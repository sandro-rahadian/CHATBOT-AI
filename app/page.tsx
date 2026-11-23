"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  User,
  ShieldCheck,
  Zap,
  ChevronDown,
  LogOut,
  Check,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

// ─── Shadcn UI Components ─────────────────────────────────────────────────────
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ─── Local UI Elements ────────────────────────────────────────────────────────
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SourceItem {
  id: number;
  school: string;
  category: string;
  title: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: SourceItem[];
  userRole?: string;
}

interface UserProfile {
  username: string;
  role: "guest" | "siswa" | "guru" | "admin";
  schoolId: number | null;
  allowedCategories: string[];
  dailyLimit: number | null;
  remainingQuota: number | null;
}

interface DemoUser {
  id: number;
  username: string;
  role: "siswa" | "guru" | "admin";
  school_id: number | null;
  allowed_categories: string | null;
  daily_limit: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRoleBadgeStyle(role: string) {
  switch (role) {
    case "admin":
      return {
        bg: "bg-purple-500/15 text-purple-300 border-purple-500/40",
        label: "Admin",
      };
    case "guru":
      return {
        bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
        label: "Guru",
      };
    case "siswa":
      return {
        bg: "bg-sky-500/15 text-sky-300 border-sky-500/40",
        label: "Siswa",
      };
    case "guest":
    default:
      return {
        bg: "bg-zinc-700/50 text-zinc-300 border-zinc-600",
        label: "Guest",
      };
  }
}

// ─── DynamicIslandNav ─────────────────────────────────────────────────────────

function DynamicIslandNav({ onClear }: { onClear: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        layout
        onHoverStart={() => setExpanded(true)}
        onHoverEnd={() => setExpanded(false)}
        onClick={() => setExpanded((prev) => !prev)}
        animate={{
          width: expanded ? 290 : 155,
          height: 44,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        className="relative bg-[#2b2d31] border border-[#3f4147] rounded-full shadow-lg shadow-black/40 overflow-hidden cursor-pointer select-none flex items-center justify-center transition-colors hover:border-[#4e5058] px-3.5"
      >
        <AnimatePresence mode="wait">
          {!expanded ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2.5"
            >
              <Image
                src="/logo.png"
                alt="KeraVokasi"
                width={26}
                height={26}
                className="w-6 h-6 rounded-full object-cover border border-[#4e5058]"
                priority
              />
              <span className="text-xs font-semibold text-[#f2f3f5] tracking-wide whitespace-nowrap">
                KeraVokasi
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Image
                  src="/logo.png"
                  alt="KeraVokasi"
                  width={26}
                  height={26}
                  className="w-6 h-6 rounded-full object-cover border border-[#4e5058]"
                />
                <span className="text-xs font-semibold text-[#f2f3f5] tracking-wide whitespace-nowrap">
                  KeraVokasi
                </span>
              </div>
              <Button
                variant="destructive"
                size="xs"
                className="rounded-full bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs px-3 py-1 font-medium h-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
              >
                Hapus
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ─── AccountSwitcher (Shadcn DropdownMenu & Badge) ────────────────────────────

interface AccountSwitcherProps {
  currentUser: UserProfile | null;
  demoUsers: DemoUser[];
  onSwitchUser: (username: string | null) => Promise<void>;
}

function AccountSwitcher({
  currentUser,
  demoUsers,
  onSwitchUser,
}: AccountSwitcherProps) {
  const role = currentUser?.role || "guest";
  const badge = getRoleBadgeStyle(role);

  const quotaDisplay =
    role === "admin"
      ? "∞"
      : currentUser?.remainingQuota !== null &&
        currentUser?.remainingQuota !== undefined
      ? `${currentUser.remainingQuota}`
      : "-";

  return (
    <div className="fixed top-5 right-4 sm:right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 px-3 py-1.5 h-auto rounded-full bg-[#2b2d31] hover:bg-[#35373c] border-[#3f4147] hover:border-[#4e5058] shadow-lg shadow-black/30 transition-all select-none text-[#dbdee1]"
          >
            <Badge
              variant="outline"
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${badge.bg}`}
            >
              {badge.label}
            </Badge>
            <span className="hidden sm:inline-block text-xs font-medium text-[#f2f3f5] max-w-[90px] truncate">
              {currentUser?.username || "Guest"}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
              <Zap className="w-3 h-3" />
              <span>{quotaDisplay}</span>
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#949ba4]" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#2b2d31] border-[#3f4147] shadow-2xl p-4 text-xs z-50 flex flex-col gap-3.5"
        >
          {/* User Profile Header */}
          <div className="flex flex-col gap-2 pb-3 border-b border-[#383a40]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8 rounded-full bg-[#383a40] flex items-center justify-center text-[#dbdee1]">
                  <AvatarFallback className="bg-[#383a40] text-xs">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-[#f2f3f5]">
                    {currentUser?.username || "Guest (Tamu)"}
                  </span>
                  <span className="text-[11px] text-[#949ba4]">
                    {role === "admin"
                      ? "Akses Administrator Penuh"
                      : role === "guru"
                      ? "Akses Tenaga Pendidik"
                      : role === "siswa"
                      ? "Akses Peserta Didik"
                      : "Pengunjung Publik"}
                  </span>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${badge.bg}`}
              >
                {badge.label}
              </Badge>
            </div>

            {/* Sisa Kuota Banner */}
            <div className="flex items-center justify-between bg-[#1e1f22] px-3 py-2 rounded-xl border border-[#383a40]">
              <span className="text-[#949ba4] text-xs flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Sisa Kuota Harian:
              </span>
              <span className="font-mono font-semibold text-amber-400 text-xs">
                {role === "admin"
                  ? "Tanpa Batas (∞)"
                  : `${currentUser?.remainingQuota ?? 0} / ${
                      currentUser?.dailyLimit ?? 0
                    } pesan`}
              </span>
            </div>

            {/* Allowed Categories */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-[#949ba4] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Topik yang Diizinkan:
              </span>
              <div className="flex flex-wrap gap-1">
                {currentUser?.allowedCategories &&
                currentUser.allowedCategories[0] === "*" ? (
                  <Badge
                    variant="outline"
                    className="px-2 py-0.5 rounded-md bg-purple-500/15 border-purple-500/30 text-[11px] text-purple-300 font-medium"
                  >
                    ★ Semua Topik & Pencarian Web
                  </Badge>
                ) : (
                  currentUser?.allowedCategories?.map((cat) => (
                    <Badge
                      key={cat}
                      variant="outline"
                      className="px-2 py-0.5 rounded-md bg-[#1e1f22] border-[#383a40] text-[10px] text-[#dbdee1] font-normal"
                    >
                      {cat}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Switch User Selection */}
          <DropdownMenuGroup className="flex flex-col gap-1.5">
            <DropdownMenuLabel className="text-[11px] font-semibold text-[#949ba4] uppercase tracking-wider px-1 py-0.5">
              Ganti Akun Demo (RBAC)
            </DropdownMenuLabel>

            {/* Guest Option */}
            <DropdownMenuItem
              onClick={() => onSwitchUser(null)}
              className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer border ${
                role === "guest"
                  ? "bg-[#383a40] border-[#5865f2] text-white"
                  : "bg-[#1e1f22]/70 hover:bg-[#383a40] border-transparent text-[#dbdee1]"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-zinc-700/60 flex items-center justify-center text-zinc-300 text-[11px]">
                  <LogOut className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-xs">Mode Tamu (Guest)</span>
                  <span className="text-[10px] text-[#949ba4]">
                    Batas 10 pesan/hari • Tanpa Token
                  </span>
                </div>
              </div>
              {role === "guest" && <Check className="w-4 h-4 text-[#5865f2]" />}
            </DropdownMenuItem>

            {/* Registered Demo Users */}
            {demoUsers.map((user) => {
              const isCurrent = currentUser?.username === user.username;
              const userBadge = getRoleBadgeStyle(user.role);

              return (
                <DropdownMenuItem
                  key={user.id}
                  onClick={() => onSwitchUser(user.username)}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer border ${
                    isCurrent
                      ? "bg-[#383a40] border-[#5865f2] text-white"
                      : "bg-[#1e1f22]/70 hover:bg-[#383a40] border-transparent text-[#dbdee1]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#2b2d31] flex items-center justify-center text-[#dbdee1] text-[11px]">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-xs">
                          {user.username}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full border ${userBadge.bg}`}
                        >
                          {userBadge.label}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-[#949ba4]">
                        {user.role === "admin"
                          ? "Tanpa batas kuota"
                          : user.role === "guru"
                          ? "200 pesan/hari + Riset Web"
                          : "50 pesan/hari"}
                      </span>
                    </div>
                  </div>
                  {isCurrent && <Check className="w-4 h-4 text-[#5865f2]" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ─── TypingIndicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
      className="max-w-[80%] sm:max-w-[70%]"
    >
      <div className="inline-flex bg-[#2b2d31] border border-[#383a40] rounded-2xl rounded-tl-sm px-4 py-3 items-center gap-1.5 shadow-sm">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#949ba4] animate-bounce"
            style={{
              animationDelay: i === 0 ? "-0.3s" : i === 1 ? "-0.15s" : "0s",
              animationDuration: "0.9s",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── ChatBubble (Shadcn Badge for sources) ────────────────────────────────────

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const timeStr = message.timestamp.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
        className="flex flex-col items-end gap-1 max-w-[80%] sm:max-w-[70%] ml-auto"
      >
        <div className="bg-[#383a40] border border-[#404249] rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm">
          <p className="text-sm font-normal text-[#f2f3f5] leading-relaxed tracking-normal whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <span className="text-[10px] text-[#949ba4] font-mono px-1">
          {timeStr}
        </span>
      </motion.div>
    );
  }

  const hasSources = message.sources && message.sources.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
      className="flex flex-col items-start gap-1 max-w-[85%] sm:max-w-[75%]"
    >
      <div className="flex flex-col gap-2 bg-[#2b2d31] border border-[#383a40] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm w-full">
        <TextGenerateEffect
          words={message.content}
          className="font-normal"
          textClassName="text-sm font-normal text-[#dbdee1] leading-relaxed tracking-normal whitespace-pre-wrap break-words"
          duration={0.35}
        />

        {/* Sumber Basis Pengetahuan Terverifikasi (Shadcn Badge) */}
        {hasSources && (
          <div className="mt-2 pt-2.5 border-t border-[#383a40]/70 flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-[#949ba4] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#5865f2]" />
              Sumber Informasi Terverifikasi:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.sources!.map((s, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1e1f22]/90 border-[#3f4147] text-[11px] text-[#dbdee1] shadow-xs font-normal"
                  title={s.title}
                >
                  <span className="font-semibold text-[#5865f2]">
                    {s.school}
                  </span>
                  <span className="text-[#4e5058]">•</span>
                  <span className="text-[#949ba4]">{s.category}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          {message.userRole && (
            <span className="text-[10px] text-[#949ba4]">
              Respons mode:{" "}
              <span className="font-semibold text-[#dbdee1]">
                {message.userRole}
              </span>
            </span>
          )}
          <span className="text-[10px] text-[#949ba4] font-mono ml-auto">
            {timeStr}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── ChatPage (default export) ────────────────────────────────────────────────

const CHAT_PLACEHOLDERS = [
  "Tanya seputar SMK di Malang...",
  "Apa saja jurusan di SMK Telkom Malang?",
  "Dimana alamat SMKN 5 Malang?",
  "Bagaimana cara daftar PPDB di SMKN 4 Malang?",
  "Siapa kepala sekolah SMK Telkom Malang?",
  "Ekskul apa saja yang ada di SMKN 3 Malang?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // RBAC State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);
  const [apiToken, setApiToken] = useState<string | null>(null);

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "https://chatbot-ai-production-b22e59af.up.railway.app";

  // Fetch /me profile
  const fetchProfile = useCallback(
    async (token: string | null) => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers["x-api-token"] = token;

        const res = await fetch(`${apiBase}/me`, { headers });
        if (res.ok) {
          const profile: UserProfile = await res.json();
          setCurrentUser(profile);
        } else if (res.status === 401 && token) {
          // Token invalid, revert to guest
          localStorage.removeItem("chat_token");
          setApiToken(null);
          const guestRes = await fetch(`${apiBase}/me`);
          if (guestRes.ok) {
            const guestProfile: UserProfile = await guestRes.json();
            setCurrentUser(guestProfile);
          }
        }
      } catch (e) {
        console.error("Gagal mengambil profil user:", e);
      }
    },
    [apiBase]
  );

  // Initial load: Fetch /users and /me
  useEffect(() => {
    async function initAuth() {
      // 1. Fetch demo users list
      try {
        const usersRes = await fetch(`${apiBase}/users`);
        if (usersRes.ok) {
          const data = await usersRes.json();
          setDemoUsers(data.users || []);
        }
      } catch (e) {
        console.error("Gagal mengambil daftar user demo:", e);
      }

      // 2. Read stored token
      const savedToken = localStorage.getItem("chat_token");
      if (savedToken) {
        setApiToken(savedToken);
        await fetchProfile(savedToken);
      } else {
        await fetchProfile(null);
      }
    }

    initAuth();
  }, [apiBase, fetchProfile]);

  // Switch User handler
  const handleSwitchUser = async (username: string | null) => {
    try {
      if (!username) {
        // Switch to guest
        localStorage.removeItem("chat_token");
        setApiToken(null);
        await fetchProfile(null);
        toast.info("Beralih ke Akun Tamu", {
          description: "Anda kini menggunakan mode Guest (10 kuota/hari).",
        });
        return;
      }

      // Login via /login
      const res = await fetch(`${apiBase}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Login gagal (${res.status})`);
      }

      const data = await res.json();
      localStorage.setItem("chat_token", data.token);
      setApiToken(data.token);
      setCurrentUser(data.user);

      toast.success("Login Berhasil", {
        description: `Masuk sebagai ${data.user.username} (${data.user.role}).`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mengganti akun.";
      toast.error("Gagal Ganti Akun", {
        description: msg,
      });
    }
  };

  // Auto-scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    const newUserMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiToken) {
        headers["x-api-token"] = apiToken;
      }

      const response = await fetch(`${apiBase}/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: newUserMsg.content,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg =
          (errData as { error?: string }).error ||
          `Server error (${response.status})`;

        if (response.status === 429) {
          toast.warning("Kuota Harian Habis", {
            description: errMsg,
          });
        }

        throw new Error(errMsg);
      }

      const data: {
        reply: string;
        role?: string;
        sources?: SourceItem[];
      } = await response.json();

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
        sources: data.sources || [],
        userRole: data.role,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Decrement local quota and sync silently
      if (currentUser && currentUser.role !== "admin") {
        setCurrentUser((prev) =>
          prev
            ? {
                ...prev,
                remainingQuota: Math.max(0, (prev.remainingQuota ?? 1) - 1),
              }
            : null
        );
      }
      fetchProfile(apiToken);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal terhubung ke server.";
      setError(msg);
      toast.error("Gagal Mengirim Pesan", {
        description: msg,
        action: {
          label: "Coba Lagi",
          onClick: () => {
            const lastUserMsg = [...messages]
              .reverse()
              .find((m) => m.role === "user");
            if (lastUserMsg) {
              handleSend(lastUserMsg.content);
            }
          },
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Called by PlaceholdersAndVanishInput onSubmit
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector("input") as HTMLInputElement | null;
    const val = input?.value || inputValue;
    if (val.trim()) {
      handleSend(val.trim());
    }
  };

  const handleClearConfirm = () => {
    setMessages([]);
    setShowConfirm(false);
    setError(null);
    toast.info("Percakapan Dibersihkan", {
      description: "Semua pesan sesi ini telah dihapus.",
    });
  };

  return (
    <div className="relative flex flex-col h-screen bg-[#313338] text-[#dbdee1] overflow-hidden">
      {/* Dynamic Island Nav */}
      <DynamicIslandNav onClear={() => setShowConfirm(true)} />

      {/* RBAC Account Switcher & Quota Status (Shadcn DropdownMenu & Badge) */}
      <AccountSwitcher
        currentUser={currentUser}
        demoUsers={demoUsers}
        onSwitchUser={handleSwitchUser}
      />

      {/* Shadcn Dialog Confirmation for Clearing Conversation */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="border border-[#3f4147] bg-[#2b2d31] text-[#dbdee1] shadow-2xl sm:max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#f2f3f5] tracking-tight">
              Hapus Percakapan
            </DialogTitle>
            <DialogDescription className="text-xs text-[#949ba4] mt-1">
              Tindakan ini tidak dapat dibatalkan. Semua pesan dalam percakapan ini
              akan dibersihkan secara permanen dari layar sesi Anda.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-2.5">
            <Button
              variant="secondary"
              className="bg-[#383a40] hover:bg-[#404249] text-[#dbdee1] rounded-xl text-xs font-medium cursor-pointer"
              onClick={() => setShowConfirm(false)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-medium shadow-md cursor-pointer"
              onClick={handleClearConfirm}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat area */}
      <div className="relative z-10 flex flex-col flex-1 min-h-0 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Messages scroll container */}
        <div className="flex-1 overflow-y-auto chat-scroll pt-24 pb-4">
          <div className="flex flex-col gap-4 py-4">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}

            {/* Typing indicator */}
            <AnimatePresence>
              {isLoading && <TypingIndicator key="typing" />}
            </AnimatePresence>

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="relative flex-shrink-0 pb-6 pt-3">
          {/* subtle separator */}
          <div
            className="absolute top-0 inset-x-0 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)",
            }}
          />

          <div className="relative">
            <PlaceholdersAndVanishInput
              placeholders={CHAT_PLACEHOLDERS}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (error) setError(null);
              }}
              onSubmit={handleFormSubmit}
            />

            {/* Error Text Directly Below Input */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center justify-center gap-1.5 mt-2"
                >
                  <p className="text-center text-xs text-red-400 font-medium">
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
