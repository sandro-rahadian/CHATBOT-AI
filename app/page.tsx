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

// ─── Sidebar Dock Menu (MiniMax Layout) ────────────────────────────────────────
import {
  SidebarDockMenu,
  type UserProfile,
  type ConversationItem,
} from "@/components/sidebar-dock-menu";

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
      <div className="inline-flex bg-white border border-[#EDEDED] rounded-2xl rounded-tl-sm px-4 py-3 items-center gap-1.5 shadow-xs">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#9E9E9E] animate-bounce"
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

// ─── ChatBubble (MiniMax Minimalist Style) ───────────────────────────────────

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
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
        className="flex flex-col items-end gap-1 max-w-[80%] sm:max-w-[70%] ml-auto"
      >
        <div className="bg-[#171717] text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-xs">
          <p className="text-sm font-normal leading-relaxed tracking-normal whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <span className="text-[10px] text-[#8C8C8C] font-mono px-1">
          {timeStr}
        </span>
      </motion.div>
    );
  }

  const hasSources = message.sources && message.sources.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
      className="flex flex-col items-start gap-1 max-w-[85%] sm:max-w-[75%]"
    >
      <div className="flex flex-col gap-2 bg-white border border-[#EDEDED] rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-xs w-full text-[#171717]">
        <TextGenerateEffect
          words={message.content}
          className="font-normal"
          textClassName="text-sm font-normal text-[#171717] leading-relaxed tracking-normal whitespace-pre-wrap break-words"
          duration={0.35}
        />

        {/* Verified Knowledge Sources */}
        {hasSources && (
          <div className="mt-2 pt-2.5 border-t border-[#EDEDED] flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-[#666666] flex items-center gap-1.5">
              <BookOpen size={14} className="text-[#171717]" />
              Sumber Informasi Terverifikasi:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.sources!.map((s, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F7F7F8] border-[#EDEDED] text-[11px] text-[#262626] font-normal"
                  title={s.title}
                >
                  <span className="font-semibold text-[#171717]">
                    {s.school}
                  </span>
                  <span className="text-[#D4D4D4]">•</span>
                  <span className="text-[#666666]">{s.category}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          {message.userRole && (
            <span className="text-[10px] text-[#8C8C8C]">
              Respons mode:{" "}
              <span className="font-semibold text-[#262626]">
                {message.userRole}
              </span>
            </span>
          )}
          <span className="text-[10px] text-[#8C8C8C] font-mono ml-auto">
            {timeStr}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main ChatPage Component ──────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // RBAC State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [apiToken, setApiToken] = useState<string | null>(null);

  // Chat History / Multi-Session State
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

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
          localStorage.removeItem("chat_token");
          setApiToken(null);
          setCurrentUser(null);
          setConversations([]);
          setMessages([]);
          setActiveConversationId(null);
        }
      } catch (e) {
        console.error("Gagal mengambil profil user:", e);
      }
    },
    [apiBase]
  );

  // Fetch list of conversations for this user
  const fetchConversations = useCallback(
    async (token: string | null) => {
      if (!token) {
        setConversations([]);
        return;
      }
      try {
        const res = await fetch(`${apiBase}/conversations`, {
          headers: { "x-api-token": token },
        });
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
        }
      } catch (e) {
        console.warn("Gagal mengambil riwayat percakapan:", e);
      }
    },
    [apiBase]
  );

  // Load a specific conversation's messages
  const loadConversation = useCallback(
    async (convId: string, token: string | null) => {
      if (!token) return;
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`${apiBase}/conversations/${convId}`, {
          headers: { "x-api-token": token },
        });
        if (res.ok) {
          const data = await res.json();
          const rawMsgs = data.conversation?.messages || [];
          setMessages(
            rawMsgs.map(
              (m: {
                id: string;
                role: "user" | "assistant";
                content: string;
                created_at: string;
                sources?: SourceItem[];
              }) => ({
                id: m.id || crypto.randomUUID(),
                role: m.role,
                content: m.content,
                timestamp: new Date(m.created_at || Date.now()),
                sources: m.sources || [],
              })
            )
          );
          setActiveConversationId(convId);
        }
      } catch (e) {
        console.error("Gagal memuat pesan percakapan:", e);
        toast.error("Gagal Membuka Obrolan");
      } finally {
        setIsLoading(false);
      }
    },
    [apiBase]
  );

  // New Chat handler
  const handleNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setError(null);
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Delete conversation thread handler
  const handleDeleteConversation = useCallback(
    async (convId: string) => {
      if (!apiToken) return;
      try {
        const res = await fetch(`${apiBase}/conversations/${convId}`, {
          method: "DELETE",
          headers: { "x-api-token": apiToken },
        });
        if (res.ok) {
          setConversations((prev) => prev.filter((c) => c.id !== convId));
          if (activeConversationId === convId) {
            setActiveConversationId(null);
            setMessages([]);
          }
          toast.info("Riwayat Dihapus", {
            description: "Obrolan berhasil dihapus.",
          });
        }
      } catch (e) {
        console.error("Gagal menghapus percakapan:", e);
        toast.error("Gagal Menghapus Obrolan");
      }
    },
    [apiBase, apiToken, activeConversationId]
  );

  // Initial load
  useEffect(() => {
    const savedToken = localStorage.getItem("chat_token");
    if (savedToken) {
      setApiToken(savedToken);
      fetchProfile(savedToken);
      fetchConversations(savedToken);
    } else {
      setApiToken(null);
      setCurrentUser(null);
      setConversations([]);
      setMessages([]);
      setActiveConversationId(null);
      fetchProfile(null);
    }
  }, [fetchProfile, fetchConversations]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("chat_token");
    setApiToken(null);
    setCurrentUser(null);
    setConversations([]);
    setMessages([]);
    setActiveConversationId(null);
    toast.info("Berhasil Keluar", {
      description: "Sesi Anda telah berakhir. Anda kini dalam mode Tamu.",
    });
  };

  // Auto-scroll
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
          conversation_id: activeConversationId || undefined,
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
        conversation_id?: string;
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

      if (data.conversation_id) {
        setActiveConversationId(data.conversation_id);
        fetchConversations(apiToken);
      }

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
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
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
    <div className="relative flex flex-row h-screen w-screen bg-[#FAFAFA] text-[#171717] overflow-hidden select-none">
      {/* ── MiniMax Left Navigation Sidebar ── */}
      <SidebarDockMenu
        currentUser={currentUser}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => loadConversation(id, apiToken)}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onLogout={handleLogout}
        onClear={() => setShowConfirm(true)}
      />

      {/* ── Main Workbench Canvas ── */}
      <main className="flex-1 h-full bg-[#FAFAFA] flex flex-col justify-between relative overflow-y-auto">
        {/* Top Right Header Controls */}
        <header className="w-full flex justify-end items-center px-6 py-4 gap-2 absolute top-0 left-0 right-0 pointer-events-none z-10">
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              className="text-xs text-[#525252] hover:text-[#171717] px-2 py-1.5 rounded-md hover:bg-black/5 flex items-center gap-1 transition-colors cursor-pointer"
              title="Dokumentasi & Panduan"
            >
              <svg className="w-3.5 h-3.5 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                />
              </svg>
            </button>
            <button
              type="button"
              className="text-xs text-[#262626] border border-[#EDEDED] bg-white shadow-xs px-2.5 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-1.5 font-normal transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-[#525252]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
              <span>Download</span>
            </button>
          </div>
        </header>

        {/* Center Canvas Stage */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 w-full max-w-4xl mx-auto my-auto pt-16 pb-6">
          {messages.length === 0 ? (
            /* ── MiniMax Code Hero & Empty State ── */
            <div className="w-full flex flex-col items-center justify-center">
              {/* Primary Hero Title */}
              <h1 className="text-[28px] sm:text-[32px] font-semibold text-[#171717] tracking-[-0.02em] text-center mb-7">
                KeraVokasi makes school search easier
              </h1>

              {/* Omnibox Interactive Container */}
              <div
                className="w-full max-w-[720px] bg-white rounded-2xl border border-[#EDEDED] shadow-[0_2px_14px_rgba(0,0,0,0.03)] p-4 flex flex-col justify-between min-h-[142px] transition-shadow focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.06)] focus-within:border-[#D4D4D4] relative"
                onClick={() => {
                  if (!isLoggedIn) {
                    setShowLoginPrompt(true);
                  }
                }}
              >
                {/* Editable Prompt Area */}
                <div className="w-full flex items-start text-[14px] leading-relaxed text-[#171717] pt-0.5">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder="Ask anything or use / to use Skill..."
                    rows={2}
                    className="w-full bg-transparent border-0 p-0 text-[14px] text-[#171717] placeholder-[#9E9E9E] focus:ring-0 resize-none font-normal leading-relaxed outline-none"
                  />
                </div>

                {/* Omnibox Bottom Toolbar Row */}
                <div className="flex items-center justify-between pt-3 border-t border-transparent">
                  {/* Left: Attachment + Popover Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAttachmentMenu((prev) => !prev);
                      }}
                      className="w-7 h-7 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#525252] hover:bg-[#F5F5F5] hover:text-[#171717] transition-all cursor-pointer"
                      title="Add attachments or skills"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </button>

                    {/* Popover Menu matching Reference Screen */}
                    <AnimatePresence>
                      {showAttachmentMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 5 }}
                          transition={{ duration: 0.12 }}
                          className="absolute bottom-9 left-0 w-48 bg-white rounded-xl shadow-lg border border-[#EDEDED] py-1 text-xs text-[#262626] z-50"
                        >
                          <div
                            onClick={() => {
                              setShowAttachmentMenu(false);
                              toast.info("Upload Berkas", { description: "Pilih file panduan atau brosur SMK" });
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#F5F5F5] cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.8"
                              />
                            </svg>
                            <span>Add files or photos</span>
                          </div>
                          <div
                            onClick={() => {
                              setShowAttachmentMenu(false);
                              toast.info("Proyek", { description: "Tambahkan ke proyek sekolah" });
                            }}
                            className="flex items-center justify-between px-3 py-2 hover:bg-[#F5F5F5] cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <svg className="w-3.5 h-3.5 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect height="18" rx="2" strokeWidth="1.8" width="18" x="3" y="3" />
                                <path d="M9 12h6m-6 4h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                              </svg>
                              <span>Add to project</span>
                            </div>
                            <svg className="w-3 h-3 text-[#A3A3A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                          </div>
                          <div
                            onClick={() => {
                              setShowAttachmentMenu(false);
                              setInputValue("/skill jurusan ");
                            }}
                            className="flex items-center justify-between px-3 py-2 hover:bg-[#F5F5F5] cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <svg className="w-3.5 h-3.5 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                              </svg>
                              <span>Skills</span>
                            </div>
                            <svg className="w-3 h-3 text-[#A3A3A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                          </div>
                          <div
                            onClick={() => {
                              setShowAttachmentMenu(false);
                              toast.info("Plugins", { description: "Buka katalog plugins & skills" });
                            }}
                            className="flex items-center justify-between px-3 py-2 hover:bg-[#F5F5F5] cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <svg className="w-3.5 h-3.5 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.8"
                                />
                              </svg>
                              <span>Plugins</span>
                            </div>
                            <svg className="w-3 h-3 text-[#A3A3A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                          </div>
                          <div
                            onClick={() => {
                              setShowAttachmentMenu(false);
                              toast.info("Environment", { description: "Pengaturan API & variabel" });
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#F5F5F5] cursor-pointer border-t border-[#F0F0F0]"
                          >
                            <svg className="w-3.5 h-3.5 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.8"
                              />
                            </svg>
                            <span>Environment variables</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Right: Model Selector + Send CTA */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F5F5F5] hover:bg-[#EEEEEE] border border-[#E5E5E5] text-xs text-[#525252] transition-colors cursor-pointer"
                      title="Ganti Model AI"
                    >
                      <span className="font-normal text-[#404040]">M3.1-Flash</span>
                      <span className="text-[#8C8C8C] text-[11px]">default</span>
                      <svg className="w-3 h-3 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSend(inputValue)}
                      disabled={!inputValue.trim() || isLoading}
                      className="w-7 h-7 rounded-full bg-[#171717] hover:bg-black text-white flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                      title="Send message"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Action Suggestion Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
                <button
                  type="button"
                  onClick={() => handleSend("Rekomendasikan jurusan SMK berbasis teknologi dan multimedia di Malang")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#EDEDED] bg-white hover:bg-[#FAFAFA] text-[#525252] hover:text-[#171717] shadow-xs transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect height="18" rx="2" strokeWidth="1.7" width="18" x="3" y="3" />
                    <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.7" />
                    <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                  </svg>
                  <span>Jurusan Populer</span>
                  <span className="bg-[#EBF5FF] text-[#2563EB] text-[10px] font-medium px-1.5 py-0.2 rounded-md">New</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSend("Bagaimana alur pendaftaran dan jadwal PPDB SMK Malang tahun ini?")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#EDEDED] bg-white hover:bg-[#FAFAFA] text-[#525252] hover:text-[#171717] shadow-xs transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                  </svg>
                  <span>Jalur PPDB</span>
                  <span className="bg-[#F3E8FF] text-[#9333EA] text-[10px] font-medium px-1.5 py-0.2 rounded-md">H3</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSend("Apa saja syarat berkas pendaftaran PPDB SMK Malang?")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#EDEDED] bg-white hover:bg-[#FAFAFA] text-[#525252] hover:text-[#171717] shadow-xs transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                  </svg>
                  <span>Syarat Berkas</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSend("Berikan daftar SMK Negeri dan Swasta terbaik di Kota Malang")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#EDEDED] bg-white hover:bg-[#FAFAFA] text-[#525252] hover:text-[#171717] shadow-xs transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect height="14" rx="2" strokeWidth="1.7" width="20" x="2" y="3" />
                    <path d="M8 21h8m-4-4v4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                  </svg>
                  <span>Daftar SMK</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInputValue("Jelaskan prospek kerja lulusan SMK jurusan ")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#EDEDED] bg-white hover:bg-[#FAFAFA] text-[#525252] hover:text-[#171717] shadow-xs transition-all cursor-pointer"
                >
                  <span>More</span>
                </button>
              </div>
            </div>
          ) : (
            /* ── Conversation Stream State ── */
            <div className="w-full flex-1 flex flex-col max-w-[720px] mx-auto min-h-0">
              <div className="flex-1 overflow-y-auto chat-scroll flex flex-col gap-4 py-4 pr-1">
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}

                <AnimatePresence>
                  {isLoading && <TypingIndicator key="typing" />}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {/* Sticky MiniMax Omnibox at bottom of conversation */}
              <div className="w-full bg-white rounded-2xl border border-[#EDEDED] shadow-[0_2px_14px_rgba(0,0,0,0.04)] p-3.5 flex flex-col justify-between min-h-[110px] mt-2 relative">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder="Ask a follow up question..."
                  rows={2}
                  className="w-full bg-transparent border-0 p-0 text-[14px] text-[#171717] placeholder-[#9E9E9E] focus:ring-0 resize-none font-normal leading-relaxed outline-none"
                />

                <div className="flex items-center justify-between pt-2 border-t border-transparent">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAttachmentMenu((prev) => !prev);
                      }}
                      className="w-7 h-7 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#525252] hover:bg-[#F5F5F5] transition-all cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F5F5F5] hover:bg-[#EEEEEE] border border-[#E5E5E5] text-xs text-[#525252] transition-colors"
                    >
                      <span className="font-normal text-[#404040]">M3.1-Flash</span>
                      <span className="text-[#8C8C8C] text-[11px]">default</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSend(inputValue)}
                      disabled={!inputValue.trim() || isLoading}
                      className="w-7 h-7 rounded-full bg-[#171717] hover:bg-black text-white flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty footer spacer to preserve optical balance */}
        <div className="h-6 pointer-events-none" />
      </main>

      {/* ── Dialogs: Login Prompt & Clear Confirmation ── */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="border border-[#EDEDED] bg-white text-[#171717] shadow-xl sm:max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] border border-[#EDEDED] flex items-center justify-center text-[#171717] mb-2">
              <Lock size={18} />
            </div>
            <DialogTitle className="text-base font-semibold text-[#171717] tracking-tight">
              Masuk untuk Memulai Chat
            </DialogTitle>
            <DialogDescription className="text-xs text-[#666666] mt-1 leading-relaxed">
              Anda saat ini berada dalam mode Tamu. Untuk menjaga batas kuota dan hak akses informasi sekolah, silakan login dengan akun Anda atau buat akun baru.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-5 flex flex-col sm:flex-row gap-2.5">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full bg-[#F5F5F5] hover:bg-[#EAEAEA] border-[#EDEDED] text-[#171717] rounded-lg text-xs font-medium cursor-pointer"
              >
                <UserPlus size={14} className="mr-1.5" />
                Daftar Akun
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                className="w-full bg-[#171717] hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                <LogIn size={14} className="mr-1.5 text-white" />
                Masuk Sekarang
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="border border-[#EDEDED] bg-white text-[#171717] shadow-xl sm:max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-[#171717] tracking-tight">
              Hapus Percakapan
            </DialogTitle>
            <DialogDescription className="text-xs text-[#666666] mt-1">
              Tindakan ini tidak dapat dibatalkan. Semua pesan dalam percakapan ini akan dibersihkan dari layar sesi Anda.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-2.5">
            <Button
              variant="secondary"
              className="bg-[#F5F5F5] hover:bg-[#EAEAEA] border border-[#EDEDED] text-[#171717] rounded-lg text-xs font-medium cursor-pointer"
              onClick={() => setShowConfirm(false)}
            >
              Batal
            </Button>
            <Button
              className="bg-[#DC3341] hover:bg-[#B91C1C] text-white rounded-lg text-xs font-medium shadow-xs cursor-pointer"
              onClick={handleClearConfirm}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
