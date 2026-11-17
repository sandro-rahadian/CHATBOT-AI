import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createApp, toGeminiContents } from "../server.js";

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
