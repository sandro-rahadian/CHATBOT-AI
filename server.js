// server.js — Entry point backend AI Chatbot
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { tavily } from "@tavily/core";
import mysql from "mysql2/promise";
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

const rawOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000,https://keravokasi.my.id,https://www.keravokasi.my.id")
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

const MAX_MESSAGE_LENGTH = 4000; // karakter per pesan
const MAX_HISTORY = 30; // jumlah pesan history terakhir yang dikirim ke Gemini

// ---------- Knowledge Base & System Instruction ----------
let cachedKnowledgeItems = null;

let cachedDbPool = null;

/**
 * Membuat atau menggunakan singleton connection pool ke database MySQL online (Railway/Cloud).
 */
export function getDbPool() {
  if (cachedDbPool) return cachedDbPool;

  const url = process.env.MYSQL_URL || process.env.DATABASE_URL;
  if (url) {
    cachedDbPool = mysql.createPool({
      uri: url,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      connectTimeout: 5000,
    });
    return cachedDbPool;
  }
  if (process.env.MYSQLHOST || process.env.DB_HOST) {
    cachedDbPool = mysql.createPool({
      host: process.env.MYSQLHOST || process.env.DB_HOST,
      user: process.env.MYSQLUSER || process.env.DB_USER || "root",
      password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
      database: process.env.MYSQLDATABASE || process.env.DB_NAME || "chatbot_sekolah",
      port: Number(process.env.MYSQLPORT || process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      connectTimeout: 5000,
    });
    return cachedDbPool;
  }
  return null;
}

/**
 * Mengambil data terbaru dari MySQL database online dengan menggabungkan tabel-tabel relasional terpisah:
 * (school_profiles, school_majors, school_address_contacts, school_ppdb, school_facilities, school_activities)
 * yang masing-masing berelasi ke tabel induk `schools` melalui foreign key `school_id`.
 */
export async function fetchKnowledgeFromDb() {
  const pool = getDbPool();
  if (!pool) return null;
  try {
    const query = `
      SELECT p.id, s.name AS school_name, 'Profil' AS category, p.title, p.content, p.keywords
      FROM school_profiles p
      JOIN schools s ON p.school_id = s.id

      UNION ALL

      SELECT m.id, s.name AS school_name, 'Jurusan' AS category, m.title, m.content, m.keywords
      FROM school_majors m
      JOIN schools s ON m.school_id = s.id

      UNION ALL

      SELECT c.id, s.name AS school_name, 'Alamat & Kontak' AS category, c.title, c.content, c.keywords
      FROM school_address_contacts c
      JOIN schools s ON c.school_id = s.id

      UNION ALL

      SELECT b.id, s.name AS school_name, 'PPDB' AS category, b.title, b.content, b.keywords
      FROM school_ppdb b
      JOIN schools s ON b.school_id = s.id

      UNION ALL

      SELECT f.id, s.name AS school_name, 'Fasilitas' AS category, f.title, f.content, f.keywords
      FROM school_facilities f
      JOIN schools s ON f.school_id = s.id

      UNION ALL

      SELECT a.id, s.name AS school_name, 'Ekstrakurikuler' AS category, a.title, a.content, a.keywords
      FROM school_activities a
      JOIN schools s ON a.school_id = s.id

      ORDER BY school_name ASC, category ASC, id ASC;
    `;

    const [rows] = await pool.query(query);
    if (Array.isArray(rows) && rows.length > 0) {
      return rows;
    }
  } catch (err) {
    console.warn("[MySQL] Gagal mengambil data antar-tabel dari database online:", err?.message ?? err);
  }
  return null;
}

/**
 * Membaca data.md / data.json (berisi JSON basis pengetahuan SMK Telkom Malang).
 */
export function loadKnowledgeBase() {
  if (cachedKnowledgeItems && cachedKnowledgeItems.length > 0) {
    return cachedKnowledgeItems;
  }
  try {
    const mdPath = fileURLToPath(new URL("./data.md", import.meta.url));
    const jsonPath = fileURLToPath(new URL("./data.json", import.meta.url));
    const dataPath = fs.existsSync(mdPath) ? mdPath : fs.existsSync(jsonPath) ? jsonPath : null;
    if (dataPath) {
      const raw = fs.readFileSync(dataPath, "utf8");
      const items = JSON.parse(raw);
      if (Array.isArray(items)) {
        return items;
      }
    }
  } catch (err) {
    console.warn("[KnowledgeBase] Gagal memuat database:", err?.message ?? err);
  }
  return [];
}

/**
 * Membaca dokumen panduan tambahan (panduan-memilih-jurusan.md) sebagai sumber pengetahuan kedua.
 */
export function loadGuideDocument() {
  try {
    const guidePath = fileURLToPath(new URL("./panduan-memilih-jurusan.md", import.meta.url));
    if (fs.existsSync(guidePath)) {
      return fs.readFileSync(guidePath, "utf8");
    }
  } catch (err) {
    console.warn("[GuideDocument] Gagal membaca panduan-memilih-jurusan.md:", err?.message ?? err);
  }
  return "";
}

// ---------- Tavily Web Search ----------
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
 * Dipicu ketika user menanyakan info tentang SMK di Malang yang tidak ada di database 5 sekolah,
 * atau informasi spesifik/terkini seputar SMK/vokasi.
 */
export function shouldPerformWebSearch(message) {
  if (!process.env.TAVILY_API_KEY) return false;
  if (typeof message !== "string") return false;

  const text = message.toLowerCase().trim();

  // Abaikan sapaan singkat atau ucapan terima kasih
  const greetings = /^(halo|hai|hi|hello|pagi|siang|sore|malam|assalamualaikum|tes|test|terima kasih|makasih|thanks|thank you|ok|oke|siap)[.!? ]*$/i;
  if (greetings.test(text)) return false;

  // Abaikan pertanyaan seputar identitas bot KeraVokasi
  if (/^(siapa kamu|kamu siapa|apa itu keravokasi|tentang keravokasi|profil keravokasi)/i.test(text)) {
    return false;
  }

  // Cek apakah menanyakan sekolah di luar DB (SMKN 1, 2, 7, 8, 9, dst, atau SMK swasta lain)
  const otherSchoolRegex = /\b(smkn?\s*(1|2|7|8|9|10|11|12|13)|smk\s+pgri|smk\s+muhammadiyah|smk\s+cor\s*jesu|smk\s+widyagama|smk\s+bina\s*cendekia|smk\s+singosari|smk\s+angkasa|smk\s+penerbangan|smk\s+kesehatan|smk\s+nasional|smk\s+sriwedari|smk\s+shalahuddin)\b/i;
  if (otherSchoolRegex.test(text)) {
    return true;
  }

  // Cek apakah menyebut SMK / sekolah / jurusan di Malang
  const mentionsVocational = /\b(smk|smkn|kejuruan|vokasi|stm|smea|sekolah)\b/i.test(text);
  const mentionsMalang = /\b(malang|jatim|jawa timur)\b/i.test(text);

  // Jika menanyakan sekolah yang ada di DB (Telkom, 3, 4, 5, 6)
  const mentionsDbSchool = /\b(smk\s*telkom|moklet|smkn?\s*3|smkn?\s*4|smkn?\s*5|smkn?\s*6)\b/i.test(text);

  if (mentionsDbSchool) {
    // Jika menanyakan hal dinamis yang tidak tercatat di DB (kepala sekolah, biaya spesifik sekolah negeri, akreditasi, berita)
    const dynamicTopics = /\b(kepala sekolah|kepsek|biaya|spp|uang gedung|akreditasi|ranking|peringkat|berita|alumni|reuni|prestasi terbaru)\b/i;
    if (dynamicTopics.test(text)) {
      return true;
    }
    // Jika pertanyaan standar (jurusan, profil, fasilitas, kontak, alamat, ppdb), database sudah lengkap
    return false;
  }

  // Jika menanyakan topik kejuruan/jurusan secara umum yang melibatkan Malang
  if (mentionsVocational && mentionsMalang) {
    return true;
  }

  // Jika user bertanya spesifik tentang jurusan tertentu di Malang (misal: "adakah jurusan penerbangan di Malang?")
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
 * Melakukan pencarian web menggunakan SDK Tavily.
 */
export async function searchWebFallback(query, client = getTavilyClient()) {
  if (!client) return null;
  try {
    const isMalangSpecified = /malang|jatim|jawa timur/i.test(query);
    const searchQuery = isMalangSpecified ? query : `${query} SMK Malang`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // batas timeout pencarian 8 detik

    const res = await Promise.race([
      client.search(searchQuery, {
        searchDepth: "basic",
        maxResults: 3,
        includeAnswer: true,
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
 * Menyimpan data hasil pencarian web Tavily ke tabel `knowledge_pending` di MySQL secara asinkron.
 * Status awal adalah 'pending' sehingga admin dapat me-review atau mengubahnya jadi 'approved' di Railway.
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

    // Deteksi school_id jika belum diberikan
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

    const query = `
      INSERT INTO knowledge_pending (school_id, question, question_key, answer, sources, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
      ON DUPLICATE KEY UPDATE
        answer = VALUES(answer),
        sources = VALUES(sources),
        updated_at = CURRENT_TIMESTAMP
    `;

    // Catatan: Jika updated_at tidak ada di skema, update created_at atau status jika pending
    await pool.query(`
      INSERT INTO knowledge_pending (school_id, question, question_key, answer, sources, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
      ON DUPLICATE KEY UPDATE
        answer = VALUES(answer),
        sources = VALUES(sources)
    `, [targetSchoolId || null, message, normalizedKey, answer, sources]);

    console.log(`[KnowledgePending] Data baru berhasil dicatat ke antrean pending: "${message.slice(0, 50)}..."`);
    return true;
  } catch (err) {
    console.warn("[KnowledgePending] Gagal menyimpan ke antrean pending:", err?.message ?? err);
    return null;
  }
}

/**
 * Memproses dan mendistribusikan data dari `knowledge_pending` yang telah di-ACC (status 'approved')
 * langsung ke tabel relasional resmi (school_majors, school_profiles, school_address_contacts, dll).
 */
export async function syncApprovedPendingKnowledge() {
  const pool = getDbPool();
  if (!pool) return { migrated: 0 };

  try {
    const [approvedRows] = await pool.query(`
      SELECT kp.id, kp.school_id, kp.question, kp.question_key, kp.answer, kp.sources, s.name AS school_name
      FROM knowledge_pending kp
      LEFT JOIN schools s ON kp.school_id = s.id
      WHERE kp.status = 'approved'
    `);

    if (!Array.isArray(approvedRows) || approvedRows.length === 0) {
      return { migrated: 0 };
    }

    let migratedCount = 0;

    for (const row of approvedRows) {
      let targetSchoolId = row.school_id;

      // 1. Jika sekolah belum ada di tabel `schools`, deteksi nama sekolah dan buat entri baru
      if (!targetSchoolId) {
        let extractedSchoolName = null;
        const text = `${row.question} ${row.answer}`;
        const match = text.match(/\b(SMKN?\s*\d+|SMK\s+[A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)?)\b/i);
        if (match) {
          extractedSchoolName = match[0].toUpperCase();
          if (extractedSchoolName.startsWith("SMKN")) {
            extractedSchoolName = extractedSchoolName.replace("SMKN", "SMK Negeri");
          }
        } else {
          extractedSchoolName = "SMK di Malang (Umum)";
        }

        // Cek atau buat di tabel schools
        const [existing] = await pool.query("SELECT id FROM schools WHERE name = ? LIMIT 1", [extractedSchoolName]);
        if (existing && existing.length > 0) {
          targetSchoolId = existing[0].id;
        } else {
          const [insertRes] = await pool.query(
            "INSERT INTO schools (name, aliases) VALUES (?, ?)",
            [extractedSchoolName, extractedSchoolName.toLowerCase()]
          );
          targetSchoolId = insertRes.insertId;
        }
      }

      // 2. Tentukan tabel tujuan berdasarkan konteks pertanyaan
      const q = row.question.toLowerCase();
      let targetTable = "school_profiles";
      let title = "Informasi Tambahan";

      if (/\b(jurusan|prodi|keahlian|program studi|rpl|tkj|dkv|animasi|kuliner|tata boga)\b/i.test(q)) {
        targetTable = "school_majors";
        title = `Jurusan dan Kompetensi Keahlian (${row.question.slice(0, 40)})`;
      } else if (/\b(kontak|telepon|wa|whatsapp|alamat|lokasi|email|website|maps)\b/i.test(q)) {
        targetTable = "school_address_contacts";
        title = `Kontak dan Lokasi (${row.question.slice(0, 40)})`;
      } else if (/\b(ppdb|daftar|pendaftaran|biaya|spp|syarat|jalur)\b/i.test(q)) {
        targetTable = "school_ppdb";
        title = `Informasi PPDB dan Pendaftaran (${row.question.slice(0, 40)})`;
      } else if (/\b(fasilitas|lab|gedung|bengkel|lapangan)\b/i.test(q)) {
        targetTable = "school_facilities";
        title = `Fasilitas Sekolah (${row.question.slice(0, 40)})`;
      } else if (/\b(ekskul|ekstrakurikuler|kegiatan|organisasi|osis)\b/i.test(q)) {
        targetTable = "school_activities";
        title = `Kegiatan dan Ekstrakurikuler (${row.question.slice(0, 40)})`;
      } else {
        targetTable = "school_profiles";
        title = `Profil Sekolah (${row.question.slice(0, 40)})`;
      }

      const keywords = `${row.question_key} ${row.question.toLowerCase()}`.slice(0, 250);

      // 3. Masukkan ke tabel relasional resmi
      await pool.query(`
        INSERT INTO \`${targetTable}\` (school_id, title, content, keywords)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          content = VALUES(content),
          keywords = VALUES(keywords)
      `, [targetSchoolId, title, row.answer, keywords]);

      // 4. Update status dari 'approved' menjadi 'migrated' atau hapus dari antrean agar tidak diproses berulang
      // Karena enum status adalah ('pending', 'approved', 'rejected'), kita hapus baris yang selesai dimigrasi
      await pool.query("DELETE FROM knowledge_pending WHERE id = ?", [row.id]);
      migratedCount += 1;
    }

    console.log(`[KnowledgePending] ${migratedCount} data yang di-ACC berhasil didistribusikan ke tabel relasional resmi.`);
    return { migrated: migratedCount };
  } catch (err) {
    console.warn("[KnowledgePending] Gagal menyinkronkan data approved:", err?.message ?? err);
    return { migrated: 0, error: err?.message };
  }
}

/**
 * Menyusun system prompt yang membatasi jawaban Gemini berdasarkan database pengetahuan, dokumen panduan, dan pencarian web (Tavily).
 */
export function buildSystemPrompt(items = loadKnowledgeBase(), guideDoc = loadGuideDocument(), webResults = null) {
  if (process.env.SYSTEM_PROMPT) {
    return process.env.SYSTEM_PROMPT;
  }

  let knowledgeSection = "";

  if (items && items.length > 0) {
    const formatted = items
      .map((item, idx) => {
        const school = item.school_name ? ` | Sekolah: ${item.school_name}` : "";
        return `[Data ${idx + 1}]${school} | Kategori: ${item.category} | Judul: ${item.title}\nIsi: ${item.content}`;
      })
      .join("\n\n");

    knowledgeSection = `\n=== SUMBER 1: DATABASE PENGETAHUAN RESMI SMK TELKOM MALANG & SEKOLAH KEJURUAN ===\n${formatted}\n===================================================================================\n`;
  }

  let guideSection = "";
  if (guideDoc && guideDoc.trim().length > 0) {
    guideSection = `\n=== SUMBER 2: DOKUMEN PANDUAN MEMILIH JURUSAN SMK DI MALANG ===\n${guideDoc.trim()}\n===============================================================\n`;
  }

  let tavilySection = "";
  if (webResults && typeof webResults === "string" && webResults.trim().length > 0) {
    tavilySection = `\n=== SUMBER 3: PENCARIAN WEB TERBARU (TAVILY) ===\n${webResults.trim()}\n=================================================\n`;
  }

  return `Kamu adalah KeraVokasi, asisten AI resmi yang cerdas, ramah, dan solutif seputar sekolah kejuruan (SMK) di Malang, termasuk SMK Telkom Malang serta SMK lainnya (seperti SMKN 1, SMKN 2, SMKN 3, SMKN 4, SMKN 5, SMKN 6, dan SMK lain di Malang) yang tercatat di database, dokumen panduan, maupun pencarian web kami.

ATURAN UTAMA (SANGAT KETAT):
1. IDENTITAS & BRAND: Perkenalkan dirimu sebagai "KeraVokasi", asisten AI informasi SMK di Malang. Jangan pernah menyebut dirimu dengan nama lain seperti Moklet Assistant atau Moka.
2. TIGA SUMBER INFORMASI RESMI:
   - SUMBER 1 (DATABASE): Berisi data spesifik profil, jurusan, kontak resmi, alamat, fasilitas, dan PPDB tiap sekolah yang ada di database (SMK Telkom, SMKN 3, SMKN 4, SMKN 5, SMKN 6).
   - SUMBER 2 (DOKUMEN PANDUAN): Berisi panduan pemilihan jurusan berdasarkan minat, bakat, perbandingan jurusan (misal perbedaan RPL vs TKJ), tips karier, dan ringkasan bidang keahlian di Malang.
   - SUMBER 3 (PENCARIAN WEB TERBARU): Jika tersedia, berisi informasi terkini dari hasil pencarian web terpercaya melalui Tavily mengenai SMK di Malang di luar database (seperti SMKN 1, SMKN 2, SMKN 7, SMK PGRI, SMK swasta lainnya di Malang) atau informasi terbaru yang tidak ada di SUMBER 1 dan 2.
   - Jawablah pertanyaan pengguna berdasarkan ketiga sumber informasi resmi tersebut. Jika pengguna meminta saran jurusan sesuai minat, manfaatkan SUMBER 2 secara maksimal dan padukan dengan SUMBER 1 atau SUMBER 3.
3. TIDAK BOLEH MENGARANG: Jawablah hanya berdasarkan data yang ada pada ketiga sumber di atas. Jangan mengarang atau berspekulasi jika informasi tidak ditemukan.
4. PERTANYAAN DI LUAR SUMBER ATAU DATA BELUM TERSEDIA:
   - Jika pengguna menanyakan hal umum yang tidak ada kaitannya dengan sekolah/SMK di Malang (misalnya resep masakan, cuaca kota lain, politik luar negeri), tolak dengan santun dan jelaskan bahwa fokus KeraVokasi adalah seputar informasi SMK di Malang.
   - Jika pengguna menanyakan info tentang SMK Telkom Malang tetapi datanya belum ada di sumber: sampaikan bahwa informasi resmi tersebut belum tersedia di data kami, lalu arahkan untuk menghubungi kontak resmi:
     * Call Center / WhatsApp: 0812-2348-8999
     * Telepon Kantor: 0341-712500
     * Email: info@smktelkom-mlg.sch.id
     * Website: https://smktelkom-mlg.sch.id / https://ppdb.smktelkom-mlg.sch.id
     * Instagram & TikTok: @smktelkommalang
     * Jam Layanan: Senin - Sabtu pukul 06.00 - 16.00 WIB (Minggu tutup)
   - Jika menanyakan sekolah negeri atau swasta lain di Malang yang informasinya belum lengkap di ketiga sumber, arahkan ke website resmi sekolah terkait atau Dinas Pendidikan Provinsi Jawa Timur.
5. FORMAT JAWABAN (SANGAT BERSIH & RAPI):
   - Gunakan format teks standar yang rapi dan mudah dibaca.
   - BOLD: Gunakan tanda bintang ganda **teks** untuk judul bagian atau penekanan (contoh: **Alamat:**, **Jurusan:**). JANGAN gunakan bintang satu atau bintang acak di tengah kalimat.
   - BULLET LIST: Gunakan tanda strip '-' atau titik bulat '•' diikuti spasi pada baris baru untuk daftar rincian.
   - LINK: Jika mencantumkan alamat website atau tautan sumber, tuliskan link lengkap yang dapat diklik langsung (contoh: https://smkn4malang.sch.id). Jangan membuat format markdown link yang berantakan atau tertutup tanda bintang aneh seperti '*Website:* [link]'.
   - Jaga agar spasi dan baris tersusun rapi tanpa simbol aneh atau tanda baca berulang.
6. NATURAL: Jangan menyebutkan istilah teknis seperti "berdasarkan database di atas", "menurut dokumen panduan", atau "berdasarkan pencarian tavily". Jawablah langsung secara alami, ramah, dan solutif sebagai KeraVokasi.
${knowledgeSection}${guideSection}${tavilySection}`;
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
export function createApp({
  generate,
  searchWeb = searchWebFallback,
  retries = MAX_RETRIES,
  retryDelayMs = RETRY_DELAY_MS,
}) {
  const app = express();

  app.use(cors(corsOptions));
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  // POST /sync - Memperbarui cache dari MySQL online tanpa restart & memproses antrean ACC (approved)
  app.post("/sync", async (_req, res) => {
    // 1. Proses data approved dari knowledge_pending ke tabel resmi jika ada
    const syncResult = await syncApprovedPendingKnowledge();

    // 2. Refresh cache knowledge items dari database relasional
    const dbItems = await fetchKnowledgeFromDb();
    if (dbItems && dbItems.length > 0) {
      cachedKnowledgeItems = dbItems;
      return res.json({
        status: "ok",
        count: dbItems.length,
        source: "mysql",
        migrated_pending: syncResult.migrated,
      });
    }
    const localItems = loadKnowledgeBase();
    return res.json({
      status: "fallback",
      count: localItems.length,
      source: "local",
      migrated_pending: syncResult.migrated,
    });
  });

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
      const items = (cachedKnowledgeItems && cachedKnowledgeItems.length > 0) ? cachedKnowledgeItems : loadKnowledgeBase();
      const guideDoc = loadGuideDocument();

      // Cek apakah memerlukan pencarian web (Tavily)
      let webResultsText = "";
      if (typeof searchWeb === "function" && shouldPerformWebSearch(parsed.message)) {
        try {
          const tavilyRes = await searchWeb(parsed.message);
          if (tavilyRes) {
            webResultsText = formatTavilyResults(tavilyRes);

            // Simpan otomatis ke antrean pending (background non-blocking)
            saveTavilyToPending(parsed.message, tavilyRes).catch((err) =>
              console.warn("[saveTavilyToPending error]", err?.message ?? err)
            );
          }
        } catch (searchErr) {
          console.warn("[Tavily search skipped]", searchErr?.message ?? searchErr);
        }
      }

      const currentPrompt = buildSystemPrompt(items, guideDoc, webResultsText);
      const reply = await withRetry(() => generate(contents, currentPrompt), {
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
  app.listen(PORT, async () => {
    console.log(`Backend berjalan di http://localhost:${PORT} (model: ${MODEL_NAME})`);
    console.log(`Timeout ${TIMEOUT_MS} ms, coba ulang maks ${MAX_RETRIES}x`);
    console.log(`CORS diizinkan untuk: ${rawOrigins.join(", ")}`);
    console.log(`Tavily Web Search: ${process.env.TAVILY_API_KEY ? "Aktif" : "Tidak aktif (TAVILY_API_KEY kosong)"}`);

    // Coba sambungkan ke database MySQL online (Railway)
    const dbItems = await fetchKnowledgeFromDb();
    if (dbItems && dbItems.length > 0) {
      cachedKnowledgeItems = dbItems;
      console.log(`Database pengetahuan MySQL Online: ${dbItems.length} entri dimuat.`);
    } else {
      console.log(`Database pengetahuan fallback (data.md): ${loadKnowledgeBase().length} entri dimuat.`);
    }

    // Jalankan sinkronisasi background berkala untuk memproses data yang di-ACC di Railway Data Viewer
    setInterval(async () => {
      try {
        const syncRes = await syncApprovedPendingKnowledge();
        if (syncRes.migrated > 0) {
          const refreshed = await fetchKnowledgeFromDb();
          if (refreshed && refreshed.length > 0) {
            cachedKnowledgeItems = refreshed;
            console.log(`[AutoSync] Berhasil memigrasikan ${syncRes.migrated} entri yang di-ACC ke tabel resmi.`);
          }
        }
      } catch (e) {
        // Abaikan error periodic sync
      }
    }, 60000); // Cek setiap 60 detik
  });
}
