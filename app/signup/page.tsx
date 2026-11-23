import type { Metadata } from "next";
import { SignupForm } from "@/components/signup-form";

export const metadata: Metadata = {
  title: "Daftar Akun Baru | KeraVokasi",
  description: "Daftar akun siswa atau guru untuk mendapatkan kuota dan akses informasi SMK di Malang",
};

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 sm:p-8 bg-[#0A0A0B] text-[#FFFFFF] overflow-hidden">
      {/* Subtle monochrome ambient background */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <SignupForm />
      </div>
    </div>
  );
}
