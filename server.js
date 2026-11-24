// server.js — Entry Point & Re-Exports Backend KeraVokasi
import { pathToFileURL } from "node:url";
import { PORT, MODEL_NAME, TIMEOUT_MS, MAX_RETRIES, rawOrigins } from "./src/config.js";
import { getDbPool, fetchKnowledgeFromDb, syncApprovedPendingKnowledge } from "./src/db/pool.js";
import { initConversationTables } from "./src/db/conversations.js";
import { loadKnowledgeBase, setCachedKnowledgeItems } from "./src/ai/knowledge.js";
import { createGeminiGenerator, createGeminiAgentGenerator } from "./src/ai/gemini.js";
import { createApp } from "./src/app.js";

// Re-export semua modul agar kompatibel penuh dengan test suite dan konsumen eksternal
export * from "./src/config.js";
export * from "./src/db/pool.js";
export * from "./src/db/schema.js";
export * from "./src/db/conversations.js";
export * from "./src/auth/users.js";
export * from "./src/auth/rbac.js";
export * from "./src/ai/knowledge.js";
export * from "./src/ai/search.js";
export * from "./src/ai/tools.js";
export * from "./src/ai/gemini.js";
export * from "./src/app.js";

// ---------- Jalankan server (hanya jika file ini dieksekusi langsung) ----------
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY belum diisi. Salin .env.example menjadi .env lalu isi API key-nya.");
    process.exit(1);
  }

  // Gunakan Autonomous Agentic Database Generator
  const app = createApp({ generate: createGeminiAgentGenerator() });

  app.listen(PORT, async () => {
    console.log(`🚀 KeraVokasi Backend berjalan di http://localhost:${PORT} (model: ${MODEL_NAME})`);
    console.log(`⏱️  Timeout ${TIMEOUT_MS} ms, coba ulang maks ${MAX_RETRIES}x`);
    console.log(`🌐 CORS diizinkan untuk: ${rawOrigins.join(", ")}`);
    console.log(`🔍 Tavily Web Search: ${process.env.TAVILY_API_KEY ? "Aktif" : "Tidak aktif (TAVILY_API_KEY kosong)"}`);
    console.log(`🤖 Agentic Database Mode: Aktif (Function Calling & Text-to-SQL Guardrails)`);

    // Inisialisasi tabel percakapan & multi-session
    await initConversationTables();

    // Inisialisasi cache pengetahuan dari MySQL online atau fallback data.md
    const dbItems = await fetchKnowledgeFromDb();
    if (dbItems && dbItems.length > 0) {
      setCachedKnowledgeItems(dbItems);
      console.log(`📦 Database pengetahuan MySQL Online: ${dbItems.length} entri dimuat.`);
    } else {
      console.log(`📦 Database pengetahuan fallback (data.md): ${loadKnowledgeBase().length} entri dimuat.`);
    }

    // Jalankan background auto-sync berkala untuk memproses entri ACC di Railway
    setInterval(async () => {
      try {
        const syncRes = await syncApprovedPendingKnowledge();
        if (syncRes.migrated > 0) {
          const refreshed = await fetchKnowledgeFromDb();
          if (refreshed && refreshed.length > 0) {
            setCachedKnowledgeItems(refreshed);
            console.log(`[AutoSync] Berhasil memigrasikan ${syncRes.migrated} entri yang di-ACC ke tabel resmi.`);
          }
        }
      } catch {
        // Abaikan error periodic sync
      }
    }, 60000);
  });
}
