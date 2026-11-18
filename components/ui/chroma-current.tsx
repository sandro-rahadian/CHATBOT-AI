"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ChromaCurrentProps {
  colorA?: string;
  colorB?: string;
  backgroundColor?: string;
  pitch?: number;
  dotSize?: number;
  baseDots?: number;
  streams?: number;
  speed?: number;
  turbulence?: number;
  intensity?: number;
  bloom?: number;
  className?: string;
  interactive?: boolean;
}

export function ChromaCurrent({
  colorA = "#b8292e", // Crimson red from user config
  colorB = "#322c2b", // Charcoal brownish from user config
  backgroundColor = "#000000",
  pitch = 8,
  dotSize = 0.62,
  baseDots = 0.12,
  streams = 4,
  speed = 0.6,
  turbulence = 0.6,
  intensity = 1.0,
  bloom = 0.6,
  className,
  interactive = true,
}: ChromaCurrentProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };

    if (interactive) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseleave", onMouseLeave);
    }

    // Stream lines initialization
    interface StreamParticle {
      x: number;
      y: number;
      angle: number;
      speedMultiplier: number;
      color: string;
      radius: number;
      phase: number;
    }

    const streamList: StreamParticle[] = [];
    const colors = [colorA, colorA, colorB, "#d9383e", colorB];

    for (let i = 0; i < streams * 3; i++) {
      streamList.push({
        x: Math.random() * width,
        y: Math.random() * height,
        angle: (Math.PI * 2 * i) / (streams * 3),
        speedMultiplier: 0.8 + Math.random() * 0.6,
        color: colors[i % colors.length],
        radius: 120 + Math.random() * 80,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.008 * speed;

      // Clear background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // Create an offscreen-like effect: draw the glowing stream blobs
      // We draw bright glowing gradients that move across the screen
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      for (let i = 0; i < streamList.length; i++) {
        const p = streamList[i];
        p.phase += 0.005 * speed;

        // Turbulent flow movement
        const noiseX = Math.sin(time + p.phase + i * 1.5) * turbulence * 200;
        const noiseY = Math.cos(time * 0.8 + p.phase * 1.2 + i) * turbulence * 180;

        let targetX = (width * 0.5) + Math.cos(time * p.speedMultiplier + p.angle) * (width * 0.35) + noiseX;
        let targetY = (height * 0.5) + Math.sin(time * 0.9 * p.speedMultiplier + p.angle * 1.3) * (height * 0.3) + noiseY;

        // Mouse attraction
        if (mouseRef.current.active && interactive) {
          const dx = mouseRef.current.x - targetX;
          const dy = mouseRef.current.y - targetY;
          const dist = Math.hypot(dx, dy);
          if (dist < 400) {
            targetX += (dx / dist) * 120 * (1 - dist / 400);
            targetY += (dy / dist) * 120 * (1 - dist / 400);
          }
        }

        const gradient = ctx.createRadialGradient(
          targetX,
          targetY,
          10,
          targetX,
          targetY,
          p.radius * (1 + bloom * 0.5)
        );

        gradient.addColorStop(0, p.color);
        gradient.addColorStop(0.5, p.color === colorA ? "rgba(184, 41, 46, 0.4)" : "rgba(50, 44, 43, 0.3)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(targetX, targetY, p.radius * (1 + bloom * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Mask with Dot Grid:
      // Draw grid of dots.
      // We sample or punch through with dots.
      // To get the crisp "Currents of light flowing across glowing dots":
      // We draw the dots using destination-in so only the dots remain glowing!
      ctx.save();
      ctx.globalCompositeOperation = "destination-in";

      const radius = Math.max(1, (pitch * dotSize) / 2);
      ctx.fillStyle = "#ffffff";

      const startX = (width % pitch) / 2;
      const startY = (height % pitch) / 2;

      ctx.beginPath();
      for (let x = startX; x < width; x += pitch) {
        for (let y = startY; y < height; y += pitch) {
          ctx.moveTo(x + radius, y);
          ctx.arc(x, y, radius, 0, Math.PI * 2);
        }
      }
      ctx.fill();
      ctx.restore();

      // Add base ambient dots so dark areas still show the faint dot grid (baseDots = 0.12)
      ctx.save();
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // Faint base dots
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = `rgba(180, 180, 180, ${baseDots})`;
      ctx.beginPath();
      for (let x = startX; x < width; x += pitch) {
        for (let y = startY; y < height; y += pitch) {
          ctx.moveTo(x + radius, y);
          ctx.arc(x, y, radius, 0, Math.PI * 2);
        }
      }
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      if (interactive) {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseleave", onMouseLeave);
      }
    };
  }, [
    colorA,
    colorB,
    backgroundColor,
    pitch,
    dotSize,
    baseDots,
    streams,
    speed,
    turbulence,
    intensity,
    bloom,
    interactive,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      style={{ background: backgroundColor }}
    />
  );
}
