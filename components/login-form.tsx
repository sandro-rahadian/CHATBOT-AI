"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  User,
  Lock,
  LogIn,
  ArrowRight,
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
  FieldDescription,
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
      <Card className="border-[#3f4147] bg-[#2b2d31] shadow-2xl text-[#dbdee1] rounded-2xl overflow-hidden">
        {/* Header Branding */}
        <CardHeader className="text-center pb-2 pt-6">
          <div className="mx-auto mb-3 flex items-center justify-center gap-3">
            <Image
              src="/logo.png"
              alt="KeraVokasi"
              width={42}
              height={42}
              className="rounded-full border border-[#4e5058] shadow-md object-cover"
              priority
            />
            <div className="text-left">
              <h2 className="text-xl font-bold tracking-tight text-[#f2f3f5]">
                KeraVokasi
              </h2>
              <p className="text-xs text-[#949ba4]">Asisten AI SMK Malang</p>
            </div>
          </div>
          <CardTitle className="text-base font-semibold text-[#f2f3f5]">
            Masuk ke Akun Anda
          </CardTitle>
          <CardDescription className="text-xs text-[#949ba4]">
            Masukkan username dan kata sandi akun Anda untuk mulai chat
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-2">
          <form onSubmit={handleLogin} className="space-y-4">
            <FieldGroup className="space-y-3">
              <Field>
                <FieldLabel htmlFor="username" className="text-xs text-[#dbdee1]">
                  Username
                </FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="Contoh: budi_siswa / username Anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-[#1e1f22] border-[#383a40] text-sm text-[#f2f3f5] focus:border-[#5865f2] rounded-xl h-10 px-3"
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password" className="text-xs text-[#dbdee1]">
                    Kata Sandi
                  </FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#1e1f22] border-[#383a40] text-sm text-[#f2f3f5] focus:border-[#5865f2] rounded-xl h-10 px-3"
                />
              </Field>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold rounded-xl h-10 text-xs shadow-md cursor-pointer transition-all mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <LogIn size={16} className="mr-2" />
                    Masuk Sekarang
                  </>
                )}
              </Button>
            </FieldGroup>
          </form>

          {/* Navigation Links */}
          <div className="mt-5 pt-4 border-t border-[#383a40] flex flex-col gap-2.5 text-center text-xs">
            <p className="text-[#949ba4]">
              Belum memiliki akun?{" "}
              <Link
                href="/signup"
                className="text-[#5865f2] hover:underline font-semibold"
              >
                Daftar Akun Baru
              </Link>
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 text-[#949ba4] hover:text-[#f2f3f5] transition-colors pt-1"
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
