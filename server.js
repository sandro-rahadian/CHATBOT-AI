// server.js — Entry point backend AI Chatbot
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";

dotenv.config();

// ---------- Konfigurasi ----------
const PORT = Number(process.env.PORT) || 3001;
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 15000; // batas tunggu per percobaan
const parsedRetries = Number.parseInt(process.env.GEMINI_MAX_RETRIES ?? "", 10);
const MAX_RETRIES = Number.isNaN(parsedRetries) ? 2 : Math.max(0, parsedRetries); // coba ulang saat Gemini sibuk
const RETRY_DELAY_MS = 1000; // jeda dasar: 1 dtk, lalu 2 dtk, dst.

const rawOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalized = origin.replace(/\/$/, "");
    if (rawOrigins.includes("*") || rawOrigins.includes(normalized)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
};

const MAX_MESSAGE_LENGTH = 4000; // karakter per pesan
const MAX_HISTORY = 30; // jumlah pesan history terakhir yang dikirim ke Gemini

// ---------- Knowledge Base & System Instruction ----------
/**
 * Membaca data.md (berisi JSON basis pengetahuan SMK Telkom Malang).
 */
export function loadKnowledgeBase() {
  try {
    const dataPath = fileURLToPath(new URL("./data.md", import.meta.url));
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, "utf8");
      const items = JSON.parse(raw);
      if (Array.isArray(items)) {
        return items;
      }
    }
  } catch (err) {
    console.warn("[KnowledgeBase] Gagal memuat data.md:", err?.message ?? err);
  }
  return [];
}

/**
 * Menyusun system prompt yang membatasi jawaban Gemini HANYA berdasarkan database data.md.
 */
export function buildSystemPrompt() {
  if (process.env.SYSTEM_PROMPT) {
    return process.env.SYSTEM_PROMPT;
  }

  const items = loadKnowledgeBase();
  let knowledgeSection = "";

  if (items.length > 0) {
    const formatted = items
      .map(
        (item, idx) =>
          `[Data ${idx + 1}] Kategori: ${item.category} | Judul: ${item.title}\nIsi: ${item.content}`
      )
      .join("\n\n");

    knowledgeSection = `\n=== DATABASE PENGETAHUAN RESMI SMK TELKOM MALANG ===\n${formatted}\n====================================================\n`;
  }

  return `Kamu adalah asisten AI resmi untuk SMK Telkom Malang (Moklet). Tugasmu adalah memberikan informasi yang akurat, ramah, dan solutif seputar SMK Telkom Malang kepada calon siswa, siswa, orang tua, dan masyarakat umum.

ATURAN UTAMA (SANGAT KETAT):
1. SUMBER INFORMASI TUNGGAL: Jawablah pertanyaan HANYA berdasarkan fakta yang tertulis di dalam "DATABASE PENGETAHUAN RESMI" di bawah.
2. TIDAK BOLEH MENGARANG: JANGAN pernah mengarang, berspekulasi, berhalusinasi, atau menggunakan informasi di luar database resmi ini.
3. PERTANYAAN DI LUAR DATABASE ATAU DATA BELUM TERSEDIA:
   - Jika pengguna menanyakan hal umum yang tidak relevan dengan SMK Telkom Malang (misalnya resep masakan, cuaca kota lain, tugas coding umum, politik, dll.), tolak dengan santun dan jelaskan bahwa kamu adalah asisten khusus SMK Telkom Malang.
   - Jika pengguna menanyakan info tentang SMK Telkom Malang tetapi datanya belum ada di database (misalnya rincian nominal biaya masuk/SPP yang belum tertera): sampaikan bahwa informasi resmi tersebut belum tersedia di data kami, lalu arahkan untuk menghubungi kontak resmi:
     * Call Center / WhatsApp: 0812-2348-8999
     * Telepon Kantor: 0341-712500
     * Email: info@smktelkom-mlg.sch.id
     * Website: smktelkom-mlg.sch.id / ppdb.smktelkom-mlg.sch.id
     * Instagram & TikTok: @smktelkommalang
     * Jam Layanan: Senin - Sabtu pukul 06.00 - 16.00 WIB (Minggu tutup)
4. GAYA BAHASA: Santun, ramah, jelas, dan profesional dalam Bahasa Indonesia. Boleh menggunakan poin-poin agar mudah dibaca.
5. NATURAL: Jangan menyebutkan kata-kata teknis seperti "berdasarkan database di atas" atau "menurut prompt sistem". Jawablah langsung secara alami sebagai asisten sekolah resmi.
${knowledgeSection}`;
}

