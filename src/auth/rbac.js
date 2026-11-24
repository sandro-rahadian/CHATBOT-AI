// src/auth/rbac.js — Role-Based Access Control (RBAC), Kuota Harian, & Kategori Pertanyaan
import { getDbPool } from "../db/pool.js";
import { DEFAULT_USERS, guestQuotaMap } from "./users.js";

/**
 * Mendeteksi topik/kategori pertanyaan pengguna untuk pembatasan izin RBAC.
 */
export function detectQuestionCategory(message) {
  if (typeof message !== "string") return null;
  const text = message.toLowerCase();

  if (/\b(profil|tentang sekolah|sejarah|berdiri|didirikan|yayasan|visi|misi|kepala sekolah|kepsek|akreditasi|kurikulum)\b/i.test(text)) {
    return "Profil";
  }
  if (/\b(alamat|lokasi|dimana|letak|maps|rute|telepon|telp|nomor telepon|wa|whatsapp|email|website|fax|kontak)\b/i.test(text)) {
    return "Alamat & Kontak";
  }
  if (/\b(ppdb|daftar|pendaftaran|siswa baru|syarat masuk|persyaratan|biaya|spp|uang gedung|gelombang|jadwal)\b/i.test(text)) {
    return "Pendaftaran";
  }
  if (/\b(jurusan|kompetensi keahlian|program studi|prodi|rpl|tkj|dkv|animasi|kuliner|tata boga|perhotelan|mekatronika|logistik)\b/i.test(text)) {
    return "Jurusan";
  }
  if (/\b(fasilitas|sarana|prasarana|lab|laboratorium|bengkel|lapangan|perpustakaan|perpus|gedung)\b/i.test(text)) {
    return "Fasilitas";
  }
  if (/\b(ekskul|ekstrakurikuler|kegiatan|organisasi|osis|pramuka|paskibra|basket|futsal|silat|pmr)\b/i.test(text)) {
    return "Kegiatan";
  }

  return null;
}

/**
 * Memeriksa apakah kategori pertanyaan diizinkan berdasarkan daftar hak akses role.
 */
export function isCategoryAllowed(category, allowedCategories) {
  if (!category) return true;
  if (!Array.isArray(allowedCategories)) return false;
  if (allowedCategories.includes("*")) return true;

  const normalize = (cat) => {
    const c = String(cat).toLowerCase();
    if (c.includes("daftar") || c.includes("ppdb")) return "Pendaftaran";
    if (c.includes("ekskul") || c.includes("kegiatan")) return "Kegiatan";
    if (c.includes("alamat") || c.includes("kontak")) return "Alamat & Kontak";
    if (c.includes("jurusan")) return "Jurusan";
    if (c.includes("profil")) return "Profil";
    if (c.includes("fasilitas")) return "Fasilitas";
    return cat;
  };

  const target = normalize(category);
  return allowedCategories.some((allowed) => normalize(allowed) === target);
}

/**
 * Memvalidasi token x-api-token dan mengembalikan profil hak akses serta sisa kuota harian.
 */
