"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  Trash2,
  Users,
  LogIn,
  UserPlus,
  Zap,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  ShieldCheck,
  LogOut,
  User as UserIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
  demoUsers: DemoUser[];
  onSwitchUser: (username: string | null) => Promise<void>;
  onClear: () => void;
}

function getRoleBadgeStyle(role: string) {
  switch (role) {
    case "admin":
      return {
        bg: "bg-purple-500/15 text-purple-300 border-purple-500/40",
        label: "Admin",
        ring: "ring-purple-500/50",
      };
    case "guru":
      return {
        bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
        label: "Guru",
        ring: "ring-emerald-500/50",
      };
    case "siswa":
      return {
        bg: "bg-sky-500/15 text-sky-300 border-sky-500/40",
        label: "Siswa",
        ring: "ring-sky-500/50",
      };
    case "guest":
    default:
      return {
        bg: "bg-zinc-700/50 text-zinc-300 border-zinc-600",
        label: "Guest",
        ring: "ring-zinc-600/50",
      };
  }
}

export function SidebarDockMenu({
  currentUser,
  demoUsers,
  onSwitchUser,
  onClear,
}: SidebarDockMenuProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isAccountsOpen, setIsAccountsOpen] = useState(false);

  const role = currentUser?.role || "guest";
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
      className="fixed top-5 left-4 sm:left-5 z-50 flex flex-col pointer-events-auto"
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
        className="relative bg-[#23252a]/90 backdrop-blur-xl border border-white/10 rounded-[22px] shadow-2xl shadow-black/60 overflow-hidden flex flex-col justify-between text-[#dbdee1] transition-colors p-3"
        style={{
          maxHeight: "calc(100vh - 40px)",
        }}
      >
        {/* ── Top Section: Logo & Toggle ────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between min-h-[38px]">
            <Link
              href="/"
              className="flex items-center gap-2.5 overflow-hidden group select-none"
            >
              <div className="relative shrink-0 w-9 h-9 rounded-xl overflow-hidden border border-white/10 shadow-sm flex items-center justify-center bg-[#2b2d31]">
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
                    <span className="text-xs font-bold text-[#f2f3f5] tracking-wide group-hover:text-white transition-colors">
                      KeraVokasi
                    </span>
                    <span className="text-[10px] text-[#949ba4] font-medium">
                      Asisten AI SMK Malang
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>

            {/* Toggle Expand/Collapse Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setIsOpen((prev) => !prev)}
                  className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-[#949ba4] hover:text-[#f2f3f5] transition-colors cursor-pointer shrink-0"
                >
                  {isOpen ? (
                    <ChevronLeft className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isOpen ? "Ciutkan Sidebar" : "Buka Sidebar"}
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="h-px bg-white/5 w-full my-0.5" />

          {/* ── User Profile & Quota Section ─────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            {!isOpen ? (
              /* Compact Icon Mode */
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="w-10 h-10 mx-auto rounded-xl bg-[#1e1f22] border border-white/10 flex items-center justify-center relative cursor-pointer hover:border-white/20 transition-all"
                  >
                    <Avatar className={`w-7 h-7 ring-2 ${badge.ring}`}>
                      <AvatarFallback className="bg-[#2b2d31] text-[11px] text-[#dbdee1] font-semibold">
                        {role === "admin"
                          ? "AD"
                          : role === "guru"
                          ? "GR"
                          : role === "siswa"
                          ? "SW"
                          : "GS"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-1 -right-1 bg-amber-400 text-black text-[9px] font-mono font-bold px-1 rounded-full shadow-xs">
                      {quotaDisplay}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-xs">
                      {currentUser?.username || "Guest"} ({badge.label})
                    </span>
                    <span className="text-[10px] text-amber-300 font-mono">
                      Sisa Kuota: {quotaDisplay}
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : (
              /* Expanded Mode */
              <div className="bg-[#1e1f22]/90 border border-white/10 rounded-2xl p-3 flex flex-col gap-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className={`w-8 h-8 shrink-0 ring-2 ${badge.ring}`}>
                      <AvatarFallback className="bg-[#2b2d31] text-xs text-[#dbdee1] font-semibold">
                        <UserIcon className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-[#f2f3f5] truncate">
                        {currentUser?.username || "Guest (Tamu)"}
                      </span>
                      <span className="text-[10px] text-[#949ba4] truncate">
                        {role === "admin"
                          ? "Administrator"
                          : role === "guru"
                          ? "Tenaga Pendidik"
                          : role === "siswa"
                          ? "Peserta Didik"
                          : "Pengunjung"}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${badge.bg}`}
                  >
                    {badge.label}
                  </Badge>
                </div>

                {/* Sisa Kuota Bar */}
                <div className="flex items-center justify-between bg-[#2b2d31] px-2.5 py-1.5 rounded-xl border border-white/5 text-[11px]">
                  <span className="text-[#949ba4] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Sisa Kuota:
                  </span>
                  <span className="font-mono font-semibold text-amber-400">
                    {role === "admin"
                      ? "Tanpa Batas (∞)"
                      : `${currentUser?.remainingQuota ?? 0}/${
                          currentUser?.dailyLimit ?? 0
                        }`}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-white/5 w-full my-0.5" />

          {/* ── Navigation Menu Items ────────────────────────────────────────── */}
          <nav className="flex flex-col gap-1.5">
            {/* 1. Obrolan Utama (Active) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`flex items-center gap-3 p-2 rounded-xl bg-[#5865f2]/15 text-white border border-[#5865f2]/30 transition-all select-none ${
                    !isOpen ? "justify-center" : ""
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-[#5865f2] shrink-0" />
                  {isOpen && (
                    <span className="text-xs font-medium truncate flex-1">
                      Obrolan Chat
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              {!isOpen && <TooltipContent side="right">Obrolan Chat</TooltipContent>}
            </Tooltip>

            {/* 2. Ganti Akun Demo (Collapsible Accordion / DropDownWrapper style) */}
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isOpen) setIsOpen(true);
                      setIsAccountsOpen((prev) => !prev);
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 text-[#dbdee1] hover:text-white transition-all cursor-pointer text-left ${
                      !isOpen ? "justify-center" : "justify-between"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Users className="w-4 h-4 text-[#949ba4] shrink-0" />
                      {isOpen && (
                        <span className="text-xs font-medium truncate">
                          Ganti Akun Demo
                        </span>
                      )}
                    </div>
                    {isOpen && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[#949ba4] transition-transform duration-200 shrink-0 ${
                          isAccountsOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                </TooltipTrigger>
                {!isOpen && (
                  <TooltipContent side="right">Ganti Akun Demo (RBAC)</TooltipContent>
                )}
              </Tooltip>

              {/* Collapsible Demo Users List */}
              <AnimatePresence>
                {isOpen && isAccountsOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden flex flex-col gap-1 pl-2 pr-1 pt-1.5"
                  >
                    {/* Guest option */}
                    <button
                      type="button"
                      onClick={() => onSwitchUser(null)}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                        role === "guest"
                          ? "bg-[#383a40] text-white border border-[#5865f2]/40"
                          : "hover:bg-white/5 text-[#949ba4] hover:text-[#dbdee1]"
                      }`}
                    >
                      <span className="truncate">Mode Tamu (Guest)</span>
                      {role === "guest" && (
                        <Check className="w-3.5 h-3.5 text-[#5865f2] shrink-0" />
                      )}
                    </button>

                    {/* Demo accounts */}
                    {demoUsers.map((u) => {
                      const isCurrent = currentUser?.username === u.username;
                      const uBadge = getRoleBadgeStyle(u.role);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => onSwitchUser(u.username)}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                            isCurrent
                              ? "bg-[#383a40] text-white border border-[#5865f2]/40"
                              : "hover:bg-white/5 text-[#949ba4] hover:text-[#dbdee1]"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="truncate">{u.username}</span>
                            <span
                              className={`text-[8px] uppercase font-bold px-1.5 py-0.2 rounded-full border ${uBadge.bg}`}
                            >
                              {uBadge.label}
                            </span>
                          </div>
                          {isCurrent && (
                            <Check className="w-3.5 h-3.5 text-[#5865f2] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Hapus Percakapan */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onClear}
                  className={`flex items-center gap-3 p-2 rounded-xl hover:bg-red-500/15 text-[#949ba4] hover:text-red-300 transition-all cursor-pointer text-left ${
                    !isOpen ? "justify-center" : ""
                  }`}
                >
                  <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
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

        {/* ── Bottom Section: Links & Auth ─────────────────────────────────── */}
        <div className="flex flex-col gap-1.5 pt-3 border-t border-white/5 mt-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/login"
                className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 text-[#dbdee1] hover:text-white transition-all text-xs font-medium ${
                  !isOpen ? "justify-center" : ""
                }`}
              >
                <LogIn className="w-4 h-4 text-[#5865f2] shrink-0" />
                {isOpen && <span className="truncate">Halaman Login</span>}
              </Link>
            </TooltipTrigger>
            {!isOpen && <TooltipContent side="right">Halaman Login</TooltipContent>}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/signup"
                className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 text-[#dbdee1] hover:text-white transition-all text-xs font-medium ${
                  !isOpen ? "justify-center" : ""
                }`}
              >
                <UserPlus className="w-4 h-4 text-emerald-400 shrink-0" />
                {isOpen && <span className="truncate">Daftar Akun</span>}
              </Link>
            </TooltipTrigger>
            {!isOpen && <TooltipContent side="right">Daftar Akun</TooltipContent>}
          </Tooltip>
        </div>
      </motion.div>
    </aside>
  );
}
