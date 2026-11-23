"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  LogIn,
  ArrowLeft,
} from "@/components/ui/icons";
import { toast } from "sonner";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "https://chatbot-ai-production-b22e59af.up.railway.app";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.warning("Username Wajib Diisi", {
        description: "Silakan masukkan username akun Anda.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Login gagal (${res.status})`);
      }

      const data = await res.json();
      localStorage.setItem("chat_token", data.token);

      toast.success("Login Berhasil", {
        description: `Selamat datang kembali, ${data.user.username} (${data.user.role}).`,
      });

      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal masuk ke akun.";
      toast.error("Gagal Masuk", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-[#2E2E2F] bg-[#141515] shadow-2xl text-[#FFFFFF] rounded-[10px] overflow-hidden">
        {/* Header Branding */}
        <CardHeader className="text-center pb-2 pt-6">
          <div className="mx-auto mb-3 flex items-center justify-center gap-3">
            <div className="w-11 h-11 rounded-[6px] border border-[#2E2E2F] bg-[#1E1F1F] flex items-center justify-center shadow-md">
              <Image
                src="/logo.png"
                alt="KeraVokasi"
                width={36}
                height={36}
                className="rounded-[4px] object-cover"
                priority
              />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold tracking-tight text-[#FFFFFF]">
                KeraVokasi
              </h2>
              <p className="text-xs text-[#B3B2B2]">Asisten AI SMK Malang</p>
            </div>
          </div>
          <CardTitle className="text-base font-semibold text-[#FFFFFF]">
            Masuk ke Akun Anda
          </CardTitle>
          <CardDescription className="text-xs text-[#B3B2B2]">
            Masukkan username dan kata sandi akun Anda untuk mulai chat
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-2">
          <form onSubmit={handleLogin} className="space-y-4">
            <FieldGroup className="space-y-3">
              <Field>
                <FieldLabel htmlFor="username" className="text-xs text-[#E0E0E0]">
                  Username
                </FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="Contoh: budi_siswa / username Anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-[#0A0A0B] border-[#2E2E2F] text-sm text-[#FFFFFF] focus:border-[#FFFFFF] placeholder:text-[#5F5C5D] rounded-[6px] h-10 px-3"
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password" className="text-xs text-[#E0E0E0]">
                    Kata Sandi
                  </FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#0A0A0B] border-[#2E2E2F] text-sm text-[#FFFFFF] focus:border-[#FFFFFF] placeholder:text-[#5F5C5D] rounded-[6px] h-10 px-3"
                />
              </Field>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FFFFFF] hover:bg-[#F0F0F0] text-[#0A0A0B] font-semibold rounded-[6px] h-10 text-xs shadow-xs cursor-pointer transition-all mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#0A0A0B]" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <LogIn size={16} className="mr-2 text-[#0A0A0B]" />
                    Masuk Sekarang
                  </>
                )}
              </Button>
            </FieldGroup>
          </form>

          {/* Navigation Links */}
          <div className="mt-5 pt-4 border-t border-[#2E2E2F] flex flex-col gap-2.5 text-center text-xs">
            <p className="text-[#B3B2B2]">
              Belum memiliki akun?{" "}
              <Link
                href="/signup"
                className="text-[#FFFFFF] hover:underline font-semibold"
              >
                Daftar Akun Baru
              </Link>
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 text-[#B3B2B2] hover:text-[#FFFFFF] transition-colors pt-1"
            >
              <ArrowLeft size={14} />
              Kembali ke Halaman Utama
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
