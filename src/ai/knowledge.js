// src/ai/knowledge.js — Pengelolaan Basis Pengetahuan, Dokumen Panduan, & Prompt KeraVokasi
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { isCategoryAllowed, detectQuestionCategory } from "../auth/rbac.js";

let cachedKnowledgeItems = null;

export function getCachedKnowledgeItems() {
  return cachedKnowledgeItems;
}

export function setCachedKnowledgeItems(items) {
  cachedKnowledgeItems = items;
}

/**
 * Membaca data.md / data.json (berisi JSON basis pengetahuan SMK Malang).
 */
export function loadKnowledgeBase() {
  if (cachedKnowledgeItems && cachedKnowledgeItems.length > 0) {
    return cachedKnowledgeItems;
  }
  try {
    const candidatePaths = [
      new URL("../../data.md", import.meta.url),
      new URL("../data.md", import.meta.url),
      new URL("./data.md", import.meta.url),
      new URL("../../data.json", import.meta.url),
      new URL("./data.json", import.meta.url),
    ];

    for (const cand of candidatePaths) {
      try {
        const filePath = fileURLToPath(cand);
        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, "utf8");
          const items = JSON.parse(raw);
          if (Array.isArray(items)) {
            return items;
          }
        }
      } catch {
        // Coba kandidat berikutnya
      }
    }
  } catch (err) {
    console.warn("[KnowledgeBase] Gagal memuat database:", err?.message ?? err);
  }
  return [];
}

/**
 * Membaca dokumen panduan tambahan (panduan-memilih-jurusan.md).
 */
export function loadGuideDocument() {
  try {
    const candidatePaths = [
      new URL("../../panduan-memilih-jurusan.md", import.meta.url),
      new URL("../panduan-memilih-jurusan.md", import.meta.url),
      new URL("./panduan-memilih-jurusan.md", import.meta.url),
    ];

    for (const cand of candidatePaths) {
      try {
        const filePath = fileURLToPath(cand);
        if (fs.existsSync(filePath)) {
          return fs.readFileSync(filePath, "utf8");
        }
      } catch {
        // Coba kandidat berikutnya
      }
    }
  } catch (err) {
    console.warn("[GuideDocument] Gagal membaca panduan:", err?.message ?? err);
  }
  return "";
}

/**
 * Menyusun system prompt yang membatasi jawaban Gemini berdasarkan database pengetahuan,
 * dokumen panduan, dan hasil pencarian web (Tavily).
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

/**
 * Seleksi pengetahuan relevan (Knowledge Retrieval Efisien).
 * Hanya memuat baris tabel dan dokumen yang sesuai topik pertanyaan.
 */
