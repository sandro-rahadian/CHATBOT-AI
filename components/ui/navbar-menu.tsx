"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const transition = {
  type: "spring" as const,
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative">
      <motion.p
        transition={{ duration: 0.3 }}
        className={cn(
          "cursor-pointer text-sm font-medium transition-colors select-none",
          active === item ? "text-white" : "text-[#dbdee1] hover:text-white"
        )}
      >
        {item}
      </motion.p>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-2 z-50">
              <motion.div
                transition={transition}
                layoutId="active"
                className="bg-[#1E1F1F]/95 backdrop-blur-xl rounded-2xl overflow-hidden border border-[#2E2E2F] shadow-2xl shadow-black/80"
              >
                <motion.div layout className="w-max max-w-sm sm:max-w-md h-full p-4">
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
  className,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className={cn(
        "relative rounded-full border border-[#2E2E2F] bg-[#1E1F1F]/85 backdrop-blur-xl shadow-lg shadow-black/50 flex items-center justify-between px-6 py-2.5",
        className
      )}
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
  onClick,
}: {
  title: string;
  description: string;
  href?: string;
  src?: string;
  onClick?: () => void;
}) => {
  const content = (
    <div
      onClick={onClick}
      className="flex space-x-3 cursor-pointer group p-2 rounded-xl hover:bg-white/5 transition-colors"
    >
      {src && (
        <img
          src={src}
          width={100}
          height={60}
          alt={title}
          className="shrink-0 rounded-lg shadow-lg object-cover w-20 h-14 border border-white/10"
        />
      )}
      <div>
        <h4 className="text-sm font-semibold mb-1 text-white group-hover:text-[#f87171] transition-colors">
          {title}
        </h4>
        <p className="text-[#949ba4] text-xs max-w-[14rem] line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return content;
};

export const HoveredLink = ({
  children,
  className,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode }) => {
  return (
    <a
      {...rest}
      className={cn(
        "text-xs text-[#949ba4] hover:text-white transition-colors cursor-pointer block py-1",
        className
      )}
    >
      {children}
    </a>
  );
};
