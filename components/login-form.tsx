"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Shield, Zap, ArrowRight, ArrowLeft, Loader2, KeyRound } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DEMO_ACCOUNTS = [
  {
    username: "budi_siswa",
    name: "Budi Santoso",
    role: "siswa",
    roleLabel: "Siswa",
    quota: "50 pesan/hari",
    badgeBg: "bg-sky-500/15 text-sky-300 border-sky-500/40",
    desc: "Akses Jurusan, Fasilitas, PPDB & Kontak",
  },
  {
    username: "pak_andi_guru",
    name: "Pak Andi Wijaya",
    role: "guru",
    roleLabel: "Guru",
    quota: "200 pesan/hari",
    badgeBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    desc: "Akses Lengkap + Profil Sekolah & Riset Web",
  },
  {
    username: "admin_utama",
    name: "Admin Sekolah",
    role: "admin",
    roleLabel: "Admin",
    quota: "Unlimited (∞)",
    badgeBg: "bg-purple-500/15 text-purple-300 border-purple-500/40",
    desc: "Akses Penuh Semua Topik Tanpa Batas Kuota",
  },
];

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState<string | null>(null);

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "https://chatbot-ai-production-b22e59af.up.railway.app";

  const performLogin = async (targetUsername: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: targetUsername }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Login gagal (${res.status})`);
      }

      const data = await res.json();
      localStorage.setItem("chat_token", data.token);

      toast.success("Login Berhasil", {
        description: `Selamat datang, ${data.user.username} (${data.user.role}).`,
      });

      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal melakukan login.";
      toast.error("Gagal Masuk", { description: msg });
    } finally {
      setIsLoading(false);
      setLoadingUser(null);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.warning("Username Wajib Diisi", {
        description: "Silakan masukkan username terdaftar Anda.",
      });
      return;
    }
    performLogin(username.trim());
  };

  const handleDemoLogin = (targetUser: string) => {
    setLoadingUser(targetUser);
    performLogin(targetUser);
  };

  const handleGuestLogin = () => {
    localStorage.removeItem("chat_token");
    toast.info("Mode Tamu Aktif", {
      description: "Anda masuk sebagai Guest dengan batas 10 pesan/hari.",
    });
    router.push("/");
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
            Pilih metode login akun demo (RBAC) atau gunakan akun terdaftar
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-2">
          <Tabs defaultValue="demo" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#1e1f22] p-1 rounded-xl mb-4 border border-[#383a40]">
              <TabsTrigger
                value="demo"
                className="text-xs rounded-lg data-[state=active]:bg-[#383a40] data-[state=active]:text-white transition-all font-medium"
              >
                Akun Demo RBAC
              </TabsTrigger>
              <TabsTrigger
                value="manual"
                className="text-xs rounded-lg data-[state=active]:bg-[#383a40] data-[state=active]:text-white transition-all font-medium"
              >
                Masuk Manual
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Akun Demo 1-Click */}
            <TabsContent value="demo" className="space-y-3 pt-1">
              <div className="flex flex-col gap-2.5">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.username}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleDemoLogin(acc.username)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[#1e1f22]/80 hover:bg-[#383a40] border border-[#383a40] hover:border-[#5865f2]/50 transition-all text-left group disabled:opacity-60 cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#2b2d31] flex items-center justify-center text-[#dbdee1] border border-[#3f4147]">
                        {loadingUser === acc.username ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#5865f2]" />
                        ) : (
                          <User className="w-4 h-4 text-[#949ba4] group-hover:text-white transition-colors" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[#f2f3f5] group-hover:text-white">
                            {acc.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full border ${acc.badgeBg}`}
                          >
                            {acc.roleLabel}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-[#949ba4] line-clamp-1">
                          {acc.desc}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pl-2">
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 whitespace-nowrap hidden sm:inline">
                        {acc.quota}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#949ba4] group-hover:translate-x-0.5 group-hover:text-white transition-all" />
                    </div>
                  </button>
                ))}

                {/* Mode Tamu */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleGuestLogin}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-800/40 hover:bg-zinc-800/80 border border-zinc-700/60 transition-all text-left text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-zinc-700/60 flex items-center justify-center text-zinc-300">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-medium text-[#dbdee1]">Mode Tamu (Guest)</span>
                      <p className="text-[10px] text-[#949ba4]">10 pesan/hari tanpa token</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#949ba4]" />
                </button>
              </div>
            </TabsContent>

            {/* Tab 2: Masuk Manual */}
            <TabsContent value="manual" className="pt-1">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <FieldGroup className="space-y-3">
                  <Field>
                    <FieldLabel htmlFor="username" className="text-xs text-[#dbdee1]">
                      Username Akun
                    </FieldLabel>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Contoh: budi_siswa, pak_andi_guru"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-[#1e1f22] border-[#383a40] text-sm text-[#f2f3f5] focus:border-[#5865f2] rounded-xl h-10 px-3"
                      required
                    />
                  </Field>

                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="password" className="text-xs text-[#dbdee1]">
                        Kata Sandi (Opsional)
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
                      "Masuk Sekarang"
                    )}
                  </Button>
                </FieldGroup>
              </form>
            </TabsContent>
          </Tabs>

          {/* Navigation Links */}
          <div className="mt-5 pt-4 border-t border-[#383a40] flex flex-col gap-2.5 text-center text-xs">
            <p className="text-[#949ba4]">
              Belum memiliki akun terdaftar?{" "}
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
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Percakapan Chat
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
