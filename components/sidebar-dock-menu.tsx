"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Message,
  Plus,
  Trash,
  LogIn,
  LogOut,
  UserPlus,
  ChevronRight,
  Search,
  CollapseLeftPanel,
  Clock,
} from "@/components/ui/icons";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProfileDockNav } from "@/components/profile-dock-nav";

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
  onOpenHistoryModal?: () => void;
  onLogout: () => void;
  isProfileMenuOpen?: boolean;
  onProfileMenuOpenChange?: (open: boolean) => void;
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
  onOpenHistoryModal,
  onLogout,
  isProfileMenuOpen,
  onProfileMenuOpenChange,
}: SidebarDockMenuProps) {
  const [isOpen, setIsOpen] = useState(true);

  // If profile menu is triggered to open from outside, expand sidebar if collapsed
  useEffect(() => {
    if (isProfileMenuOpen && !isOpen) {
      setIsOpen(true);
    }
  }, [isProfileMenuOpen, isOpen]);

  const role = currentUser?.role || "guest";
  const isLoggedIn = role !== "guest";
  const badge = getRoleBadgeStyle(role);

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
            <button
              type="button"
              onClick={onNewChat}
              className="flex items-center gap-2 overflow-hidden rounded-lg px-1 py-0.5 -ml-1 hover:bg-[#EDEDED]/80 transition-colors cursor-pointer text-left"
              title="Mulai percakapan baru"
            >
              {/* KeraVokasi Logo */}
              <div className="w-7 h-7 flex items-center justify-center shrink-0 overflow-hidden">
                <Image
                  src="/logo-v2.png"
                  alt="KeraVokasi"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>

              {isOpen && (
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className="text-[14.5px] font-semibold tracking-tight text-[#171717] truncate">
                    KeraVokasi
                  </span>
                </div>
              )}
            </button>

            {/* Header Icons: Search & Collapse from IconMCP */}
            <div className="flex items-center gap-0.5 text-[#737373] shrink-0">
              {isOpen ? (
                <>
                  <button
                    type="button"
                    onClick={onOpenHistoryModal}
                    className="p-1 rounded-md hover:bg-[#EDEDED] hover:text-[#171717] transition-colors cursor-pointer"
                    title="Cari & Buka Riwayat (⌘K)"
                  >
                    <Search size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-md hover:bg-[#EDEDED] hover:text-[#171717] transition-colors cursor-pointer"
                    title="Collapse sidebar"
                  >
                    <CollapseLeftPanel size={15} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="p-1.5 rounded-md hover:bg-[#EDEDED] hover:text-[#171717] transition-colors cursor-pointer mx-auto"
                  title="Expand sidebar"
                >
                  <ChevronRight size={15} />
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
                <Plus size={14} className="text-[#525252] group-hover:scale-110 transition-transform" />
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
                    <Plus size={15} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">New task (+)</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* ── MiniMax Standard Nav Links ──────────────────── */}
          <nav className="flex flex-col gap-0.5 text-xs text-[#404040] shrink-0">
            <button
              type="button"
              onClick={onOpenHistoryModal}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#EDEDED]/80 font-normal transition-colors cursor-pointer ${
                !isOpen ? "justify-center px-1" : ""
              }`}
              title="Riwayat Percakapan"
            >
              <Clock size={15} className="text-[#737373] shrink-0" />
              {isOpen && <span>History</span>}
            </button>
          </nav>

          {/* ── Section Dividers: More / Projects / Recents ─────────────────── */}
          {isOpen && (
            <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-hidden pt-1">
              <button
                type="button"
                onClick={onOpenHistoryModal}
                className="w-full flex items-center justify-between px-2 py-0.5 rounded-md hover:bg-[#EDEDED]/60 text-[11px] text-[#A3A3A3] hover:text-[#525252] font-medium shrink-0 transition-colors cursor-pointer"
                title="Buka jendela Riwayat Percakapan"
              >
                <span>Recents</span>
                {conversations.length > 0 && (
                  <span className="font-mono text-[10px] text-[#737373]">
                    {conversations.length}
                  </span>
                )}
              </button>

              {/* Chat History List */}
              <div className="flex flex-col gap-0.5 overflow-y-auto pr-1 flex-1 min-h-0">
                {conversations.length > 0 &&
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
                          <Message
                            size={14}
                            className={`shrink-0 ${
                              isActive ? "text-[#171717]" : "text-[#8C8C8C]"
                            }`}
                          />
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
                  })}
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom Section: User Profile & Logout (Navigation 8 Animation Block) ── */}
        <div className="border-t border-[#EDEDED] pt-2 px-0.5 mt-2 shrink-0">
          <ProfileDockNav
            currentUser={currentUser}
            onLogout={onLogout}
            isOpen={isOpen}
            isMenuOpen={isProfileMenuOpen}
            onMenuOpenChange={onProfileMenuOpenChange}
          />
        </div>
      </div>
    </aside>
  );
}
