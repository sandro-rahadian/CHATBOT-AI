// src/ai/tools.js — Definisi Tools Function Calling untuk Gemini Database Agent
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
