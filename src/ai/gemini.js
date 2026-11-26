// src/ai/gemini.js — Integrasi Gemini SDK, Generator, Agentic DB Loop, & Error Handling
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MODEL_NAME, TIMEOUT_MS, MAX_MESSAGE_LENGTH, MAX_HISTORY } from "../config.js";
import { buildSystemPrompt } from "./knowledge.js";
import { databaseAgentTools, webSearchAgentToolDeclaration } from "./tools.js";
import { getDbSchemaDescription, executeDbQueryTool } from "../db/schema.js";
import { getDbPool } from "../db/pool.js";
import { searchWebFallback, formatTavilyResults, saveTavilyToPending } from "./search.js";

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

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_IMAGES = 4;
const MAX_IMAGE_BASE64_LENGTH = 15 * 1024 * 1024; // ~11MB binary per image

/**
 * Validasi body request dari frontend. Return { error } atau { message, history, conversation_id, images }.
 */
export function validateChatBody(body) {
  const { message, history = [], conversation_id, images = [] } = body ?? {};

  if (!Array.isArray(images)) {
    return { error: "Field 'images' harus berupa array" };
  }
  if (images.length > MAX_IMAGES) {
    return { error: `Maksimal ${MAX_IMAGES} gambar per pesan` };
  }

  const normalizedImages = [];
  for (const img of images) {
    if (!img || typeof img.mimeType !== "string" || typeof img.data !== "string") {
      return { error: "Setiap item 'images' harus berbentuk { mimeType: string, data: string }" };
    }
    const mimeType = img.mimeType.trim().toLowerCase();
    if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
      return { error: `Format gambar tidak didukung (${mimeType}). Gunakan JPG, PNG, WebP, atau GIF.` };
    }
    // Strip optional data URL prefix (e.g. "data:image/png;base64,")
    const base64Data = img.data.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "").trim();
    if (!base64Data) {
      return { error: "Data gambar tidak boleh kosong" };
    }
    if (base64Data.length > MAX_IMAGE_BASE64_LENGTH) {
      return { error: "Ukuran gambar terlalu besar (maksimal ~5MB per gambar)" };
    }
    normalizedImages.push({ mimeType, data: base64Data });
  }

  const hasImages = normalizedImages.length > 0;
  const trimmedMessage = typeof message === "string" ? message.trim() : "";

  if (!hasImages && trimmedMessage === "") {
    return { error: "Field 'message' wajib diisi dan tidak boleh kosong" };
  }
  if (typeof message === "string" && message.length > MAX_MESSAGE_LENGTH) {
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
    message:
      trimmedMessage ||
      "Tolong analisis gambar yang saya lampirkan ini dan berikan informasi lengkapnya berdasarkan database sekolah, dokumen panduan, dan informasi terbaru.",
    history,
    conversation_id: typeof conversation_id === "string" && conversation_id.trim() !== "" ? conversation_id.trim() : null,
    images: normalizedImages,
  };
}

/**
 * Ubah riwayat percakapan frontend ke format Gemini (role 'assistant' -> 'model').
 * Mendukung lampiran gambar multimodal (inlineData) pada pesan terakhir user.
 */
export function toGeminiContents(history, message, images = []) {
  const trimmed = history.slice(-MAX_HISTORY);
  while (trimmed.length > 0 && trimmed[0].role === "assistant") trimmed.shift();

  const userParts = [];
  if (Array.isArray(images) && images.length > 0) {
    for (const img of images) {
      if (img?.mimeType && img?.data) {
        userParts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.data,
          },
        });
      }
    }
  }
  userParts.push({ text: message });

  return [
    ...trimmed.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: userParts },
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

const FALLBACK_MODEL = MODEL_NAME === "gemini-3.1-flash-lite" ? "gemini-3.1-flash-lite-preview" : "gemini-3.1-flash-lite";

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
    const hasWebSearch = Boolean(process.env.TAVILY_API_KEY);

    const extraCapabilities = [];
    const activeDeclarations = [];
    if (hasDb) {
      extraCapabilities.push(
        `=== KEMAMPUAN AGENTIC DATABASE (FUNCTION CALLING) ===\n${getDbSchemaDescription()}\nKamu dapat menggunakan tool 'execute_sql_query' kapan pun kamu membutuhkan data spesifik relasi antar-tabel dari database.`
      );
      activeDeclarations.push(...databaseAgentTools[0].functionDeclarations);
    }
    if (hasWebSearch) {
      extraCapabilities.push(
        `=== KEMAMPUAN AGENTIC WEB SEARCH (SUMBER 3 - TAVILY) ===\nJika kamu menganalisis gambar atau pertanyaan tentang SMK di Malang yang belum lengkap di Sumber 1 (Database) dan Sumber 2 (Dokumen Panduan), panggil tool 'search_web_info' untuk mencari data terbarunya di web.`
      );
      activeDeclarations.push(webSearchAgentToolDeclaration);
    }

    const fullSystemInstruction =
      extraCapabilities.length > 0
        ? `${baseInstruction}\n\n${extraCapabilities.join("\n\n")}`
        : baseInstruction;

    const modelOptions = {
      model: MODEL_NAME,
      systemInstruction: fullSystemInstruction,
    };
    if (activeDeclarations.length > 0) {
      modelOptions.tools = [{ functionDeclarations: activeDeclarations }];
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
            currentContents.push(
              response.candidates?.[0]?.content || {
                role: "model",
                parts: functionCalls.map((c) => ({ functionCall: c })),
              }
            );

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
              } else if (call.name === "search_web_info" && call.args?.query) {
                console.log(`[WebSearchAgent] Mencari informasi web: ${call.args.query}`);
                const webRes = await searchWebFallback(call.args.query);
                if (webRes) {
                  saveTavilyToPending(call.args.query, webRes).catch((err) =>
                    console.warn("[saveTavilyToPending error]", err?.message ?? err)
                  );
                }
                const formattedWeb = webRes ? formatTavilyResults(webRes) : "";
                functionResponses.push({
                  functionResponse: {
                    name: call.name,
                    response: formattedWeb
                      ? { success: true, results: formattedWeb }
                      : { success: false, message: "Tidak ditemukan hasil web tambahan." },
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

            // Pada Gemini 3.5 API, role 'function' sudah dideprecate dan wajib menggunakan role 'user'
            currentContents.push({
              role: "user",
              parts: functionResponses,
            });

            continue;
          }

          const text = extractResponseText(response);
          if (text) {
            return text;
          }
        }

        // Jika setelah multi-turn selesai masih belum ada teks, minta sintesis akhir teks tanpa tools
        const synthesisModel = genAI.getGenerativeModel({
          model: activeModelName,
          systemInstruction: fullSystemInstruction,
        });
        currentContents.push({
          role: "user",
          parts: [{ text: "Tolong berikan jawaban langsung, ramah, dan lengkap kepada pengguna berdasarkan data yang tersedia." }],
        });
        const finalResult = await synthesisModel.generateContent({ contents: currentContents }, { signal: controller.signal });
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
