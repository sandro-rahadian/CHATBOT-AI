"use client";

import React, { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";

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
      "span.anim-span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration || 0.35,
        delay: stagger(0.015),
      }
    );
  }, [scope.current, words, filter, duration]);

  const renderLines = () => {
    const lines = words.split("\n");

    return lines.map((line, lineIdx) => {
      if (line.trim() === "") {
        return <div key={`empty-${lineIdx}`} className="h-2" />;
      }

      // Tokenize markdown bold (**...**), italic (*...*), inline code (`...`)
      const tokens: { type: "bold" | "italic" | "code" | "text"; content: string }[] = [];
      const regex = /(\*\*(?:[^*]+|\*(?!\*))+\*\*|\*(?:[^*]+)\*|`[^`]+`)/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          tokens.push({ type: "text", content: line.slice(lastIndex, match.index) });
        }
        const raw = match[0];
        if (raw.startsWith("**") && raw.endsWith("**")) {
          tokens.push({ type: "bold", content: raw.slice(2, -2) });
        } else if (raw.startsWith("*") && raw.endsWith("*")) {
          tokens.push({ type: "italic", content: raw.slice(1, -1) });
        } else if (raw.startsWith("`") && raw.endsWith("`")) {
          tokens.push({ type: "code", content: raw.slice(1, -1) });
        }
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < line.length) {
        tokens.push({ type: "text", content: line.slice(lastIndex) });
      }

      return (
        <div key={`line-${lineIdx}`} className="my-0.5 leading-relaxed">
          {tokens.map((token, tokenIdx) => {
            if (token.type === "bold") {
              return (
                <motion.span
                  key={`t-${lineIdx}-${tokenIdx}`}
                  className="anim-span inline font-bold text-white opacity-0"
                  style={{ filter: filter ? "blur(6px)" : "none" }}
                >
                  {token.content}
                </motion.span>
              );
            }

            if (token.type === "italic") {
              return (
                <motion.span
                  key={`t-${lineIdx}-${tokenIdx}`}
                  className="anim-span italic text-[#dbdee1] opacity-0 mx-0.5 inline"
                  style={{ filter: filter ? "blur(6px)" : "none" }}
                >
                  {token.content}
                </motion.span>
              );
            }

            if (token.type === "code") {
              return (
                <motion.span
                  key={`t-${lineIdx}-${tokenIdx}`}
                  className="anim-span font-mono text-xs bg-[#1e1f22] px-1.5 py-0.5 rounded border border-[#383a40] text-[#f2f3f5] opacity-0 inline-block mx-0.5"
                  style={{ filter: filter ? "blur(6px)" : "none" }}
                >
                  {token.content}
                </motion.span>
              );
            }

            // Normal text words
            const parts = token.content.split(/(\s+)/);
            return parts.map((part, partIdx) => {
              if (part === "") return null;
              if (/^\s+$/.test(part)) {
                return <span key={`s-${lineIdx}-${tokenIdx}-${partIdx}`}>{part}</span>;
              }

              return (
                <motion.span
                  key={`w-${lineIdx}-${tokenIdx}-${partIdx}`}
                  className="anim-span opacity-0 inline-block text-[#dbdee1]"
                  style={{ filter: filter ? "blur(6px)" : "none" }}
                >
                  {part}
                </motion.span>
              );
            });
          })}
        </div>
      );
    });
  };

  return (
    <div className={cn("font-normal", className)}>
      <div ref={scope} className={cn("leading-relaxed", textClassName)}>
        {renderLines()}
      </div>
    </div>
  );
};
