# Backend — AI Chatbot (Express + Gemini)

Sesuai dokumen teknis v1.0.0. Port `3001`, endpoint `POST /chat`.

> **Catatan:** dokumen teknis menyebut model `gemini-2.0-flash`, tetapi model itu sudah tidak tersedia untuk akun baru. Backend ini memakai `gemini-3.1-flash-lite` sebagai default dan bisa diganti lewat `GEMINI_MODEL`.

## Menjalankan

```bash
cd backend
npm install
copy .env.example .env   # Windows. Mac/Linux: cp .env.example .env
# Buka .env lalu isi GEMINI_API_KEY (https://aistudio.google.com/apikey)
npm run dev              # atau: npm start
npm test                 # 15 tes otomatis (Gemini di-mock, tidak butuh API key)
```

Saat berhasil, terminal menampilkan:

```
Backend berjalan di http://localhost:3001 (model: gemini-3.1-flash-lite)
Timeout 15000 ms, coba ulang maks 2x
```

Backend hanya membaca `.env` saat dijalankan. Setelah mengubah `.env`, hentikan dengan `Ctrl + C` lalu jalankan lagi.

## Kontrak API (untuk tim Frontend)

### `POST /chat`

Request:
```json
{
  "message": "Halo, siapa kamu?",
  "history": [
    { "role": "user", "content": "Halo" },
    { "role": "assistant", "content": "Halo! Ada yang bisa saya bantu?" }
  ]
}
```
- `message`: string, wajib, tidak boleh kosong, maks 4000 karakter
- `history`: array opsional, `role` hanya `"user"` atau `"assistant"`. Backend memakai 30 pesan terakhir. Pesan `assistant` di awal history (mis. pesan sambutan) diabaikan.

Response sukses `200`:
```json
{ "reply": "..." }
```

Response error (semua berbentuk `{ "error": "pesan" }`, aman ditampilkan langsung ke pengguna):

| Status | Penyebab |
|--------|----------|
| 400 | Input tidak valid / JSON rusak |
| 413 | Body terlalu besar (>100kb) |
| 429 | Rate limit (20 request/menit/IP) atau kuota Gemini habis |
| 502 | Gagal menghubungi Gemini / jawaban kosong |
| 503 | Gemini sedang sibuk (sudah dicoba ulang otomatis) |
| 504 | Gemini tidak merespons tepat waktu |
| 500 | Kesalahan server lain |

### `GET /health`
Mengembalikan `{ "status": "ok" }`.

## Catatan untuk Frontend

- **Waktu tunggu.** Backend memberi batas 15 detik per percobaan dan mencoba ulang hingga 2 kali saat Gemini sibuk. Dalam kasus terburuk, satu request bisa memakan waktu sekitar 48 detik sebelum error muncul. Jangan memutus request di frontend terlalu cepat.
- **CORS.** Hanya origin di `CORS_ORIGIN` yang diizinkan (default `http://localhost:3000`). Buka frontend lewat `http://localhost:3000`, bukan `http://127.0.0.1:3000`.
- **Pesan error.** Tampilkan `data.error` apa adanya di toast, supaya pengguna tahu penyebabnya (mis. "AI sedang sibuk, coba lagi sebentar lagi").
- **URL backend.** Jangan tulis `http://localhost:3001` langsung di kode. Pakai `process.env.NEXT_PUBLIC_API_URL`.

## Environment Variables

| Variabel | Wajib | Default | Keterangan |
|----------|-------|---------|------------|
| `GEMINI_API_KEY` | ya | - | API key Google AI Studio |
| `PORT` | tidak | `3001` | Port server |
| `CORS_ORIGIN` | tidak | `http://localhost:3000` | Origin frontend, pisahkan koma untuk banyak origin |
| `GEMINI_MODEL` | tidak | `gemini-3.1-flash-lite` | Nama model Gemini |
| `GEMINI_TIMEOUT_MS` | tidak | `15000` | Batas tunggu per percobaan ke Gemini |
| `GEMINI_MAX_RETRIES` | tidak | `2` | Berapa kali dicoba ulang saat Gemini sibuk (503/timeout). `0` untuk mematikan |
| `SYSTEM_PROMPT` | tidak | prompt ramah berbahasa Indonesia | Instruksi sistem |

Jangan pernah memasukkan `.env` ke Git atau mengirimnya ke orang lain. Setiap anggota tim membuat `.env` sendiri dari `.env.example` dengan API key masing-masing.

## Troubleshooting

Detail error selalu tercetak di terminal tempat backend berjalan, pada baris `[Gemini error]`.

| Pesan di terminal | Arti | Solusi |
|-------------------|------|--------|
| `GEMINI_API_KEY belum diisi` | Key tidak terbaca | Pastikan `.env` ada, barisnya `GEMINI_API_KEY=...` (tanpa spasi/kutip), lalu restart |
| `403 ... free tier is not available for this project` | Project/akun tidak boleh memakai free tier | Buat key dengan akun Google lain (mis. akun pribadi, bukan akun sekolah/organisasi) atau aktifkan billing |
| `404 ... no longer available to new users` | Model sudah ditutup untuk akun baru | Ganti `GEMINI_MODEL` ke model yang tersedia |
| `503 ... high demand` atau `TIMEOUT` | Model sedang padat | Tunggu sebentar atau ganti `GEMINI_MODEL` ke model lain |
| `429` | Kuota atau limit tercapai | Tunggu beberapa menit |

Daftar model yang tersedia berubah dari waktu ke waktu. Lihat https://ai.google.dev/gemini-api/docs/models.

## Deployment

### 1. Vercel (Serverless Function)

Proyek ini sudah dilengkapi file konfigurasi `vercel.json` dan handler `api/index.js` agar Express dapat berjalan otomatis sebagai serverless function di Vercel:

1. Import repositori backend ini di Dashboard Vercel (**Add New Project**).
2. Set **Root Directory** ke folder backend (jika monorepo) atau pilih repositori branch `backend`.
3. Framework Preset: **Other**.
4. Masukkan Environment Variables di Vercel Settings:
   - `GEMINI_API_KEY`: API key dari [Google AI Studio](https://aistudio.google.com/apikey).
   - `CORS_ORIGIN`: URL domain frontend kamu di Vercel (contoh: `https://chatbot-fe.vercel.app`), atau `*` untuk mengizinkan semua origin.
   - `GEMINI_MODEL`: (opsional) contoh `gemini-2.5-flash` atau `gemini-3.1-flash-lite`.
5. Klik **Deploy**.
6. Salin domain backend yang dihasilkan (contoh: `https://chatbot-be.vercel.app`) dan pasang di frontend sebagai `NEXT_PUBLIC_API_URL`.

### 2. Railway / Render / VPS (Long-running process)

1. Set Environment Variables: `GEMINI_API_KEY`, `PORT`, dan `CORS_ORIGIN=https://url-frontend-kamu.vercel.app`.
2. Start command: `npm start`.
