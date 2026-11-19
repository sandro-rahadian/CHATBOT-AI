"use client";

import React, { useEffect } from "react";
import { motion, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.35,
  textClassName,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
  textClassName?: string;
}) => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (!scope.current) return;
    animate(
      scope.current,
      {
        opacity: [0, 1],
        y: [4, 0],
        filter: filter ? ["blur(4px)", "blur(0px)"] : "none",
      },
      {
        duration: duration || 0.35,
        ease: "easeOut",
      }
    );
  }, [words, filter, duration]);

  return (
    <div className={cn("font-normal text-sm leading-relaxed", className)}>
      <motion.div
        ref={scope}
        className={cn(
          "leading-relaxed text-[#dbdee1] flex flex-col gap-2.5",
          textClassName
        )}
      >
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p className="my-0.5 leading-relaxed text-[#dbdee1] break-words">
                {children}
              </p>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-white tracking-wide">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic text-[#e3e5e8]">{children}</em>
            ),
            h1: ({ children }) => (
              <h1 className="text-base font-bold text-white mt-2 mb-1">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-sm font-bold text-white mt-1.5 mb-1">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm font-semibold text-white mt-1 mb-0.5">
                {children}
              </h3>
            ),
            ul: ({ children }) => (
              <ul className="my-1 pl-4 space-y-1 list-disc list-outside marker:text-[#949ba4]">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="my-1 pl-4 space-y-1 list-decimal list-outside marker:text-[#949ba4]">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed pl-0.5 text-[#dbdee1]">
                {children}
              </li>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00a8fc] hover:text-[#58bbf8] underline underline-offset-2 hover:underline transition-colors cursor-pointer break-all font-medium"
              >
                {children}
              </a>
            ),
            code: ({ children }) => (
              <code className="font-mono text-xs bg-[#1e1f22] text-[#f2f3f5] px-1.5 py-0.5 rounded border border-[#383a40]">
                {children}
              </code>
            ),
          }}
        >
          {words}
        </ReactMarkdown>
      </motion.div>
    </div>
  );
};
