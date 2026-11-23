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
      <Card className="border-[#EDEDED] bg-white shadow-xl text-[#171717] rounded-2xl overflow-hidden">
        {/* Header Branding */}
        <CardHeader className="text-center pb-2 pt-6">
          <div className="mx-auto mb-3 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center overflow-hidden">
              <Image
                src="/minimax-assets/apple-touch_v2ae52.png"
                alt="KeraVokasi"
                width={36}
                height={36}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold tracking-tight text-[#171717]">
                KeraVokasi
              </h2>
              <p className="text-xs text-[#666666]">Asisten AI SMK Malang</p>
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
                  className="bg-[#FAFAFA] border-[#EDEDED] text-sm text-[#171717] focus:border-[#171717] placeholder:text-[#949494] rounded-lg h-10 px-3"
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
                  className="bg-[#FAFAFA] border-[#EDEDED] text-sm text-[#171717] focus:border-[#171717] placeholder:text-[#949494] rounded-lg h-10 px-3"
                />
              </Field>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#171717] hover:bg-black text-white font-semibold rounded-lg h-10 text-xs shadow-xs cursor-pointer transition-all mt-2"
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
                className="text-[#171717] hover:underline font-semibold"
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
