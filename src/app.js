// src/app.js — Express App Factory, Routing, & Middleware
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { corsOptions, MAX_RETRIES, RETRY_DELAY_MS } from "./config.js";
import { getDbPool, fetchKnowledgeFromDb, syncApprovedPendingKnowledge } from "./db/pool.js";
import {
  createConversation,
  getConversationsByUser,
  getConversationWithMessages,
  appendMessageToConversation,
  deleteConversation,
} from "./db/conversations.js";
import { DEFAULT_USERS } from "./auth/users.js";
import {
  resolveUserAccess,
  detectQuestionCategory,
  isCategoryAllowed,
  consumeUserQuota,
} from "./auth/rbac.js";
import {
  loadKnowledgeBase,
  loadGuideDocument,
  buildSystemPrompt,
  selectRelevantKnowledge,
  extractSources,
  getCachedKnowledgeItems,
  setCachedKnowledgeItems,
  cleanMarkdownOutput,
} from "./ai/knowledge.js";
import {
  shouldPerformWebSearch,
  formatTavilyResults,
  searchWebFallback,
  saveTavilyToPending,
} from "./ai/search.js";
import {
  validateChatBody,
  toGeminiContents,
  withRetry,
  toClientError,
} from "./ai/gemini.js";

/**
 * Membuat instance Express App beserta seluruh routing dan middleware.
 */
