"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  LogIn,
  LogOut,
  ChevronDown,
} from "@/components/ui/icons";
import { DotButton } from "@/components/ui/dot-button";
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

// Framer MorphedMenu spring physics & perspective parameters
const morphSpring = {
  type: "spring" as const,
  stiffness: 60,
  damping: 14,
  mass: 1,
};

const perspectiveAnimation = {
  initial: { opacity: 0, rotateX: 60, translateY: 16 },
  enter: {
    opacity: 1,
    rotateX: 0,
    translateY: 0,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 15,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    rotateX: 60,
    translateY: 10,
    transition: { duration: 0.15 },
  },
};

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
      {/* ── Framer MorphedMenu Popup: Strictly only Logout (or Login) Button (Tanpa Blur Backdrop) ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={morphSpring}
            className={cn(
              "absolute z-50 overflow-hidden rounded-[20px] border border-[#EDEDED] bg-white shadow-[0_12px_36px_-6px_rgba(0,0,0,0.12)] select-none p-1.5",
              isOpen
                ? "bottom-[calc(100%+8px)] left-0 w-full"
                : "bottom-0 left-[calc(100%+10px)] w-[180px]"
            )}
          >
            {/* Perspective Animated Button Container */}
            <div style={{ perspective: "70px", perspectiveOrigin: "bottom" }} className="w-full">
              {isLoggedIn ? (
                <motion.div
                  variants={perspectiveAnimation}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                  className="w-full"
                >
                  <DotButton
                    variant="danger-light"
                    icon={<LogOut size={14} className="shrink-0" />}
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full h-10 text-xs font-semibold"
                  >
                    Keluar (Logout)
                  </DotButton>
                </motion.div>
              ) : (
                <motion.div
                  variants={perspectiveAnimation}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                  className="w-full"
                >
                  <DotButton
                    href="/login"
                    variant="dark"
                    icon={<LogIn size={14} className="shrink-0" />}
                    onClick={() => setMenuOpen(false)}
                    className="w-full h-10 text-xs font-semibold"
                  >
                    Masuk Akun
                  </DotButton>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trigger Bottom Bar / Pill (Clean single line without role description) ── */}
      {isOpen ? (
        <div
          onClick={() => setMenuOpen((prev) => !prev)}
          className={cn(
            "w-full flex items-center justify-between p-2 rounded-[20px] border border-neutral-200/80 bg-white/70 hover:bg-white backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm group",
            isMenuOpen && "bg-white border-neutral-300 shadow-sm"
          )}
          title="Buka menu akun"
        >
          {/* User Avatar + Name */}
          <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#171717] text-white flex items-center justify-center text-[10px] font-semibold shrink-0 border border-[#2E2E2F] shadow-xs transition-transform group-hover:scale-105">
              {userInitials}
            </div>
            <span
              className="text-xs font-medium text-[#262626] truncate"
              title={currentUser?.username || "Tamu"}
            >
              {isLoggedIn ? currentUser?.username : "Tamu (Guest)"}
            </span>
          </div>

          {/* Right Action Icon: Rotating Chevron */}
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
                <div className="w-6 h-6 rounded-full bg-[#171717] text-white flex items-center justify-center text-[10px] font-semibold border border-[#2E2E2F] shadow-xs">
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
