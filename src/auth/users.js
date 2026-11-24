// src/auth/users.js — Data Akun Default & Cache Kuota Guest
export const DEFAULT_USERS = [
  {
    id: 1,
    username: "budi_siswa",
    api_token: "token-siswa-123",
    role: "siswa",
    school_id: null,
    allowed_categories: ["Alamat & Kontak", "Pendaftaran", "Jurusan", "Fasilitas"],
    daily_limit: 50,
    daily_count: 0,
    can_web_search: false,
  },
  {
    id: 2,
    username: "pak_andi_guru",
    api_token: "token-guru-456",
    role: "guru",
    school_id: null,
    allowed_categories: ["Profil", "Alamat & Kontak", "Pendaftaran", "Jurusan", "Fasilitas", "Kegiatan", "Hasil riset web"],
    daily_limit: 200,
    daily_count: 0,
    can_web_search: true,
  },
  {
    id: 3,
    username: "admin_utama",
    api_token: "token-admin-789",
    role: "admin",
    school_id: null,
    allowed_categories: ["*"],
    daily_limit: null,
    daily_count: 0,
    can_web_search: true,
  },
];

export const guestQuotaMap = new Map();
