"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Message,
  Plus,
  Trash,
  LogIn,
  LogOut,
  UserPlus,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "@/components/ui/icons";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface UserProfile {
  username: string;
  role: "guest" | "siswa" | "guru" | "admin";
  schoolId: number | null;
  allowedCategories: string[];
  dailyLimit: number | null;
  remainingQuota: number | null;
}

export interface ConversationItem {
  id: string;
  user_id?: number | null;
  title: string;
  created_at: string;
  updated_at: string;
}

interface SidebarDockMenuProps {
  currentUser: UserProfile | null;
  conversations?: ConversationItem[];
  activeConversationId?: string | null;
  onSelectConversation?: (id: string) => void;
  onNewChat?: () => void;
  onDeleteConversation?: (id: string) => void;
  onLogout: () => void;
  onClear: () => void;
}

function getRoleBadgeStyle(role: string) {
  switch (role) {
    case "admin":
      return {
        bg: "bg-[#171717] text-[#FFFFFF] border-transparent font-semibold",
        label: "Admin",
      };
    case "guru":
      return {
        bg: "bg-[#EDEDED] text-[#171717] border-[#D4D4D4] font-medium",
        label: "Guru",
      };
    case "siswa":
      return {
        bg: "bg-[#F5F5F5] text-[#525252] border-[#E5E5E5] font-normal",
        label: "Siswa",
      };
    case "guest":
    default:
      return {
        bg: "bg-[#F5F5F5] text-[#737373] border-[#E5E5E5] font-normal",
        label: "Tamu",
      };
  }
}

