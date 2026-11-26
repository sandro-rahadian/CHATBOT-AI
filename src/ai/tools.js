// src/ai/tools.js — Definisi Tools Function Calling untuk Gemini Database & Web Agent
export const databaseAgentTools = [
  {
    functionDeclarations: [
      {
        name: "execute_sql_query",
        description: "Mengeksekusi query SQL SELECT ke database MySQL untuk mencari profil, jurusan, fasilitas, kontak, PPDB, atau kegiatan sekolah kejuruan berdasarkan relasi tabel yang ada.",
        parameters: {
          type: "OBJECT",
          properties: {
            sql: {
              type: "STRING",
              description: "Query SQL SELECT yang valid dan aman dengan JOIN sesuai skema database (contoh: SELECT f.title, f.content FROM school_facilities f JOIN schools s ON f.school_id = s.id WHERE s.name LIKE '%Telkom%').",
            },
          },
          required: ["sql"],
        },
      },
    ],
  },
];

export const webSearchAgentToolDeclaration = {
  name: "search_web_info",
  description: "Mencari informasi terbaru di web (Tavily) mengenai SMK di Malang (profil, jurusan, PPDB, alamat, kegiatan, atau detail yang ditemukan pada gambar) jika tidak lengkap di database atau dokumen panduan.",
  parameters: {
    type: "OBJECT",
    properties: {
      query: {
        type: "STRING",
        description: "Kata kunci pencarian web yang spesifik terkait SMK di Malang (contoh: 'SMKN 1 Malang jurusan PPDB terbaru').",
      },
    },
    required: ["query"],
  },
};
