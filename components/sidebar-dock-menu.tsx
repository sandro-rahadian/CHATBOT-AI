"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Message,
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

export interface DemoUser {
  id: number;
  username: string;
  role: "siswa" | "guru" | "admin";
  school_id: number | null;
  allowed_categories: string | null;
  daily_limit: number | null;
}

interface SidebarDockMenuProps {
  currentUser: UserProfile | null;
  onLogout: () => void;
  onClear: () => void;
}

function getRoleBadgeStyle(role: string) {
  switch (role) {
    case "admin":
      return {
        bg: "bg-[#FFFFFF] text-[#0A0A0B] border-transparent font-semibold shadow-xs",
        label: "Admin",
        ring: "ring-1 ring-[#FFFFFF]/50",
      };
    case "guru":
      return {
        bg: "bg-[#2E2E2F] text-[#FFFFFF] border-[#3F3F3F] font-medium",
        label: "Guru",
        ring: "ring-1 ring-[#FFFFFF]/30",
      };
    case "siswa":
      return {
        bg: "bg-[#1E1F1F] text-[#E0E0E0] border-[#2E2E2F] font-normal",
        label: "Siswa",
        ring: "ring-1 ring-[#3F3F3F]",
      };
    case "guest":
    default:
      return {
        bg: "bg-transparent text-[#B3B2B2] border-[#2E2E2F] font-normal",
        label: "Tamu",
        ring: "ring-1 ring-[#2E2E2F]",
      };
  }
}

