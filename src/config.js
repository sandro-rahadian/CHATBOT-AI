// src/config.js — Konfigurasi Lingkungan dan Pengaturan Aplikasi
import dotenv from "dotenv";

dotenv.config();

export const PORT = Number(process.env.PORT) || 3001;
export const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
export const TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 30000;

const parsedRetries = Number.parseInt(process.env.GEMINI_MAX_RETRIES ?? "", 10);
export const MAX_RETRIES = Number.isNaN(parsedRetries) ? 2 : Math.max(0, parsedRetries);
export const RETRY_DELAY_MS = 1000;

export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_HISTORY = 30;

export const rawOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000,https://keravokasi.my.id,https://www.keravokasi.my.id")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalized = origin.replace(/\/$/, "");
    if (
      rawOrigins.includes("*") ||
      rawOrigins.includes(normalized) ||
      normalized.endsWith(".vercel.app") ||
      normalized.endsWith("keravokasi.my.id")
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
};
