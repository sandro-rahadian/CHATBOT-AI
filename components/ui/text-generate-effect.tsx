"use client";

import React, { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";

type InlineToken =
  | { type: "bold"; content: string }
  | { type: "italic"; content: string }
  | { type: "code"; content: string }
  | { type: "link"; text: string; href: string }
  | { type: "text"; content: string };

function parseInlineTokens(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  // Regex matches:
  // 1. Markdown link: [text](url)
  // 2. Bold: **text**
  // 3. Italic: *text* (bukan ** atau bullet list)
  // 4. Inline code: `text`
  // 5. Raw URL: https://... or http://...
  const pattern =
    /(\[[^\]]+\]\([^\)]+\)|\*\*(?:[^*]+|\*(?!\*))+\*\*|\*(?:[^*]+)\*|`[^`]+`|https?:\/\/[^\s<)]+)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }

    const raw = match[0];
    if (raw.startsWith("[") && raw.includes("](") && raw.endsWith(")")) {
      const closeBracket = raw.indexOf("](");
      const linkText = raw.slice(1, closeBracket);
      const linkHref = raw.slice(closeBracket + 2, -1);
      tokens.push({ type: "link", text: linkText, href: linkHref });
    } else if (raw.startsWith("**") && raw.endsWith("**")) {
      tokens.push({ type: "bold", content: raw.slice(2, -2) });
    } else if (raw.startsWith("*") && raw.endsWith("*") && raw.length > 2) {
      tokens.push({ type: "italic", content: raw.slice(1, -1) });
    } else if (raw.startsWith("`") && raw.endsWith("`")) {
      tokens.push({ type: "code", content: raw.slice(1, -1) });
    } else if (raw.startsWith("http://") || raw.startsWith("https://")) {
      tokens.push({ type: "link", text: raw, href: raw });
    } else {
      tokens.push({ type: "text", content: raw });
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: "text", content: text.slice(lastIndex) });
  }

  return tokens;
}

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
        delay: stagger(0.012),
      }
    );
  }, [scope.current, words, filter, duration]);

  const renderLines = () => {
    const rawLines = words.split("\n");

    return rawLines.map((line, lineIdx) => {
      const trimmed = line.trim();

      // Empty line -> vertical spacer
      if (trimmed === "") {
        return <div key={`empty-${lineIdx}`} className="h-2.5" />;
      }

      // Check for bullet lists (* item, - item)
      const bulletMatch = line.match(/^(\s*)([-*•]|\d+\.)\s+(.+)$/);
      const isBullet = !!bulletMatch;
      const bulletPrefix = bulletMatch ? bulletMatch[2] : null;
      const contentToParse = bulletMatch ? bulletMatch[3] : line;

      const tokens = parseInlineTokens(contentToParse);

      const renderedTokens = tokens.map((token, tokenIdx) => {
        if (token.type === "bold") {
          return (
            <motion.strong
              key={`b-${lineIdx}-${tokenIdx}`}
              className="anim-span font-semibold text-white opacity-0 inline mr-0.5"
              style={{ filter: filter ? "blur(4px)" : "none" }}
            >
              {token.content}
            </motion.strong>
          );
        }

        if (token.type === "italic") {
          return (
            <motion.em
              key={`i-${lineIdx}-${tokenIdx}`}
              className="anim-span italic text-[#e3e5e8] opacity-0 inline mr-0.5"
              style={{ filter: filter ? "blur(4px)" : "none" }}
            >
              {token.content}
            </motion.em>
          );
        }

        if (token.type === "code") {
          return (
            <motion.code
              key={`c-${lineIdx}-${tokenIdx}`}
              className="anim-span font-mono text-xs bg-[#1e1f22] px-1.5 py-0.5 rounded border border-[#383a40] text-[#5865f2] dark:text-[#a5b4fc] opacity-0 inline mx-0.5"
              style={{ filter: filter ? "blur(4px)" : "none" }}
            >
              {token.content}
            </motion.code>
          );
        }

        if (token.type === "link") {
          return (
            <motion.a
              key={`l-${lineIdx}-${tokenIdx}`}
              href={token.href}
              target="_blank"
              rel="noopener noreferrer"
              className="anim-span text-[#00a8fc] hover:text-[#58bbf8] hover:underline font-medium underline-offset-2 opacity-0 inline break-all mx-0.5 cursor-pointer"
              style={{ filter: filter ? "blur(4px)" : "none" }}
            >
              {token.text}
            </motion.a>
          );
        }

        // Regular text words
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
              style={{ filter: filter ? "blur(4px)" : "none" }}
            >
              {part}
            </motion.span>
          );
        });
      });

      if (isBullet) {
        return (
          <div
            key={`line-${lineIdx}`}
            className="flex items-start gap-2 my-1 leading-relaxed pl-2 sm:pl-3"
          >
            <motion.span
              className="anim-span opacity-0 text-[#949ba4] font-bold select-none shrink-0 text-sm mt-[1px]"
              style={{ filter: filter ? "blur(4px)" : "none" }}
            >
              {bulletPrefix?.endsWith(".") ? bulletPrefix : "•"}
            </motion.span>
            <div className="flex-1">{renderedTokens}</div>
          </div>
        );
      }

      return (
        <div key={`line-${lineIdx}`} className="my-1 leading-relaxed">
          {renderedTokens}
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
