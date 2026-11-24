import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PreloaderLoadScreen } from "@/components/ui/preloader-load-screen";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KeraVokasi",
  description: "Asisten AI resmi seputar sekolah kejuruan SMK di Malang",
  icons: {
    icon: [
      { url: "/logo-v2.png", type: "image/png" },
      { url: "/favicon.ico?v=4" },
    ],
    apple: [
      { url: "/apple-icon.png?v=4" },
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAFAFA] text-[#171717]">
        <PreloaderLoadScreen />
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
