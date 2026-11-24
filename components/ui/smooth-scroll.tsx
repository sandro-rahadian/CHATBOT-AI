"use client";

import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Standard luxury easing curve for smooth inertial scrolling
 */
const smoothEasing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

/**
 * Global SmoothScroll component for page-level smooth scrolling
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.2,
      easing: smoothEasing,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      allowNestedScroll: true,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}

/**
 * Hook to attach Lenis smooth inertial scrolling to any internal scrollable container
 * (such as <main> in MiniMax workbench or chat message stream)
 */
export function useSmoothScroll<T extends HTMLElement = HTMLElement>(
  enabled = true
) {
  const containerRef = useRef<T | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;
    const element = containerRef.current;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      wrapper: element,
      content: (element.firstElementChild as HTMLElement) || element,
      eventsTarget: element,
      autoRaf: true,
      duration: 1.2,
      easing: smoothEasing,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      allowNestedScroll: true,
    });

    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  return containerRef;
}

export default SmoothScroll;