export async function resolveUserAccess(apiToken, clientIp = "127.0.0.1") {
  const pool = getDbPool();
  const today = new Date().toISOString().slice(0, 10);

  // 1. Jika token disediakan, verifikasi di database users
  if (apiToken && typeof apiToken === "string" && apiToken.trim() !== "") {
    if (pool) {
      try {
        const [rows] = await pool.query(`
          SELECT u.*, r.allowed_categories AS role_categories, r.daily_limit AS role_daily_limit, r.can_web_search AS role_web_search
          FROM users u
          JOIN role_permissions r ON u.role = r.role
          WHERE u.api_token = ?
          LIMIT 1
        `, [apiToken.trim()]);

        if (Array.isArray(rows) && rows.length > 0) {
          const user = rows[0];

          // Reset hitungan harian jika tanggal berganti
          let dailyCount = user.daily_count;
          const userLastReset = user.last_reset ? new Date(user.last_reset).toISOString().slice(0, 10) : "";
          if (userLastReset !== today) {
            dailyCount = 0;
            await pool.query("UPDATE users SET daily_count = 0, last_reset = ? WHERE id = ?", [today, user.id]);
          }

          let allowedCategories = ["*"];
          try {
            if (user.allowed_categories) {
              allowedCategories = typeof user.allowed_categories === "string" ? JSON.parse(user.allowed_categories) : user.allowed_categories;
            } else if (user.role_categories) {
              allowedCategories = typeof user.role_categories === "string" ? JSON.parse(user.role_categories) : user.role_categories;
            }
          } catch {
            allowedCategories = ["*"];
          }

          const dailyLimit = user.daily_limit !== null && user.daily_limit !== undefined ? user.daily_limit : user.role_daily_limit;
          const remainingQuota = dailyLimit === null || dailyLimit === undefined ? null : Math.max(0, dailyLimit - dailyCount);
          const canWebSearch = user.role === "admin" || user.role === "guru" || Boolean(user.role_web_search);

          return {
            valid: true,
            user: {
              id: user.id,
              username: user.username,
              role: user.role,
              schoolId: user.school_id,
              allowedCategories,
              dailyLimit,
              remainingQuota,
              canWebSearch,
            },
          };
        }
      } catch (err) {
        console.warn("[RBAC] Gagal mencari user token di DB:", err?.message ?? err);
      }
    } else {
      // Fallback lokal / offline jika database belum tersambung
      const def = DEFAULT_USERS.find((u) => u.api_token === apiToken.trim());
      if (def) {
        return {
          valid: true,
          user: {
            id: def.id,
            username: def.username,
            role: def.role,
            schoolId: def.school_id,
            allowedCategories: def.allowed_categories,
            dailyLimit: def.daily_limit,
            remainingQuota: def.daily_limit === null ? null : def.daily_limit - def.daily_count,
            canWebSearch: def.can_web_search,
          },
        };
      }
    }

    // Token dikirim tetapi tidak valid
    return {
      valid: false,
      error: "Token tidak valid. Periksa kembali header x-api-token Anda.",
    };
  }

  // 2. Jika tanpa token -> Role Guest (Tamu)
  let guestDailyCount = 0;
  const ipKey = clientIp || "127.0.0.1";
  const guestUsage = guestQuotaMap.get(ipKey);
  if (guestUsage && guestUsage.date === today) {
    guestDailyCount = guestUsage.count;
  } else {
    guestQuotaMap.set(ipKey, { count: 0, date: today });
  }

  const guestLimit = 10;
  const guestRemaining = Math.max(0, guestLimit - guestDailyCount);

  return {
    valid: true,
    user: {
      id: null,
      username: "guest",
      role: "guest",
      schoolId: null,
      allowedCategories: ["Alamat & Kontak", "Pendaftaran"],
      dailyLimit: guestLimit,
      remainingQuota: guestRemaining,
      canWebSearch: false,
      clientIp: ipKey,
    },
  };
}

/**
 * Mengurangi sisa kuota (increment daily_count) setelah pesan berhasil dijawab AI.
 */
export async function consumeUserQuota(userAccess) {
  const pool = getDbPool();
  const user = userAccess?.user;
  if (!user) return;

  if (user.role === "admin" || user.dailyLimit === null) {
    return; // Admin / unlimited tidak dikurangi
  }

  if (user.id && pool) {
    try {
      await pool.query("UPDATE users SET daily_count = daily_count + 1 WHERE id = ?", [user.id]);
    } catch (err) {
      console.warn("[RBAC] Gagal menambah daily_count:", err?.message ?? err);
    }
  } else if (user.role === "guest" && user.clientIp) {
    const today = new Date().toISOString().slice(0, 10);
    const curr = guestQuotaMap.get(user.clientIp) || { count: 0, date: today };
    guestQuotaMap.set(user.clientIp, { count: curr.count + 1, date: today });
  }
}
