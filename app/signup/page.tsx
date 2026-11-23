import type { Metadata } from "next";
import { SignupForm } from "@/components/signup-form";

export const metadata: Metadata = {
  title: "Daftar Akun Baru | KeraVokasi",
  description: "Daftar akun siswa atau guru untuk mendapatkan kuota dan akses informasi SMK di Malang",
};

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 sm:p-8 bg-[#FAFAFA] text-[#171717] overflow-hidden">
      <div className="relative z-10 w-full max-w-md">
        <SignupForm />
      </div>
    </div>
  );
}
