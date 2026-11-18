"use client";

import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from "@/components/ui/animated-modal";
import { Menu, MenuItem, HoveredLink } from "@/components/ui/navbar-menu";
import { ChromaCurrent } from "@/components/ui/chroma-current";
import { Copy, Trash2, Check, Sparkles, BookOpen, Clock, Phone, ExternalLink } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: Message[];
}

// ─── Navbar Component (Aceternity Navbar Menu) ────────────────────────────────

interface NavbarProps {
  onClear: () => void;
  onSelectPrompt: (prompt: string) => void;
  history: ChatSession[];
  onLoadHistory: (session: ChatSession) => void;
  onCopyChat: () => void;
  copied: boolean;
}

function Navbar({
  onClear,
  onSelectPrompt,
  history,
  onLoadHistory,
  onCopyChat,
  copied,
}: NavbarProps) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="fixed top-4 inset-x-0 z-50 mx-auto max-w-3xl px-4 pointer-events-auto">
      <Menu setActive={setActive} className="border border-white/10 bg-black/75 shadow-2xl backdrop-blur-2xl py-2 px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2 cursor-pointer select-none py-1">
          <div className="w-2.5 h-2.5 rounded-full bg-[#b8292e] animate-pulse shadow-[0_0_8px_#b8292e]" />
          <span className="text-xs sm:text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
            Moklet AI
            <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-[#b8292e]/20 text-[#fca5a5] border border-[#b8292e]/40 hidden sm:inline-block">
              Telkom Malang
            </span>
          </span>
        </div>

        {/* Menu Items */}
        <div className="flex items-center space-x-3 sm:space-x-6">
          {/* Dokumentasi */}
          <MenuItem setActive={setActive} active={active} item="Dokumentasi">
            <div className="w-72 sm:w-80 flex flex-col space-y-3 text-sm p-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/90 border-b border-white/10 pb-2">
                <BookOpen className="w-3.5 h-3.5 text-[#f87171]" />
                Topik Pengetahuan Resmi
              </div>
              <div className="flex flex-col space-y-2 text-xs">
                <button
                  onClick={() => {
                    onSelectPrompt("Jelaskan profil dan sejarah SMK Telkom Malang");
                    setActive(null);
                  }}
                  className="text-left p-2 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <p className="font-medium text-white group-hover:text-[#f87171] transition-colors">
                    Profil & Sejarah
                  </p>
                  <p className="text-[#949ba4] text-[11px] line-clamp-1">
                    Didirikan 1992, pelopor SMK TI, akreditasi A, ISO 9001:2015.
                  </p>
                </button>

                <button
                  onClick={() => {
                    onSelectPrompt("Apa saja jurusan di SMK Telkom Malang dan prospeknya?");
                    setActive(null);
                  }}
                  className="text-left p-2 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <p className="font-medium text-white group-hover:text-[#f87171] transition-colors">
                    3 Jurusan Unggulan
                  </p>
                  <p className="text-[#949ba4] text-[11px] line-clamp-1">
                    RPL (Software), TKJ (Jaringan), dan Pengembangan Gim (PG).
                  </p>
                </button>

                <button
                  onClick={() => {
                    onSelectPrompt("Bagaimana informasi pendaftaran siswa baru (PPDB) SMK Telkom Malang?");
                    setActive(null);
                  }}
                  className="text-left p-2 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <p className="font-medium text-white group-hover:text-[#f87171] transition-colors">
                    Pendaftaran & PPDB
                  </p>
                  <p className="text-[#949ba4] text-[11px] line-clamp-1">
                    Pendaftaran online, tes akademik & kesamaptaan, program MP3.
                  </p>
                </button>

                <button
                  onClick={() => {
                    onSelectPrompt("Fasilitas apa saja yang ada di SMK Telkom Malang?");
                    setActive(null);
                  }}
                  className="text-left p-2 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <p className="font-medium text-white group-hover:text-[#f87171] transition-colors">
                    Fasilitas & Karir
                  </p>
                  <p className="text-[#949ba4] text-[11px] line-clamp-1">
                    Game Station, Techno Park, jalur BMW (Bekerja, Kuliah, Wirausaha).
                  </p>
                </button>
              </div>
            </div>
          </MenuItem>

          {/* Riwayat Chat */}
          <MenuItem setActive={setActive} active={active} item="Riwayat">
            <div className="w-72 sm:w-80 flex flex-col space-y-3 text-sm p-1">
              <div className="flex items-center justify-between text-xs font-semibold text-white/90 border-b border-white/10 pb-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#f87171]" />
                  Riwayat Percakapan
                </span>
                <span className="text-[10px] text-[#949ba4] font-normal">
                  {history.length} sesi tersimpan
                </span>
              </div>
              <div className="flex flex-col space-y-1.5 max-h-56 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-xs text-[#949ba4] py-3 text-center">
                    Belum ada riwayat percakapan tersimpan.
                  </p>
                ) : (
                  history.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => {
                        onLoadHistory(session);
                        setActive(null);
                      }}
                      className="text-left p-2 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <p className="text-xs font-medium text-white group-hover:text-[#f87171] truncate">
                        {session.title}
                      </p>
                      <p className="text-[10px] text-[#949ba4]">{session.date}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </MenuItem>

          {/* Aksi & Kontak */}
          <MenuItem setActive={setActive} active={active} item="Bantuan">
            <div className="w-64 flex flex-col space-y-3 text-xs p-1">
              <div className="flex items-center gap-1.5 font-semibold text-white/90 border-b border-white/10 pb-2">
                <Phone className="w-3.5 h-3.5 text-[#f87171]" />
                Kontak & Layanan Resmi
              </div>
              <div className="space-y-2">
                <a
                  href="https://wa.me/6281223488999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-white group"
                >
                  <div>
                    <p className="font-medium group-hover:text-[#f87171]">WhatsApp / Call Center</p>
                    <p className="text-[11px] text-[#949ba4]">0812-2348-8999</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-[#949ba4]" />
                </a>

                <a
                  href="https://ppdb.smktelkom-mlg.sch.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-white group"
                >
                  <div>
                    <p className="font-medium group-hover:text-[#f87171]">Situs Resmi PPDB</p>
                    <p className="text-[11px] text-[#949ba4]">ppdb.smktelkom-mlg.sch.id</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-[#949ba4]" />
                </a>

                <div className="pt-2 border-t border-white/10 flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      onCopyChat();
                      setActive(null);
                    }}
                    className="flex items-center gap-2 p-1.5 rounded text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Percakapan Disalin!" : "Salin Isi Obrolan"}
                  </button>

                  <button
                    onClick={() => {
                      onClear();
                      setActive(null);
                    }}
                    className="flex items-center gap-2 p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus Obrolan
                  </button>
                </div>
              </div>
            </div>
          </MenuItem>
        </div>

        {/* Quick Action Button: Delete Chat */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            title="Hapus Percakapan"
            className="p-1.5 rounded-full text-[#949ba4] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </Menu>
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
      <div className="inline-flex bg-[#1e1f22]/90 border border-[#3f4147]/80 rounded-2xl rounded-tl-sm px-4 py-3 items-center gap-1.5 shadow-lg backdrop-blur-md">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#f87171] animate-bounce"
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

// ─── ChatBubble ───────────────────────────────────────────────────────────────

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const timeStr = new Date(message.timestamp).toLocaleTimeString("id-ID", {
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
        className="flex flex-col items-end gap-1 max-w-[85%] sm:max-w-[75%] ml-auto"
      >
        <div className="bg-[#2a2b2f]/90 border border-white/15 rounded-2xl rounded-br-sm px-4 py-2.5 shadow-xl backdrop-blur-md">
          <TextGenerateEffect
            words={message.content}
            className="font-normal"
            textClassName="text-sm font-normal text-[#f2f3f5] leading-relaxed tracking-normal whitespace-pre-wrap break-words"
            duration={0.4}
          />
        </div>
        <span className="text-[10px] text-[#949ba4] font-mono px-1">
          {timeStr}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
      className="flex flex-col items-start gap-1 max-w-[85%] sm:max-w-[75%]"
    >
      <div className="flex flex-col gap-1 bg-[#18191c]/95 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 shadow-2xl backdrop-blur-xl">
        <TextGenerateEffect
          words={message.content}
          className="font-normal"
          textClassName="text-sm font-normal text-[#e4e4e7] leading-relaxed tracking-normal whitespace-pre-wrap break-words"
          duration={0.4}
        />
        <span className="text-[10px] text-[#71717a] font-mono self-end pt-1">
          {timeStr}
        </span>
      </div>
    </motion.div>
  );
}

// ─── ChatPage (default export) ────────────────────────────────────────────────

const CHAT_PLACEHOLDERS = [
  "Tanya seputar SMK Telkom Malang...",
  "Apa saja jurusan di SMK Telkom Malang?",
  "Bagaimana cara daftar PPDB siswa baru?",
  "Siapa kepala sekolah SMK Telkom Malang?",
  "Apa itu jurusan Pengembangan Gim (PG)?",
  "Ekskul apa saja yang ada di Moklet?",
];

const SUGGESTED_QUESTIONS = [
  "Apa saja 3 jurusan yang ada di SMK Telkom Malang?",
  "Bagaimana alur pendaftaran siswa baru (PPDB)?",
  "Siapa kepala sekolah SMK Telkom Malang saat ini?",
  "Fasilitas dan kegiatan ekstrakurikuler apa saja yang ada?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage on initial render
  useEffect(() => {
    try {
      const stored = localStorage.getItem("moklet_chat_history");
      if (stored) {
        const parsed = JSON.parse(stored);
        setChatHistory(parsed);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save conversation into history whenever messages change (if >= 2 messages)
  useEffect(() => {
    if (messages.length < 2) return;
    try {
      const firstUserMsg = messages.find((m) => m.role === "user");
      const title = firstUserMsg ? firstUserMsg.content.slice(0, 40) + "..." : "Percakapan Moklet";
      const now = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

      setChatHistory((prev) => {
        const filtered = prev.filter((s) => s.id !== "current");
        const updated = [{ id: "current", title, date: now, messages }, ...filtered].slice(0, 10);
        localStorage.setItem("moklet_chat_history", JSON.stringify(updated));
        return updated;
      });
    } catch {
      // Ignore storage errors
    }
  }, [messages]);

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
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
        "http://localhost:3001";
      const response = await fetch(`${apiBase}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        throw new Error(
          (errData as { error?: string }).error ||
            `Server error (${response.status})`
        );
      }

      const data: { reply: string } = await response.json();

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal terhubung ke server.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

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
  };

  const handleCopyChat = () => {
    if (messages.length === 0) return;
    const transcript = messages
      .map((m) => `[${m.role === "user" ? "Anda" : "Moklet AI"}]:\n${m.content}`)
      .join("\n\n");
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative flex flex-col h-screen bg-black text-[#dbdee1] overflow-hidden select-text">
      {/* ── Chroma Current Background ── */}
      <div className="absolute inset-0 z-0">
        <ChromaCurrent
          colorA="#b8292e"
          colorB="#322c2b"
          backgroundColor="#000000"
          pitch={8}
          dotSize={0.62}
          baseDots={0.12}
          streams={4}
          speed={0.6}
          turbulence={0.6}
          bloom={0.6}
          interactive={true}
        />
        {/* Soft overlay gradient for maximum text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-black/90 pointer-events-none" />
      </div>

      {/* ── Navbar Menu ── */}
      <Navbar
        onClear={() => setShowConfirm(true)}
        onSelectPrompt={handleSend}
        history={chatHistory}
        onLoadHistory={(session) => setMessages(session.messages)}
        onCopyChat={handleCopyChat}
        copied={copied}
      />

      {/* ── Deletion Confirmation Modal ── */}
      <Modal open={showConfirm} setOpen={setShowConfirm}>
        <ModalBody className="border border-white/10 bg-[#18191c] shadow-2xl backdrop-blur-2xl">
          <ModalContent className="p-6 sm:p-7">
            <h3 className="text-lg font-semibold text-white tracking-tight">
              Hapus Obrolan
            </h3>
            <p className="text-xs text-[#949ba4] mt-1 mb-4">
              Tindakan ini tidak dapat dibatalkan
            </p>
            <p className="text-sm text-[#dbdee1] leading-relaxed">
              Semua pesan dalam percakapan saat ini akan dibersihkan dari layar sesi Anda.
            </p>
          </ModalContent>
          <ModalFooter className="bg-[#121316] border-t border-white/10 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#dbdee1] hover:text-white bg-[#2b2d31] hover:bg-[#383a40] transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleClearConfirm}
              className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-[#b8292e] hover:bg-[#991b1f] transition-all shadow-md"
            >
              Hapus
            </button>
          </ModalFooter>
        </ModalBody>
      </Modal>

      {/* ── Main Chat Container ── */}
      <div className="relative z-10 flex flex-col flex-1 min-h-0 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto chat-scroll pt-24 pb-4">
          {messages.length === 0 ? (
            /* Empty Welcome State */
            <div className="h-full flex flex-col items-center justify-center text-center px-4 max-w-xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#b8292e]/20 border border-[#b8292e]/40 flex items-center justify-center text-[#f87171] mb-4 shadow-[0_0_24px_rgba(184,41,46,0.35)]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
                  Asisten AI SMK Telkom Malang
                </h2>
                <p className="text-xs sm:text-sm text-[#949ba4] leading-relaxed mb-6 max-w-md">
                  Tanyakan informasi resmi seputar jurusan, pendaftaran (PPDB), profil, fasilitas, dan kegiatan di Moklet.
                </p>

                {/* Suggested prompt chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#b8292e]/50 transition-all text-xs text-[#dbdee1] hover:text-white flex items-center justify-between group"
                    >
                      <span>{q}</span>
                      <span className="text-[#949ba4] group-hover:text-[#f87171] transition-colors ml-2">
                        &rarr;
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
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
          )}
        </div>

        {/* ── Input Bar ── */}
        <div className="relative flex-shrink-0 pb-6 pt-3">
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

            {/* Status footer hint */}
            <p className="text-center text-[10px] text-[#71717a] mt-2 font-mono">
              {isLoading
                ? "Moklet AI sedang merespons..."
                : messages.length > 0
                ? `${messages.length} pesan · Tekan Enter untuk kirim`
                : "Tekan Enter untuk kirim · Ditenagai Basis Data Resmi SMK Telkom Malang"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