export function SidebarDockMenu({
  currentUser,
  conversations = [],
  activeConversationId = null,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onLogout,
  onClear,
}: SidebarDockMenuProps) {
  const [isOpen, setIsOpen] = useState(true);

  const role = currentUser?.role || "guest";
  const isLoggedIn = role !== "guest";
  const badge = getRoleBadgeStyle(role);

  const quotaDisplay =
    role === "admin"
      ? "∞"
      : currentUser?.remainingQuota !== null &&
        currentUser?.remainingQuota !== undefined
      ? `${currentUser.remainingQuota}`
      : "-";

  const userInitials =
    currentUser?.username?.slice(0, 2).toUpperCase() || "KV";

  return (
    <aside
      className={`h-screen flex-shrink-0 z-30 transition-all duration-200 select-none ${
        isOpen ? "w-[240px]" : "w-[64px]"
      }`}
      aria-label="MiniMax Sidebar"
    >
      <div
        className="w-full h-full bg-[#F7F7F8] border-r border-[#EDEDED] flex flex-col justify-between p-3 overflow-hidden text-[#171717]"
      >
        {/* ── Top Block: Brand, Action & Navigation ────────────────────────── */}
        <div className="flex flex-col gap-3 min-h-0 flex-1 overflow-hidden">
          {/* Brand & Collapse Header */}
          <div className="flex items-center justify-between px-1 py-0.5 shrink-0 min-h-[36px]">
            <div className="flex items-center gap-2 overflow-hidden">
              {/* KeraVokasi / MiniMax Monkey Avatar */}
              <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-xs shadow-xs shrink-0 overflow-hidden">
                <Image
                  src="/minimax-assets/apple-touch_v2ae52.png"
                  alt="MiniMax Code"
                  width={24}
                  height={24}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to SVG if image not loaded
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              {isOpen && (
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className="text-[14.5px] font-semibold tracking-tight text-[#171717] truncate">
                    KeraVokasi
                  </span>
                  <span className="text-[10px] text-[#8C8C8C] font-mono px-1 py-0.2 bg-[#EFEFEF] rounded border border-[#E0E0E0]">
                    AI
                  </span>
                </div>
              )}
            </div>

            {/* Header Icons: Search & Collapse */}
            <div className="flex items-center gap-0.5 text-[#737373] shrink-0">
              {isOpen ? (
                <>
                  <button
                    type="button"
                    className="p-1 rounded-md hover:bg-[#EDEDED] hover:text-[#171717] transition-colors cursor-pointer"
                    title="Search"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-md hover:bg-[#EDEDED] hover:text-[#171717] transition-colors cursor-pointer"
                    title="Collapse sidebar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect height="18" rx="3" strokeWidth="1.8" width="18" x="3" y="3" />
                      <path d="M9 3v18" strokeLinecap="round" strokeWidth="1.8" />
                    </svg>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="p-1.5 rounded-md hover:bg-[#EDEDED] hover:text-[#171717] transition-colors cursor-pointer mx-auto"
                  title="Expand sidebar"
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>

          {/* ── + New Task Button ───────────────────────────────────────────── */}
          <div className="shrink-0">
            {isOpen ? (
              <button
                type="button"
                onClick={onNewChat}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#EDEDEE]/80 hover:bg-[#E5E5E6] border border-[#E5E5E7] transition-all text-xs font-medium text-[#1F1F1F] shadow-xs cursor-pointer group"
                data-purpose="new-task-trigger"
              >
                <svg className="w-3.5 h-3.5 text-[#525252] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
                  <path d="M12 8v8m-4-4h8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                </svg>
                <span>New task</span>
              </button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onNewChat}
                    className="w-9 h-9 mx-auto rounded-lg bg-[#EDEDEE]/80 hover:bg-[#E5E5E6] border border-[#E5E5E7] flex items-center justify-center text-[#1F1F1F] shadow-xs cursor-pointer transition-transform hover:scale-105"
                  >
                    <Plus size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">New task (+)</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* ── MiniMax Standard Nav Links ──────────────────────────────────── */}
          <nav className="flex flex-col gap-0.5 text-xs text-[#404040] shrink-0">
            <Link
              href="#"
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#EDEDED]/80 font-normal transition-colors ${
                !isOpen ? "justify-center px-1" : ""
              }`}
              title="Plugins · Skills"
            >
              <svg className="w-4 h-4 text-[#737373] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                />
              </svg>
              {isOpen && <span>Plugins · Skills</span>}
            </Link>

            <Link
              href="#"
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#EDEDED]/80 font-normal transition-colors ${
                !isOpen ? "justify-center px-1" : ""
              }`}
              title="Scheduled"
            >
              <svg className="w-4 h-4 text-[#737373] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth="1.7" />
                <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
              </svg>
              {isOpen && <span>Scheduled</span>}
            </Link>

            <Link
              href="#"
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#EDEDED]/80 font-normal transition-colors ${
                !isOpen ? "justify-center px-1" : ""
              }`}
              title="Assets"
            >
              <svg className="w-4 h-4 text-[#737373] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                />
              </svg>
              {isOpen && <span>Assets</span>}
            </Link>

            <Link
              href="#"
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#EDEDED]/80 font-normal transition-colors ${
                !isOpen ? "justify-center px-1" : ""
              }`}
              title="Connect mobile"
            >
              <svg className="w-4 h-4 text-[#737373] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect height="18" rx="2" strokeWidth="1.7" width="10" x="7" y="3" />
                <path d="M11 17h2" strokeLinecap="round" strokeWidth="1.7" />
              </svg>
              {isOpen && <span>Connect mobile</span>}
            </Link>
          </nav>

          {/* ── Section Dividers: More / Projects / Recents ─────────────────── */}
          {isOpen && (
            <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-hidden pt-1">
              <div className="flex items-center justify-between px-2 text-[11px] text-[#A3A3A3] font-medium shrink-0">
                <span>Recents</span>
                {conversations.length > 0 && (
                  <span className="font-mono text-[10px] text-[#737373]">
                    {conversations.length}
                  </span>
                )}
              </div>

              {/* Chat History List */}
              <div className="flex flex-col gap-0.5 overflow-y-auto pr-1 flex-1 min-h-0">
                {conversations.length === 0 ? (
                  <div className="p-3 text-center border border-dashed border-[#E5E5E5] rounded-lg my-auto">
                    <p className="text-[11px] text-[#8C8C8C]">Belum ada sesi tugas</p>
                    <p className="text-[10px] text-[#A3A3A3] mt-0.5">Mulai dengan 'New task'</p>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const isActive = conv.id === activeConversationId;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => onSelectConversation?.(conv.id)}
                        className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          isActive
                            ? "bg-[#FFFFFF] text-[#171717] font-medium shadow-xs border border-[#E5E5E5]"
                            : "text-[#525252] hover:text-[#171717] hover:bg-[#EDEDED]/70 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <svg
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? "text-[#171717]" : "text-[#8C8C8C]"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.8"
                            />
                          </svg>
                          <span className="truncate">{conv.title || "Tugas Tanpa Judul"}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation?.(conv.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-[#DC3341] text-[#8C8C8C] rounded transition-opacity cursor-pointer shrink-0 ml-1"
                          title="Hapus obrolan ini"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Utility Clear Action */}
              <button
                type="button"
                onClick={onClear}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#737373] hover:text-[#DC3341] hover:bg-[#EDEDED]/50 rounded-md transition-colors cursor-pointer mt-auto shrink-0"
              >
                <Trash size={13} />
                <span>Bersihkan Layar</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Bottom Section: User Profile Drawer ───────────────────────────── */}
        <div className="border-t border-[#EDEDED] pt-3 px-1 mt-2 shrink-0">
          {isOpen ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden min-w-0">
                  {/* User Avatar with initials */}
                  <div className="w-6 h-6 rounded-full bg-[#E0533C] text-white flex items-center justify-center text-[10px] font-semibold shrink-0 shadow-xs">
                    {userInitials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-[#262626] truncate max-w-[100px]" title={currentUser?.username || "Tamu"}>
                      {isLoggedIn ? currentUser?.username : "Tamu (Guest)"}
                    </span>
                    <span className="text-[10px] text-[#8C8C8C]">
                      {isLoggedIn ? `Kuota: ${quotaDisplay}` : "Belum login"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[#737373]">
                  {/* Notification Bell with alert dot */}
                  <button
                    type="button"
                    className="relative hover:text-[#262626] transition-colors p-1 rounded hover:bg-[#EDEDED] cursor-pointer"
                    title="Notifications"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                      />
                    </svg>
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#EF4444] rounded-full" />
                  </button>

                  {/* Auth Action: Logout or Login */}
                  {isLoggedIn ? (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="hover:text-[#DC3341] transition-colors p-1 rounded hover:bg-[#EDEDED] cursor-pointer"
                      title="Logout"
                    >
                      <LogOut size={14} />
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="hover:text-[#171717] transition-colors p-1 rounded hover:bg-[#EDEDED] cursor-pointer"
                      title="Masuk Akun"
                    >
                      <LogIn size={14} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Collapsed bottom avatar & login/logout */
            <div className="flex flex-col items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="w-7 h-7 rounded-full bg-[#E0533C] text-white flex items-center justify-center text-[10px] font-semibold cursor-pointer shadow-xs hover:scale-105 transition-transform"
                  >
                    {userInitials}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {isLoggedIn ? `${currentUser?.username} (Kuota: ${quotaDisplay})` : "Tamu (Klik untuk buka)"}
                </TooltipContent>
              </Tooltip>

              {isLoggedIn ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="p-1 rounded text-[#737373] hover:text-[#DC3341] cursor-pointer"
                    >
                      <LogOut size={15} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Keluar (Logout)</TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/login" className="p-1 rounded text-[#737373] hover:text-[#171717]">
                      <LogIn size={15} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Masuk (Login)</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
