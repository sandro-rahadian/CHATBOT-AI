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
import { ChromaCurrent } from "@/components/ui/chroma-current";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Globe2,
  Lock,
  ChevronDown,
  Check,
  Copy,
  Trash2,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  GraduationCap,
  Briefcase,
  Users,
  Code,
  Network,
  Gamepad2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Building,
  Award,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── TypingIndicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
      className="max-w-[85%] sm:max-w-[75%]"
    >
      <div className="inline-flex bg-[#16181d]/90 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 items-center gap-1.5 shadow-lg backdrop-blur-md">
        <span className="text-xs text-[#a1a1aa] font-medium mr-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#e30613]" /> Moka sedang merespons
        </span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#e30613] animate-bounce"
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
        initial={{ opacity: 0, y: 15, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
        className="flex flex-col items-end gap-1 max-w-[85%] sm:max-w-[75%] ml-auto"
      >
        <div className="bg-[#1f2229]/95 border border-white/15 rounded-2xl rounded-br-sm px-4 py-2.5 shadow-xl backdrop-blur-md">
          <TextGenerateEffect
            words={message.content}
            className="font-normal"
            textClassName="text-sm font-normal text-[#f4f4f5] leading-relaxed tracking-normal whitespace-pre-wrap break-words"
            duration={0.35}
          />
        </div>
        <span className="text-[10px] text-[#71717a] font-mono px-1">
          {timeStr}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
      className="flex flex-col items-start gap-1 max-w-[90%] sm:max-w-[80%]"
    >
      <div className="flex flex-col gap-1 bg-[#121316]/95 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-1.5 pb-1 mb-1 border-b border-white/5">
          <div className="w-2 h-2 rounded-full bg-[#e30613]" />
          <span className="text-[11px] font-semibold text-[#fca5a5]">Moka</span>
          <span className="text-[10px] text-[#71717a]">· Asisten Resmi</span>
        </div>
        <TextGenerateEffect
          words={message.content}
          className="font-normal"
          textClassName="text-sm font-normal text-[#e4e4e7] leading-relaxed tracking-normal whitespace-pre-wrap break-words"
          duration={0.35}
        />
        <span className="text-[10px] text-[#52525b] font-mono self-end pt-1">
          {timeStr}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main Landing Page Component (Moka — Moklet Assistant) ────────────────────

export default function MokaLandingPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeRoleTab, setActiveRoleTab] = useState<string>("ppdb");

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll inside chat box when messages update
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
      .map((m) => `[${m.role === "user" ? "Pengguna" : "Moka (Moklet AI)"}]:\n${m.content}`)
      .join("\n\n");
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToChat = () => {
    chatContainerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const CHAT_PLACEHOLDERS = [
    "Tanya seputar SMK Telkom Malang...",
    "Apa saja jurusan di SMK Telkom Malang?",
    "Bagaimana alur pendaftaran siswa baru (PPDB)?",
    "Siapa kepala sekolah SMK Telkom Malang?",
    "Fasilitas apa saja yang ada di Moklet?",
  ];

  const HERO_CHIPS = [
    { label: "Jurusan di Moklet", prompt: "Sebutkan dan jelaskan 3 jurusan yang ada di SMK Telkom Malang!" },
    { label: "Pendaftaran PPDB", prompt: "Bagaimana alur pendaftaran siswa baru (PPDB) SMK Telkom Malang?" },
    { label: "Kepala Sekolah", prompt: "Siapa kepala sekolah SMK Telkom Malang saat ini?" },
    { label: "Game Station & Fasilitas", prompt: "Fasilitas apa saja yang ada di SMK Telkom Malang, termasuk Game Station?" },
  ];

  const FAQ_LIST = [
    {
      q: "Apa itu Moka (Moklet Assistant)?",
      a: "Moka adalah asisten AI resmi SMK Telkom Malang yang dirancang untuk menjawab pertanyaan siswa, calon siswa (PPDB), guru, orang tua, dan masyarakat seputar profil sekolah, jurusan, fasilitas, kurikulum, dan tata cara pendaftaran.",
    },
    {
      q: "Apakah informasi yang diberikan Moka selalu akurat?",
      a: "Ya. Moka dihubungkan secara ketat dengan basis data pengetahuan resmi (data.md) SMK Telkom Malang. Moka diinstruksikan tidak mengarang bebas (zero-hallucination) dan hanya menyajikan fakta yang telah diverifikasi sekolah.",
    },
    {
      q: "Apakah rincian biaya pendaftaran atau SPP dapat dilihat di Moka?",
      a: "Rincian pasti nominal biaya pendaftaran dan SPP diperbarui setiap tahun ajaran. Untuk informasi resmi biaya terkini, silakan kunjungi ppdb.smktelkom-mlg.sch.id atau hubungi Call Center resmi sekolah di 0812-2348-8999.",
    },
    {
      q: "Jurusan apa saja yang tersedia di SMK Telkom Malang?",
      a: "Terdapat 3 jurusan unggulan: Rekayasa Perangkat Lunak (RPL - 8 kelas), Teknik Komputer dan Jaringan (TKJ - 4 kelas), serta Pengembangan Gim (PG - 2 kelas) yang baru dibuka pada 2024.",
    },
    {
      q: "Bagaimana cara mendaftar sebagai siswa baru di SMK Telkom Malang?",
      a: "Pendaftaran siswa baru dilakukan secara online melalui ppdb.smktelkom-mlg.sch.id. Terdapat jalur Moklet Pass Priority Programme (MP3) untuk siswa kelas 8 serta seleksi reguler (tes akademik & wawancara/kesamaptaan).",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#07080a] text-[#f2f3f5] font-sans selection:bg-[#e30613]/30 selection:text-white">
      {/* ── Background Chroma Current Canvas ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ChromaCurrent
          colorA="#b8292e"
          colorB="#322c2b"
          backgroundColor="#07080a"
          pitch={8}
          dotSize={0.62}
          baseDots={0.12}
          streams={4}
          speed={0.5}
          turbulence={0.6}
          bloom={0.55}
          interactive={true}
        />
        {/* Ambient Gradient Masks */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07080a]/90 via-[#07080a]/75 to-[#07080a]/95 pointer-events-none" />
      </div>

      {/* ── Floating Frosted Pill Header (Glacia Style) ── */}
      <header className="fixed top-4 inset-x-0 z-50 mx-auto max-w-4xl px-4 pointer-events-auto">
        <div className="glass-pill rounded-full px-5 py-2.5 flex items-center justify-between shadow-2xl">
          {/* Brand Lockup */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-3 h-3 rounded-full bg-[#e30613] shadow-[0_0_12px_#e30613] animate-pulse" />
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              Moka
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[#e30613]/15 text-[#fca5a5] border border-[#e30613]/35">
                Moklet Assistant
              </span>
            </span>
          </a>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-[#a1a1aa]">
            <a href="#features" className="hover:text-white transition-colors">
              Fitur
            </a>
            <a href="#workflows" className="hover:text-white transition-colors">
              Peran & Jurusan
            </a>
            <a href="#integrations" className="hover:text-white transition-colors">
              Ekosistem
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={scrollToChat}
              className="text-xs font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-[#e30613] to-[#b8292e] text-white hover:brightness-110 transition-all glow-red-sm flex items-center gap-1.5"
            >
              <span>Tanya Moka</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Delete Confirmation Modal ── */}
      <Modal open={showConfirm} setOpen={setShowConfirm}>
        <ModalBody className="border border-white/10 bg-[#14161b] shadow-2xl backdrop-blur-2xl">
          <ModalContent className="p-6 sm:p-7">
            <h3 className="text-lg font-semibold text-white tracking-tight">
              Hapus Percakapan
            </h3>
            <p className="text-xs text-[#a1a1aa] mt-1 mb-4">
              Tindakan ini tidak dapat dibatalkan
            </p>
            <p className="text-sm text-[#d4d4d8] leading-relaxed">
              Semua pesan dalam sesi obrolan ini akan dibersihkan dari layar Anda.
            </p>
          </ModalContent>
          <ModalFooter className="bg-[#0f1013] border-t border-white/10 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#d4d4d8] hover:text-white bg-[#27272a] hover:bg-[#3f3f46] transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleClearConfirm}
              className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-[#e30613] hover:bg-[#b8292e] transition-all shadow-md"
            >
              Hapus
            </button>
          </ModalFooter>
        </ModalBody>
      </Modal>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-10 flex flex-col pt-28 sm:pt-36">
        {/* ── SECTION 1: HERO (Glacia Layout) ── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Micro-badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-[#d4d4d8] backdrop-blur-md mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-[#e30613] animate-ping" />
            <span className="font-mono text-[11px] text-[#fca5a5]">0.4s response time</span>
            <span className="text-white/20">|</span>
            <span>Didukung Basis Data Resmi SMK Telkom Malang</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] max-w-4xl"
          >
            Beyond Smart. Beyond Fast.
            <br />
            <span className="bg-gradient-to-r from-white via-[#fca5a5] to-[#e30613] bg-clip-text text-transparent">
              Temui Moka.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-[#a1a1aa] max-w-2xl leading-relaxed"
          >
            Asisten AI cerdas resmi SMK Telkom Malang. Panduan akurat seputar jurusan (RPL, TKJ, Pengembangan Gim), pendaftaran PPDB, kurikulum, fasilitas, hingga persiapan karir industri.
          </motion.p>

          {/* Dual CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
          >
            <button
              onClick={scrollToChat}
              className="px-6 py-3 rounded-full bg-[#e30613] hover:bg-[#b8292e] text-white font-semibold text-sm transition-all glow-red flex items-center gap-2"
            >
              <span>Tanya Moka Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-all backdrop-blur-md"
            >
              Pelajari Fitur Moka
            </a>
          </motion.div>

          {/* ── Interactive Live Chat Playground (Hero Window) ── */}
          <motion.div
            ref={chatContainerRef}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-14 w-full max-w-3xl glass-panel rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/15 relative overflow-hidden"
          >
            {/* Window Titlebar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-[#e30613]/90 shadow-[0_0_8px_#e30613]" />
                <span className="text-xs font-semibold text-white">Moka Interactive Playground</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-[#a1a1aa]">
                  Gemini 2.0 Flash
                </span>
              </div>

              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <>
                    <button
                      onClick={handleCopyChat}
                      className="p-1.5 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-white/5 transition-colors text-xs flex items-center gap-1"
                      title="Salin Percakapan"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="p-1.5 rounded-lg text-[#a1a1aa] hover:text-red-400 hover:bg-red-500/10 transition-colors text-xs"
                      title="Hapus Percakapan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-2 mb-4 justify-start">
              {HERO_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.prompt)}
                  className="text-[11px] px-3 py-1.5 rounded-full bg-white/5 hover:bg-[#e30613]/15 border border-white/10 hover:border-[#e30613]/40 text-[#d4d4d8] hover:text-white transition-all text-left"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Message Stream Area */}
            <div className="min-h-[220px] max-h-[380px] overflow-y-auto chat-scroll flex flex-col gap-3.5 p-2 text-left">
              {messages.length === 0 ? (
                <div className="h-[200px] flex flex-col items-center justify-center text-center p-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#e30613]/15 border border-[#e30613]/30 flex items-center justify-center text-[#f87171] mb-2.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">
                    Halo! Ada yang ingin ditanyakan tentang Moklet?
                  </p>
                  <p className="text-xs text-[#a1a1aa] max-w-sm">
                    Ketik pertanyaan Anda di bawah atau klik salah satu topik rekomendasi di atas.
                  </p>
                </div>
              ) : (
                messages.map((m) => <ChatBubble key={m.id} message={m} />)
              )}

              <AnimatePresence>
                {isLoading && <TypingIndicator />}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <PlaceholdersAndVanishInput
                placeholders={CHAT_PLACEHOLDERS}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (error) setError(null);
                }}
                onSubmit={handleFormSubmit}
              />

              {/* Inline Error Notice */}
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
          </motion.div>
        </section>

        {/* ── SECTION 2: TRUST STATS STRIP ── */}
        <section className="mt-24 border-y border-white/10 bg-[#0e1014]/60 backdrop-blur-md py-10 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">1.400+</p>
              <p className="text-xs text-[#a1a1aa] mt-1 font-medium">Siswa Aktif Tiga Angkatan</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#fca5a5] tracking-tight">Akreditasi A</p>
              <p className="text-xs text-[#a1a1aa] mt-1 font-medium">ISO 9001:2015 & Adiwiyata</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">3 Jurusan</p>
              <p className="text-xs text-[#a1a1aa] mt-1 font-medium">RPL (8), TKJ (4), PG (2 Kelas)</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#fca5a5] tracking-tight">100% Valid</p>
              <p className="text-xs text-[#a1a1aa] mt-1 font-medium">Bebas Halusinasi (data.md)</p>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: CORE FEATURES (BENTO GRID - GLACIA STYLE) ── */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-semibold text-[#f87171] uppercase tracking-wider">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">
              Fitur yang Benar-Benar Berarti.
            </h2>
            <p className="text-sm text-[#a1a1aa] mt-3">
              Dirancang untuk kecepatan respons, akurasi tanpa keraguan, dan kenyamanan civitas SMK Telkom Malang.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bento Card 1 */}
            <div className="glass-panel rounded-3xl p-7 flex flex-col justify-between hover:border-[#e30613]/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#e30613]/15 border border-[#e30613]/30 flex items-center justify-center text-[#f87171] mb-6 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Respons Secepat Kilat</h3>
                <p className="text-sm text-[#a1a1aa] leading-relaxed">
                  Tidak perlu menunggu lama. Ditenagai model Google Gemini Flash, Moka merespons pertanyaan Anda dalam rata-rata 0.4 detik.
                </p>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="glass-panel rounded-3xl p-7 flex flex-col justify-between hover:border-[#e30613]/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#e30613]/15 border border-[#e30613]/30 flex items-center justify-center text-[#f87171] mb-6 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Pemahaman Berbasis Fakta</h3>
                <p className="text-sm text-[#a1a1aa] leading-relaxed">
                  Terhubung langsung dengan 21 entri basis data resmi sekolah. Informasi kepala sekolah, jurusan, fasilitas, dan kontak dijamin akurat tanpa halusinasi.
                </p>
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="glass-panel rounded-3xl p-7 flex flex-col justify-between hover:border-[#e30613]/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#e30613]/15 border border-[#e30613]/30 flex items-center justify-center text-[#f87171] mb-6 group-hover:scale-105 transition-transform">
                <Globe2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Komunikasi Santun & Informatif</h3>
                <p className="text-sm text-[#a1a1aa] leading-relaxed">
                  Menyajikan penjelasan yang terstruktur, ramah, dan solutif. Mengarahkan ke call center resmi untuk pertanyaan yang belum tercatat di sistem.
                </p>
              </div>
            </div>

            {/* Bento Card 4 */}
            <div className="glass-panel rounded-3xl p-7 flex flex-col justify-between hover:border-[#e30613]/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#e30613]/15 border border-[#e30613]/30 flex items-center justify-center text-[#f87171] mb-6 group-hover:scale-105 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Privasi Terjaga</h3>
                <p className="text-sm text-[#a1a1aa] leading-relaxed">
                  Obrolan Anda diproses secara anonim tanpa pelacakan komersial, menjunjung tinggi standar keamanan Yayasan Pendidikan Telkom.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: WORKFLOW BY ROLE (GLACIA ROLE TABS) ── */}
        <section id="workflows" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-semibold text-[#f87171] uppercase tracking-wider">
              Workflows & Roles
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">
              Peran Anda. Kebutuhan Anda. Moka Milik Anda.
            </h2>
            <p className="text-sm text-[#a1a1aa] mt-3">
              Moka menyesuaikan jawaban sesuai dengan siapa Anda dan apa yang Anda butuhkan.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {[
              { id: "ppdb", label: "Calon Siswa & Ortu", icon: GraduationCap },
              { id: "rpl", label: "Rekayasa Perangkat Lunak", icon: Code },
              { id: "tkj", label: "Teknik Jaringan", icon: Network },
              { id: "pg", label: "Pengembangan Gim", icon: Gamepad2 },
              { id: "alumni", label: "Karir & Industri (BMW)", icon: Briefcase },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeRoleTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveRoleTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-all ${
                    isActive
                      ? "bg-[#e30613] text-white shadow-lg glow-red-sm"
                      : "bg-white/5 hover:bg-white/10 text-[#a1a1aa] hover:text-white border border-white/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Role Content Card */}
          <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-white/15">
            {activeRoleTab === "ppdb" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-mono text-[#fca5a5] uppercase">Jalur Penerimaan 2025/2026</span>
                  <h3 className="text-2xl font-bold text-white mt-1 mb-3">Informasi Pendaftaran Siswa Baru (PPDB)</h3>
                  <p className="text-sm text-[#a1a1aa] leading-relaxed mb-6">
                    Moka membantu calon siswa dan orang tua memahami alur seleksi akademik (Matematika & Bahasa Inggris), wawancara, tes kesamaptaan fisik, serta program prioritas MP3.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#d4d4d8]">Online ppdb.smktelkom-mlg.sch.id</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#d4d4d8]">Program MP3</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#d4d4d8]">Call Center 0812-2348-8999</span>
                  </div>
                </div>
                <div className="bg-[#16181d] rounded-2xl p-6 border border-white/10">
                  <p className="text-xs font-mono text-[#f87171] mb-2">// Pertanyaan Populer PPDB</p>
                  <p className="text-sm text-white font-medium mb-3">"Bagaimana alur pendaftaran siswa baru SMK Telkom Malang?"</p>
                  <button
                    onClick={() => handleSend("Bagaimana alur pendaftaran siswa baru (PPDB) SMK Telkom Malang?")}
                    className="w-full text-xs py-2.5 rounded-xl bg-[#e30613]/20 hover:bg-[#e30613]/30 border border-[#e30613]/40 text-white font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Tanyakan ini ke Moka</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activeRoleTab === "rpl" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-mono text-[#fca5a5] uppercase">Jurusan Paling Diminati (8 Kelas)</span>
                  <h3 className="text-2xl font-bold text-white mt-1 mb-3">Rekayasa Perangkat Lunak (RPL)</h3>
                  <p className="text-sm text-[#a1a1aa] leading-relaxed mb-6">
                    Fokus pada pembuatan aplikasi, software engineering, web, dan mobile. Lulusan dipersiapkan berkarir sebagai programmer handal, full-stack developer, atau tech entrepreneur.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#d4d4d8]">8 Kelas per Angkatan</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#d4d4d8]">Full-Stack Developer</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#d4d4d8]">Kurikulum Merdeka</span>
                  </div>
                </div>
                <div className="bg-[#16181d] rounded-2xl p-6 border border-white/10">
                  <p className="text-xs font-mono text-[#f87171] mb-2">// Eksplorasi RPL</p>
                  <p className="text-sm text-white font-medium mb-3">"Apa saja yang dipelajari di jurusan RPL SMK Telkom Malang?"</p>
                  <button
                    onClick={() => handleSend("Apa saja yang dipelajari di jurusan RPL SMK Telkom Malang?")}
                    className="w-full text-xs py-2.5 rounded-xl bg-[#e30613]/20 hover:bg-[#e30613]/30 border border-[#e30613]/40 text-white font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Tanyakan ini ke Moka</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activeRoleTab === "tkj" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-mono text-[#fca5a5] uppercase">Infrastruktur & Jaringan (4 Kelas)</span>
                  <h3 className="text-2xl font-bold text-white mt-1 mb-3">Teknik Komputer dan Jaringan (TKJ)</h3>
                  <p className="text-sm text-[#a1a1aa] leading-relaxed mb-6">
                    Berfokus pada perangkat keras, arsitektur server, routing, internet provider, dan keamanan jaringan. Menghasilkan network engineer berstandar industri.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#d4d4d8]">Network Engineer</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#d4d4d8]">Server & Infrastruktur</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#d4d4d8]">Sertifikasi Internasional</span>
                  </div>
                </div>
                <div className="bg-[#16181d] rounded-2xl p-6 border border-white/10">
                  <p className="text-xs font-mono text-[#f87171] mb-2">// Eksplorasi TKJ</p>
                  <p className="text-sm text-white font-medium mb-3">"Bagaimana prospek kerja lulusan TKJ SMK Telkom Malang?"</p>
                  <button
                    onClick={() => handleSend("Bagaimana prospek kerja lulusan TKJ SMK Telkom Malang?")}
                    className="w-full text-xs py-2.5 rounded-xl bg-[#e30613]/20 hover:bg-[#e30613]/30 border border-[#e30613]/40 text-white font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Tanyakan ini ke Moka</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activeRoleTab === "pg" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-mono text-[#fca5a5] uppercase">Jurusan Terbaru (Dibuka 2024 - 2 Kelas)</span>
                  <h3 className="text-2xl font-bold text-white mt-1 mb-3">Pengembangan Gim (PG)</h3>
                  <p className="text-sm text-[#a1a1aa] leading-relaxed mb-6">
                    Bagi calon kreator gim masa depan. Mempelajari konsep cerita, desain level, aset grafis 2D/3D, dan pemrograman gim dengan fasilitas khusus Game Station.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#d4d4d8]">Fasilitas Game Station</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#d4d4d8]">2D & 3D Assets</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#d4d4d8]">Gamedev Career</span>
                  </div>
                </div>
                <div className="bg-[#16181d] rounded-2xl p-6 border border-white/10">
                  <p className="text-xs font-mono text-[#f87171] mb-2">// Eksplorasi PG</p>
                  <p className="text-sm text-white font-medium mb-3">"Apa keunggulan jurusan Pengembangan Gim (PG) di SMK Telkom Malang?"</p>
                  <button
                    onClick={() => handleSend("Apa keunggulan jurusan Pengembangan Gim (PG) di SMK Telkom Malang?")}
                    className="w-full text-xs py-2.5 rounded-xl bg-[#e30613]/20 hover:bg-[#e30613]/30 border border-[#e30613]/40 text-white font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Tanyakan ini ke Moka</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activeRoleTab === "alumni" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-mono text-[#fca5a5] uppercase">Jalur BMW & Inkubator</span>
                  <h3 className="text-2xl font-bold text-white mt-1 mb-3">Bekerja, Melanjutkan Kuliah, Wirausaha</h3>
                  <p className="text-sm text-[#a1a1aa] leading-relaxed mb-6">
                    Lulusan disiapkan lewat tiga jalur mandiri: langsung bekerja di perusahaan teknologi, melanjutkan kuliah di perguruan tinggi ternama, atau berwirausaha lewat Malang Techno Park dan kelas industri PT Strategrat.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#d4d4d8]">Malang Techno Park</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#d4d4d8]">PT Strategrat</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#d4d4d8]">Ngalup & Jagoan Hosting</span>
                  </div>
                </div>
                <div className="bg-[#16181d] rounded-2xl p-6 border border-white/10">
                  <p className="text-xs font-mono text-[#f87171] mb-2">// Eksplorasi Karir</p>
                  <p className="text-sm text-white font-medium mb-3">"Bagaimana kerja sama industri dan jalur BMW di SMK Telkom Malang?"</p>
                  <button
                    onClick={() => handleSend("Bagaimana kerja sama industri dan jalur BMW di SMK Telkom Malang?")}
                    className="w-full text-xs py-2.5 rounded-xl bg-[#e30613]/20 hover:bg-[#e30613]/30 border border-[#e30613]/40 text-white font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Tanyakan ini ke Moka</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── SECTION 5: EDITORIAL QUOTE (GLACIA PLAYFAIR STYLE) ── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div className="glass-panel rounded-3xl p-8 sm:p-14 border border-white/15 relative">
            <div className="w-10 h-10 rounded-full bg-[#e30613]/20 flex items-center justify-center text-[#f87171] mx-auto mb-6">
              <Award className="w-5 h-5" />
            </div>
            <blockquote className="text-2xl sm:text-3xl md:text-4xl font-serif italic text-white leading-snug">
              "Pelopor SMK bidang teknologi informasi di Indonesia sejak 1992, melahirkan lulusan Mokleters yang berdaya saing global."
            </blockquote>
            <div className="mt-8 flex flex-col items-center">
              <p className="font-bold text-white text-sm tracking-wide">Rahmat Dwi Djatmiko</p>
              <p className="text-xs text-[#a1a1aa]">Kepala SMK Telkom Malang</p>
            </div>
          </div>
        </section>

        {/* ── SECTION 6: INTEGRATION ARCHITECTURE (ORBITAL STACK) ── */}
        <section id="integrations" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full text-center">
          <div className="max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-semibold text-[#f87171] uppercase tracking-wider">
              School Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">
              Terhubung dengan Seluruh Ekosistem Moklet.
            </h2>
            <p className="text-sm text-[#a1a1aa] mt-3">
              Moka mengintegrasikan kanal resmi sekolah agar seluruh kebutuhan informasi terpusat.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { title: "Portal PPDB", sub: "ppdb.smktelkom-mlg.sch.id", icon: ExternalLink },
              { title: "WhatsApp CS", sub: "0812-2348-8999", icon: Phone },
              { title: "Gemini 2.0", sub: "Fast AI Engine", icon: Sparkles },
              { title: "Game Station", sub: "Fasilitas Gamedev", icon: Gamepad2 },
              { title: "Techno Park", sub: "Inkubator Bisnis", icon: Building },
              { title: "YPT Telkom", sub: "Yayasan Pendidikan", icon: Award },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="glass-panel rounded-2xl p-5 flex flex-col items-center hover:border-[#e30613]/50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#f87171] mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                  <p className="text-[10px] text-[#a1a1aa] truncate max-w-full mt-0.5">{item.sub}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SECTION 7: FAQ ACCORDION (GLACIA STYLE) ── */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-semibold text-[#f87171] uppercase tracking-wider">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">
              Segala yang Perlu Anda Ketahui.
            </h2>
            <p className="text-sm text-[#a1a1aa] mt-3">
              Jawaban seputar fungsi Moka, akurasi jawaban, dan informasi sekolah.
            </p>
          </div>

          <div className="space-y-3.5">
            {FAQ_LIST.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="glass-panel rounded-2xl overflow-hidden border border-white/10 transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between text-sm sm:text-base font-semibold text-white hover:text-[#fca5a5] transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#a1a1aa] transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[#e30613]" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-5 pb-5 text-xs sm:text-sm text-[#a1a1aa] leading-relaxed border-t border-white/5 pt-3"
                      >
                        {item.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SECTION 8: MASTER CONVERSION CTA CARD ── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
          <div className="glass-panel rounded-3xl p-8 sm:p-14 border border-white/20 text-center relative overflow-hidden glow-red-sm">
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <span className="text-xs font-mono font-semibold text-[#f87171] uppercase tracking-wider">
                Moka — Moklet Assistant
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2 mb-4">
                Asisten AI Anda Siap Menjawab Sekarang.
              </h2>
              <p className="text-sm text-[#a1a1aa] mb-8 leading-relaxed">
                Tanyakan apa saja seputar SMK Telkom Malang. Tanpa registrasi rumit, tanpa jeda lama.
              </p>

              <button
                onClick={scrollToChat}
                className="px-8 py-3.5 rounded-full bg-[#e30613] hover:bg-[#b8292e] text-white font-bold text-sm transition-all glow-red flex items-center gap-2"
              >
                <span>Mulai Tanya Moka</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 bg-[#060709] py-14 px-4 sm:px-6 lg:px-8 text-xs text-[#a1a1aa]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#e30613]" />
              <span className="font-bold text-white text-sm">Moka · SMK Telkom Malang</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#71717a]">
              Asisten kecerdasan buatan resmi untuk civitas akademika SMK Telkom Malang di bawah naungan Yayasan Pendidikan Telkom (YPT).
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <p className="font-semibold text-white text-xs uppercase tracking-wider font-mono">Alamat Resmi</p>
            <p className="text-[11px] leading-relaxed flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#e30613] shrink-0 mt-0.5" />
              <span>Jl. Danau Ranau No. 01, Sawojajar, Kedungkandang, Kota Malang, Jawa Timur 65139</span>
            </p>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <p className="font-semibold text-white text-xs uppercase tracking-wider font-mono">Kontak & Layanan</p>
            <p className="text-[11px] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#e30613]" />
              <span>Call Center / WA: 0812-2348-8999</span>
            </p>
            <p className="text-[11px] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#e30613]" />
              <span>info@smktelkom-mlg.sch.id</span>
            </p>
            <p className="text-[11px] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#e30613]" />
              <span>Senin - Sabtu: 06.00 - 16.00 WIB</span>
            </p>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <p className="font-semibold text-white text-xs uppercase tracking-wider font-mono">Tautan Resmi</p>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a href="https://smktelkom-mlg.sch.id" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>smktelkom-mlg.sch.id</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a href="https://ppdb.smktelkom-mlg.sch.id" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>ppdb.smktelkom-mlg.sch.id</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <span className="text-[#71717a]">Instagram & TikTok: @smktelkommalang</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#52525b]">
          <p>© 2026 Moka (Moklet Assistant) · SMK Telkom Malang. Hak cipta dilindungi.</p>
          <p className="mt-2 sm:mt-0 font-mono">Ditenagai Google Gemini & Next.js</p>
        </div>
      </footer>
    </div>
  );
}
