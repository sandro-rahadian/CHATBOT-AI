import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KeraVokasi | Asisten AI SMK Malang",
  description: "Asisten AI resmi seputar sekolah kejuruan SMK di Malang",
  icons: {
    icon: [
      { url: "/logo.png?v=2", type: "image/png" },
      { url: "/favicon.ico?v=2" },
    ],
    apple: [
      { url: "/apple-icon.png?v=2" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#313338] text-[#dbdee1]">
        <TooltipProvider>
          {children}
          <Toaster richColors position="top-center" theme="dark" />
        </TooltipProvider>
      </body>
    </html>
  );
}
