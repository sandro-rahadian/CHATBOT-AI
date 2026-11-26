"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Message, Plus, Search, Trash, Clock } from "@/components/ui/icons";
import type { ConversationItem, UserProfile } from "@/components/sidebar-dock-menu";

interface PreviewMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ConversationItem[];
  activeConversationId: string | null;
  currentUser: UserProfile | null;
  apiBase: string;
  apiToken: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewChat: () => void;
}

function formatRelativeDate(dateStr?: string, nowMs?: number | null) {
  if (!dateStr || !nowMs) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = nowMs - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function HistoryModal({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  currentUser,
  apiBase,
  apiToken,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
}: HistoryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewMessages, setPreviewMessages] = useState<PreviewMessage[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [nowMs, setNowMs] = useState<number | null>(null);

  // Sync initial selected item & client timestamp when modal opens
  useEffect(() => {
    if (isOpen) {
      setNowMs(Date.now());
      setSearchQuery("");
      if (activeConversationId && conversations.some((c) => c.id === activeConversationId)) {
        setSelectedId(activeConversationId);
      } else if (conversations.length > 0) {
        setSelectedId(conversations[0].id);
      } else {
        setSelectedId(null);
      }
    }
  }, [isOpen, activeConversationId, conversations]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Fetch preview messages for selected conversation
  useEffect(() => {
    if (!isOpen || !selectedId) {
      setPreviewMessages([]);
      return;
    }

    const token =
      apiToken ||
      (typeof window !== "undefined" ? localStorage.getItem("chat_token") : null);
    if (!token) {
      setPreviewMessages([]);
      return;
    }

    let cancelled = false;
    setIsLoadingPreview(true);
    fetch(`${apiBase}/conversations/${selectedId}`, {
      headers: { "x-api-token": token },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.conversation?.messages) {
          setPreviewMessages(data.conversation.messages);
        } else if (!cancelled) {
          setPreviewMessages([]);
        }
      })
      .catch(() => {
        if (!cancelled) setPreviewMessages([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPreview(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, selectedId, apiBase, apiToken]);

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      (c.title || "Tugas Tanpa Judul").toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  const grouped = useMemo(() => {
    const today: ConversationItem[] = [];
    const earlier: ConversationItem[] = [];
    const now = nowMs ? new Date(nowMs) : null;
    for (const conv of filteredConversations) {
      const d = new Date(conv.updated_at || conv.created_at);
      if (now && !Number.isNaN(d.getTime()) && isSameDay(d, now)) {
        today.push(conv);
      } else {
        earlier.push(conv);
      }
    }
    return { today, earlier };
  }, [filteredConversations, nowMs]);

  const selectedConv = useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId]
  );

  const userInitials = currentUser?.username?.slice(0, 2).toUpperCase() || "KV";
  const roleLabel =
    currentUser?.role === "admin"
      ? "Administrator"
      : currentUser?.role === "guru"
      ? "Guru"
      : currentUser?.role === "siswa"
      ? "Siswa"
      : "Mode Tamu";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[2px] p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Riwayat Percakapan"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[840px] h-[580px] max-h-[85vh] bg-white rounded-2xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.2)] border border-[#E5E5E5] flex overflow-hidden text-[#171717]"
          >
            {/* ── Left Pane (Antigravity Modal Sidebar Style) ── */}
            <div className="w-[220px] sm:w-[250px] shrink-0 bg-[#F7F7F8] border-r border-[#EDEDED] flex flex-col justify-between p-3 select-none">
              <div className="flex flex-col gap-2 min-h-0 flex-1">
                {/* Search input */}
                <div className="relative">
                  <Search
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C8C8C] pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari riwayat..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-[#E5E5E5] rounded-lg text-[#171717] placeholder:text-[#9E9E9E] focus:border-[#171717] outline-none focus:outline-none focus:ring-0 transition-colors"
                  />
                </div>

                {/* New Task shortcut */}
                <button
                  type="button"
                  onClick={() => {
                    onNewChat();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#171717] bg-[#EDEDEE]/80 hover:bg-[#E5E5E7] border border-[#E5E5E7] transition-colors cursor-pointer"
                >
                  <Plus size={13} className="text-[#525252]" />
                  <span>Percakapan Baru</span>
                </button>

                {/* Grouped History List */}
                <div className="flex-1 overflow-y-auto pr-0.5 mt-1 space-y-3">
                  {filteredConversations.length === 0 ? (
                    <div className="px-2.5 py-6 text-center text-[11px] text-[#8C8C8C]">
                      {searchQuery.trim()
                        ? "Tidak ada riwayat yang cocok."
                        : "Belum ada riwayat percakapan."}
                    </div>
                  ) : (
                    <>
                      {grouped.today.length > 0 && (
                        <div>
                          <p className="px-2.5 pb-1 text-[11px] font-medium text-[#8C8C8C]">
                            Hari Ini
                          </p>
                          <div className="flex flex-col gap-0.5">
                            {grouped.today.map((conv) => {
                              const isSelected = conv.id === selectedId;
                              return (
                                <button
                                  key={conv.id}
                                  type="button"
                                  onClick={() => setSelectedId(conv.id)}
                                  className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-[#E6E6E8] text-[#171717] font-medium"
                                      : "text-[#404040] hover:bg-[#EDEDEE]"
                                  }`}
                                >
                                  <Message
                                    size={13}
                                    className={`shrink-0 ${
                                      isSelected ? "text-[#171717]" : "text-[#8C8C8C]"
                                    }`}
                                  />
                                  <span className="truncate flex-1">
                                    {conv.title || "Tugas Tanpa Judul"}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {grouped.earlier.length > 0 && (
                        <div>
                          <p className="px-2.5 pb-1 text-[11px] font-medium text-[#8C8C8C]">
                            Sebelumnya
                          </p>
                          <div className="flex flex-col gap-0.5">
                            {grouped.earlier.map((conv) => {
                              const isSelected = conv.id === selectedId;
                              return (
                                <button
                                  key={conv.id}
                                  type="button"
                                  onClick={() => setSelectedId(conv.id)}
                                  className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-[#E6E6E8] text-[#171717] font-medium"
                                      : "text-[#404040] hover:bg-[#EDEDEE]"
                                  }`}
                                >
                                  <Message
                                    size={13}
                                    className={`shrink-0 ${
                                      isSelected ? "text-[#171717]" : "text-[#8C8C8C]"
                                    }`}
                                  />
                                  <span className="truncate flex-1">
                                    {conv.title || "Tugas Tanpa Judul"}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Bottom User Footer (matching Antigravity modal footer) */}
              <div className="border-t border-[#EDEDED] pt-2.5 mt-2 flex items-center gap-2.5 px-1">
                <Avatar className="w-7 h-7 border border-[#E5E5E5] shrink-0">
                  <AvatarFallback className="bg-[#171717] text-white text-[10px] font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="text-xs font-medium text-[#171717] truncate">
                    {currentUser?.username || "Tamu"}
                  </p>
                  <p className="text-[10.5px] text-[#737373] truncate">
                    {roleLabel} · {conversations.length} sesi
                  </p>
                </div>
              </div>
            </div>

            {/* ── Right Pane (Antigravity Detail Cards Layout) ── */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
              {/* Top Header */}
              <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-[#F2F2F2] shrink-0">
                <div className="min-w-0 pr-4">
                  <h2 className="text-[16px] font-semibold text-[#171717] truncate">
                    {selectedConv ? selectedConv.title || "Tugas Tanpa Judul" : "Riwayat Percakapan"}
                  </h2>
                  <p className="text-xs text-[#737373] mt-0.5 flex items-center gap-1.5">
                    {selectedConv ? (
                      <>
                        <Clock size={12} className="text-[#8C8C8C]" />
                        <span>
                          Diperbarui {formatRelativeDate(selectedConv.updated_at || selectedConv.created_at, nowMs)}
                        </span>
                        {selectedConv.id === activeConversationId && (
                          <span className="ml-1 px-1.5 py-0.2 rounded-md bg-[#F0F0F0] text-[#404040] text-[10px] font-medium">
                            Aktif
                          </span>
                        )}
                      </>
                    ) : (
                      <span>Pilih salah satu sesi di sebelah kiri untuk melihat pratinjau percakapan.</span>
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-[#F5F5F5] transition-colors cursor-pointer shrink-0"
                  title="Tutup (Esc)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {selectedConv ? (
                  <>
                    {/* Section 1: Session Actions Card */}
                    <div>
                      <p className="text-xs font-medium text-[#171717] mb-2">Sesi Percakapan</p>
                      <div className="rounded-xl border border-[#EDEDED] bg-white divide-y divide-[#F2F2F2]">
                        <div className="flex items-center justify-between px-4 py-3 gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-[#171717]">Lanjutkan di Jendela Chat</p>
                            <p className="text-[11px] text-[#737373]">
                              Muat seluruh riwayat pesan sesi ini ke layar utama.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectConversation(selectedConv.id);
                              onClose();
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-[#171717] hover:bg-black text-white text-xs font-medium transition-colors cursor-pointer shrink-0"
                          >
                            Buka Sesi
                          </button>
                        </div>

                        <div className="flex items-center justify-between px-4 py-3 gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-[#171717]">Hapus Sesi Ini</p>
                            <p className="text-[11px] text-[#737373]">
                              Hapus permanen riwayat percakapan ini dari daftar.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const deletingId = selectedConv.id;
                              const nextConv = conversations.find((c) => c.id !== deletingId);
                              onDeleteConversation(deletingId);
                              setSelectedId(nextConv ? nextConv.id : null);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E5E5] hover:border-[#FCA5A5] hover:bg-[#FEF2F2] text-[#525252] hover:text-[#DC2626] text-xs font-medium transition-colors cursor-pointer shrink-0"
                          >
                            <Trash size={13} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Message Preview Card */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-[#171717]">Pratinjau Pesan</p>
                        {!isLoadingPreview && (
                          <span className="text-[11px] text-[#8C8C8C]">
                            {previewMessages.length} pesan
                          </span>
                        )}
                      </div>

                      <div className="rounded-xl border border-[#EDEDED] bg-white divide-y divide-[#F2F2F2]">
                        {isLoadingPreview ? (
                          <div className="px-4 py-8 text-center text-xs text-[#8C8C8C]">
                            Memuat pratinjau percakapan...
                          </div>
                        ) : previewMessages.length === 0 ? (
                          <div className="px-4 py-8 text-center text-xs text-[#8C8C8C]">
                            Belum ada pesan tersimpan pada sesi ini.
                          </div>
                        ) : (
                          previewMessages.map((msg) => (
                            <div key={msg.id} className="px-4 py-3 flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-[10.5px] font-semibold uppercase tracking-wide ${
                                    msg.role === "user" ? "text-[#171717]" : "text-[#737373]"
                                  }`}
                                >
                                  {msg.role === "user" ? "Anda" : "KeraVokasi"}
                                </span>
                                {msg.created_at && (
                                  <span className="text-[10px] text-[#A3A3A3]">
                                    {new Date(msg.created_at).toLocaleTimeString("id-ID", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    })}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#404040] leading-relaxed whitespace-pre-wrap line-clamp-4">
                                {msg.content}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-11 h-11 rounded-2xl bg-[#F5F5F5] border border-[#EDEDED] flex items-center justify-center text-[#737373] mb-3">
                      <Clock size={20} />
                    </div>
                    <p className="text-sm font-medium text-[#171717]">Belum ada riwayat sesi</p>
                    <p className="text-xs text-[#737373] mt-1 max-w-xs">
                      Mulai percakapan baru untuk bertanya seputar jurusan, PPDB, atau analisis gambar SMK di Malang.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onNewChat();
                        onClose();
                      }}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#171717] hover:bg-black text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Mulai Percakapan Baru</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
