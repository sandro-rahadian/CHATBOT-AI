// Session management — absolute expiry + idle timeout.
//
// Sesi punya dua batas:
//   1. Absolute  : maksimal seberapa lama sesi boleh hidup sejak login.
//   2. Idle      : seberapa lama tanpa aktivitas sebelum sesi dianggap mati.
//
// Keduanya bisa diatur lewat env (frontend/.env.local):
//   NEXT_PUBLIC_SESSION_MAX_HOURS=24
//   NEXT_PUBLIC_SESSION_IDLE_MINUTES=60

const SESSION_KEY = "kv_session";

// Kunci lama (sebelum ada expiry yang benar-benar ditegakkan) — dimigrasi otomatis.
const LEGACY_TOKEN_KEY = "chat_token";
const LEGACY_USER_KEY = "chat_user";
const LEGACY_EXPIRY_KEY = "chat_token_expiry";

const MAX_HOURS_ENV = Number(process.env.NEXT_PUBLIC_SESSION_MAX_HOURS);
const IDLE_MINUTES_ENV = Number(process.env.NEXT_PUBLIC_SESSION_IDLE_MINUTES);

/** Batas absolut sesi sejak login (default 24 jam). */
export const SESSION_MAX_MS =
  (Number.isFinite(MAX_HOURS_ENV) && MAX_HOURS_ENV > 0 ? MAX_HOURS_ENV : 24) *
  60 *
  60 *
  1000;

/** Batas idle tanpa aktivitas (default 60 menit). */
export const SESSION_IDLE_MS =
  (Number.isFinite(IDLE_MINUTES_ENV) && IDLE_MINUTES_ENV > 0
    ? IDLE_MINUTES_ENV
    : 60) *
  60 *
  1000;

export type SessionUser = Record<string, unknown>;

export interface Session {
  token: string;
  user: SessionUser | null;
  issuedAt: number;
  expiresAt: number;
  lastActiveAt: number;
}

export type SessionInvalidReason = "missing" | "expired" | "idle";

export interface SessionStatus {
  valid: boolean;
  reason: SessionInvalidReason | null;
  session: Session | null;
  /** Sisa waktu sampai batas absolut (ms). */
  remainingMs: number;
  /** Sisa waktu sampai kena idle timeout (ms). */
  idleRemainingMs: number;
}

const TOUCH_THROTTLE_MS = 20_000;
let lastTouchWrite = 0;

function now(): number {
  return Date.now();
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function parseSession(raw: string | null): Session | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (typeof parsed?.token !== "string" || parsed.token.trim() === "") {
      return null;
    }
    const issuedAt = Number(parsed.issuedAt) || now();
    return {
      token: parsed.token,
      user:
        parsed.user && typeof parsed.user === "object"
          ? (parsed.user as SessionUser)
          : null,
      issuedAt,
      expiresAt: Number(parsed.expiresAt) || issuedAt + SESSION_MAX_MS,
      lastActiveAt: Number(parsed.lastActiveAt) || issuedAt,
    };
  } catch {
    return null;
  }
}

/**
 * Migrasi sesi format lama (chat_token + chat_token_expiry) ke format baru.
 * Kalau expiry lama sudah lewat, sesi dianggap basi dan dibuang.
 */
function migrateLegacySession(): Session | null {
  const token = localStorage.getItem(LEGACY_TOKEN_KEY);
  if (!token) return null;

  const legacyExpiry = Number(localStorage.getItem(LEGACY_EXPIRY_KEY));
  if (Number.isFinite(legacyExpiry) && legacyExpiry > 0 && now() > legacyExpiry) {
    clearSession();
    return null;
  }

  let user: SessionUser | null = null;
  const rawUser = localStorage.getItem(LEGACY_USER_KEY);
  if (rawUser) {
    try {
      user = JSON.parse(rawUser) as SessionUser;
    } catch {
      user = null;
    }
  }

  const issuedAt = now();
  const session: Session = {
    token,
    user,
    issuedAt,
    // Hormati expiry lama kalau ada, tapi jangan lebih panjang dari batas absolut.
    expiresAt:
      Number.isFinite(legacyExpiry) && legacyExpiry > 0
        ? Math.min(legacyExpiry, issuedAt + SESSION_MAX_MS)
        : issuedAt + SESSION_MAX_MS,
    lastActiveAt: issuedAt,
  };

  writeSession(session);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
  localStorage.removeItem(LEGACY_EXPIRY_KEY);
  return session;
}

