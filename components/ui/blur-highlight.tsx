"use client";

import React, { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";

interface BlurHighlightProps {
  text: string;
  className?: string;
  highlightWords?: string[];
  filter?: boolean;
  duration?: number;
  highlightClassName?: string;
}

export function BlurHighlight({
  text,
  className,
  highlightWords = [],
  filter = true,
  duration = 0.5,
  highlightClassName,
}: BlurHighlightProps) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (!scope.current) return;
    animate(
      "span.blur-word",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration || 0.5,
        delay: stagger(0.03),
      }
    );
  }, [scope.current, text, filter, duration]);

  // Tokenize text into words and check if matching highlightWords or markdown **bold**
  const renderContent = () => {
    const lines = text.split("\n");

    return lines.map((line, lineIdx) => {
      if (line.trim() === "") {
        return <div key={`empty-${lineIdx}`} className="h-3" />;
      }

      // Regex matches **bold**, *italic*, `code`, or general words
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
                  key={`token-${lineIdx}-${tokenIdx}`}
                  className={cn(
                    "blur-word inline-block font-semibold px-2 py-0.5 my-0.5 rounded-lg text-white opacity-0",
                    "bg-[#b8292e]/25 border border-[#b8292e]/50 shadow-[0_0_16px_rgba(184,41,46,0.35)]",
                    highlightClassName
                  )}
                  style={{
                    filter: filter ? "blur(8px)" : "none",
                  }}
                >
                  {token.content}
                </motion.span>
              );
            }

            if (token.type === "italic") {
              return (
                <motion.span
                  key={`token-${lineIdx}-${tokenIdx}`}
                  className="blur-word italic text-[#e4e4e7] opacity-0 mx-0.5 inline-block"
                  style={{ filter: filter ? "blur(8px)" : "none" }}
                >
                  {token.content}
                </motion.span>
              );
            }

            if (token.type === "code") {
              return (
                <motion.span
                  key={`token-${lineIdx}-${tokenIdx}`}
                  className="blur-word font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded border border-white/15 text-[#fca5a5] opacity-0 inline-block mx-0.5"
                  style={{ filter: filter ? "blur(8px)" : "none" }}
                >
                  {token.content}
                </motion.span>
              );
            }

            // Normal text: split by whitespace to animate word by word
            const parts = token.content.split(/(\s+)/);
            return parts.map((part, partIdx) => {
              if (part === "") return null;
              if (/^\s+$/.test(part)) {
                return <span key={`space-${lineIdx}-${tokenIdx}-${partIdx}`}>{part}</span>;
              }

              // Check if part is in highlightWords
              const isHighlighted = highlightWords.some(
                (hw) => hw.toLowerCase() === part.toLowerCase()
              );

              if (isHighlighted) {
                return (
                  <motion.span
                    key={`part-${lineIdx}-${tokenIdx}-${partIdx}`}
                    className={cn(
                      "blur-word font-semibold text-white px-1.5 py-0.5 rounded bg-[#b8292e]/20 border border-[#b8292e]/40 shadow-[0_0_10px_rgba(184,41,46,0.3)] opacity-0 inline-block mx-0.5",
                      highlightClassName
                    )}
                    style={{ filter: filter ? "blur(8px)" : "none" }}
                  >
                    {part}
                  </motion.span>
                );
              }

              return (
                <motion.span
                  key={`part-${lineIdx}-${tokenIdx}-${partIdx}`}
                  className="blur-word opacity-0 inline-block"
                  style={{ filter: filter ? "blur(8px)" : "none" }}
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
    <div ref={scope} className={cn("text-sm sm:text-[15px] leading-relaxed", className)}>
      {renderContent()}
    </div>
  );
}
