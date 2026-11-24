// src/db/schema.js — Agentic Database Tools (Text-to-SQL dengan Security Guardrails)
import { getDbPool } from "./pool.js";

/**
 * Mendeskripsikan skema relasional database MySQL kepada LLM Agent.
 */
export function getDbSchemaDescription() {
  return `
Kamu memiliki akses ke database MySQL sekolah kejuruan di Malang dengan skema relasional berikut:

TABEL UTAMA:
1. schools (id, name, aliases, address) - Tabel induk data sekolah (SMK Telkom Malang, SMKN 3 Malang, SMKN 4 Malang, SMKN 5 Malang, SMKN 6 Malang, dll).
2. school_profiles (id, school_id, title, content, keywords) - Profil sekolah, visi, misi, akreditasi, dan sejarah.
3. school_majors (id, school_id, title, content, keywords) - Daftar jurusan, konsentrasi keahlian, dan kurikulum (contoh: RPL, TKJ, DKV, Animasi, Kuliner, dll).
4. school_facilities (id, school_id, title, content, keywords) - Fasilitas gedung, laboratorium komputer, bengkel praktek, sarana olahraga, dan asrama.
5. school_address_contacts (id, school_id, title, content, keywords) - Nomor telepon kantor, call center / WhatsApp, alamat lengkap, email resmi, dan media sosial.
6. school_ppdb (id, school_id, title, content, keywords) - Informasi PPDB, syarat pendaftaran, jalur masuk, rincian biaya / SPP, dan jadwal.
7. school_activities (id, school_id, title, content, keywords) - Ekstrakurikuler, organisasi kesiswaan (OSIS, MPK), dan kegiatan tahunan.

ATURAN RELASI ANTAR-TABEL:
- Semua tabel 'school_*' terhubung ke tabel induk 'schools.id' melalui foreign key 'school_id'.
- Gunakan JOIN 'schools' jika Anda perlu mencocokkan atau memfilter nama sekolah.
- Gunakan kata kunci fleksibel dengan LIKE '%nama%'.
- Contoh Query:
  SELECT f.title, f.content FROM school_facilities f JOIN schools s ON f.school_id = s.id WHERE s.name LIKE '%Telkom%';
`;
}

/**
 * Eksekusi query SELECT read-only ke database MySQL dengan sanitasi keamanan ketat.
 * Mencegah SQL injection destruktif (DDL/DML) dan membatasi ukuran output ke Gemini.
 */
export async function executeDbQueryTool(sqlQuery) {
  const cleanSql = (sqlQuery || "").trim();

  // Guardrail 1: Wajib berawalan SELECT
  if (!cleanSql.toLowerCase().startsWith("select")) {
    return { error: "Keamanan: Hanya query SELECT (Read-Only) yang diizinkan." };
  }

  // Guardrail 2: Blokir keyword manipulasi data & DDL
  const forbiddenKeywords = ["insert", "update", "delete", "drop", "alter", "truncate", "create", "grant", "revoke"];
  const tokens = cleanSql.toLowerCase().split(/\s+/);
  if (forbiddenKeywords.some((kw) => tokens.includes(kw))) {
    return { error: "Keamanan: Query mengandung perintah manipulasi data atau DDL yang dilarang." };
  }

  const pool = getDbPool();
  if (!pool) {
    return { error: "Database offline atau koneksi pool MySQL tidak tersedia." };
  }

  try {
    // Batasi limit maksimal 25 baris agar token tidak meluap
    const finalSql = cleanSql.toLowerCase().includes("limit") ? cleanSql : `${cleanSql} LIMIT 25`;
    const [rows] = await pool.query(finalSql);
    return { success: true, count: rows.length, data: rows };
  } catch (err) {
    return { error: `Query SQL gagal dieksekusi: ${err.message}` };
  }
}