function readSession(): Session | null {
  if (!isBrowser()) return null;
  const stored = parseSession(localStorage.getItem(SESSION_KEY));
  if (stored) return stored;
  return migrateLegacySession();
}

function writeSession(session: Session): void {
  if (!isBrowser()) return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function invalidReason(session: Session): SessionInvalidReason | null {
  const t = now();
  if (t >= session.expiresAt) return "expired";
  if (t - session.lastActiveAt >= SESSION_IDLE_MS) return "idle";
  return null;
}

/**
 * Status sesi lengkap: valid/tidak, alasan kalau tidak valid, dan sisa waktunya.
 * Kalau sesi sudah tidak valid, penyimpanan langsung dibersihkan.
 */
export function getSessionStatus(): SessionStatus {
  const empty: SessionStatus = {
    valid: false,
    reason: "missing",
    session: null,
    remainingMs: 0,
    idleRemainingMs: 0,
  };

  if (!isBrowser()) return empty;

  const session = readSession();
  if (!session) return empty;

  const reason = invalidReason(session);
  if (reason) {
    clearSession();
    return { ...empty, reason };
  }

  const t = now();
  return {
    valid: true,
    reason: null,
    session,
    remainingMs: Math.max(0, session.expiresAt - t),
    idleRemainingMs: Math.max(0, session.lastActiveAt + SESSION_IDLE_MS - t),
  };
}

/**
 * Ambil token yang masih valid. Return null kalau tidak ada / sudah kedaluwarsa
 * (absolut maupun idle). Sesi yang kedaluwarsa langsung dihapus.
 */
export function getStoredToken(): string | null {
  return getSessionStatus().session?.token ?? null;
}

/** Ambil data user dari sesi yang masih valid. */
export function getStoredUser(): SessionUser | null {
  return getSessionStatus().session?.user ?? null;
}

/** Simpan sesi baru setelah login/registrasi berhasil. */
export function setSession(token: string, user?: object): void {
  if (!isBrowser() || !token) return;
  const t = now();
  writeSession({
    token,
    user: (user as SessionUser | undefined) ?? null,
    issuedAt: t,
    expiresAt: t + SESSION_MAX_MS,
    lastActiveAt: t,
  });
  lastTouchWrite = t;
}

/**
 * Catat aktivitas user, memperpanjang jendela idle (bukan batas absolut).
 * Dipanggil dari event pointer/keyboard/scroll. Ditulis maksimal tiap 20 detik
 * supaya localStorage tidak dihajar terus-menerus.
 */
export function touchSession(): void {
  if (!isBrowser()) return;

  const session = readSession();
  if (!session) return;
  if (invalidReason(session)) return; // jangan hidupkan sesi yang sudah mati

  const t = now();
  if (t - lastTouchWrite < TOUCH_THROTTLE_MS) return;
  if (t - session.lastActiveAt < TOUCH_THROTTLE_MS) return;

  lastTouchWrite = t;
  writeSession({ ...session, lastActiveAt: t });
}

/** Hapus semua data sesi (format baru maupun sisa format lama). */
export function clearSession(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
  localStorage.removeItem(LEGACY_EXPIRY_KEY);
  lastTouchWrite = 0;
}

/** Perbarui data user di sesi (tanpa mengubah expiry). */
export function updateSessionUser(user: object): void {
  if (!isBrowser()) return;
  const session = readSession();
  if (!session) return;
  writeSession({ ...session, user: user as SessionUser });
}

/** Cek apakah sesi masih valid. */
export function isSessionValid(): boolean {
  return getSessionStatus().valid;
}

/** Format sisa waktu jadi teks pendek, misal "23 jam 12 menit". */
export function formatRemaining(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0 menit";
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return minutes > 0 ? `${hours} jam ${minutes} menit` : `${hours} jam`;
  }
  return minutes > 0 ? `${minutes} menit` : "kurang dari 1 menit";
}