// ---------- Helper ----------
/**
 * Validasi body request. Return { error } atau { message, history }.
 */
export function validateChatBody(body) {
  const { message, history = [] } = body ?? {};

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
  return { message: message.trim(), history };
}

/**
 * Ubah history frontend ke format Gemini (role "assistant" -> "model").
 * Gemini mewajibkan percakapan diawali role "user", jadi pesan awal dari
 * assistant (mis. pesan sambutan) dibuang.
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

/** Pembungkus Gemini SDK dengan timeout. Dipisah supaya mudah di-mock saat testing. */
export function createGeminiGenerator(systemInstruction = buildSystemPrompt()) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction,
  });

  return async (contents) => {
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
        .then((result) => result.response.text());
      return await Promise.race([call, timeout]);
    } finally {
      clearTimeout(timer);
    }
  };
}

/** Error yang layak dicoba ulang: timeout, 5xx dari Gemini, atau gangguan jaringan. */
export function isRetryable(err) {
  if (err?.code === "TIMEOUT") return true;
  if (typeof err?.status === "number") return [500, 502, 503, 504].includes(err.status);
  return /fetch failed|ECONNRESET|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|EAI_AGAIN/i.test(err?.message ?? "");
}

/** Jalankan fn, ulangi sampai `retries` kali jika error-nya layak dicoba ulang. */
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

/** Ubah error Gemini menjadi status + pesan yang ramah untuk pengguna chat. */
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

// ---------- App ----------
export function createApp({ generate, retries = MAX_RETRIES, retryDelayMs = RETRY_DELAY_MS }) {
  const app = express();

  app.use(cors(corsOptions));
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20, // 20 request / menit / IP
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Terlalu banyak permintaan, coba lagi sebentar lagi" },
  });

  // POST /chat
  app.post("/chat", chatLimiter, async (req, res) => {
    const parsed = validateChatBody(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    try {
      const contents = toGeminiContents(parsed.history, parsed.message);
      const reply = await withRetry(() => generate(contents), {
        retries,
        delayMs: retryDelayMs,
        onRetry: (err, n) =>
          console.warn(`[Gemini] percobaan ${n} gagal (${err?.status ?? err?.code ?? "error"}), mencoba ulang...`),
      });
      if (!reply || !reply.trim()) {
        return res.status(502).json({ error: "Gemini tidak mengembalikan jawaban" });
      }
      return res.json({ reply });
    } catch (err) {
      console.error("[Gemini error]", err?.message ?? err);
      const { status, error } = toClientError(err);
      return res.status(status).json({ error });
    }
  });

  // 404
  app.use((_req, res) => res.status(404).json({ error: "Endpoint tidak ditemukan" }));

  // Error handler (JSON rusak, body terlalu besar, dll.)
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Body request bukan JSON yang valid" });
    }
    if (err.type === "entity.too.large") {
      return res.status(413).json({ error: "Body request terlalu besar" });
    }
    console.error(err);
    return res.status(500).json({ error: "Terjadi kesalahan pada server" });
  });

  return app;
}

// ---------- Jalankan server (hanya jika file ini dieksekusi langsung) ----------
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY belum diisi. Salin .env.example menjadi .env lalu isi API key-nya.");
    process.exit(1);
  }
  const app = createApp({ generate: createGeminiGenerator() });
  app.listen(PORT, () => {
    console.log(`Backend berjalan di http://localhost:${PORT} (model: ${MODEL_NAME})`);
    console.log(`Timeout ${TIMEOUT_MS} ms, coba ulang maks ${MAX_RETRIES}x`);
    console.log(`CORS diizinkan untuk: ${rawOrigins.join(", ")}`);
    console.log(`Database pengetahuan data.md: ${loadKnowledgeBase().length} entri dimuat.`);
  });
}
