"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

interface PreloaderLoadScreenProps {
  fill?: string;
}

/**
 * Easing cubic-bezier persis dari Framer Preloader / LoadScreen:
 * https://framer.com/m/Interactive-Components-Preloader-LoadScreen-j67ejr.js@avLwyyJ0iIdSjc2rmvzz
 * transition: { ease: [1, 0, 0.56, 1], type: "tween" }
 */
const framerEase = [1, 0, 0.56, 1] as const;

export function PreloaderLoadScreen({
  fill = "#0A0A0B", // Sesuai .stitch/DESIGN.md: Canvas / Background `#0A0A0B`
}: PreloaderLoadScreenProps) {
  const pathname = usePathname();
  const router = useRouter();
  const prevPathname = useRef(pathname);

  // Phase: "idle" | "closing" | "opening"
  const [phase, setPhase] = useState<"idle" | "closing" | "opening">("opening");
  const [isActive, setIsActive] = useState(true);

  // 1. Initial Page Load Reveal
  useEffect(() => {
    setIsActive(true);
    setPhase("opening");
    const timer = setTimeout(() => {
      setIsActive(false);
      setPhase("idle");
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  // 2. Deteksi perubahan rute halaman (URL change)
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setIsActive(true);
      setPhase("opening");

      const timer = setTimeout(() => {
        setIsActive(false);
        setPhase("idle");
      }, 1100);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // 3. Global click interceptor untuk navigasi internal (/chat, /login, /signup, dll)
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Filter hanya link navigasi internal dalam aplikasi
      const isInternal =
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !href.startsWith("/#") &&
        !href.startsWith("/api") &&
        anchor.target !== "_blank" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey;

      if (!isInternal) return;

      try {
        const targetUrl = new URL(href, window.location.origin);
        if (targetUrl.pathname === pathname) return; // Rute sama, abaikan

        e.preventDefault();
        setIsActive(true);
        setPhase("closing");

        // Setelah curtain menutup penuh, lakukan navigasi rute
        setTimeout(() => {
          router.push(href);
        }, 420);
      } catch {
        // Fallback jika URL parsing gagal
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
    };
  }, [pathname, router]);

  if (!isActive) return null;

  // Staggering 5 Kolom Vertikal:
  // - Closing: Edges (0, 4) -> Inner (1, 3) -> Center (2)
  // - Opening (Wave Outward): Center (2) -> Inner (1, 3) -> Edges (0, 4)
  const getColumnDelay = (index: number, currentPhase: "closing" | "opening" | "idle") => {
    if (currentPhase === "closing") {
      if (index === 0 || index === 4) return 0;
      if (index === 1 || index === 3) return 0.08;
      return 0.16; // Center
    } else {
      // Opening
      if (index === 2) return 0.04; // Center buka duluan
      if (index === 1 || index === 3) return 0.18; // Inner buka kedua
      return 0.32; // Edges buka terakhir
    }
  };

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden flex flex-row w-screen h-screen select-none"
    >
      {/* 5 Kolom Vertikal persis seperti Framer Preloader */}
      {[0, 1, 2, 3, 4].map((colIndex) => {
        const delay = getColumnDelay(colIndex, phase);

        return (
          <motion.div
            key={colIndex}
            initial={{ scaleY: phase === "opening" ? 1 : 0 }}
            animate={{ scaleY: phase === "closing" ? 1 : 0 }}
            transition={{
              duration: phase === "closing" ? 0.38 : 0.65,
              delay,
              ease: framerEase,
            }}
            style={{
              backgroundColor: fill,
              transformOrigin: phase === "closing" ? "bottom" : "top",
            }}
            className="relative h-full w-[20%] flex-none overflow-hidden border-l border-[#2E2E2F] first:border-l-0"
          />
        );
      })}

      {/* Logo & Branding KeraVokasi di tengah layar saat tertutup (Monochrome Palette dari DESIGN.md) */}
      <AnimatePresence>
        {phase === "closing" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 text-white"
          >
            <div className="flex items-center gap-3 bg-[#141515] px-5 py-2.5 rounded-2xl border border-[#2E2E2F] shadow-2xl">
              <div className="w-8 h-8 rounded-xl bg-white text-[#0A0A0B] flex items-center justify-center font-bold text-sm shadow-sm">
                KV
              </div>
              <span className="text-lg font-bold tracking-tight text-[#FFFFFF]">
                KeraVokasi
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PreloaderLoadScreen;
