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
  const [error, setError] = useState<string | null>(null);

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "https://chatbot-ai-production-b22e59af.up.railway.app";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("Silakan masukkan username akun Anda.");
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
      if (data.user) {
        localStorage.setItem("chat_user", JSON.stringify(data.user));
      }

      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal masuk ke akun.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-[#EDEDED] bg-white shadow-xl text-[#171717] rounded-2xl overflow-hidden">
        {/* Header Branding */}
        <CardHeader className="text-center pb-2 pt-6">
          <div className="mx-auto mb-3 flex items-center justify-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
              <Image
                src="/logo-v2.png"
                alt="KeraVokasi"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
                unoptimized
              />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold tracking-tight text-[#171717]">
                KeraVokasi
              </h2>
            </div>
          </div>
          <CardTitle className="text-base font-semibold text-[#171717]">
            Masuk ke Akun Anda
          </CardTitle>
          <CardDescription className="text-xs text-[#666666]">
            Masukkan username dan kata sandi akun Anda untuk mulai chat
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-2">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium text-center">
                {error}
              </div>
            )}
            <FieldGroup className="space-y-3">
              <Field>
                <FieldLabel htmlFor="username" className="text-xs text-[#171717] font-medium">
                  Username
                </FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="Contoh: budi_siswa / username Anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white border border-[#171717] text-sm text-[#171717] focus:border-black focus:ring-1 focus:ring-black placeholder:text-[#8C8C8C] rounded-full h-11 px-4 transition-colors"
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password" className="text-xs text-[#171717] font-medium">
                    Kata Sandi
                  </FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border border-[#171717] text-sm text-[#171717] focus:border-black focus:ring-1 focus:ring-black placeholder:text-[#8C8C8C] rounded-full h-11 px-4 transition-colors"
                />
              </Field>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#171717] hover:bg-black text-white font-medium rounded-full h-11 text-sm border border-[#171717] shadow-none cursor-pointer transition-colors mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <LogIn size={16} className="mr-2 text-white" />
                    Masuk Sekarang
                  </>
                )}
              </Button>
            </FieldGroup>
          </form>

          {/* Navigation Links */}
          <div className="mt-5 pt-4 border-t border-[#EDEDED] flex flex-col gap-2.5 text-center text-xs">
            <p className="text-[#666666]">
              Belum memiliki akun?{" "}
              <Link
                href="/signup"
                className="text-[#737373] hover:text-[#171717] hover:underline font-semibold"
              >
                Daftar Akun Baru
              </Link>
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 text-[#666666] hover:text-[#171717] transition-colors pt-1"
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
