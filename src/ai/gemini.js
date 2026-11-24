// src/ai/gemini.js — Integrasi Gemini SDK, Generator, Agentic DB Loop, & Error Handling
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MODEL_NAME, TIMEOUT_MS, MAX_MESSAGE_LENGTH, MAX_HISTORY } from "../config.js";
import { buildSystemPrompt } from "./knowledge.js";
import { databaseAgentTools } from "./tools.js";
import { getDbSchemaDescription, executeDbQueryTool } from "../db/schema.js";
import { getDbPool } from "../db/pool.js";

/**
 * Ekstraksi teks dari response Gemini secara aman tanpa memicu exception
 * jika ada kandidat atau part selain teks biasa.
 */
function extractResponseText(response) {
  try {
    const t = response.text();
    if (t && t.trim()) return t.trim();
  } catch {
    // response.text() throw jika ada part tanpa text
  }
  const parts = response.candidates?.[0]?.content?.parts || [];
  const textParts = parts.map((p) => p.text).filter(Boolean);
  return textParts.join("\n").trim();
}

/**
 * Validasi body request dari frontend. Return { error } atau { message, history, conversation_id }.
 */
export function validateChatBody(body) {
  const { message, history = [], conversation_id } = body ?? {};

  if (typeof message !== "string" || message.trim() === "") {
    return { error: "Field 'message' wajib diisi dan tidak boleh kosong" };
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { error: `Pesan terlalu panjang (maksimal ${MAX_MESSAGE_LENGTH} karakter)` };
  }
  if (!Array.isArray(history)) {
    return { error: "Field 'history' harus berupa array" };
  }
  for (const item of history) {
    const valid =
      item &&
      (item.role === "user" || item.role === "assistant") &&
      typeof item.content === "string";
    if (!valid) {
      return {
        error: "Setiap item 'history' harus berbentuk { role: 'user' | 'assistant', content: string }",
      };
    }
  }
  return {
    message: message.trim(),
    history,
    conversation_id: typeof conversation_id === "string" && conversation_id.trim() !== "" ? conversation_id.trim() : null,
  };
}

/**
 * Ubah riwayat percakapan frontend ke format Gemini (role 'assistant' -> 'model').
 */
export function toGeminiContents(history, message) {
  const trimmed = history.slice(-MAX_HISTORY);
  while (trimmed.length > 0 && trimmed[0].role === "assistant") trimmed.shift();

  return [
    ...trimmed.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];
}

/**
 * Error yang layak dicoba ulang (retryable): timeout, status 5xx, atau gangguan jaringan.
 */
export function isRetryable(err) {
  if (err?.code === "TIMEOUT") return true;
  if (typeof err?.status === "number") return [500, 502, 503, 504].includes(err.status);
  return /fetch failed|ECONNRESET|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|EAI_AGAIN|high demand|overloaded/i.test(err?.message ?? "");
}

/**
 * Jalankan fn, ulangi sampai `retries` kali jika error layak dicoba ulang.
 */
export async function withRetry(fn, { retries = 0, delayMs = 0, onRetry } = {}) {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries || !isRetryable(err)) throw err;
      attempt += 1;
      onRetry?.(err, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
}

/**
 * Konversi error Gemini menjadi status HTTP dan pesan user-friendly.
 */
export function toClientError(err) {
  if (err?.code === "TIMEOUT") {
    return { status: 504, error: "AI tidak merespons tepat waktu, coba lagi sebentar lagi" };
  }
  if ([500, 502, 503, 504].includes(err?.status)) {
    return { status: 503, error: "AI sedang sibuk, coba lagi sebentar lagi" };
  }
  if (err?.status === 429) {
    return { status: 429, error: "Kuota Gemini API tercapai, coba lagi nanti" };
  }
  return { status: 502, error: "Gagal menghubungi Gemini API" };
}

/**
 * Standar Gemini Generator tanpa tools (kompatibel penuh dengan mock testing).
 */
export function createGeminiGenerator(defaultSystemInstruction) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  return async (contents, dynamicSystemInstruction) => {
    const instruction = dynamicSystemInstruction || defaultSystemInstruction || buildSystemPrompt();
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: instruction,
    });

    const controller = new AbortController();
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        const err = new Error(`Gemini tidak merespons dalam ${TIMEOUT_MS} ms`);
        err.code = "TIMEOUT";
        reject(err);
      }, TIMEOUT_MS);
    });

    try {
      const call = model
        .generateContent({ contents }, { signal: controller.signal })
        .then((result) => extractResponseText(result.response));
      return await Promise.race([call, timeout]);
    } finally {
      clearTimeout(timer);
    }
  };
}