export function selectRelevantKnowledge(message, items = [], userAllowedCategories = ["*"], userSchoolId = null) {
  if (!Array.isArray(items) || items.length === 0) {
    return { selectedItems: [], includeGuide: false };
  }

  const text = (message || "").toLowerCase().trim();

  // 1. Sapaan singkat atau ucapan terima kasih -> 0 baris database (hemat token)
  const cleanGreetingText = text.replace(/[^a-z0-9\s]/g, " ").trim();
  const greetingWords = cleanGreetingText.split(/\s+/).filter(Boolean);
  const commonGreetingWords = new Set([
    "halo", "hai", "hi", "hello", "selamat", "pagi", "siang", "sore", "malam",
    "assalamualaikum", "tes", "test", "terima", "kasih", "makasih", "thanks", "thank", "you",
    "ok", "oke", "siap", "hei", "hey", "banyak"
  ]);
  const isGreetingOnly =
    greetingWords.length > 0 && greetingWords.every((w) => commonGreetingWords.has(w));
  const isIdentityQuestion =
    /^(siapa kamu|kamu siapa|apa itu keravokasi|tentang keravokasi|profil keravokasi)/i.test(cleanGreetingText);

  if (isGreetingOnly || isIdentityQuestion) {
    return { selectedItems: [], includeGuide: false };
  }

  // 2. Pertanyaan panduan/rekomendasi jurusan -> Sertakan dokumen panduan
  const isRecommendation = /\b(rekomendasi|saran|pilih|memilih|bingung|cocok|bakat|minat|prospek|peluang kerja|gaji|perbedaan|bedanya)\b/i.test(text);

  // 3. Deteksi sekolah tertentu
  let schoolKeyword = null;
  if (/\b(telkom|moklet)\b/i.test(text)) schoolKeyword = "telkom";
  else if (/\b(smkn?\s*3|smk\s*3)\b/i.test(text)) schoolKeyword = "3";
  else if (/\b(smkn?\s*4|smk\s*4|grafika)\b/i.test(text)) schoolKeyword = "4";
  else if (/\b(smkn?\s*5|smk\s*5)\b/i.test(text)) schoolKeyword = "5";
  else if (/\b(smkn?\s*6|smk\s*6)\b/i.test(text)) schoolKeyword = "6";

  // 4. Deteksi kategori pertanyaan
  const detectedCategory = detectQuestionCategory(message);

  // 5. Filter dasar berdasarkan izin user (RBAC) & isolasi sekolah
  let allowedItems = items.filter((item) => {
    const catOk = isCategoryAllowed(item.category, userAllowedCategories);
    const schoolOk = !userSchoolId || item.school_id === userSchoolId;
    return catOk && schoolOk;
  });

  if (schoolKeyword) {
    const schoolItems = allowedItems.filter((item) => {
      const name = (item.school_name || "smk telkom malang").toLowerCase();
      if (schoolKeyword === "telkom") return name.includes("telkom");
      return name.includes(`smkn ${schoolKeyword}`) || name.includes(`smk negeri ${schoolKeyword}`) || name.includes(`smk ${schoolKeyword}`);
    });
    if (schoolItems.length > 0) {
      allowedItems = schoolItems;
    }
  }

  // 6. Filter spesifik berdasarkan kategori pertanyaan jika ada
  let categoryFiltered = allowedItems;
  if (detectedCategory) {
    const normalizeCat = (cat) => {
      const c = String(cat).toLowerCase();
      if (c.includes("daftar") || c.includes("ppdb")) return "Pendaftaran";
      if (c.includes("ekskul") || c.includes("kegiatan")) return "Kegiatan";
      if (c.includes("alamat") || c.includes("kontak")) return "Alamat & Kontak";
      if (c.includes("jurusan")) return "Jurusan";
      if (c.includes("profil")) return "Profil";
      if (c.includes("fasilitas")) return "Fasilitas";
      return cat;
    };

    const targetCat = normalizeCat(detectedCategory);
    const matched = allowedItems.filter((item) => normalizeCat(item.category) === targetCat);
    if (matched.length > 0) {
      categoryFiltered = matched;
    }
  }

  // 7. Relevance scoring kata kunci teks
  const words = text
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const scored = categoryFiltered.map((item) => {
    let score = 0;
    const itemText = `${item.title || ""} ${item.keywords || ""} ${item.content || ""}`.toLowerCase();
    for (const word of words) {
      if (itemText.includes(word)) {
        score += 2;
      }
    }
    const titleText = (item.title || "").toLowerCase();
    for (const word of words) {
      if (titleText.includes(word)) {
        score += 3;
      }
    }
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topItems = scored.slice(0, 4).map((s) => s.item);

  return {
    selectedItems: topItems,
    includeGuide: isRecommendation,
  };
}

/**
 * Mengekstrak sumber data (sources) yang relevan dari database untuk response chat.
 */
export function extractSources(message, reply, items = []) {
  const sources = [];
  const text = `${message} ${reply}`.toLowerCase();

  for (const item of items) {
    const school = (item.school_name || "").toLowerCase();
    const cleanSchool = school.replace("smk negeri", "smkn").replace("smk ", "");
    const title = (item.title || "").toLowerCase();

    const matchesSchool = cleanSchool && text.includes(cleanSchool);
    const matchesTitle = title.split(/\s+/).some((w) => w.length > 4 && text.includes(w));

    if (matchesSchool && matchesTitle) {
      if (!sources.some((s) => s.id === item.id)) {
        sources.push({
          id: item.id,
          school: item.school_name,
          category: item.category,
          title: item.title,
        });
      }
    }
    if (sources.length >= 3) break;
  }

  return sources;
}
