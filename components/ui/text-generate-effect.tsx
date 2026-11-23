"use client";

import React, { useEffect, useMemo } from "react";
import { motion, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Otomatis mendeteksi nomor handphone/WhatsApp (08xxx) dan telepon kantor (0341-xxx / (0341) xxx)
 * lalu mengubahnya menjadi tautan markdown yang bisa langsung diklik.
 */
function autoLinkContactsAndUrls(text: string): string {
  if (!text) return "";

  // 1. Deteksi nomor HP / WhatsApp (08xx-xxxx-xxxx atau +628xx...)
  const waRegex = /(?:(?:\+62|62|0)8[0-9]{1,2}[ -]?[0-9]{3,4}[ -]?[0-9]{3,5})/g;
  let formatted = text.replace(waRegex, (match, offset, str) => {
    // Hindari jika sudah berada di dalam tag markdown link [label](...)
    const before = str.slice(Math.max(0, offset - 10), offset);
    if (before.includes("](") || before.includes("href=") || before.includes("wa.me/")) return match;
    const digits = match.replace(/[^0-9]/g, "");
    const waNumber = digits.startsWith("0") ? "62" + digits.slice(1) : digits;
    return `[${match}](https://wa.me/${waNumber})`;
  });

  // 2. Deteksi nomor telepon kantor seperti (0341) 478195 atau 0341-353798
  const telRegex = /(?:\(?0[2-9][0-9]{1,2}\)?[ -]?[0-9]{5,8})/g;
  formatted = formatted.replace(telRegex, (match, offset, str) => {
    const before = str.slice(Math.max(0, offset - 10), offset);
    if (before.includes("](") || before.includes("tel:") || before.includes("wa.me/")) return match;
    const digits = match.replace(/[^0-9]/g, "");
    if (digits.length < 6) return match;
    const telNumber = digits.startsWith("0") ? "+62" + digits.slice(1) : "+62" + digits;
    return `[${match}](tel:${telNumber})`;
  });

  return formatted;
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

  const processedContent = useMemo(() => {
    return autoLinkContactsAndUrls(words);
  }, [words]);

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
          remarkPlugins={[remarkGfm]}
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
            a: ({ href, children }) => {
              const isTel = href?.startsWith("tel:");
              const isWa = href?.includes("wa.me");

              return (
                <a
                  href={href}
                  target={isTel ? undefined : "_blank"}
                  rel={isTel ? undefined : "noopener noreferrer"}
                  className="inline-flex items-center gap-1 font-medium text-[#FFFFFF] hover:text-[#E0E0E0] underline underline-offset-4 decoration-[#5F5C5D] hover:decoration-[#FFFFFF] transition-colors cursor-pointer break-all"
                >
                  {children}
                </a>
              );
            },
            code: ({ children }) => (
              <code className="font-mono text-xs bg-[#1E1F1F] text-[#FFFFFF] px-1.5 py-0.5 rounded-[4px] border border-[#2E2E2F]">
                {children}
              </code>
            ),
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </motion.div>
    </div>
  );
};
