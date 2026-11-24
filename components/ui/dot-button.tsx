"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type DotButtonVariant = "dark" | "light" | "danger" | "danger-light";

export interface DotButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: DotButtonVariant;
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  dotPosition?: "right" | "left";
  href?: string;
}

const transitionConfig = {
  type: "tween" as const,
  ease: [0.09, 0.74, 0.56, 1] as const,
  duration: 0.35,
};

export const DotButton = React.forwardRef<
  HTMLButtonElement,
  DotButtonProps
>(
  (
    {
      children,
      variant = "dark",
      isLoading = false,
      loadingText,
      icon,
      dotPosition = "right",
      className,
      disabled,
      href,
      onClick,
      onMouseEnter,
      onMouseLeave,
      type = "button",
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const isDisabled = disabled || isLoading;

    // Sesuai token Framer Dot Button:
    // https://framer.com/m/Dot-Button-MC30l2.js@tYg8ONT5dYenbwZvkeZJ
    // Dark: normal #171717 bg, white dot -> hover white bg, dark text
    // Light: normal #FAFAFA bg, dark dot -> hover dark bg, white text
    // Danger: normal #171717 bg, red dot -> hover #DC2626 bg, white text
    // Danger-light: normal #FAFAFA bg, red dot -> hover #DC2626 bg, white text
    const getColors = () => {
      switch (variant) {
        case "light":
          return {
            containerBg: "bg-[#FAFAFA] border-[#E5E5E5]",
            hoverBorder: "border-[#171717]",
            textColorRest: "text-[#171717]",
            textColorHover: "text-white",
            dotBgRest: "bg-[#171717]",
            dotBgHover: "bg-[#171717]",
          };
        case "danger":
          return {
            containerBg: "bg-[#171717] border-[#2E2E2F]",
            hoverBorder: "border-[#DC2626]",
            textColorRest: "text-white",
            textColorHover: "text-white",
            dotBgRest: "bg-[#EF4444]",
            dotBgHover: "bg-[#DC2626]",
          };
        case "danger-light":
          return {
            containerBg: "bg-[#FAFAFA] border-[#EDEDED]",
            hoverBorder: "border-[#DC2626]",
            textColorRest: "text-[#171717]",
            textColorHover: "text-white",
            dotBgRest: "bg-[#EF4444]",
            dotBgHover: "bg-[#DC2626]",
          };
        case "dark":
        default:
          return {
            containerBg: "bg-[#171717] border-[#2E2E2F]",
            hoverBorder: "border-[#EDEDED]",
            textColorRest: "text-white",
            textColorHover: "text-[#171717]",
            dotBgRest: "bg-white",
            dotBgHover: "bg-white",
          };
      }
    };

    const colors = getColors();

    const buttonContent = (
      <>
        {/* Expanding Dot Background Animation (Framer Dot Button layout morph) */}
        <motion.span
          layout
          transition={transitionConfig}
          className={cn(
            "rounded-full pointer-events-none",
            isHovered
              ? cn("absolute inset-[-1px] z-0", colors.dotBgHover)
              : cn(
                  "relative z-0 w-[7px] h-[7px] shrink-0",
                  colors.dotBgRest,
                  dotPosition === "right" ? "order-3 ml-2" : "order-1 mr-2"
                )
          )}
        />

        {/* Text and Icon with layout position tracking */}
        <motion.span
          layout
          transition={transitionConfig}
          className={cn(
            "relative z-10 flex items-center justify-center gap-2 pointer-events-none transition-colors duration-200 font-medium tracking-normal",
            isHovered ? colors.textColorHover : colors.textColorRest,
            "order-2"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>{loadingText || children}</span>
            </>
          ) : (
            <>
              {icon && <span className="shrink-0">{icon}</span>}
              <span>{children}</span>
            </>
          )}
        </motion.span>
      </>
    );

    const commonClasses = cn(
      "relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium text-sm select-none transition-colors duration-200 cursor-pointer shadow-xs border",
      colors.containerBg,
      isHovered && colors.hoverBorder,
      isDisabled && "opacity-60 cursor-not-allowed pointer-events-none",
      className
    );

    if (href) {
      return (
        <Link
          href={href}
          onClick={onClick as any}
          onMouseEnter={(e) => {
            if (!isDisabled) setIsHovered(true);
            onMouseEnter?.(e as any);
          }}
          onMouseLeave={(e) => {
            setIsHovered(false);
            onMouseLeave?.(e as any);
          }}
          className={commonClasses}
        >
          {buttonContent}
        </Link>
      );
    }

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        whileTap={isDisabled ? undefined : { scale: 0.985 }}
        onMouseEnter={(e) => {
          if (!isDisabled) setIsHovered(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          onMouseLeave?.(e);
        }}
        onClick={onClick}
        className={commonClasses}
        {...(props as any)}
      >
        {buttonContent}
      </motion.button>
    );
  }
);

DotButton.displayName = "DotButton";
