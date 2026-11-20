import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  createApp,
  toGeminiContents,
  loadKnowledgeBase,
  buildSystemPrompt,
  shouldPerformWebSearch,
  formatTavilyResults,
  searchWebFallback,
} from "../server.js";

let server, base, lastContents;

before(async () => {
  const generate = async (contents) => {
    lastContents = contents;
    const last = contents.at(-1).parts[0].text;
    if (last === "BOOM") throw new Error("gemini down");
    if (last === "EMPTY") return "";
    return `Echo: ${last}`;
  };
  server = createApp({ generate }).listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.closeAllConnections?.();
  server.close();
});

const post = (body, raw = false) =>
  fetch(`${base}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: raw ? body : JSON.stringify(body),
  });

test("GET /health", async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: "ok" });
});

test("POST /chat sukses dan history dikonversi ke format Gemini", async () => {
  const res = await post({
    message: "Halo, siapa kamu?",
    history: [
      { role: "user", content: "Halo" },
      { role: "assistant", content: "Halo! Ada yang bisa saya bantu?" },
    ],
  });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { reply: "Echo: Halo, siapa kamu?" });
  assert.deepEqual(
    lastContents.map((c) => c.role),
    ["user", "model", "user"]
  );
});

test("history tanpa field tetap valid", async () => {
  const res = await post({ message: "tes" });
  assert.equal(res.status, 200);
});

test("pesan sambutan assistant di awal history dibuang", () => {
  const out = toGeminiContents(
    [{ role: "assistant", content: "Selamat datang" }, { role: "user", content: "hi" }],
    "lanjut"
  );
  assert.equal(out[0].role, "user");
  assert.equal(out.length, 2);
});

test("validasi: message kosong / bukan string / history salah -> 400", async () => {
  for (const body of [{ message: "   " }, {}, { message: 123 }, { message: "x", history: "salah" }, { message: "x", history: [{ role: "admin", content: "y" }] }]) {
    const res = await post(body);
    assert.equal(res.status, 400);
    assert.ok((await res.json()).error);
  }
});

test("JSON rusak -> 400", async () => {
  const res = await post("{bukan json", true);
  assert.equal(res.status, 400);
  assert.ok((await res.json()).error);
});

test("Gemini error -> 502 dengan format { error }", async () => {
  const res = await post({ message: "BOOM" });
  assert.equal(res.status, 502);
  assert.deepEqual(await res.json(), { error: "Gagal menghubungi Gemini API" });
});

test("Jawaban kosong -> 502", async () => {
  const res = await post({ message: "EMPTY" });
  assert.equal(res.status, 502);
});

test("route tidak dikenal -> 404 JSON", async () => {
  const res = await fetch(`${base}/nope`);
  assert.equal(res.status, 404);
});

test("CORS mengizinkan http://localhost:3000", async () => {
  const res = await fetch(`${base}/chat`, {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:3000", "Access-Control-Request-Method": "POST" },
  });
  assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:3000");
});

// ---------- Retry & timeout ----------
async function withServer(generate, run, opts = {}) {
  const srv = createApp({ generate, retryDelayMs: 1, ...opts }).listen(0);
  const url = `http://127.0.0.1:${srv.address().port}`;
  try {
    await run((body) =>
      fetch(`${url}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    );
  } finally {
    srv.closeAllConnections?.();
    srv.close();
  }
}

const geminiError = (status) => Object.assign(new Error(`status ${status}`), { status });

test("503 sementara: dicoba ulang lalu berhasil", async () => {
  let calls = 0;
  const generate = async () => {
    calls += 1;
    if (calls < 3) throw geminiError(503);
    return "akhirnya berhasil";
  };
  await withServer(generate, async (send) => {
    const res = await send({ message: "halo" });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { reply: "akhirnya berhasil" });
    assert.equal(calls, 3); // 1 percobaan + 2 retry
  });
});

test("503 terus-menerus: berhenti setelah retry habis dan beri pesan ramah", async () => {
  let calls = 0;
  const generate = async () => {
    calls += 1;
    throw geminiError(503);
  };
  await withServer(generate, async (send) => {
    const res = await send({ message: "halo" });
    assert.equal(res.status, 503);
    assert.deepEqual(await res.json(), { error: "AI sedang sibuk, coba lagi sebentar lagi" });
    assert.equal(calls, 3);
  });
});

test("timeout: dicoba ulang lalu dilaporkan sebagai 504", async () => {
  let calls = 0;
  const generate = async () => {
    calls += 1;
    throw Object.assign(new Error("timeout"), { code: "TIMEOUT" });
  };
  await withServer(generate, async (send) => {
    const res = await send({ message: "halo" });
    assert.equal(res.status, 504);
    assert.ok((await res.json()).error.includes("tepat waktu"));
    assert.equal(calls, 3);
  });
});

test("429 (kuota) dan 403 tidak dicoba ulang", async () => {
  for (const [status, expected] of [[429, 429], [403, 502]]) {
    let calls = 0;
    const generate = async () => {
      calls += 1;
      throw geminiError(status);
    };
    await withServer(generate, async (send) => {
      const res = await send({ message: "halo" });
      assert.equal(res.status, expected);
      assert.equal(calls, 1);
    });
  }
});

test("retries=0 menonaktifkan coba ulang", async () => {
  let calls = 0;
  const generate = async () => {
    calls += 1;
    throw geminiError(503);
  };
  await withServer(
    generate,
    async (send) => {
      await send({ message: "halo" });
      assert.equal(calls, 1);
    },
    { retries: 0 }
  );
});

test("loadKnowledgeBase membaca data.md dan mengembalikan entri pengetahuan", () => {
  const items = loadKnowledgeBase();
  assert.ok(Array.isArray(items));
  assert.equal(items.length, 21);
  assert.ok(items.some((i) => i.title.includes("SMK Telkom Malang")));
});

test("buildSystemPrompt menyusun instruksi ketat dengan database pengetahuan", () => {
  const prompt = buildSystemPrompt();
  assert.ok(prompt.includes("SMK Telkom Malang"));
  assert.ok(prompt.includes("ATURAN UTAMA (SANGAT KETAT)"));
  assert.ok(prompt.includes("0812-2348-8999"));
  assert.ok(prompt.includes("DATABASE PENGETAHUAN RESMI SMK TELKOM MALANG"));
});

// ---------- Pengujian Fitur Tavily Search ----------
test("shouldPerformWebSearch: false jika TAVILY_API_KEY tidak ada", () => {
  const origKey = process.env.TAVILY_API_KEY;
  delete process.env.TAVILY_API_KEY;
  try {
    assert.equal(shouldPerformWebSearch("SMKN 2 Malang"), false);
  } finally {
    if (origKey) process.env.TAVILY_API_KEY = origKey;
  }
});

test("shouldPerformWebSearch: mendeteksi kebutuhan pencarian dengan benar saat TAVILY_API_KEY aktif", () => {
  const origKey = process.env.TAVILY_API_KEY;
  process.env.TAVILY_API_KEY = "tvly-test-key";
  try {
    // Sapaan / identitas -> tidak perlu search
    assert.equal(shouldPerformWebSearch("halo"), false);
    assert.equal(shouldPerformWebSearch("selamat pagi"), false);
    assert.equal(shouldPerformWebSearch("siapa kamu"), false);
    assert.equal(shouldPerformWebSearch("terima kasih"), false);

    // Pertanyaan standar sekolah di DB (SMKN 4, Telkom) -> tidak perlu search
    assert.equal(shouldPerformWebSearch("apa jurusan di SMKN 4 Malang?"), false);
    assert.equal(shouldPerformWebSearch("berapa nomor telepon SMK Telkom?"), false);

    // Pertanyaan sekolah di luar DB (SMKN 1, SMKN 2, SMK PGRI, SMK Penerbangan) -> search aktif!
    assert.equal(shouldPerformWebSearch("apakah SMKN 2 Malang punya jurusan tata boga?"), true);
    assert.equal(shouldPerformWebSearch("apa saja jurusan di SMKN 1 Malang?"), true);
    assert.equal(shouldPerformWebSearch("info pendaftaran SMK PGRI 3 Malang"), true);

    // Pertanyaan dinamis sekolah DB yang belum ada di DB (kepala sekolah, biaya spesifik) -> search aktif!
    assert.equal(shouldPerformWebSearch("siapa kepala sekolah SMKN 5 Malang sekarang?"), true);

    // Pertanyaan topik vokasi / kejuruan di Malang secara umum -> search aktif!
    assert.equal(shouldPerformWebSearch("apakah ada jurusan perkapalan di SMK Malang?"), true);
  } finally {
    if (origKey) process.env.TAVILY_API_KEY = origKey;
    else delete process.env.TAVILY_API_KEY;
  }
});

test("formatTavilyResults memformat jawaban dan link web dengan rapi", () => {
  const mockResponse = {
    query: "SMKN 2 Malang jurusan",
    answer: "SMKN 2 Malang memiliki program keahlian Kuliner (Tata Boga), Perhotelan, dan Usaha Layanan Pariwisata.",
    results: [
      {
        title: "SMKN 2 Malang - Profil",
        url: "https://smkn2malang.sch.id",
        content: "SMKN 2 Malang beralamat di Jl. Veteran No. 17 Malang dengan jurusan unggulan Tata Boga dan Perhotelan.",
      },
    ],
  };

  const formatted = formatTavilyResults(mockResponse);
  assert.ok(formatted.includes("SMKN 2 Malang jurusan"));
  assert.ok(formatted.includes("Ringkasan Jawaban Web:"));
  assert.ok(formatted.includes("https://smkn2malang.sch.id"));
  assert.ok(formatted.includes("Tata Boga dan Perhotelan"));

  // Input null atau kosong tidak error
  assert.equal(formatTavilyResults(null), "");
  assert.equal(formatTavilyResults({}), "");
});

test("buildSystemPrompt menyertakan SUMBER 3 jika webResults diberikan", () => {
  const webResults = "Ringkasan: SMKN 2 Malang memiliki jurusan Kuliner.";
  const prompt = buildSystemPrompt([], "", webResults);
  assert.ok(prompt.includes("=== SUMBER 3: PENCARIAN WEB TERBARU (TAVILY) ==="));
  assert.ok(prompt.includes("SMKN 2 Malang memiliki jurusan Kuliner."));
});

test("POST /chat menggunakan searchWeb mock saat menanyakan sekolah di luar DB", async () => {
  const origKey = process.env.TAVILY_API_KEY;
  process.env.TAVILY_API_KEY = "tvly-test-key";

  let searchCalledWith = null;
  let receivedPrompt = null;

  const mockSearch = async (query) => {
    searchCalledWith = query;
    return {
      query,
      answer: "SMKN 2 Malang memiliki program Tata Boga.",
      results: [
        {
          title: "SMKN 2 Malang",
          url: "https://smkn2malang.sch.id",
          content: "Sekolah kejuruan bidang pariwisata dan boga di Malang.",
        },
      ],
    };
  };

  const mockGenerate = async (contents, systemInstruction) => {
    receivedPrompt = systemInstruction;
    return "Ya, SMKN 2 Malang memiliki jurusan Tata Boga.";
  };

  try {
    await withServer(mockGenerate, async (send) => {
      const res = await send({ message: "Apakah SMKN 2 Malang punya jurusan Tata Boga?" });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.reply, "Ya, SMKN 2 Malang memiliki jurusan Tata Boga.");
      assert.equal(searchCalledWith, "Apakah SMKN 2 Malang punya jurusan Tata Boga?");
      assert.ok(receivedPrompt.includes("=== SUMBER 3: PENCARIAN WEB TERBARU (TAVILY) ==="));
      assert.ok(receivedPrompt.includes("SMKN 2 Malang memiliki program Tata Boga."));
    }, { searchWeb: mockSearch });
  } finally {
    if (origKey) process.env.TAVILY_API_KEY = origKey;
    else delete process.env.TAVILY_API_KEY;
  }
});

test("POST /chat tetap sukses jika searchWeb mengalami kegagalan", async () => {
  const origKey = process.env.TAVILY_API_KEY;
  process.env.TAVILY_API_KEY = "tvly-test-key";

  const failingSearch = async () => {
    throw new Error("Tavily service timeout");
  };

  const mockGenerate = async () => "Jawaban fallback tanpa web search";

  try {
    await withServer(mockGenerate, async (send) => {
      const res = await send({ message: "Info SMKN 2 Malang" });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.reply, "Jawaban fallback tanpa web search");
    }, { searchWeb: failingSearch });
  } finally {
    if (origKey) process.env.TAVILY_API_KEY = origKey;
    else delete process.env.TAVILY_API_KEY;
  }
});

