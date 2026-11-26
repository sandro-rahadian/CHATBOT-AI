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
5. FORMAT JAWABAN (SANGAT BERSIH, RAPI, & KONSISTEN):
   - Gunakan format teks standar yang rapi, padat, dan mudah dibaca.
   - BOLD KONSISTEN:
     * Tebalkan judul bagian atau nomor sekolah (contoh: **1. SMK Telkom Malang**, **2. SMK Negeri 4 Malang**, **3. SMK Negeri 5 Malang**).
     * Saat menampilkan butir daftar jurusan atau rincian untuk setiap sekolah, gunakan format yang SERAGAM dan KONSISTEN di semua sekolah:
       - **Nama Jurusan (Singkatan)**: penjelasan singkat atau fokus bidangnya
       atau jika hanya menyebutkan nama jurusan:
       - **Nama Jurusan (Singkatan)**
     * JANGAN PERNAH membuat satu sekolah ditebalkan sementara sekolah lain tidak ditebalkan atau sebagian kata acak ditebalkan.
     * Hanya tebalkan label/nama jurusannya saja (contoh: '- **Rekayasa Perangkat Lunak (RPL)**: Pemrograman...', BUKAN menebalkan seluruh kalimat butir).
   - BULLET LIST RAPAT & COMPACT (DILARANG DOUBLE ENTER / TIDAK BERJARAK):
     * Wajib selalu gunakan tanda strip '-' diikuti satu spasi di awal baris (contoh: '- **RPL**: Pembuatan aplikasi').
     * DILARANG menggunakan karakter simbol titik bulat unicode seperti '•', '●', atau '○'. Gunakan selalu tanda strip '-'.
     * DILARANG menambahkan baris kosong antar-butir list (jangan ada double newline / enter ganda di antara butir). Setiap butir list harus langsung berlanjut di baris baru tepat di bawah butir sebelumnya agar daftar tampil rapat dan rapi.
   - LINK: Jika mencantumkan alamat website atau tautan sumber, tuliskan link lengkap yang dapat diklik langsung (contoh: https://smkn4malang.sch.id). Jangan membuat format markdown link yang berantakan atau tertutup tanda bintang aneh seperti '*Website:* [link]'.
   - Jaga agar spasi dan baris tersusun rapi tanpa simbol aneh atau tanda baca berulang.
6. NATURAL: Jangan menyebutkan istilah teknis seperti "berdasarkan database di atas", "menurut dokumen panduan", atau "berdasarkan pencarian tavily". Jawablah langsung secara alami, ramah, dan solutif sebagai KeraVokasi.
7. ANALISIS GAMBAR (MULTIMODAL): Jika pengguna mengirimkan gambar (misalnya brosur PPDB, logo sekolah, foto gedung/fasilitas, jadwal, infografis jurusan, atau dokumen lainnya), analisislah isi visual serta teks di dalam gambar secara cermat, lalu padukan hasil analisis gambar tersebut dengan ketiga sumber informasi resmi (SUMBER 1 Database, SUMBER 2 Dokumen Panduan, dan SUMBER 3 Pencarian Web jika tersedia) untuk memberikan jawaban yang akurat, relevan, dan lengkap seputar SMK di Malang.
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
  const isRecommendation = /\b(rekomendasi|saran|pilih|memilih|bingung|cocok|bakat|minat|prospek|peluang kerja|gaji)\b/i.test(text);

  // 3. Deteksi sekolah tertentu (mendukung satu atau beberapa sekolah sekaligus)
  const schoolKeywords = [];
  if (/\b(telkom|moklet)\b/i.test(text)) schoolKeywords.push("telkom");
  if (/\b(smkn?\s*3|smk\s*3)\b/i.test(text)) schoolKeywords.push("3");
  if (/\b(smkn?\s*4|smk\s*4|grafika)\b/i.test(text)) schoolKeywords.push("4");
  if (/\b(smkn?\s*5|smk\s*5)\b/i.test(text)) schoolKeywords.push("5");
  if (/\b(smkn?\s*6|smk\s*6)\b/i.test(text)) schoolKeywords.push("6");

  // Jika membandingkan beberapa sekolah atau meminta perbandingan
  const isMultiSchool = schoolKeywords.length > 1;
  const isComparison = isMultiSchool || /\b(bandingkan|perbedaan|bedanya|antara)\b/i.test(text);
  const includeGuide = isRecommendation || isComparison;

  // 4. Deteksi kategori pertanyaan
  const detectedCategory = detectQuestionCategory(message);

  // 5. Filter dasar berdasarkan izin user (RBAC) & isolasi sekolah
  let allowedItems = items.filter((item) => {
    const catOk = isCategoryAllowed(item.category, userAllowedCategories);
    const schoolOk = !userSchoolId || item.school_id === userSchoolId;
    return catOk && schoolOk;
  });

  if (schoolKeywords.length > 0) {
    const schoolItems = allowedItems.filter((item) => {
      const name = (item.school_name || "smk telkom malang").toLowerCase();
      return schoolKeywords.some((kw) => {
        if (kw === "telkom") return name.includes("telkom");
        return name.includes(`smkn ${kw}`) || name.includes(`smk negeri ${kw}`) || name.includes(`smk ${kw}`);
      });
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

  if (schoolKeywords.length > 1) {
    // Pastikan setiap sekolah yang disebut pengguna mendapatkan alokasi item relevan
    const perSchoolItems = [];
    for (const kw of schoolKeywords) {
      const matchSchool = (name) => {
        const n = (name || "").toLowerCase();
        if (kw === "telkom") return n.includes("telkom");
        return n.includes(`smk negeri ${kw}`) || n.includes(`smkn ${kw}`) || n.includes(`smk ${kw}`);
      };

      const matchingForSchool = scored.filter((s) => matchSchool(s.item.school_name));

      if (matchingForSchool.length > 0) {
        // Ambil maksimal 2 item teratas per sekolah agar prompt ringkas dan respon kilat (< 4 detik)
        perSchoolItems.push(...matchingForSchool.slice(0, 2).map((s) => s.item));
      } else {
        // Fallback: jika sekolah tidak memiliki data pada kategori spesifik (misal PPDB),
        // sertakan profil atau jurusan sekolah tersebut agar AI memiliki konteks lengkap sekolah tersebut
        const schoolFallback = allowedItems.filter((item) => matchSchool(item.school_name));
        perSchoolItems.push(...schoolFallback.slice(0, 2));
      }
    }
    const finalSelected = perSchoolItems.length > 0 ? perSchoolItems : scored.slice(0, 8).map((s) => s.item);
    return {
      selectedItems: finalSelected,
      includeGuide,
    };
  }

  const maxSelected = 4;
  const topItems = scored.slice(0, maxSelected).map((s) => s.item);

  return {
    selectedItems: topItems,
    includeGuide,
  };
}

/**
 * Membersihkan output markdown dari Gemini agar rapat, bebas baris kosong berlebih,
 * dan menggunakan bullet list standar '-'.
 */
export function cleanMarkdownOutput(text) {
  if (typeof text !== "string") return text;
  let cleaned = text;

  // 1. Ubah bullet unicode (•, ●, ○) di awal baris menjadi standard markdown hyphen (-)
  cleaned = cleaned.replace(/^[ \t]*[•●○][ \t]*/gm, "- ");

  // 2. Hilangkan baris kosong ganda (double newline) di antara item-item bullet list agar list rapat (tight list)
  cleaned = cleaned.replace(/(^[-*]\s+[^\n]+)\n\n+(?=[-*]\s+)/gm, "$1\n");

  // 3. Hilangkan baris kosong ganda di antara item numbered list
  cleaned = cleaned.replace(/(^\d+\.\s+[^\n]+)\n\n+(?=\d+\.\s+)/gm, "$1\n");

  // 4. Batasi newline beruntun maksimal 2 (\n\n) agar tidak ada rongga kosong berlebihan
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  return cleaned.trim();
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
