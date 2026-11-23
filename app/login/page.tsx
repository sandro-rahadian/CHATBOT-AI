import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Masuk ke KeraVokasi | Asisten AI SMK Malang",
  description: "Halaman login pengguna dan demonstrasi role akses (RBAC)",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 sm:p-8 bg-[#FAFAFA] text-[#171717] overflow-hidden">
      <div className="relative z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