const FALLBACK_MODEL = MODEL_NAME === "gemini-3.5-flash" ? "gemini-3.5-flash-lite" : "gemini-3.5-flash";

/**
 * Autonomous Gemini Database Agent Generator dengan Function Calling (Text-to-SQL).
 * Jika database MySQL aktif, Gemini memahami skema relasional tabel dan secara mandiri
 * dapat mengeksekusi query SELECT read-only untuk mengambil data akurat dari database MySQL.
 * Jika database MySQL offline, generator otomatis beralih ke mode pengetahuan terstruktur (fallback).
 */
export function createGeminiAgentGenerator(defaultSystemInstruction) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  return async (contents, dynamicSystemInstruction) => {
    const baseInstruction = dynamicSystemInstruction || defaultSystemInstruction || buildSystemPrompt();
    const pool = getDbPool();
    const hasDb = Boolean(pool);

    const fullSystemInstruction = hasDb
      ? `${baseInstruction}\n\n=== KEMAMPUAN AGENTIC DATABASE (FUNCTION CALLING) ===\n${getDbSchemaDescription()}\nKamu dapat menggunakan tool 'execute_sql_query' kapan pun kamu membutuhkan data spesifik relasi antar-tabel dari database.`
      : baseInstruction;

    const modelOptions = {
      model: MODEL_NAME,
      systemInstruction: fullSystemInstruction,
    };
    if (hasDb) {
      modelOptions.tools = databaseAgentTools;
    }

    const controller = new AbortController();
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        const err = new Error(`Gemini tidak merespons dalam ${TIMEOUT_MS} ms`);
        err.code = "TIMEOUT";
        reject(err);
      }, TIMEOUT_MS);
    });

    try {
      const executeWithModel = async (activeModelName) => {
        const model = genAI.getGenerativeModel({
          ...modelOptions,
          model: activeModelName,
        });

        const currentContents = [...contents];
        let turns = 0;
        const maxTurns = 3;

        while (turns < maxTurns) {
          turns++;
          const result = await model.generateContent({ contents: currentContents }, { signal: controller.signal });
          const response = result.response;

          // Periksa apakah Gemini meminta eksekusi tool (Function Call)
          const functionCalls = typeof response.functionCalls === "function" ? response.functionCalls() : null;

          if (Array.isArray(functionCalls) && functionCalls.length > 0) {
            currentContents.push({
              role: "model",
              parts: response.candidates?.[0]?.content?.parts || functionCalls.map((c) => ({ functionCall: c })),
            });

            const functionResponses = [];
            for (const call of functionCalls) {
              if (call.name === "execute_sql_query" && call.args?.sql) {
                console.log(`[DatabaseAgent] Menjalankan query SQL: ${call.args.sql}`);
                const queryResult = await executeDbQueryTool(call.args.sql);
                functionResponses.push({
                  functionResponse: {
                    name: call.name,
                    response: queryResult,
                  },
                });
              } else {
                functionResponses.push({
                  functionResponse: {
                    name: call.name,
                    response: { error: "Tool tidak dikenal atau argumen tidak lengkap" },
                  },
                });
              }
            }

            currentContents.push({
              role: "function",
              parts: functionResponses,
            });

            continue;
          }

          const text = extractResponseText(response);
          if (text) {
            return text;
          }
        }

        // Jika setelah multi-turn selesai masih belum ada teks, minta sintesis akhir teks
        currentContents.push({
          role: "user",
          parts: [{ text: "Tolong berikan jawaban langsung, ramah, dan lengkap kepada pengguna berdasarkan data yang tersedia." }],
        });
        const finalResult = await model.generateContent({ contents: currentContents }, { signal: controller.signal });
        return extractResponseText(finalResult.response);
      };

      const agentExecution = async () => {
        try {
          return await executeWithModel(MODEL_NAME);
        } catch (err) {
          const isOverloaded = err?.status === 503 || /high demand|overloaded/i.test(err?.message ?? "");
          if (isOverloaded && MODEL_NAME !== FALLBACK_MODEL) {
            console.warn(`[Gemini] Model ${MODEL_NAME} sibuk (${err?.status ?? "overloaded"}), otomatis mencoba model cadangan ${FALLBACK_MODEL}...`);
            return await executeWithModel(FALLBACK_MODEL);
          }
          throw err;
        }
      };

      return await Promise.race([agentExecution(), timeoutPromise]);
    } finally {
      clearTimeout(timer);
    }
  };
}
