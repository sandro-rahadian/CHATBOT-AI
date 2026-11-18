"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from "@/components/ui/animated-modal";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
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
        animate={{
          width: expanded ? 360 : 170,
          height: expanded ? 50 : 40,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        className="relative bg-[#2b2d31] border border-[#3f4147] rounded-full shadow-lg shadow-black/40 overflow-hidden cursor-pointer select-none"
      >
        <AnimatePresence mode="wait">
          {!expanded ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center px-5"
            >
              <span className="text-sm font-medium text-[#f2f3f5] tracking-tight">
                AI Chatbot
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-between px-5"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#f2f3f5] tracking-tight">
                  AI Chatbot
                </span>
                <span className="text-xs text-[#949ba4] font-mono">
                  Gemini 2.0
                </span>
              </div>
              <HoverBorderGradient
                containerClassName="rounded-full"
                className="bg-[#1e1f22] hover:bg-red-500/20 text-[#dbdee1] hover:text-red-300 text-xs px-3.5 py-1 font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
              >
                Hapus
              </HoverBorderGradient>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
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

// ─── ChatBubble ───────────────────────────────────────────────────────────────

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
          <TextGenerateEffect
            words={message.content}
            className="font-normal"
            textClassName="text-sm font-normal text-[#f2f3f5] leading-relaxed tracking-normal whitespace-pre-wrap break-words"
            duration={0.5}
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
      className="flex flex-col items-start gap-1 max-w-[80%] sm:max-w-[70%]"
    >
      <div className="flex flex-col gap-1 bg-[#2b2d31] border border-[#383a40] rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
        <TextGenerateEffect
          words={message.content}
          className="font-normal"
          textClassName="text-sm font-normal text-[#dbdee1] leading-relaxed tracking-normal whitespace-pre-wrap break-words"
          duration={0.5}
        />
        <span className="text-[10px] text-[#949ba4] font-mono self-end">
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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  };

  return (
    <div className="relative flex flex-col h-screen bg-[#313338] text-[#dbdee1] overflow-hidden">
      {/* Dynamic Island Nav */}
      <DynamicIslandNav onClear={() => setShowConfirm(true)} />

      {/* Aceternity Animated Modal for Confirmation */}
      <Modal open={showConfirm} setOpen={setShowConfirm}>
        <ModalBody className="border border-[#3f4147] bg-[#2b2d31] shadow-2xl">
          <ModalContent className="p-6 sm:p-7">
            <h3 className="text-lg font-semibold text-[#f2f3f5] tracking-tight">
              Hapus Percakapan
            </h3>
            <p className="text-xs text-[#949ba4] mt-1 mb-4">
              Tindakan ini tidak dapat dibatalkan
            </p>
            <p className="text-sm text-[#dbdee1] leading-relaxed">
              Semua pesan dalam percakapan ini akan dibersihkan secara permanen
              dari layar sesi Anda.
            </p>
          </ModalContent>
          <ModalFooter className="bg-[#1e1f22] border-t border-[#383a40] px-6 py-4 flex justify-end gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#dbdee1] hover:text-white bg-[#383a40] hover:bg-[#404249] transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleClearConfirm}
              className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-all shadow-md"
            >
              Hapus
            </button>
          </ModalFooter>
        </ModalBody>
      </Modal>

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

            {/* ── Error Text Directly Below Input (No Popups) ── */}
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

            {/* Status hint */}
            <p className="text-center text-[10px] text-[#949ba4] mt-2 font-mono">
              {isLoading
                ? "AI sedang mengetik..."
                : messages.length > 0
                ? `${messages.length} pesan · Tekan Enter untuk kirim`
                : "Tekan Enter untuk kirim · Gemini 2.0 Flash"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
