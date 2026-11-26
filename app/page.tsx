"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";

// ─── Sidebar Dock Menu (MiniMax Layout) ────────────────────────────────────────
import {
  SidebarDockMenu,
  type UserProfile,
  type ConversationItem,
} from "@/components/sidebar-dock-menu";
import { HistoryModal } from "@/components/history-modal";

import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { CurvedCarousel } from "@/components/ui/curved-carousel";
import { useSmoothScroll } from "@/components/ui/smooth-scroll";
import {
  getSessionStatus,
  getStoredToken,
  touchSession,
  clearSession,
  updateSessionUser,
  SESSION_MAX_MS,
  SESSION_IDLE_MS,
} from "@/lib/session";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SourceItem {
  id: number;
  school: string;
  category: string;
  title: string;
}

interface AttachedImage {
  id: string;
  name: string;
  mimeType: string;
  data: string;
  previewUrl: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: SourceItem[];
  images?: Array<{ previewUrl: string; mimeType: string; name?: string }>;
  userRole?: string;
  isError?: boolean;
}

// ─── TypingIndicator (Ultra-Lightweight Minimalist Dots) ────────────────────

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.96 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="max-w-[80%] sm:max-w-[70%]"
    >
      <div className="inline-flex items-center gap-1.5 bg-white border border-[#EDEDED] rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs">
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#8C8C8C] animate-bounce"
          style={{ animationDelay: "-0.3s", animationDuration: "0.85s" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#8C8C8C] animate-bounce"
          style={{ animationDelay: "-0.15s", animationDuration: "0.85s" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#8C8C8C] animate-bounce"
          style={{ animationDuration: "0.85s" }}
        />
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

  if (message.isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
        className="flex flex-col items-start gap-1 max-w-[85%] sm:max-w-[75%]"
      >
        <div className="flex items-start gap-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-xs w-full text-[#B91C1C]">
          <div className="w-5 h-5 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#991B1B] mb-0.5">Gagal Mengirim Pesan</p>
            <p className="text-xs font-normal text-[#DC2626] leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
        </div>
        <span className="text-[10px] text-[#DC2626]/70 font-normal px-1">
          {timeStr}
        </span>
      </motion.div>
    );
  }

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
        className="flex flex-col items-end gap-1.5 max-w-[80%] sm:max-w-[70%] ml-auto"
      >
        {message.images && message.images.length > 0 && (
          <div className="flex flex-wrap justify-end gap-2">
            {message.images.map((img, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-xs max-w-[240px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.previewUrl}
                  alt={img.name || `Lampiran gambar ${idx + 1}`}
                  className="max-h-[200px] w-auto object-cover block"
                />
              </div>
            ))}
          </div>
        )}
        {message.content && (
          <div className="bg-[#171717] text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-xs">
            <p className="text-sm font-normal leading-relaxed tracking-normal whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
        )}
        <span className="text-[10px] text-[#8C8C8C] font-normal px-1">
          {timeStr}
        </span>
      </motion.div>
    );
  }

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
          textClassName="text-sm font-normal text-[#171717] leading-relaxed tracking-normal break-words"
          duration={0.35}
        />

        <div className="flex items-center justify-end pt-1">
          <span className="text-[10px] text-[#8C8C8C] font-normal">
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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUp = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mainScrollRef = useSmoothScroll<HTMLElement>();

  // RBAC State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [apiToken, setApiToken] = useState<string | null>(null);

  // Notifikasi sesi (login kedaluwarsa / idle timeout)
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  // Chat History / Multi-Session State
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "https://chatbot-ai-production-b22e59af.up.railway.app";

  const isLoggedIn =
    Boolean(apiToken) && (currentUser ? currentUser.role !== "guest" : true);

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
          updateSessionUser(profile);
        } else if (res.status === 401 && token) {
          // Hanya clear session jika server eksplisit menolak token (401)
          clearSession();
          setApiToken(null);
          setCurrentUser(null);
          setConversations([]);
          setMessages([]);
          setActiveConversationId(null);
          setSessionNotice(
            "Sesi tidak valid atau sudah berakhir. Silakan login kembali."
          );
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
          isUserScrolledUp.current = false;
        }
      } catch (e) {
        console.error("Gagal memuat pesan percakapan:", e);
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
    isUserScrolledUp.current = false;
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
        }
      } catch (e) {
        console.error("Gagal menghapus percakapan:", e);
      }
    },
    [apiBase, apiToken, activeConversationId]
  );

  // Notifikasi sesi berakhir, dipakai bareng di beberapa tempat
  const sessionExpiredMessage = useCallback(
    (reason: "expired" | "idle") =>
      reason === "idle"
        ? `Sesi berakhir karena tidak ada aktivitas selama ${Math.round(
            SESSION_IDLE_MS / 60_000
          )} menit. Silakan login kembali.`
        : `Sesi login Anda sudah berakhir setelah ${Math.round(
            SESSION_MAX_MS / 3_600_000
          )} jam. Silakan login kembali.`,
    []
  );

  // Initial load
  useEffect(() => {
    // getSessionStatus() sudah memvalidasi batas absolut + idle timeout
    // dan otomatis membersihkan sesi yang sudah mati.
    const status = getSessionStatus();
    const savedToken = status.session?.token ?? null;
    const savedUser = status.session?.user ?? null;

    if (savedToken) {
      setApiToken(savedToken);
      if (savedUser) {
        try {
          setCurrentUser(savedUser as unknown as UserProfile);
        } catch {
          // ignore parsing error
        }
      }
      fetchProfile(savedToken);
      fetchConversations(savedToken);
    } else {
      clearSession();
      setApiToken(null);
      setCurrentUser(null);
      setConversations([]);
      setMessages([]);
      setActiveConversationId(null);
      fetchProfile(null);

      if (status.reason === "expired" || status.reason === "idle") {
        setSessionNotice(sessionExpiredMessage(status.reason));
      }
    }
  }, [fetchProfile, fetchConversations, sessionExpiredMessage]);

  // Force logout saat sesi tidak valid lagi
  const forceLogout = useCallback(
    (reason: "expired" | "idle") => {
      clearSession();
      setApiToken(null);
      setCurrentUser(null);
      setConversations([]);
      setMessages([]);
      setActiveConversationId(null);
      setInputValue("");
      setIsProfileMenuOpen(true);
      setSessionNotice(sessionExpiredMessage(reason));
    },
    [sessionExpiredMessage]
  );

  // Watcher sesi: cek tiap 30 detik dan setiap tab kembali aktif
  useEffect(() => {
    const evaluate = () => {
      if (!apiToken) return;
      const status = getSessionStatus();
      if (!status.valid && (status.reason === "expired" || status.reason === "idle")) {
        forceLogout(status.reason);
      }
    };

    evaluate();
    const interval = window.setInterval(evaluate, 30_000);

    const handleVisible = () => {
      if (!document.hidden) evaluate();
    };
    document.addEventListener("visibilitychange", handleVisible);
    window.addEventListener("focus", handleVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisible);
      window.removeEventListener("focus", handleVisible);
    };
  }, [apiToken, forceLogout]);

  // Activity tracker: interaksi user memperpanjang jendela idle
  useEffect(() => {
    const markActive = () => touchSession();
    const events: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "wheel",
      "touchstart",
    ];
    events.forEach((ev) => window.addEventListener(ev, markActive, { passive: true }));
    return () => events.forEach((ev) => window.removeEventListener(ev, markActive));
  }, []);

  // Logout handler
  const handleLogout = () => {
    clearSession();
    setApiToken(null);
    setCurrentUser(null);
    setConversations([]);
    setMessages([]);
    setActiveConversationId(null);
    setSessionNotice(null);
  };

  // Scroll handler: Detect if user intentionally scrolled up to read history
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    isUserScrolledUp.current = scrollHeight - scrollTop - clientHeight > 100;
  };

  // Safe Auto-scroll without fighting user manual scroll
  useEffect(() => {
    if (!isUserScrolledUp.current && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  const isGuest =
    !apiToken &&
    (!currentUser || currentUser.role === "guest");

  // Keyboard shortcut Cmd/Ctrl + K untuk membuka History Pop-up
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsHistoryModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Proses file gambar (upload file / paste clipboard) dengan kompresi otomatis agar ringan & cepat
  const processImageFiles = useCallback((files: FileList | File[]) => {
    const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
    const maxBytes = 10 * 1024 * 1024; // 10MB raw file limit
    const incoming = Array.from(files).filter((f) => allowed.has(f.type));
    if (incoming.length === 0) return;

    incoming.forEach((file) => {
      if (file.size > maxBytes) {
        setError(`Ukuran gambar "${file.name}" melebihi batas 10MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const rawDataUrl = typeof reader.result === "string" ? reader.result : "";
        if (!rawDataUrl) return;

        // Jangan kompres GIF agar animasi tetap utuh
        if (file.type === "image/gif") {
          const base64 = rawDataUrl.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");
          setAttachedImages((prev) => {
            if (prev.length >= 4) return prev;
            return [
              ...prev,
              {
                id: crypto.randomUUID(),
                name: file.name || "gambar.gif",
                mimeType: file.type,
                data: base64,
                previewUrl: rawDataUrl,
              },
            ];
          });
          return;
        }

        // Kompres & resize gambar besar (mis. screenshot Retina Mac) via Canvas
        const img = new window.Image();
        img.onload = () => {
          const maxDim = 1600;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, width, height);

          const outputMime = "image/jpeg";
          const compressedUrl = canvas.toDataURL(outputMime, 0.85);
          const base64 = compressedUrl.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");

          setAttachedImages((prev) => {
            if (prev.length >= 4) return prev;
            return [
              ...prev,
              {
                id: crypto.randomUUID(),
                name: file.name || "gambar.jpg",
                mimeType: outputMime,
                data: base64,
                previewUrl: compressedUrl,
              },
            ];
          });
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFiles(e.target.files);
    }
    e.target.value = "";
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault();
      processImageFiles(imageFiles);
    }
  };

  const removeAttachedImage = (id: string) => {
    setAttachedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSend = async (userMessage: string) => {
    isUserScrolledUp.current = false;
    const activeToken = apiToken || getStoredToken();

    // Strict Login Guard: Guest cannot send chat messages -> trigger bottom sidebar login menu
    if (!activeToken && (!currentUser || currentUser.role === "guest")) {
      setIsProfileMenuOpen(true);
      return;
    }

    const imagesToSend = [...attachedImages];
    if ((!userMessage.trim() && imagesToSend.length === 0) || isLoading) return;

    const newUserMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessage.trim(),
      images: imagesToSend.map((img) => ({
        previewUrl: img.previewUrl,
        mimeType: img.mimeType,
        name: img.name,
      })),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setAttachedImages([]);
    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const tokenToSend = apiToken || getStoredToken();
      if (tokenToSend) {
        headers["x-api-token"] = tokenToSend;
      }

      const response = await fetch(`${apiBase}/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: newUserMsg.content,
          conversation_id: activeConversationId || undefined,
          images:
            imagesToSend.length > 0
              ? imagesToSend.map((img) => ({
                  mimeType: img.mimeType,
                  data: img.data,
                }))
              : undefined,
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
        fetchConversations(tokenToSend);
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
      fetchProfile(tokenToSend);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal terhubung ke server.";
      setError(msg);
      // Render error message inside chat stream as red card instead of toast notification
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: msg,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
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

  return (
    <div className="relative flex flex-row h-screen w-screen bg-[#FAFAFA] text-[#171717] overflow-hidden select-none">
      {/* Hidden File Input for Multimodal Image Analysis */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* ── Antigravity-Style History Pop-up Modal ── */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        currentUser={currentUser}
        apiBase={apiBase}
        apiToken={apiToken}
        onSelectConversation={(id) => loadConversation(id, apiToken || getStoredToken())}
        onDeleteConversation={handleDeleteConversation}
        onNewChat={handleNewChat}
      />

      {/* ── MiniMax Left Navigation Sidebar ── */}
      <SidebarDockMenu
        currentUser={currentUser}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => loadConversation(id, apiToken || getStoredToken())}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onLogout={handleLogout}
        isProfileMenuOpen={isProfileMenuOpen}
        onProfileMenuOpenChange={setIsProfileMenuOpen}
      />

      {/* ── Main Workbench Canvas ── */}
      <main
        ref={messages.length === 0 ? mainScrollRef : undefined}
        data-lenis-prevent
        className={`flex-1 h-full bg-[#FAFAFA] relative ${
          messages.length === 0
            ? "overflow-y-auto chat-scroll flex flex-col justify-between"
            : "overflow-hidden flex flex-col"
        }`}
      >
        {sessionNotice && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 w-[min(92%,560px)]">
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 shadow-sm">
              <span className="flex-1 leading-relaxed">{sessionNotice}</span>
              <button
                type="button"
                onClick={() => setSessionNotice(null)}
                aria-label="Tutup notifikasi sesi"
                className="shrink-0 font-semibold text-amber-700 transition-colors hover:text-amber-950"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {messages.length === 0 ? (
          /* ── MiniMax Code Hero & Empty State ── */
          <div className="flex-1 flex flex-col items-center justify-center px-4 w-full max-w-5xl mx-auto my-auto pt-12 pb-6">
            <div className="w-full flex flex-col items-center justify-center">
              {/* Primary Hero Title with Codigo Staggered Character Slide-Up Transition */}
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[28px] sm:text-[34px] font-semibold text-[#171717] tracking-[-0.02em] text-center mb-7 flex items-center justify-center flex-wrap"
              >
                {"Sebaiknya kita mulai dari mana?".split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.025,
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{
                      display: "inline-block",
                      whiteSpace: char === " " ? "pre" : "normal",
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.h1>

              {/* Omnibox Interactive Container with Codigo Elevation & Spring Transitions */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 16 }}
                className="w-full max-w-[720px] bg-white rounded-2xl sm:rounded-[24px] border border-[#EDEDED] shadow-[0_2px_14px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 p-4 flex flex-col justify-between min-h-[142px] transition-all duration-300 focus-within:shadow-[0_20px_45px_-12px_rgba(0,0,0,0.09)] focus-within:border-[#EDEDED] focus-within:outline-none focus-within:-translate-y-1 relative group outline-none"
              >
                {/* Attached Image Previews */}
                {attachedImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 pb-2.5">
                    {attachedImages.map((img) => (
                      <div
                        key={img.id}
                        className="relative group/img w-14 h-14 rounded-xl overflow-hidden border border-[#E5E5E5] bg-[#FAFAFA] shrink-0"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.previewUrl}
                          alt={img.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeAttachedImage(img.id)}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer"
                          title="Hapus gambar"
                        >
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Editable Prompt Area */}
                <div className="w-full flex items-start text-[14px] leading-relaxed text-[#171717] pt-0.5">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    disabled={isLoading}
                    placeholder="Ask anything, paste an image, or use / to use Skill..."
                    rows={2}
                    className="w-full bg-transparent border-0 p-0 text-[14px] text-[#171717] placeholder-[#9E9E9E] focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none resize-none font-normal leading-relaxed outline-none"
                  />
                </div>

                {/* Omnibox Bottom Toolbar Row */}
                <div className="flex items-center justify-between pt-3 border-t border-transparent">
                  {/* Left: Attachment + Image Upload + Popover Dropdown */}
                  <div className="relative flex items-center gap-1.5">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAttachmentMenu((prev) => !prev);
                      }}
                      className="w-8 h-8 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#525252] hover:bg-[#F5F5F5] hover:text-[#171717] transition-colors cursor-pointer"
                      title="Add attachments or skills"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading || attachedImages.length >= 4}
                      className="w-8 h-8 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#525252] hover:bg-[#F5F5F5] hover:text-[#171717] transition-colors cursor-pointer disabled:opacity-40"
                      title="Lampirkan gambar untuk dianalisis AI"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect height="18" rx="2" strokeWidth="1.8" width="18" x="3" y="3" />
                        <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.8" />
                        <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                      </svg>
                    </motion.button>

                    {/* Popover Menu matching Reference Screen */}
                    <AnimatePresence>
                      {showAttachmentMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 5 }}
                          transition={{ duration: 0.14, ease: "easeOut" }}
                          className="absolute bottom-10 left-0 w-48 bg-white rounded-xl shadow-lg border border-[#EDEDED] py-1 text-xs text-[#262626] z-50"
                        >
                          <div
                            onClick={() => {
                              setShowAttachmentMenu(false);
                              fileInputRef.current?.click();
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#F5F5F5] cursor-pointer transition-colors"
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
                            }}
                            className="flex items-center justify-between px-3 py-2 hover:bg-[#F5F5F5] cursor-pointer transition-colors"
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
                            className="flex items-center justify-between px-3 py-2 hover:bg-[#F5F5F5] cursor-pointer transition-colors"
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
                            }}
                            className="flex items-center justify-between px-3 py-2 hover:bg-[#F5F5F5] cursor-pointer transition-colors"
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
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#F5F5F5] cursor-pointer border-t border-[#F0F0F0] transition-colors"
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

                  {/* Right: Codigo Animated Send CTA */}
                  <div className="flex items-center gap-2">
                    <AnimatePresence mode="wait">
                      {inputValue.trim().length > 0 || attachedImages.length > 0 ? (
                        <motion.button
                          key="send-active"
                          type="button"
                          onClick={() => handleSend(inputValue)}
                          disabled={isLoading}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          whileTap={{ scale: 0.92 }}
                          whileHover={{ scale: 1.05 }}
                          className="w-8 h-8 rounded-full bg-[#171717] hover:bg-black text-white flex items-center justify-center cursor-pointer shadow-sm transition-colors"
                          title="Send message"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </motion.button>
                      ) : (
                        <motion.button
                          key="send-idle"
                          type="button"
                          onClick={() => handleSend(inputValue)}
                          disabled={isLoading || (!isGuest && !inputValue.trim())}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 0.35, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.18 }}
                          className="w-8 h-8 rounded-full bg-[#E5E5E5] text-[#737373] flex items-center justify-center cursor-not-allowed shadow-none"
                          title="Ketik pesan..."
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              {/* Quick Action Suggestion Chips with Codigo Staggered Entrance */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
                {[
                  {
                    title: "Jurusan Populer",
                    query: "Rekomendasikan jurusan SMK berbasis teknologi dan multimedia di Malang",
                    badge: "New",
                    badgeColor: "bg-[#EBF5FF] text-[#2563EB]",
                    icon: (
                      <svg className="w-3.5 h-3.5 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect height="18" rx="2" strokeWidth="1.7" width="18" x="3" y="3" />
                        <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.7" />
                        <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                      </svg>
                    ),
                  },
                  {
                    title: "Jalur PPDB",
                    query: "Bagaimana alur pendaftaran dan jadwal PPDB SMK Malang tahun ini?",
                    badge: "H3",
                    badgeColor: "bg-[#F3E8FF] text-[#9333EA]",
                    icon: (
                      <svg className="w-3.5 h-3.5 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                      </svg>
                    ),
                  },
                  {
                    title: "Syarat Berkas",
                    query: "Apa saja syarat berkas pendaftaran PPDB SMK Malang?",
                    icon: (
                      <svg className="w-3.5 h-3.5 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                      </svg>
                    ),
                  },
                  {
                    title: "Daftar SMK",
                    query: "Berikan daftar SMK Negeri dan Swasta terbaik di Kota Malang",
                    icon: (
                      <svg className="w-3.5 h-3.5 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect height="14" rx="2" strokeWidth="1.7" width="20" x="2" y="3" />
                        <path d="M8 21h8m-4-4v4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                      </svg>
                    ),
                  },
                ].map((chip, idx) => (
                  <motion.button
                    key={chip.title}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.25 + idx * 0.04,
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSend(chip.query)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#EDEDED] bg-white hover:bg-[#FAFAFA] text-[#525252] hover:text-[#171717] hover:border-[#D4D4D4] shadow-xs transition-colors cursor-pointer"
                  >
                    {chip.icon}
                    <span>{chip.title}</span>
                    {chip.badge && (
                      <span className={`${chip.badgeColor} text-[10px] font-medium px-1.5 py-0.2 rounded-md`}>
                        {chip.badge}
                      </span>
                    )}
                  </motion.button>
                ))}

                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42, duration: 0.35 }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setInputValue("Jelaskan prospek kerja lulusan SMK jurusan ")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#EDEDED] bg-white hover:bg-[#FAFAFA] text-[#525252] hover:text-[#171717] shadow-xs transition-colors cursor-pointer"
                >
                  <span>More</span>
                </motion.button>
              </div>

              {/* ── Curved Carousel Showcase (Framer Curved Carousel Component) ── */}
              <div className="w-full mt-7 flex justify-center overflow-hidden">
                <CurvedCarousel
                  curve={0.35}
                  speed={28}
                  cardWidth={190}
                  cardHeight={250}
                  gap={20}
                  radius={16}
                  height={290}
                  width="100%"
                  paper="#FFFFFF"
                  cardBorder="rgba(0, 0, 0, 0.08)"
                  captionFade={0.65}
                />
              </div>
            </div>
          </div>
        ) : (
          /* ── Conversation Stream State (Single Stream + Floating Docked Omnibox) ── */
          <>
            {/* Scrollable Conversation Stream */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              data-lenis-prevent
              className="flex-1 w-full overflow-y-auto chat-scroll px-4 pt-6"
            >
              <div className="w-full max-w-[760px] mx-auto flex flex-col gap-4 pb-48">
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}

                <AnimatePresence>
                  {isLoading && <TypingIndicator key="typing" />}
                </AnimatePresence>

                <div ref={messagesEndRef} className="h-2" />
              </div>
            </div>

            {/* ── Floating Chat Omnibox (Hover & Melayang Mengikuti Screen) ── */}
            <div className="absolute bottom-5 left-0 right-0 z-30 pointer-events-none px-4 flex justify-center">
              <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="pointer-events-auto w-full max-w-[760px] bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-[24px] border border-[#EDEDED] shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_18px_42px_rgba(0,0,0,0.13)] hover:-translate-y-1.5 p-3.5 flex flex-col justify-between min-h-[114px] transition-all duration-300 focus-within:shadow-[0_20px_45px_-12px_rgba(0,0,0,0.14)] focus-within:border-[#EDEDED] focus-within:outline-none focus-within:-translate-y-1.5 relative group outline-none"
              >
                {/* Attached Image Previews */}
                {attachedImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 pb-2">
                    {attachedImages.map((img) => (
                      <div
                        key={img.id}
                        className="relative group/img w-12 h-12 rounded-xl overflow-hidden border border-[#E5E5E5] bg-[#FAFAFA] shrink-0"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.previewUrl}
                          alt={img.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeAttachedImage(img.id)}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer"
                          title="Hapus gambar"
                        >
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Editable Prompt Area */}
                <div className="w-full flex items-start text-[14px] leading-relaxed text-[#171717] pt-0.5">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    disabled={isLoading}
                    placeholder="Ask a follow up question or paste an image..."
                    rows={2}
                    className="w-full bg-transparent border-0 p-0 text-[14px] text-[#171717] placeholder-[#9E9E9E] focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none resize-none font-normal leading-relaxed outline-none"
                  />
                </div>

                {/* Omnibox Bottom Toolbar Row */}
                <div className="flex items-center justify-between pt-2 border-t border-transparent">
                  <div className="relative flex items-center gap-1.5">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAttachmentMenu((prev) => !prev);
                      }}
                      className="w-8 h-8 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#525252] hover:bg-[#F5F5F5] hover:text-[#171717] transition-colors cursor-pointer"
                      title="Add attachments or skills"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading || attachedImages.length >= 4}
                      className="w-8 h-8 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#525252] hover:bg-[#F5F5F5] hover:text-[#171717] transition-colors cursor-pointer disabled:opacity-40"
                      title="Lampirkan gambar untuk dianalisis AI"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect height="18" rx="2" strokeWidth="1.8" width="18" x="3" y="3" />
                        <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.8" />
                        <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                      </svg>
                    </motion.button>

                    {/* Popover Menu matching Reference Screen */}
                    <AnimatePresence>
                      {showAttachmentMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 5 }}
                          transition={{ duration: 0.14, ease: "easeOut" }}
                          className="absolute bottom-10 left-0 w-48 bg-white rounded-xl shadow-lg border border-[#EDEDED] py-1 text-xs text-[#262626] z-50"
                        >
                          <div
                            onClick={() => {
                              setShowAttachmentMenu(false);
                              fileInputRef.current?.click();
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#F5F5F5] cursor-pointer transition-colors"
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
                              setInputValue("/skill jurusan ");
                            }}
                            className="flex items-center justify-between px-3 py-2 hover:bg-[#F5F5F5] cursor-pointer transition-colors"
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center gap-2">
                    <AnimatePresence mode="wait">
                      {inputValue.trim().length > 0 || attachedImages.length > 0 ? (
                        <motion.button
                          key="send-bottom-active"
                          type="button"
                          onClick={() => handleSend(inputValue)}
                          disabled={isLoading}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          whileTap={{ scale: 0.92 }}
                          whileHover={{ scale: 1.05 }}
                          className="w-8 h-8 rounded-full bg-[#171717] hover:bg-black text-white flex items-center justify-center cursor-pointer shadow-sm transition-colors"
                          title="Send message"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </motion.button>
                      ) : (
                        <motion.button
                          key="send-bottom-idle"
                          type="button"
                          onClick={() => handleSend(inputValue)}
                          disabled={isLoading || (!isGuest && !inputValue.trim())}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 0.35, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.18 }}
                          className="w-8 h-8 rounded-full bg-[#E5E5E5] text-[#737373] flex items-center justify-center cursor-not-allowed shadow-none"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}

        {/* Empty footer spacer to preserve optical balance */}
        {messages.length === 0 && <div className="h-6 pointer-events-none" />}
      </main>
    </div>
  );
}
