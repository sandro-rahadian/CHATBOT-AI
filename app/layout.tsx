import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moka — Moklet Assistant | Asisten AI Resmi SMK Telkom Malang",
  description:
    "Beyond Smart. Beyond Fast. Temui Moka, asisten AI resmi SMK Telkom Malang ditenagai basis data terverifikasi dan Google Gemini.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} dark scroll-smooth h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#07080a] text-[#f2f3f5] selection:bg-[#e30613]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
