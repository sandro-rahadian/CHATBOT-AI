// src/db/conversations.js — Penyimpanan Percakapan & Riwayat Chat (Multi-Session & Isolasi Akun)
import crypto from "node:crypto";
import { getDbPool } from "./pool.js";

export const inMemoryConversations = new Map();
export const inMemoryMessages = new Map();

/**
 * Inisialisasi tabel percakapan dan pesan di MySQL jika belum ada.
 */
export async function initConversationTables(pool = getDbPool()) {
  if (!pool) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(36) PRIMARY KEY,
        user_id INT NULL,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_conv_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversation_messages (
        id VARCHAR(36) PRIMARY KEY,
        conversation_id VARCHAR(36) NOT NULL,
        role ENUM('user', 'assistant') NOT NULL,
        content TEXT NOT NULL,
        sources JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_msg_conv (conversation_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  } catch (err) {
    console.warn("[Conversations] Inisialisasi tabel percakapan:", err?.message ?? err);
  }
}

/**
 * Membuat sesi percakapan baru untuk user tertentu.
 */
export async function createConversation({ id = null, userId = null, title = "Obrolan Baru" } = {}) {
  const convId = id && typeof id === "string" && id.trim() !== "" ? id.trim() : crypto.randomUUID();
  const cleanTitle = (title || "Obrolan Baru").trim().slice(0, 100);
  const now = new Date();

  const conv = {
    id: convId,
    user_id: userId,
    title: cleanTitle || "Obrolan Baru",
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  inMemoryConversations.set(convId, conv);
  inMemoryMessages.set(convId, []);

  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(
        "INSERT INTO conversations (id, user_id, title) VALUES (?, ?, ?)",
        [convId, userId, cleanTitle]
      );
    } catch (err) {
      console.warn("[createConversation DB warning]", err?.message ?? err);
    }
  }

  return conv;
}

/**
 * Mengambil daftar riwayat percakapan milik user tertentu (terisolasi per user_id).
 */
export async function getConversationsByUser(userId) {
  const pool = getDbPool();
  if (pool && userId !== null && userId !== undefined) {
    try {
      const [rows] = await pool.query(
        "SELECT id, user_id, title, created_at, updated_at FROM conversations WHERE user_id = ? ORDER BY updated_at DESC",
        [userId]
      );
      if (Array.isArray(rows)) {
        return rows;
      }
    } catch (err) {
      console.warn("[getConversationsByUser DB warning]", err?.message ?? err);
    }
  }

  // Fallback in-memory jika offline / DB tidak terhubung
  const list = [];
  for (const conv of inMemoryConversations.values()) {
    if (String(conv.user_id) === String(userId)) {
      list.push(conv);
    }
  }
  return list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

/**
 * Mengambil satu percakapan beserta seluruh pesannya dengan verifikasi hak milik (user_id).
 */
export async function getConversationWithMessages(conversationId, userId) {
  const pool = getDbPool();
  if (pool) {
    try {
      const [convRows] = await pool.query(
        "SELECT id, user_id, title, created_at, updated_at FROM conversations WHERE id = ? LIMIT 1",
        [conversationId]
      );
      if (Array.isArray(convRows) && convRows.length > 0) {
        const conv = convRows[0];
        if (userId !== null && conv.user_id !== null && String(conv.user_id) !== String(userId)) {
          return { error: "forbidden", status: 403 };
        }
        const [msgRows] = await pool.query(
          "SELECT id, role, content, sources, created_at FROM conversation_messages WHERE conversation_id = ? ORDER BY created_at ASC",
          [conversationId]
        );
        const parsedMsgs = (msgRows || []).map((m) => ({
          ...m,
          sources: typeof m.sources === "string" ? JSON.parse(m.sources) : m.sources || [],
        }));
        return { conversation: { ...conv, messages: parsedMsgs } };
      }
    } catch (err) {
      console.warn("[getConversationWithMessages DB warning]", err?.message ?? err);
    }
  }

  const conv = inMemoryConversations.get(conversationId);
  if (!conv) {
    return { error: "not_found", status: 404 };
  }
  if (userId !== null && conv.user_id !== null && String(conv.user_id) !== String(userId)) {
    return { error: "forbidden", status: 403 };
  }
  const msgs = inMemoryMessages.get(conversationId) || [];
  return { conversation: { ...conv, messages: msgs } };
}

/**
 * Menambahkan pesan ke percakapan tertentu dan memperbarui timestamp updated_at.
 */
export async function appendMessageToConversation(conversationId, { role, content, sources = [] }) {
  const msgId = crypto.randomUUID();
  const now = new Date();
  const msgItem = {
    id: msgId,
    conversation_id: conversationId,
    role,
    content,
    sources: sources || [],
    created_at: now.toISOString(),
  };

  const msgs = inMemoryMessages.get(conversationId) || [];
  msgs.push(msgItem);
  inMemoryMessages.set(conversationId, msgs);

  const conv = inMemoryConversations.get(conversationId);
  if (conv) {
    conv.updated_at = now.toISOString();
  }

  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(
        "INSERT INTO conversation_messages (id, conversation_id, role, content, sources) VALUES (?, ?, ?, ?, ?)",
        [msgId, conversationId, role, content, JSON.stringify(sources || [])]
      );
      await pool.query(
        "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [conversationId]
      );
    } catch (err) {
      console.warn("[appendMessageToConversation DB warning]", err?.message ?? err);
    }
  }

  return msgItem;
}

/**
 * Menghapus percakapan beserta seluruh pesannya dengan verifikasi hak milik (user_id).
 */
export async function deleteConversation(conversationId, userId) {
  const pool = getDbPool();
  if (pool) {
    try {
      const [convRows] = await pool.query(
        "SELECT user_id FROM conversations WHERE id = ? LIMIT 1",
        [conversationId]
      );
      if (Array.isArray(convRows) && convRows.length > 0) {
        const conv = convRows[0];
        if (userId !== null && conv.user_id !== null && String(conv.user_id) !== String(userId)) {
          return { error: "forbidden", status: 403 };
        }
        await pool.query("DELETE FROM conversation_messages WHERE conversation_id = ?", [conversationId]);
        await pool.query("DELETE FROM conversations WHERE id = ?", [conversationId]);
      }
    } catch (err) {
      console.warn("[deleteConversation DB warning]", err?.message ?? err);
    }
  }

  const conv = inMemoryConversations.get(conversationId);
  if (conv) {
    if (userId !== null && conv.user_id !== null && String(conv.user_id) !== String(userId)) {
      return { error: "forbidden", status: 403 };
    }
    inMemoryConversations.delete(conversationId);
    inMemoryMessages.delete(conversationId);
  }

  return { success: true };
}