export function createApp({
  generate,
  searchWeb = searchWebFallback,
  retries = MAX_RETRIES,
  retryDelayMs = RETRY_DELAY_MS,
}) {
  const app = express();

  app.use(cors(corsOptions));
  app.use(express.json({ limit: "100kb" }));

  // GET /health - Pengecekan status server
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  // GET /users - Mengambil daftar akun terdaftar untuk komponen antarmuka demo
  app.get("/users", async (_req, res) => {
    const pool = getDbPool();
    if (!pool) {
      return res.json({
        users: [
          { id: 1, username: "budi_siswa", role: "siswa", school_id: null, allowed_categories: null, daily_limit: null },
          { id: 2, username: "pak_andi_guru", role: "guru", school_id: null, allowed_categories: null, daily_limit: null },
          { id: 3, username: "admin_utama", role: "admin", school_id: null, allowed_categories: null, daily_limit: null },
        ],
      });
    }
    try {
      const [users] = await pool.query(
        "SELECT id, username, role, school_id, allowed_categories, daily_limit FROM users ORDER BY id ASC"
      );
      return res.json({ users });
    } catch (err) {
      console.warn("[GET /users] Error:", err?.message ?? err);
      return res.status(500).json({ error: "Gagal mengambil daftar user." });
    }
  });

  // POST /login - Login pengguna dan mengembalikan token serta sisa kuota
  app.post("/login", async (req, res) => {
    const { username } = req.body ?? {};
    if (!username || typeof username !== "string" || username.trim() === "") {
      return res.status(400).json({ error: "Username wajib diisi." });
    }

    const pool = getDbPool();
    if (!pool) {
      const def = DEFAULT_USERS.find((u) => u.username === username.trim());
      if (!def) {
        return res.status(401).json({ error: "Username tidak ditemukan." });
      }
      return res.json({
        message: "Login berhasil",
        token: def.api_token,
        user: {
          username: def.username,
          role: def.role,
          schoolId: def.school_id,
          allowedCategories: def.allowed_categories,
          dailyLimit: def.daily_limit,
          remainingQuota: def.daily_limit === null ? null : def.daily_limit - def.daily_count,
        },
      });
    }

    try {
      const [rows] = await pool.query(`
        SELECT u.*, r.allowed_categories AS role_categories, r.daily_limit AS role_daily_limit
        FROM users u
        JOIN role_permissions r ON u.role = r.role
        WHERE u.username = ?
        LIMIT 1
      `, [username.trim()]);

      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(401).json({ error: "Username tidak ditemukan." });
      }

      const user = rows[0];
      const today = new Date().toISOString().slice(0, 10);
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

      return res.json({
        message: "Login berhasil",
        token: user.api_token,
        user: {
          username: user.username,
          role: user.role,
          schoolId: user.school_id,
          allowedCategories,
          dailyLimit,
          remainingQuota,
        },
      });
    } catch (err) {
      console.error("[POST /login] Error:", err?.message ?? err);
      return res.status(500).json({ error: "Terjadi kesalahan pada server saat login." });
    }
  });

  // POST /register - Registrasi akun pengguna baru
  app.post("/register", async (req, res) => {
    const { username, role = "siswa", school_id = null } = req.body ?? {};
    if (!username || typeof username !== "string" || username.trim() === "") {
      return res.status(400).json({ error: "Username wajib diisi." });
    }

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, "_");
    const chosenRole = ["siswa", "guru"].includes(role) ? role : "siswa";
    const apiToken = `token-${cleanUsername}-${Date.now().toString().slice(-4)}`;

    const pool = getDbPool();
    if (!pool) {
      return res.status(201).json({
        message: "Registrasi berhasil",
        token: apiToken,
        user: {
          username: cleanUsername,
          role: chosenRole,
          schoolId: school_id,
          allowedCategories:
            chosenRole === "guru"
              ? ["Profil", "Alamat & Kontak", "Pendaftaran", "Jurusan", "Fasilitas", "Kegiatan", "Hasil riset web"]
              : ["Alamat & Kontak", "Pendaftaran", "Jurusan", "Fasilitas"],
          dailyLimit: chosenRole === "guru" ? 200 : 50,
          remainingQuota: chosenRole === "guru" ? 200 : 50,
        },
      });
    }

    try {
      const [existing] = await pool.query(
        "SELECT id FROM users WHERE username = ? LIMIT 1",
        [cleanUsername]
      );
      if (Array.isArray(existing) && existing.length > 0) {
        return res.status(400).json({ error: "Username sudah digunakan. Silakan pilih username lain." });
      }

      const today = new Date().toISOString().slice(0, 10);
      await pool.query(
        "INSERT INTO users (username, api_token, role, school_id, daily_count, last_reset) VALUES (?, ?, ?, ?, 0, ?)",
        [cleanUsername, apiToken, chosenRole, school_id || null, today]
      );

      const [rolePerms] = await pool.query(
        "SELECT * FROM role_permissions WHERE role = ? LIMIT 1",
        [chosenRole]
      );
      const roleRow = Array.isArray(rolePerms) && rolePerms.length > 0 ? rolePerms[0] : null;

      let allowedCategories = ["*"];
      try {
        if (roleRow && roleRow.allowed_categories) {
          allowedCategories =
            typeof roleRow.allowed_categories === "string"
              ? JSON.parse(roleRow.allowed_categories)
              : roleRow.allowed_categories;
        }
      } catch {
        allowedCategories = ["*"];
      }

      const dailyLimit = roleRow?.daily_limit ?? (chosenRole === "guru" ? 200 : 50);

      return res.status(201).json({
        message: "Registrasi berhasil",
        token: apiToken,
        user: {
          username: cleanUsername,
          role: chosenRole,
          schoolId: school_id,
          allowedCategories,
          dailyLimit,
          remainingQuota: dailyLimit,
        },
      });
    } catch (err) {
      console.error("[POST /register] Error:", err?.message ?? err);
      return res.status(500).json({ error: "Terjadi kesalahan pada server saat pendaftaran." });
    }
  });

  // GET /me - Profil dan sisa kuota pengguna saat ini
  app.get("/me", async (req, res) => {
    const token = req.headers["x-api-token"];
    const clientIp = req.ip || req.socket?.remoteAddress || "127.0.0.1";
    const userAccess = await resolveUserAccess(token, clientIp);

    if (!userAccess.valid) {
      return res.status(401).json({ error: userAccess.error });
    }

    const u = userAccess.user;
    return res.json({
      username: u.username,
      role: u.role,
      schoolId: u.schoolId,
      allowedCategories: u.allowedCategories,
      dailyLimit: u.dailyLimit,
      remainingQuota: u.remainingQuota,
    });
  });

  // GET /conversations - Daftar riwayat percakapan pengguna
  app.get("/conversations", async (req, res) => {
    const token = req.headers["x-api-token"];
    const clientIp = req.ip || req.socket?.remoteAddress || "127.0.0.1";
    const userAccess = await resolveUserAccess(token, clientIp);

    if (!userAccess.valid || !userAccess.user?.id) {
      return res.status(401).json({ error: "Harap login untuk melihat riwayat percakapan." });
    }

    const conversations = await getConversationsByUser(userAccess.user.id);
    return res.json({ conversations });
  });

  // POST /conversations - Membuat sesi percakapan baru
  app.post("/conversations", async (req, res) => {
    const token = req.headers["x-api-token"];
    const clientIp = req.ip || req.socket?.remoteAddress || "127.0.0.1";
    const userAccess = await resolveUserAccess(token, clientIp);

    if (!userAccess.valid || !userAccess.user?.id) {
      return res.status(401).json({ error: "Harap login untuk membuat percakapan baru." });
    }

    const { title } = req.body ?? {};
    const conversation = await createConversation({
      userId: userAccess.user.id,
      title: title || "Obrolan Baru",
    });
    return res.status(201).json({ conversation });
  });

  // GET /conversations/:id - Mengambil percakapan beserta seluruh pesannya
  app.get("/conversations/:id", async (req, res) => {
    const token = req.headers["x-api-token"];
    const clientIp = req.ip || req.socket?.remoteAddress || "127.0.0.1";
    const userAccess = await resolveUserAccess(token, clientIp);

    if (!userAccess.valid || !userAccess.user?.id) {
      return res.status(401).json({ error: "Harap login untuk melihat pesan percakapan." });
    }

    const result = await getConversationWithMessages(req.params.id, userAccess.user.id);
    if (result.error === "forbidden") {
      return res.status(403).json({ error: "Anda tidak memiliki izin untuk melihat percakapan ini." });
    }
    if (result.error === "not_found" || !result.conversation) {
      return res.status(404).json({ error: "Percakapan tidak ditemukan." });
    }
    return res.json(result);
  });

  // DELETE /conversations/:id - Menghapus sesi percakapan
  app.delete("/conversations/:id", async (req, res) => {
    const token = req.headers["x-api-token"];
    const clientIp = req.ip || req.socket?.remoteAddress || "127.0.0.1";
    const userAccess = await resolveUserAccess(token, clientIp);

    if (!userAccess.valid || !userAccess.user?.id) {
      return res.status(401).json({ error: "Harap login untuk menghapus percakapan." });
    }

    const result = await deleteConversation(req.params.id, userAccess.user.id);
    if (result.error === "forbidden") {
      return res.status(403).json({ error: "Anda tidak memiliki izin untuk menghapus percakapan ini." });
    }
    return res.json({ message: "Percakapan berhasil dihapus." });
  });

  // POST /sync - Memperbarui cache dari MySQL & memproses antrean ACC
  app.post("/sync", async (_req, res) => {
    const syncResult = await syncApprovedPendingKnowledge();
    const dbItems = await fetchKnowledgeFromDb();
    if (dbItems && dbItems.length > 0) {
      setCachedKnowledgeItems(dbItems);
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
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Terlalu banyak permintaan, coba lagi sebentar lagi" },
  });

  // POST /chat - Chatbot utama dengan RBAC dan isolasi hak akses
  app.post("/chat", chatLimiter, async (req, res) => {
    const parsed = validateChatBody(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    // 1. Verifikasi Token & RBAC
    const token = req.headers["x-api-token"];
    const clientIp = req.ip || req.socket?.remoteAddress || "127.0.0.1";
    const userAccess = await resolveUserAccess(token, clientIp);

    if (!userAccess.valid) {
      return res.status(401).json({ error: userAccess.error });
    }

    const { user } = userAccess;

    // 2. Cek Kuota Harian
    if (user.dailyLimit !== null && user.remainingQuota !== null && user.remainingQuota <= 0) {
      return res.status(429).json({
        error: `Kuota pertanyaan harian untuk role '${user.role}' (${user.dailyLimit}x/hari) telah habis.`,
      });
    }

    // 3. Cek Izin Kategori Pertanyaan
    const detectedCategory = detectQuestionCategory(parsed.message);
    if (detectedCategory && !isCategoryAllowed(detectedCategory, user.allowedCategories)) {
      return res.json({
        reply: `Maaf, akun dengan role '${user.role}' tidak memiliki izin untuk membaca informasi pada topik "${detectedCategory}".`,
        role: user.role,
        sources: [],
      });
    }

    try {
      const contents = toGeminiContents(parsed.history, parsed.message);
      const cached = getCachedKnowledgeItems();
      const allItems = (cached && cached.length > 0) ? cached : loadKnowledgeBase();

      // 4. Seleksi Basis Pengetahuan Efisien
      const { selectedItems, includeGuide } = selectRelevantKnowledge(
        parsed.message,
        allItems,
        user.allowedCategories,
        user.schoolId
      );

      const guideDoc = includeGuide ? loadGuideDocument() : "";

      // Cek apakah membutuhkan pencarian web Tavily (khusus guru & admin)
      let webResultsText = "";
      if (user.canWebSearch && typeof searchWeb === "function" && shouldPerformWebSearch(parsed.message)) {
        try {
          const tavilyRes = await searchWeb(parsed.message);
          if (tavilyRes) {
            webResultsText = formatTavilyResults(tavilyRes);

            // Simpan ke antrean pending (background non-blocking)
            saveTavilyToPending(parsed.message, tavilyRes).catch((err) =>
              console.warn("[saveTavilyToPending error]", err?.message ?? err)
            );
          }
        } catch (searchErr) {
          console.warn("[Tavily search skipped]", searchErr?.message ?? searchErr);
        }
      }

      // 5. Hubungkan ke sesi percakapan jika user terautentikasi
      let activeConv = null;
      if (user.id) {
        if (parsed.conversation_id) {
          const existing = await getConversationWithMessages(parsed.conversation_id, user.id);
          if (existing && !existing.error) {
            activeConv = existing.conversation;
          }
        }
        if (!activeConv) {
          activeConv = await createConversation({
            userId: user.id,
            title: parsed.message.slice(0, 45),
          });
        }
        await appendMessageToConversation(activeConv.id, {
          role: "user",
          content: parsed.message,
        });
      }

      const currentPrompt = buildSystemPrompt(selectedItems, guideDoc, webResultsText);
      const rawReply = await withRetry(() => generate(contents, currentPrompt), {
        retries,
        delayMs: retryDelayMs,
        onRetry: (err, n) =>
          console.warn(`[Gemini] percobaan ${n} gagal (${err?.status ?? err?.code ?? "error"}), mencoba ulang...`),
      });

      if (!rawReply || !rawReply.trim()) {
        return res.status(502).json({ error: "Gemini tidak mengembalikan jawaban" });
      }

      // Bersihkan format markdown (rapikan bullet list, hilangkan double newline antar item, seragamkan bullet)
      const reply = cleanMarkdownOutput(rawReply);

      // Kurangi kuota harian user setelah pesan berhasil dijawab
      await consumeUserQuota(userAccess);

      // Ekstrak sumber data referensi
      const sources = extractSources(parsed.message, reply, selectedItems.length > 0 ? selectedItems : allItems);

      // Simpan balasan assistant ke percakapan jika user terautentikasi
      if (activeConv) {
        await appendMessageToConversation(activeConv.id, {
          role: "assistant",
          content: reply,
          sources,
        });
      }

      return res.json({
        reply,
        role: user.role,
        sources,
        conversation_id: activeConv ? activeConv.id : null,
      });
    } catch (err) {
      console.error("[Gemini error]", err?.message ?? err);
      const { status, error } = toClientError(err);
      return res.status(status).json({ error });
    }
  });

  // 404 Route
  app.use((_req, res) => res.status(404).json({ error: "Endpoint tidak ditemukan" }));

  // Global Error Handler
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
