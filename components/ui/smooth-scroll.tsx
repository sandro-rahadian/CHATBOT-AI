"use client";

import { useEffect, useRef } from "react";

/**
 * Global SmoothScroll component: enables native hardware-accelerated smooth scrolling
 * with 0% CPU consumption and no continuous RAF loops.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  return null;
}

/**
 * Ultra-lightweight Hook for internal scrollable containers (e.g. main workbench, chat feed).
 * Uses GPU-accelerated CSS momentum scrolling without heavy JS event interception or memory leaks.
 */
export function useSmoothScroll<T extends HTMLElement = HTMLElement>(
  enabled = true
) {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;
    const element = containerRef.current;

    element.style.scrollBehavior = "smooth";
    element.style.overscrollBehaviorY = "contain";
    // @ts-expect-error - iOS momentum scrolling
    element.style.webkitOverflowScrolling = "touch";
  }, [enabled]);

  return containerRef;
}
