"use client";

import React, { useEffect, useMemo } from "react";
import { motion, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Normalisasi format markdown dan otomatis mendeteksi kontak/tautan:
 * 1. Menyeragamkan bullet unicode (•, ●, ○) menjadi standard markdown '-'
 * 2. Menghilangkan jarak kosong ganda (loose list double newlines) antar item bullet & numbered list
 * 3. Mencegah whitespace berlebihan (> 2 newlines)
 * 4. Mengubah nomor telepon & WhatsApp menjadi link interaktif
 */
function normalizeAndAutoLinkContent(text: string): string {
  if (!text) return "";
  let formatted = text;

  // 1. Seragamkan bullet unicode (•, ●, ○) di awal baris menjadi standard markdown hyphen (-)
  formatted = formatted.replace(/^[ \t]*[•●○][ \t]*/gm, "- ");

  // 2. Rapatkan butir-butir bullet list yang dipisahkan baris kosong (loose list -> tight list)
  formatted = formatted.replace(/(^[-*]\s+[^\n]+)\n\n+(?=[-*]\s+)/gm, "$1\n");

  // 3. Rapatkan butir-butir numbered list yang dipisahkan baris kosong
  formatted = formatted.replace(/(^\d+\.\s+[^\n]+)\n\n+(?=\d+\.\s+)/gm, "$1\n");

  // 4. Batasi newline beruntun maksimal 2 (\n\n)
  formatted = formatted.replace(/\n{3,}/g, "\n\n");

  // 5. Deteksi nomor HP / WhatsApp (08xx-xxxx-xxxx atau +628xx...)
  const waRegex = /(?:(?:\+62|62|0)8[0-9]{1,2}[ -]?[0-9]{3,4}[ -]?[0-9]{3,5})/g;
  formatted = formatted.replace(waRegex, (match, offset, str) => {
    // Hindari jika sudah berada di dalam tag markdown link [label](...)
    const before = str.slice(Math.max(0, offset - 10), offset);
    if (before.includes("](") || before.includes("href=") || before.includes("wa.me/")) return match;
    const digits = match.replace(/[^0-9]/g, "");
    const waNumber = digits.startsWith("0") ? "62" + digits.slice(1) : digits;
    return `[${match}](https://wa.me/${waNumber})`;
  });

  // 6. Deteksi nomor telepon kantor seperti (0341) 478195 atau 0341-353798
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
    return normalizeAndAutoLinkContent(words);
  }, [words]);

  return (
    <div className={cn("font-normal text-sm leading-relaxed", className)}>
      <motion.div
        ref={scope}
        className={cn(
          "leading-relaxed text-[#171717] flex flex-col gap-2.5",
          textClassName
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p className="my-0.5 leading-relaxed text-[#171717] break-words">
                {children}
              </p>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-[#171717] tracking-normal">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic text-[#404040]">{children}</em>
            ),
            h1: ({ children }) => (
              <h1 className="text-base font-bold text-[#171717] mt-2 mb-1">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-sm font-bold text-[#171717] mt-1.5 mb-1">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm font-semibold text-[#171717] mt-1 mb-0.5">
                {children}
              </h3>
            ),
            ul: ({ children }) => (
              <ul className="my-1 pl-4 space-y-1 list-disc list-outside marker:text-[#737373]">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="my-1 pl-4 space-y-1 list-decimal list-outside marker:text-[#737373]">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed pl-0.5 text-[#171717]">
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
                  className="inline-flex items-center gap-1 font-medium text-[#171717] hover:text-black underline underline-offset-4 decoration-[#737373] hover:decoration-[#171717] transition-colors cursor-pointer break-all"
                >
                  {children}
                </a>
              );
            },
            code: ({ children }) => (
              <code className="font-mono text-xs bg-[#F5F5F5] text-[#171717] px-1.5 py-0.5 rounded-[4px] border border-[#E5E5E5]">
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
