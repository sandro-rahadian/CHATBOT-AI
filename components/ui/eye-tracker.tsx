"use client";

import React, { useRef, useState, useEffect, useId } from "react";

export type EyeShape = "Ball" | "Circle" | "Cube" | "Pill" | "Hexagon" | "Hex flat";
export type EyeStyle = "Slant" | "Dots" | "Squares";
export type EyeBehavior = "Follow Cursor" | "Look Center" | "Random Look" | "Idle";
export type EyeExpression = "Default" | "Happy" | "Curious" | "Sleepy" | "Surprised" | "Angry" | "Focused";

const SHAPES: Record<EyeShape, string> = {
  Ball: "M50 0 A50 50 0 1 1 49.99 0 Z",
  Circle: "M50 7 A43 43 0 1 1 49.99 7 Z",
  Cube: "M30 6 H70 A24 24 0 0 1 94 30 V70 A24 24 0 0 1 70 94 H30 A24 24 0 0 1 6 70 V30 A24 24 0 0 1 30 6 Z",
  Pill: "M34 17 H66 A33 33 0 0 1 66 83 H34 A33 33 0 0 1 34 17 Z",
  Hexagon:
    "M59.53 8.50 L81.18 21 Q90.7 26.5 90.7 37.5 V62.5 Q90.7 73.5 81.18 79 L59.53 91.5 Q50 97 40.47 91.5 L18.82 79 Q9.3 73.5 9.3 62.5 V37.5 Q9.3 26.5 18.82 21 L40.47 8.5 Q50 3 59.53 8.5 Z",
  "Hex flat":
    "M91.5 59.53 L79 81.18 Q73.5 90.7 62.5 90.7 H37.5 Q26.5 90.7 21 81.18 L8.5 59.53 Q3 50 8.5 40.47 L21 18.82 Q26.5 9.3 37.5 9.3 H62.5 Q73.5 9.3 79 18.82 L91.5 40.47 Q97 50 91.5 59.53 Z",
};

const EYE_STYLES: Record<EyeStyle, { w: number; h: number; r: number }> = {
  Slant: { w: 9, h: 15, r: 4.5 },
  Dots: { w: 11, h: 11, r: 5.5 },
  Squares: { w: 12, h: 12, r: 3.5 },
};

const RADIUS = 50;
const EYE_GAP = 0.19;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function prefersReducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export interface EyeTrackerProps {
  size?: number;
  shape?: EyeShape;
  eyes?: EyeStyle;
  bodyColor?: string;
  eyeColor?: string;
  fillType?: "Solid" | "Gradient";
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number;
  follow?: number;
  bounce?: number;
  eyeScale?: number;
  eyeWidth?: number;
  eyeRound?: number;
  eyeHeight?: number;
  behaviorMode?: EyeBehavior;
  expression?: EyeExpression;
  naturalBlinking?: boolean;
  followSpeed?: number;
  rotationRange?: number;
  enableFocusMode?: boolean;
  focusScale?: number;
  focusDuration?: number;
  returnDuration?: number;
  idle?: boolean;
  className?: string;
}

