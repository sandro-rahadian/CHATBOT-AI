// src/db/pool.js — Koneksi Pool MySQL dan Sinkronisasi Pengetahuan
import mysql from "mysql2/promise";

let cachedDbPool = null;

/**
 * Singleton connection pool ke MySQL database (Railway / lokal).
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
 * Fallback pengambilan data pengetahuan antar-tabel relasional (legacy query UNION ALL).
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
    console.warn("[MySQL] Gagal mengambil data antar-tabel:", err?.message ?? err);
  }
  return null;
}

/**
 * Sinkronisasi data approved dari antrean knowledge_pending ke tabel resmi.
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

      await pool.query(`
        INSERT INTO \`${targetTable}\` (school_id, title, content, keywords)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          content = VALUES(content),
          keywords = VALUES(keywords)
      `, [targetSchoolId, title, row.answer, keywords]);

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
