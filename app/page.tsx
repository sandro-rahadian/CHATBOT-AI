"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

// ─── Icons from IconMCP ───────────────────────────────────────────────────────
import {
  BookOpen,
  Lock,
  LogIn,
  UserPlus,
} from "@/components/ui/icons";

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

// ─── Framer Sidebar Dock Menu ─────────────────────────────────────────────────
import {
  SidebarDockMenu,
  type UserProfile,
} from "@/components/sidebar-dock-menu";

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
      <div className="inline-flex bg-[#141515] border border-[#2E2E2F] rounded-2xl rounded-tl-sm px-4 py-3 items-center gap-1.5 shadow-sm">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#B3B2B2] animate-bounce"
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

// ─── ChatBubble (Monochrome Shadcn Badges) ───────────────────────────────────

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
        <div className="bg-[#1E1F1F] border border-[#2E2E2F] rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm">
          <p className="text-sm font-normal text-[#FFFFFF] leading-relaxed tracking-normal whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <span className="text-[10px] text-[#5F5C5D] font-mono px-1">
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
      <div className="flex flex-col gap-2 bg-[#141515] border border-[#2E2E2F] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm w-full">
        <TextGenerateEffect
          words={message.content}
          className="font-normal"
          textClassName="text-sm font-normal text-[#E0E0E0] leading-relaxed tracking-normal whitespace-pre-wrap break-words"
          duration={0.35}
        />

        {/* Sumber Basis Pengetahuan Terverifikasi (Monochrome Badge) */}
        {hasSources && (
          <div className="mt-2 pt-2.5 border-t border-[#2E2E2F] flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-[#B3B2B2] flex items-center gap-1.5">
              <BookOpen size={14} className="text-[#FFFFFF]" />
              Sumber Informasi Terverifikasi:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.sources!.map((s, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#1E1F1F] border-[#2E2E2F] text-[11px] text-[#D1D1D1] shadow-xs font-normal"
                  title={s.title}
                >
                  <span className="font-semibold text-[#FFFFFF]">
                    {s.school}
                  </span>
                  <span className="text-[#3F3F3F]">•</span>
                  <span className="text-[#B3B2B2]">{s.category}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          {message.userRole && (
            <span className="text-[10px] text-[#5F5C5D]">
              Respons mode:{" "}
              <span className="font-semibold text-[#E0E0E0]">
                {message.userRole}
              </span>
            </span>
          )}
          <span className="text-[10px] text-[#5F5C5D] font-mono ml-auto">
            {timeStr}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── ChatPage (default export) ────────────────────────────────────────────────

const CHAT_PLACEHOLDERS = [
  "Tanya seputar jurusan di SMK Malang...",
  "Apa saja jurusan di SMK Telkom Malang?",
  "Dimana alamat SMKN 5 Malang?",
  "Bagaimana cara daftar PPDB di SMKN 4 Malang?",
  "Fasilitas apa saja yang ada di SMK Telkom?",
  "Ekskul apa saja yang ada di SMKN 3 Malang?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // RBAC State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [apiToken, setApiToken] = useState<string | null>(null);

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "https://chatbot-ai-production-b22e59af.up.railway.app";

  const isLoggedIn = !!apiToken && currentUser?.role !== "guest";

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
          setCurrentUser(null);
        }
      } catch (e) {
        console.error("Gagal mengambil profil user:", e);
      }
    },
    [apiBase]
  );

  // Initial load: Read stored token
  useEffect(() => {
    const savedToken = localStorage.getItem("chat_token");
    if (savedToken) {
      setApiToken(savedToken);
      fetchProfile(savedToken);
    } else {
      fetchProfile(null);
    }
  }, [fetchProfile]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("chat_token");
    setApiToken(null);
    setCurrentUser(null);
    toast.info("Berhasil Keluar", {
      description: "Sesi Anda telah berakhir. Anda kini dalam mode Tamu.",
    });
  };

  // Auto-scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    // Strict Login Guard: Guest cannot send chat messages
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      toast.warning("Harap Masuk Terlebih Dahulu", {
        description: "Anda harus login untuk dapat bertanya kepada asisten AI.",
      });
      return;
    }

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
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
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
    <div className="relative flex flex-col h-screen bg-[#0A0A0B] text-[#FFFFFF] overflow-hidden">
      {/* ── Framer Sidebar Dock Menu ── */}
      <SidebarDockMenu
        currentUser={currentUser}
        onLogout={handleLogout}
        onClear={() => setShowConfirm(true)}
      />

      {/* ── Login Required Dialog ── */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="border border-[#2E2E2F] bg-[#141515] text-[#FFFFFF] shadow-2xl sm:max-w-md p-6 rounded-[10px]">
          <DialogHeader>
            <div className="w-10 h-10 rounded-[6px] bg-[#1E1F1F] border border-[#2E2E2F] flex items-center justify-center text-[#FFFFFF] mb-2">
              <Lock size={18} />
            </div>
            <DialogTitle className="text-base font-semibold text-[#FFFFFF] tracking-tight">
              Masuk untuk Memulai Chat
            </DialogTitle>
            <DialogDescription className="text-xs text-[#B3B2B2] mt-1 leading-relaxed">
              Anda saat ini berada dalam mode Tamu. Untuk menjaga batas kuota dan
              hak akses informasi sekolah, silakan login dengan akun Anda atau buat
              akun baru.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-5 flex flex-col sm:flex-row gap-2.5">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full bg-[#1E1F1F] hover:bg-[#2E2E2F] border-[#2E2E2F] text-[#FFFFFF] rounded-[6px] text-xs font-medium cursor-pointer"
              >
                <UserPlus size={14} className="mr-1.5" />
                Daftar Akun
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                className="w-full bg-[#FFFFFF] hover:bg-[#F0F0F0] text-[#0A0A0B] rounded-[6px] text-xs font-semibold shadow-xs cursor-pointer"
              >
                <LogIn size={14} className="mr-1.5 text-[#0A0A0B]" />
                Masuk Sekarang
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Confirmation for Clearing Conversation ── */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="border border-[#2E2E2F] bg-[#141515] text-[#FFFFFF] shadow-2xl sm:max-w-md p-6 rounded-[10px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-[#FFFFFF] tracking-tight">
              Hapus Percakapan
            </DialogTitle>
            <DialogDescription className="text-xs text-[#B3B2B2] mt-1">
              Tindakan ini tidak dapat dibatalkan. Semua pesan dalam percakapan ini
              akan dibersihkan secara permanen dari layar sesi Anda.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-2.5">
            <Button
              variant="secondary"
              className="bg-[#1E1F1F] hover:bg-[#2E2E2F] border border-[#2E2E2F] text-[#FFFFFF] rounded-[6px] text-xs font-medium cursor-pointer"
              onClick={() => setShowConfirm(false)}
            >
              Batal
            </Button>
            <Button
              className="bg-[#2E2E2F] hover:bg-[#3F3F3F] border border-[#3F3F3F] text-[#FFFFFF] rounded-[6px] text-xs font-medium shadow-xs cursor-pointer"
              onClick={handleClearConfirm}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Chat Main Area ── */}
      <div className="relative z-10 flex flex-col flex-1 min-h-0 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Messages scroll container */}
        <div className="flex-1 overflow-y-auto chat-scroll pt-20 sm:pt-6 pb-4">
          <div className="flex flex-col gap-4 py-4">
            {messages.length === 0 ? (
              /* Welcome Card for Empty State */
              <div className="flex flex-col items-center justify-center text-center py-12 px-4 max-w-md mx-auto my-auto">
                <div className="w-16 h-16 flex items-center justify-center mb-4">
                  <Image
                    src="/logo.png"
                    alt="KeraVokasi"
                    width={56}
                    height={56}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
                <h2 className="text-lg font-bold text-[#FFFFFF] tracking-tight">
                  KeraVokasi AI Chatbot
                </h2>
                <p className="text-xs text-[#B3B2B2] mt-1.5 mb-5 leading-relaxed">
                  Asisten resmi seputar sekolah kejuruan (SMK) di Malang. Dapatkan
                  informasi jurusan, pendaftaran PPDB, kurikulum, dan fasilitas
                  sekolah.
                </p>

                {!isLoggedIn && (
                  <div className="flex items-center gap-2.5 w-full justify-center">
                    <Link href="/login">
                      <Button className="bg-[#FFFFFF] hover:bg-[#F0F0F0] text-[#0A0A0B] rounded-[6px] text-xs font-semibold px-4 h-9 shadow-xs cursor-pointer">
                        <LogIn size={14} className="mr-1.5 text-[#0A0A0B]" />
                        Masuk ke Akun
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button
                        variant="outline"
                        className="bg-[#1E1F1F] hover:bg-[#2E2E2F] border-[#2E2E2F] text-[#FFFFFF] rounded-[6px] text-xs font-medium px-4 h-9 cursor-pointer"
                      >
                        <UserPlus size={14} className="mr-1.5 text-[#FFFFFF]" />
                        Daftar Baru
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)
            )}

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
                "linear-gradient(to right, transparent, #2E2E2F, transparent)",
            }}
          />

          <div className="relative">
            {isLoggedIn ? (
              /* Normal Input when Logged In */
              <PlaceholdersAndVanishInput
                placeholders={CHAT_PLACEHOLDERS}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (error) setError(null);
                }}
                onSubmit={handleFormSubmit}
              />
            ) : (
              /* Locked Input Bar for Guest */
              <div
                onClick={() => setShowLoginPrompt(true)}
                className="w-full bg-[#1E1F1F] hover:bg-[#252627] border border-[#2E2E2F] hover:border-[#3F3F3F] rounded-full p-2.5 px-4 flex items-center justify-between cursor-pointer transition-all shadow-md group"
              >
                <div className="flex items-center gap-2.5 text-xs text-[#B3B2B2] group-hover:text-[#FFFFFF]">
                  <Lock size={15} className="text-[#FFFFFF]" />
                  <span>
                    Anda harus login terlebih dahulu untuk mengirim pesan...
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-semibold text-[#0A0A0B] bg-[#FFFFFF] hover:bg-[#F0F0F0] px-3.5 py-1 rounded-full shadow-xs transition-colors"
                  >
                    Masuk
                  </Link>
                </div>
              </div>
            )}

            {/* Error Text Directly Below Input */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center justify-center gap-1.5 mt-2"
                >
                  <p className="text-center text-xs text-[#E0E0E0] bg-[#1E1F1F] border border-[#2E2E2F] px-3 py-1 rounded-[6px] font-medium">
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