export function EyeTracker({
  size = 40,
  shape = "Pill",
  eyes: eyeStyle = "Slant",
  bodyColor = "#FFFFFF",
  eyeColor = "#0B0B0D",
  fillType = "Solid",
  gradientStart = "#FF4242",
  gradientEnd = "#FF8A00",
  gradientAngle = 45,
  follow = 60,
  bounce = 30,
  eyeScale = 1,
  eyeWidth = 1,
  eyeRound = 1,
  eyeHeight = 1,
  behaviorMode = "Follow Cursor",
  expression = "Default",
  naturalBlinking = true,
  followSpeed = 60,
  rotationRange = 64,
  enableFocusMode = true,
  focusScale = 1.15,
  focusDuration = 400,
  returnDuration = 250,
  idle = false,
  className = "",
}: EyeTrackerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const eyeRefs = useRef<(SVGGElement | null)[]>([]);
  const [shapePath, setShapePath] = useState(SHAPES[shape] ?? SHAPES.Pill);
  const [focusActive, setFocusActive] = useState(false);

  const reducedMotion = prefersReducedMotion();
  const metrics = EYE_STYLES[eyeStyle] ?? EYE_STYLES.Slant;
  const eye = {
    w: metrics.w * eyeScale * eyeWidth,
    h: metrics.h * eyeScale * eyeHeight,
    r: metrics.r * eyeScale * eyeWidth * eyeRound,
  };

  const currentProps = useRef({
    follow,
    bounce,
    eyeScale,
    eye,
    behaviorMode,
    expression,
    naturalBlinking,
    followSpeed,
    rotationRange,
    enableFocusMode,
  });

  currentProps.current = {
    follow,
    bounce,
    eyeScale,
    eye,
    behaviorMode,
    expression,
    naturalBlinking,
    followSpeed,
    rotationRange,
    enableFocusMode,
  };

  useEffect(() => {
    setShapePath(SHAPES[shape] ?? SHAPES.Pill);
  }, [shape]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const turn = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
    let raf = 0;
    let previousTime = 0;
    let blinkStart = 0;
    let nextBlink = performance.now() + 2200;
    let idleTimer = 0;

    const resetTarget = () => {
      turn.tx = 0;
      turn.ty = 0;
    };

    const aim = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy) || 1;
      const reach = Math.max(80, Math.min(window.innerWidth, window.innerHeight) * 0.28);

      if (currentProps.current.behaviorMode !== "Follow Cursor") return;
      const strength = clamp(currentProps.current.follow, 0, 100) / 100;
      const amount = Math.min(0.85, Math.tanh(distance / reach) * strength * 1.5);
      turn.tx = (dx / distance) * amount;
      turn.ty = (dy / distance) * amount;
    };

    const draw = (now: number) => {
      let lid = 1;
      if (currentProps.current.naturalBlinking && now > nextBlink) {
        blinkStart = now;
        nextBlink =
          now +
          (currentProps.current.behaviorMode === "Idle" || idle
            ? 2000
            : 2400 + Math.random() * 3000);
      }
      const blinkElapsed = now - blinkStart;
      if (currentProps.current.naturalBlinking && blinkElapsed < 160) {
        lid = 1 - 0.9 * Math.sin((blinkElapsed / 160) * Math.PI);
      }

      const activeExpression = focusActive ? "Focused" : currentProps.current.expression;
      const expressionHeight =
        activeExpression === "Surprised"
          ? 1.35
          : activeExpression === "Sleepy"
          ? 0.55
          : activeExpression === "Happy"
          ? 0.78
          : activeExpression === "Angry"
          ? 0.82
          : activeExpression === "Focused"
          ? 1.12
          : 1;

      const expressionWidth =
        activeExpression === "Curious"
          ? 0.82
          : activeExpression === "Surprised"
          ? 0.9
          : activeExpression === "Focused"
          ? 0.88
          : 1;

      const yaw = Math.asin(clamp(turn.x, -0.92, 0.92));
      const pitch = -Math.asin(clamp(turn.y, -0.92, 0.92));
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const tilt = clamp(currentProps.current.rotationRange, 0, 90) * turn.x * turn.y;
      const gap = EYE_GAP * Math.max(1, currentProps.current.eyeScale * 0.8);

      [-gap, gap].forEach((x0, index) => {
        const group = eyeRefs.current[index];
        if (!group) return;
        const z0 = Math.sqrt(1 - x0 * x0);
        const x1 = x0 * cy + z0 * sy;
        const z1 = -x0 * sy + z0 * cy;
        const y2 = -z1 * sp;
        const z2 = z1 * cp;
        const depth = clamp(z2, 0, 1);
        const scale = 0.45 + 0.55 * depth;
        const horizontalScale = scale * (0.7 + 0.3 * depth);
        const eyeNow = currentProps.current.eye;
        const width = eyeNow.w * horizontalScale * expressionWidth;
        const height = Math.max(0.6, eyeNow.h * scale * lid * expressionHeight);
        const rect = group.firstElementChild as SVGRectElement | null;
        if (rect) {
          rect.setAttribute("x", (-width / 2).toFixed(2));
          rect.setAttribute("y", (-height / 2).toFixed(2));
          rect.setAttribute("width", width.toFixed(2));
          rect.setAttribute("height", height.toFixed(2));
          rect.setAttribute("rx", Math.min(eyeNow.r, width / 2, height / 2).toFixed(2));
        }
        group.setAttribute(
          "transform",
          `translate(${(50 + x1 * RADIUS).toFixed(2)} ${(50 + y2 * RADIUS).toFixed(2)}) rotate(${tilt.toFixed(2)})`
        );
        group.style.opacity = z2 < 0.05 ? "0" : "1";
      });
    };

    let isVisible = false;
    let disposed = false;

    const stopAnimation = () => {
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const startAnimation = () => {
      if (disposed || !isVisible || raf) return;
      previousTime = 0;
      raf = window.requestAnimationFrame(animate);
    };

    const animate = (now: number) => {
      raf = 0;
      if (disposed || !isVisible) return;
      const dt = previousTime ? Math.min(2.5, (now - previousTime) / 16.67) : 1;
      previousTime = now;

      if (reducedMotion) {
        turn.x = turn.tx;
        turn.y = turn.ty;
      } else {
        const speed = clamp(currentProps.current.followSpeed, 1, 100) / 100;
        const spring = 0.025 + speed * 0.095;
        const damping = 0.46 - speed * 0.12 - (clamp(currentProps.current.bounce, 0, 100) / 100) * 0.12;
        turn.vx += ((turn.tx - turn.x) * spring - turn.vx * damping) * dt;
        turn.vy += ((turn.ty - turn.y) * spring - turn.vy * damping) * dt;
        turn.x += turn.vx * dt;
        turn.y += turn.vy * dt;
      }

      draw(now);
      raf = window.requestAnimationFrame(animate);
    };

    const mode = behaviorMode;
    if (idle || mode === "Idle" || mode === "Random Look") {
      const glance = () => {
        const angle = Math.random() * Math.PI * 2;
        const amount = 0.35 + Math.random() * 0.3;
        if (currentProps.current.behaviorMode === "Look Center") {
          resetTarget();
        } else {
          turn.tx = Math.cos(angle) * amount;
          turn.ty = Math.sin(angle) * amount;
        }
        idleTimer = window.setTimeout(() => {
          resetTarget();
          idleTimer = window.setTimeout(glance, 3600);
        }, 800);
      };
      idleTimer = window.setTimeout(glance, 1200);
    } else if (mode === "Look Center") {
      resetTarget();
    } else {
      window.addEventListener("pointermove", aim, { passive: true });
      document.documentElement.addEventListener("pointerleave", resetTarget);
    }

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              const entry = entries[0];
              isVisible = !!entry?.isIntersecting;
              if (isVisible) {
                startAnimation();
              } else {
                stopAnimation();
              }
            },
            { root: null, threshold: 0.01 }
          )
        : null;

    if (observer) {
      observer.observe(root);
    } else {
      isVisible = true;
      startAnimation();
    }

    return () => {
      disposed = true;
      stopAnimation();
      observer?.disconnect();
      window.clearTimeout(idleTimer);
      window.removeEventListener("pointermove", aim);
      document.documentElement.removeEventListener("pointerleave", resetTarget);
    };
  }, [idle, reducedMotion, behaviorMode, focusActive]);

  useEffect(() => {
    if (!focusActive) return;
    const releaseFocus = () => setFocusActive(false);
    window.addEventListener("pointerup", releaseFocus);
    window.addEventListener("pointercancel", releaseFocus);
    window.addEventListener("blur", releaseFocus);
    return () => {
      window.removeEventListener("pointerup", releaseFocus);
      window.removeEventListener("pointercancel", releaseFocus);
      window.removeEventListener("blur", releaseFocus);
    };
  }, [focusActive]);

  const rawId = useId();
  const clipId = `eyt-clip-${rawId.replace(/:/g, "")}`;
  const gradientId = `eyt-grad-${rawId.replace(/:/g, "")}`;
  const gradientRadians = (clamp(gradientAngle, 0, 360) * Math.PI) / 180;
  const gradientX1 = 50 - 50 * Math.cos(gradientRadians);
  const gradientY1 = 50 - 50 * Math.sin(gradientRadians);
  const gradientX2 = 50 + 50 * Math.cos(gradientRadians);
  const gradientY2 = 50 + 50 * Math.sin(gradientRadians);

  const bodyFill = fillType === "Gradient" ? `url(#${gradientId})` : bodyColor;
  const actualSize = clamp(size, 16, 600);

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label="Eye Tracker AI Animation"
      className={`inline-flex items-center justify-center select-none ${className}`}
      style={{
        width: `${actualSize}px`,
        height: `${actualSize}px`,
        position: "relative",
        overflow: "visible",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: `${actualSize}px`,
          height: `${actualSize}px`,
          overflow: "visible",
          display: "block",
          cursor: idle || behaviorMode !== "Follow Cursor" ? "default" : "pointer",
          transformOrigin: "center",
          transform: `scale(${focusActive && enableFocusMode ? clamp(focusScale, 1, 1.6) : 1})`,
          transition: `transform ${
            focusActive ? clamp(focusDuration, 100, 3000) : clamp(returnDuration, 100, 3000)
          }ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
          touchAction: "manipulation",
        }}
        onPointerDown={(e) => {
          if (!enableFocusMode || idle || e.button !== 0) return;
          setFocusActive(true);
        }}
        onPointerUp={() => setFocusActive(false)}
        onPointerCancel={() => setFocusActive(false)}
      >
        <defs>
          {fillType === "Gradient" && (
            <linearGradient
              id={gradientId}
              x1={`${gradientX1}%`}
              y1={`${gradientY1}%`}
              x2={`${gradientX2}%`}
              y2={`${gradientY2}%`}
            >
              <stop offset="0%" stopColor={gradientStart} />
              <stop offset="100%" stopColor={gradientEnd} />
            </linearGradient>
          )}
          <clipPath id={clipId}>
            <path d={shapePath} />
          </clipPath>
        </defs>

        {/* Body shape with subtle border stroke */}
        <path
          d={shapePath}
          fill={bodyFill}
          stroke="#E5E5E5"
          strokeWidth="1.5"
          className="transition-colors duration-200"
        />

        {/* Moving Eyes */}
        <g clipPath={`url(#${clipId})`}>
          {[0, 1].map((index) => (
            <g
              key={index}
              ref={(node) => {
                eyeRefs.current[index] = node;
              }}
            >
              <rect
                x={-eye.w / 2}
                y={-eye.h / 2}
                width={eye.w}
                height={eye.h}
                rx={eye.r}
                fill={eyeColor}
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

export default EyeTracker;
