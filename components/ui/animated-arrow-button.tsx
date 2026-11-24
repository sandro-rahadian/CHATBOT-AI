"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

interface AnimatedArrowButtonProps extends HTMLMotionProps<"button"> {
  text?: string;
  variant?: "white" | "black" | "danger-white";
  icon?: React.ReactNode;
}

const springTransition = {
  type: "spring" as const,
  stiffness: 320,
  damping: 48,
  mass: 1,
};

/**
 * Arrow SVG persis seperti pada Framer AnimatedArrow Button
 * https://framer.com/m/Button-VSAe.js@oLGrpQQke5sx2jBBx8pd
 */
const FramerArrow = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 12 10"
    className={cn("w-3 h-2.5 shrink-0 fill-current", className)}
  >
    <path d="M 6.6 9.861 L 5.667 8.889 L 8.678 5.694 L 0 5.69 L 0 4.31 L 8.678 4.306 L 5.684 1.111 L 6.6 0.139 L 11.182 5 Z" />
  </svg>
);

export const AnimatedArrowButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedArrowButtonProps
>(
  (
    {
      text = "Keluar (Logout)",
      variant = "white",
      className,
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    // Styling warna putih sesuai permintaan user ("jadikan warna nya putih")
    const isWhite = variant === "white" || variant === "danger-white";

    return (
      <motion.button
        ref={ref}
        type="button"
        initial="rest"
        whileHover={disabled ? "rest" : "hover"}
        whileTap={disabled ? "rest" : { scale: 0.98 }}
        animate="rest"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "relative flex items-center justify-center overflow-hidden w-full h-10 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer select-none transition-all duration-200",
          isWhite
            ? "bg-white text-[#DC3341] border border-[#EDEDED] shadow-[0px_1px_2px_rgba(0,0,0,0.04)] hover:border-red-200 hover:bg-red-50/50 hover:shadow-[0px_2px_8px_rgba(220,51,65,0.08)]"
            : "bg-[#171717] text-white border border-[#2E2E2F] shadow-sm hover:bg-black",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        {...props}
      >
        {/* Panah Kiri (Muncul saat hover dari sebelah kiri) */}
        <motion.span
          variants={{
            rest: { opacity: 0, x: -10, width: 0, marginRight: 0 },
            hover: { opacity: 1, x: 0, width: "auto", marginRight: 8 },
          }}
          transition={springTransition}
          className="inline-flex items-center justify-center shrink-0 overflow-hidden"
        >
          <FramerArrow />
        </motion.span>

        {/* Label Teks Tombol */}
        <span className="font-semibold tracking-normal text-xs whitespace-nowrap">
          {text}
        </span>

        {/* Panah Kanan (Muncul saat diam, bergeser dan hilang saat hover) */}
        <motion.span
          variants={{
            rest: { opacity: 1, x: 0, width: "auto", marginLeft: 8 },
            hover: { opacity: 0, x: 10, width: 0, marginLeft: 0 },
          }}
          transition={springTransition}
          className="inline-flex items-center justify-center shrink-0 overflow-hidden"
        >
          <FramerArrow />
        </motion.span>
      </motion.button>
    );
  }
);

AnimatedArrowButton.displayName = "AnimatedArrowButton";

export default AnimatedArrowButton;
