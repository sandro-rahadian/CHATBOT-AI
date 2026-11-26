// src/ai/search.js — Integrasi Pencarian Web (Tavily) & Antrean Pengetahuan Pending
import { tavily } from "@tavily/core";
import { getDbPool } from "../db/pool.js";

let cachedTavilyClient = null;

export function getTavilyClient() {
  if (cachedTavilyClient) return cachedTavilyClient;
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;
  try {
    cachedTavilyClient = tavily({ apiKey });
    return cachedTavilyClient;
  } catch (err) {
    console.warn("[Tavily] Inisialisasi client gagal:", err?.message ?? err);
    return null;
  }
}

/**
 * Menentukan apakah pesan user membutuhkan pencarian web (Tavily).
 */
export function shouldPerformWebSearch(message) {
  if (!process.env.TAVILY_API_KEY) return false;
  if (typeof message !== "string") return false;

  const text = message.toLowerCase().trim();

  // Abaikan sapaan singkat
  const greetings = /^(halo|hai|hi|hello|pagi|siang|sore|malam|assalamualaikum|tes|test|terima kasih|makasih|thanks|thank you|ok|oke|siap)[.!? ]*$/i;
  if (greetings.test(text)) return false;

  // Abaikan pertanyaan identitas bot KeraVokasi
  if (/^(siapa kamu|kamu siapa|apa itu keravokasi|tentang keravokasi|profil keravokasi)/i.test(text)) {
    return false;
  }

  // Cek apakah menanyakan sekolah di luar DB
  const otherSchoolRegex = /\b(smkn?\s*(1|2|7|8|9|10|11|12|13)|smk\s+pgri|smk\s+muhammadiyah|smk\s+cor\s*jesu|smk\s+widyagama|smk\s+bina\s*cendekia|smk\s+singosari|smk\s+angkasa|smk\s+penerbangan|smk\s+kesehatan|smk\s+nasional|smk\s+sriwedari|smk\s+shalahuddin)\b/i;
  if (otherSchoolRegex.test(text)) {
    return true;
  }

  const mentionsVocational = /\b(smk|smkn|kejuruan|vokasi|stm|smea|sekolah)\b/i.test(text);
  const mentionsMalang = /\b(malang|jatim|jawa timur)\b/i.test(text);

  // Jika menanyakan sekolah yang ada di DB (Telkom, 3, 4, 5, 6)
  const mentionsDbSchool = /\b(smk\s*telkom|moklet|smkn?\s*3|smkn?\s*4|smkn?\s*5|smkn?\s*6)\b/i.test(text);

  if (mentionsDbSchool) {
    const dynamicTopics = /\b(kepala sekolah|kepsek|biaya|spp|uang gedung|akreditasi|ranking|peringkat|berita|alumni|reuni|prestasi terbaru)\b/i;
    if (dynamicTopics.test(text)) {
      return true;
    }
    return false;
  }

  if (mentionsVocational && mentionsMalang) {
    return true;
  }

  if (mentionsMalang && /\b(jurusan|ada gak|apakah ada)\b/i.test(text)) {
    return true;
  }

  return false;
}

/**
 * Memformat hasil pencarian Tavily menjadi teks ringkas dan terstruktur untuk Gemini.
 */
export function formatTavilyResults(response) {
  if (!response) return "";
  const { answer, results = [], query } = response;
  const parts = [];
  if (query) {
    parts.push(`Kata Kunci Pencarian: ${query}`);
  }
  if (answer && answer.trim()) {
    parts.push(`Ringkasan Jawaban Web: ${answer.trim()}`);
  }
  if (Array.isArray(results) && results.length > 0) {
    parts.push("Rincian Hasil Web:");
    results.slice(0, 3).forEach((item, idx) => {
      const title = item.title || "Tanpa Judul";
      const url = item.url ? ` | Sumber: ${item.url}` : "";
      const content = item.content ? `\nIsi: ${item.content.trim()}` : "";
      parts.push(`[Web ${idx + 1}] ${title}${url}${content}`);
    });
  }
  return parts.join("\n\n");
}

/**
 * Mengekstrak daftar URL gambar yang valid dari hasil Tavily untuk ditampilkan sebagai Preview Gallery.
 */
export function extractGalleryImages(tavilyRes, fallbackTitle = "Galeri Sekolah") {
  if (!tavilyRes || !Array.isArray(tavilyRes.images)) return [];
  const seen = new Set();
  const gallery = [];

  for (const item of tavilyRes.images) {
    const url = typeof item === "string" ? item : item?.url;
    const description = typeof item === "object" && item?.description ? item.description : fallbackTitle;
    if (typeof url !== "string" || !/^https?:\/\//i.test(url)) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    gallery.push({
      url,
      caption: String(description).slice(0, 90),
    });
    if (gallery.length >= 6) break;
  }

  return gallery;
}

/**
 * Melakukan pencarian web menggunakan SDK Tavily.
 */
export async function searchWebFallback(query, client = getTavilyClient()) {
  if (!client) return null;
  try {
    const isMalangSpecified = /malang|jatim|jawa timur/i.test(query);
    const searchQuery = isMalangSpecified ? query : `${query} SMK Malang`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await Promise.race([
      client.search(searchQuery, {
        searchDepth: "basic",
        maxResults: 3,
        includeAnswer: true,
        includeImages: true,
        includeImageDescriptions: true,
      }),
      new Promise((_, reject) => {
        controller.signal.addEventListener("abort", () => {
          reject(new Error("Pencarian Tavily melebihi batas waktu (timeout)"));
        });
      }),
    ]).finally(() => clearTimeout(timeout));

    return res;
  } catch (err) {
    console.warn("[Tavily] Pencarian web gagal atau dilewati:", err?.message ?? err);
    return null;
  }
}

/**
 * Menyimpan data hasil pencarian web Tavily ke tabel knowledge_pending di MySQL.
 */
export async function saveTavilyToPending(message, tavilyRes, schoolId = null) {
  if (!tavilyRes) return null;
  const pool = getDbPool();
  if (!pool) return null;

  try {
    const normalizedKey = message.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 190);
    const answer = tavilyRes.answer || (tavilyRes.results?.[0]?.content ?? "");
    if (!answer || answer.trim() === "") return null;

    const sources = JSON.stringify(
      (tavilyRes.results || []).map((r) => ({ title: r.title, url: r.url }))
    );

    let targetSchoolId = schoolId;
    if (!targetSchoolId) {
      const [schools] = await pool.query("SELECT id, name, aliases FROM schools");
      if (Array.isArray(schools)) {
        for (const s of schools) {
          const names = [s.name, ...(s.aliases || "").split(",")].map((n) => n.trim().toLowerCase()).filter(Boolean);
          if (names.some((n) => message.toLowerCase().includes(n))) {
            targetSchoolId = s.id;
            break;
          }
        }
      }
    }

    await pool.query(`
      INSERT INTO knowledge_pending (school_id, question, question_key, answer, sources, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
      ON DUPLICATE KEY UPDATE
        answer = VALUES(answer),
        sources = VALUES(sources)
    `, [targetSchoolId || null, message, normalizedKey, answer, sources]);

    console.log(`[KnowledgePending] Data baru dicatat ke pending: "${message.slice(0, 50)}..."`);
    return true;
  } catch (err) {
    console.warn("[KnowledgePending] Gagal menyimpan ke antrean pending:", err?.message ?? err);
    return null;
  }
}
