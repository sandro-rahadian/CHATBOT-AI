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
  href?: string;
  expandOrigin?: "center" | "right" | "left";
}

const transitionConfig = {
  type: "tween" as const,
  ease: [0.09, 0.74, 0.56, 1] as const,
  duration: 0.32,
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
      expandOrigin = "center",
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

    // Sesuai DESIGN.md: Monochrome palette & Framer expanding hover animation
    // TANPA titik di rest/idle state (hanya ekspansi warna halus saat di-hover)
    const getColors = () => {
      switch (variant) {
        case "danger":
          return {
            containerBg: "bg-[#171717] border-[#2E2E2F]",
            hoverBorder: "border-[#DC2626]",
            hoverFill: "bg-[#DC2626]",
            textColorRest: "text-white",
            textColorHover: "text-white",
          };
        case "danger-light":
          return {
            containerBg: "bg-white border-[#EDEDED]",
            hoverBorder: "border-[#DC2626]",
            hoverFill: "bg-[#DC2626]",
            textColorRest: "text-[#DC2626]",
            textColorHover: "text-white",
          };
        case "light":
          return {
            containerBg: "bg-white border-[#EDEDED]",
            hoverBorder: "border-[#171717]",
            hoverFill: "bg-[#171717]",
            textColorRest: "text-[#171717]",
            textColorHover: "text-white",
          };
        case "dark":
        default:
          return {
            containerBg: "bg-[#171717] border-[#2E2E2F]",
            hoverBorder: "border-[#EDEDED]",
            hoverFill: "bg-white",
            textColorRest: "text-white",
            textColorHover: "text-[#171717]",
          };
      }
    };

    const colors = getColors();

    const originStyle =
      expandOrigin === "right"
        ? "90% 50%"
        : expandOrigin === "left"
        ? "10% 50%"
        : "center";

    const buttonContent = (
      <>
        {/* Expanding Background Fill on Hover (Tanpa titik di idle state!) */}
        <motion.span
          initial={false}
          animate={
            isHovered
              ? { scale: 1, opacity: 1 }
              : { scale: 0, opacity: 0 }
          }
          transition={transitionConfig}
          style={{ transformOrigin: originStyle }}
          className={cn(
            "absolute inset-0 rounded-full z-0 pointer-events-none",
            colors.hoverFill
          )}
        />

        {/* Text and Icon with smooth color transition */}
        <span
          className={cn(
            "relative z-10 flex items-center justify-center gap-2 pointer-events-none transition-colors duration-200 font-medium tracking-normal",
            isHovered ? colors.textColorHover : colors.textColorRest
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
        </span>
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
export default DotButton;
