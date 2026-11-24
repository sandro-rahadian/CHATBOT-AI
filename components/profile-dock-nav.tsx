"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  LogIn,
  ChevronDown,
} from "@/components/ui/icons";
import { AnimatedArrowButton } from "@/components/ui/animated-arrow-button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/components/sidebar-dock-menu";

interface ProfileDockNavProps {
  currentUser: UserProfile | null;
  onLogout: () => void;
  isOpen: boolean;
  isMenuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
}

export function ProfileDockNav({
  currentUser,
  onLogout,
  isOpen,
  isMenuOpen: controlledMenuOpen,
  onMenuOpenChange,
}: ProfileDockNavProps) {
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const isControlled = controlledMenuOpen !== undefined;
  const isMenuOpen = isControlled ? controlledMenuOpen : internalMenuOpen;

  const setMenuOpen = React.useCallback(
    (val: boolean | ((prev: boolean) => boolean)) => {
      const nextVal = typeof val === "function" ? val(isMenuOpen) : val;
      if (!isControlled) {
        setInternalMenuOpen(nextVal);
      }
      onMenuOpenChange?.(nextVal);
    },
    [isControlled, isMenuOpen, onMenuOpenChange]
  );

  const menuRef = useRef<HTMLDivElement>(null);

  const role = currentUser?.role || "guest";
  const isLoggedIn = role !== "guest";
  const userInitials = currentUser?.username?.slice(0, 2).toUpperCase() || "GU";

  // Close on Escape or click outside
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    }
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isMenuOpen, setMenuOpen]);

  return (
    <div ref={menuRef} className="relative w-full">
      {/* ── Backdrop Overlay ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* ── Expandable Menu Popup ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "fixed z-50 overflow-hidden rounded-2xl border border-[#EDEDED] bg-white shadow-xl select-none p-3 flex flex-col gap-2.5",
              isOpen
                ? "bottom-[72px] left-3 w-[240px]"
                : "bottom-16 left-[68px] w-[240px]"
            )}
          >
            {/* User Identity Header */}
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#F0F0F0]">
              <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center text-[11px] font-semibold shrink-0 shadow-xs">
                {userInitials}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-[#171717] truncate">
                  {isLoggedIn ? currentUser?.username : "Tamu (Guest)"}
                </span>
              </div>
            </div>

            {/* Menu Actions */}
            {isLoggedIn ? (
              <div className="flex flex-col">
                <AnimatedArrowButton
                  text="Keluar (Logout)"
                  variant="white"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Button Masuk Utama */}
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full h-10 rounded-full bg-[#171717] hover:bg-black text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors shadow-none"
                >
                  <LogIn size={14} className="text-white" />
                  <span>Masuk Akun</span>
                </Link>

                {/* Sekunder: Link ke Daftar Akun */}
                <p className="text-[11px] text-[#737373] text-center pt-0.5">
                  Belum punya akun?{" "}
                  <Link
                    href="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="text-[#171717] hover:underline font-semibold"
                  >
                    Daftar di sini
                  </Link>
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trigger Bottom Bar / Pill ── */}
      {isOpen ? (
        <div
          onClick={() => setMenuOpen((prev) => !prev)}
          className={cn(
            "w-full flex items-center justify-between p-2 rounded-[20px] border border-neutral-200/80 bg-white/70 hover:bg-white backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm group",
            isMenuOpen && "bg-white border-neutral-300 shadow-sm"
          )}
          title="Buka menu akun"
        >
          {/* User Avatar + Identity */}
          <div className="flex items-center gap-2 overflow-hidden min-w-0">
            <div className="w-6 h-6 rounded-full bg-[#E0533C] text-white flex items-center justify-center text-[10px] font-semibold shrink-0 shadow-xs transition-transform group-hover:scale-105">
              {userInitials}
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className="text-xs font-medium text-[#262626] truncate max-w-[110px]"
                title={currentUser?.username || "Tamu"}
              >
                {isLoggedIn ? currentUser?.username : "Tamu (Guest)"}
              </span>
              <span className="text-[10px] text-[#8C8C8C] capitalize truncate max-w-[110px]">
                {isLoggedIn
                  ? role === "admin"
                    ? "Administrator"
                    : "Siswa"
                  : "Belum login"}
              </span>
            </div>
          </div>

          {/* Right Action Icon: Rotating Chevron Only (No Notification Bell) */}
          <div className="flex items-center pr-1 text-[#737373]">
            <motion.div
              animate={{ rotate: isMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="p-0.5 text-neutral-500 group-hover:text-neutral-900 transition-colors"
            >
              <ChevronDown size={14} />
            </motion.div>
          </div>
        </div>
      ) : (
        /* Collapsed Sidebar Pill with Tooltip */
        <div className="flex flex-col items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className={cn(
                  "relative w-9 h-9 rounded-full bg-white/80 hover:bg-white border border-[#EDEDEE] flex items-center justify-center cursor-pointer shadow-xs hover:scale-105 transition-all group",
                  isMenuOpen && "scale-105 border-neutral-400 bg-white shadow-sm"
                )}
              >
                <div className="w-6 h-6 rounded-full bg-[#E0533C] text-white flex items-center justify-center text-[10px] font-semibold shadow-xs">
                  {userInitials}
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isLoggedIn
                ? `${currentUser?.username} (Klik menu)`
                : "Tamu (Klik untuk Masuk)"}
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

export default ProfileDockNav;