export function SidebarDockMenu({
  currentUser,
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

  return (
    <aside
      className="fixed top-5 left-4 sm:left-5 z-50 flex flex-col pointer-events-auto select-none"
      aria-label="Sidebar Dock Menu"
    >
      <motion.div
        layout
        initial={false}
        animate={{
          width: isOpen ? 256 : 64,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 32,
        }}
        className="relative bg-[#0A0A0B]/95 backdrop-blur-xl border border-[#2E2E2F] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col justify-between text-[#FFFFFF] transition-colors p-3"
        style={{
          maxHeight: "calc(100vh - 40px)",
        }}
      >
        {/* ── Top Section: Logo & Toggle ────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between min-h-[38px] w-full">
            <Link
              href="/"
              className="flex items-center gap-2.5 overflow-hidden group select-none"
            >
              <div className="relative shrink-0 w-9 h-9 rounded-[6px] overflow-hidden border border-[#2E2E2F] shadow-sm flex items-center justify-center bg-[#1E1F1F]">
                <Image
                  src="/logo.png"
                  alt="KeraVokasi"
                  width={34}
                  height={34}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>

              <AnimatePresence mode="wait">
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col whitespace-nowrap"
                  >
                    <span className="text-xs font-bold text-[#FFFFFF] tracking-wide group-hover:text-[#F0F0F0] transition-colors">
                      KeraVokasi
                    </span>
                    <span className="text-[10px] text-[#B3B2B2] font-medium">
                      Asisten AI SMK Malang
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>

            {/* Toggle Expand/Collapse Button (Only in Expanded mode) */}
            {isOpen && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 rounded-[6px] hover:bg-[#1E1F1F] flex items-center justify-center text-[#B3B2B2] hover:text-[#FFFFFF] transition-colors cursor-pointer shrink-0 border border-transparent hover:border-[#2E2E2F]"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Ciutkan Sidebar</TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="h-px bg-[#2E2E2F] w-full my-0.5" />

          {/* ── User Profile & Quota Section ─────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            {!isOpen ? (
              /* Compact Icon Mode */
              <div className="flex flex-col items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setIsOpen(true)}
                      className="w-10 h-10 rounded-[6px] bg-[#1E1F1F] border border-[#2E2E2F] flex items-center justify-center relative cursor-pointer hover:border-[#3F3F3F] hover:bg-[#2E2E2F] transition-all"
                    >
                      <Avatar className={`w-7 h-7 ${badge.ring}`}>
                        <AvatarFallback className="bg-[#141515] text-[10px] text-[#FFFFFF] font-semibold">
                          {isLoggedIn ? (
                            currentUser?.username.slice(0, 2).toUpperCase()
                          ) : (
                            <UserIcon size={14} />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {isLoggedIn && (
                        <span className="absolute -bottom-1 -right-1 bg-[#FFFFFF] text-[#0A0A0B] text-[8px] font-mono font-bold px-1 rounded-[4px] border border-[#2E2E2F] shadow-xs">
                          {quotaDisplay}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-xs text-[#FFFFFF]">
                        {isLoggedIn
                          ? `${currentUser?.username} (${badge.label})`
                          : "Mode Tamu (Belum Login)"}
                      </span>
                      {isLoggedIn ? (
                        <span className="text-[10px] text-[#E0E0E0] font-mono">
                          Sisa Kuota: {quotaDisplay}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#B3B2B2]">
                          Harap login untuk mengirim pesan
                        </span>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              /* Expanded Mode */
              <div className="bg-[#141515] border border-[#2E2E2F] rounded-[8px] p-3 flex flex-col gap-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className={`w-8 h-8 shrink-0 ${badge.ring}`}>
                      <AvatarFallback className="bg-[#1E1F1F] text-xs text-[#FFFFFF] font-semibold">
                        <UserIcon size={16} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-[#FFFFFF] truncate">
                        {isLoggedIn ? currentUser?.username : "Tamu (Guest)"}
                      </span>
                      <span className="text-[10px] text-[#B3B2B2] truncate">
                        {isLoggedIn
                          ? role === "admin"
                            ? "Administrator"
                            : role === "guru"
                            ? "Tenaga Pendidik"
                            : "Peserta Didik"
                          : "Belum Masuk"}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[4px] border shrink-0 ${badge.bg}`}
                  >
                    {badge.label}
                  </Badge>
                </div>

                {isLoggedIn ? (
                  /* Logged-in Quota Bar */
                  <div className="flex items-center justify-between bg-[#1E1F1F] px-2.5 py-1.5 rounded-[6px] border border-[#2E2E2F] text-[11px]">
                    <span className="text-[#B3B2B2] flex items-center gap-1.5">
                      <Zap size={14} className="text-[#FFFFFF]" />
                      Sisa Kuota:
                    </span>
                    <span className="font-mono font-semibold text-[#FFFFFF]">
                      {role === "admin"
                        ? "Tanpa Batas (∞)"
                        : `${currentUser?.remainingQuota ?? 0}/${
                            currentUser?.dailyLimit ?? 0
                          }`}
                    </span>
                  </div>
                ) : (
                  /* Guest Notice Banner */
                  <div className="bg-[#1E1F1F] border border-[#2E2E2F] rounded-[6px] p-2 text-center flex flex-col gap-1">
                    <span className="text-[10px] text-[#FFFFFF] font-medium">
                      🔒 Anda belum login
                    </span>
                    <p className="text-[9px] text-[#B3B2B2]">
                      Login untuk mulai chat dengan chatbot
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-px bg-[#2E2E2F] w-full my-0.5" />

          {/* ── Navigation Menu Items ────────────────────────────────────────── */}
          <nav className="flex flex-col gap-1.5">
            {/* 1. Obrolan Utama */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/"
                  className={`group flex items-center gap-3 p-2 rounded-[6px] bg-[#1E1F1F] text-[#FFFFFF] border border-[#2E2E2F] hover:bg-[#2E2E2F] transition-all select-none ${
                    !isOpen ? "justify-center" : ""
                  }`}
                >
                  <Message size={16} className="text-[#FFFFFF] shrink-0" />
                  {isOpen && (
                    <span className="text-xs font-medium truncate flex-1">
                      Obrolan Chat
                    </span>
                  )}
                </Link>
              </TooltipTrigger>
              {!isOpen && <TooltipContent side="right">Obrolan Chat</TooltipContent>}
            </Tooltip>

            {/* 2. Hapus Percakapan */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onClear}
                  className={`group flex items-center gap-3 p-2 rounded-[6px] hover:bg-[#1E1F1F] border border-transparent hover:border-[#2E2E2F] text-[#B3B2B2] hover:text-[#FFFFFF] transition-all cursor-pointer text-left ${
                    !isOpen ? "justify-center" : ""
                  }`}
                >
                  <Trash size={16} className="text-[#B3B2B2] group-hover:text-[#FFFFFF] shrink-0 transition-colors" />
                  {isOpen && (
                    <span className="text-xs font-medium truncate">
                      Hapus Percakapan
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              {!isOpen && (
                <TooltipContent side="right">Hapus Percakapan</TooltipContent>
              )}
            </Tooltip>
          </nav>
        </div>

        {/* ── Bottom Section: Auth Links / Logout ───────────────────────────── */}
        <div className="flex flex-col gap-1.5 pt-3 border-t border-[#2E2E2F] mt-3">
          {isLoggedIn ? (
            /* Logged In: Logout Button */
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onLogout}
                  className={`group flex items-center gap-3 p-2 rounded-[6px] hover:bg-[#1E1F1F] border border-transparent hover:border-[#2E2E2F] text-[#B3B2B2] hover:text-[#FFFFFF] transition-all text-xs font-medium cursor-pointer text-left ${
                    !isOpen ? "justify-center" : ""
                  }`}
                >
                  <LogOut size={16} className="text-[#B3B2B2] group-hover:text-[#FFFFFF] shrink-0 transition-colors" />
                  {isOpen && <span className="truncate">Keluar (Logout)</span>}
                </button>
              </TooltipTrigger>
              {!isOpen && <TooltipContent side="right">Keluar (Logout)</TooltipContent>}
            </Tooltip>
          ) : (
            /* Guest: Login & Signup Buttons */
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/login"
                    className={`flex items-center gap-3 p-2 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F0F0F0] text-[#0A0A0B] transition-all text-xs font-semibold shadow-xs ${
                      !isOpen ? "justify-center" : ""
                    }`}
                  >
                    <LogIn size={16} className="text-[#0A0A0B] shrink-0" />
                    {isOpen && <span className="truncate font-semibold">Masuk (Login)</span>}
                  </Link>
                </TooltipTrigger>
                {!isOpen && <TooltipContent side="right">Masuk (Login)</TooltipContent>}
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/signup"
                    className={`flex items-center gap-3 p-2 rounded-[6px] bg-[#1E1F1F] hover:bg-[#2E2E2F] border border-[#2E2E2F] hover:border-[#3F3F3F] text-[#FFFFFF] transition-all text-xs font-medium ${
                      !isOpen ? "justify-center" : ""
                    }`}
                  >
                    <UserPlus size={16} className="text-[#FFFFFF] shrink-0" />
                    {isOpen && <span className="truncate">Daftar Akun</span>}
                  </Link>
                </TooltipTrigger>
                {!isOpen && <TooltipContent side="right">Daftar Akun</TooltipContent>}
              </Tooltip>
            </>
          )}

          {/* Expand toggle in Compact mode */}
          {!isOpen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="w-10 h-7 mx-auto rounded-[6px] hover:bg-[#1E1F1F] border border-transparent hover:border-[#2E2E2F] flex items-center justify-center text-[#B3B2B2] hover:text-[#FFFFFF] transition-colors cursor-pointer mt-1"
                >
                  <ChevronRight size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Buka Sidebar</TooltipContent>
            </Tooltip>
          )}
        </div>
      </motion.div>
    </aside>
  );
}
