"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  UserPlus,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const role = "siswa"; // Otomatis terdaftar sebagai siswa
  const [schoolId, setSchoolId] = useState<string>("all");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "https://chatbot-ai-production-b22e59af.up.railway.app";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("Masukkan username unik untuk akun Anda.");
      return;
    }

    if (!password.trim() || password.length < 4) {
      setError("Kata sandi minimal 4 karakter.");
      return;
    }

    setIsLoading(true);
    try {
      const parsedSchoolId = schoolId === "all" ? null : parseInt(schoolId, 10);

      const res = await fetch(`${apiBase}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          role,
          school_id: parsedSchoolId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Pendaftaran gagal (${res.status})`);
      }

      const data = await res.json();
      localStorage.setItem("chat_token", data.token);
      if (data.user) {
        localStorage.setItem("chat_user", JSON.stringify(data.user));
      }

      router.push("/");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan saat pendaftaran.";
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
            Daftar Akun Baru
          </CardTitle>
          <CardDescription className="text-xs text-[#666666]">
            Daftarkan akun siswa untuk mengakses chat asisten dan informasi sekolah
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-2">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium text-center">
                {error}
              </div>
            )}
            <FieldGroup className="space-y-3">
              {/* Nama Lengkap */}
              <Field>
                <FieldLabel htmlFor="fullName" className="text-xs text-[#171717] font-medium">
                  Nama Lengkap
                </FieldLabel>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Contoh: Rian Pratama"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white border border-[#171717] text-sm text-[#171717] focus:border-black focus:ring-1 focus:ring-black placeholder:text-[#8C8C8C] rounded-full h-11 px-4 transition-colors"
                  required
                />
              </Field>

              {/* Username */}
              <Field>
                <FieldLabel htmlFor="signup-username" className="text-xs text-[#171717] font-medium">
                  Username (Untuk Login) *
                </FieldLabel>
                <Input
                  id="signup-username"
                  type="text"
                  placeholder="Contoh: rian_siswa"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white border border-[#171717] text-sm text-[#171717] focus:border-black focus:ring-1 focus:ring-black placeholder:text-[#8C8C8C] rounded-full h-11 px-4 transition-colors"
                  required
                />
              </Field>

              {/* School Isolation Selection */}
              <Field>
                <FieldLabel htmlFor="school-select" className="text-xs text-[#171717] font-medium">
                  Asal Sekolah (Opsional)
                </FieldLabel>
                <Select value={schoolId} onValueChange={setSchoolId}>
                  <SelectTrigger className="w-full bg-white border border-[#171717] text-sm text-[#171717] rounded-full h-11 px-4 focus:border-black focus:ring-1 focus:ring-black transition-colors">
                    <SelectValue placeholder="Pilih sekolah" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-[#171717] text-xs text-[#171717] rounded-xl shadow-xl">
                    <SelectItem value="all" className="cursor-pointer py-2 focus:bg-[#F5F5F5] focus:text-[#171717]">
                      Semua Sekolah (Umum)
                    </SelectItem>
                    <SelectItem value="1" className="cursor-pointer py-2 focus:bg-[#F5F5F5] focus:text-[#171717]">
                      SMK Telkom Malang
                    </SelectItem>
                    <SelectItem value="2" className="cursor-pointer py-2 focus:bg-[#F5F5F5] focus:text-[#171717]">
                      SMKN 4 Malang (Grafika)
                    </SelectItem>
                    <SelectItem value="3" className="cursor-pointer py-2 focus:bg-[#F5F5F5] focus:text-[#171717]">
                      SMKN 5 Malang
                    </SelectItem>
                    <SelectItem value="4" className="cursor-pointer py-2 focus:bg-[#F5F5F5] focus:text-[#171717]">
                      SMKN 3 Malang
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {/* Password Field */}
              <Field>
                <FieldLabel htmlFor="signup-password" className="text-xs text-[#171717] font-medium">
                  Kata Sandi *
                </FieldLabel>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Minimal 4 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border border-[#171717] text-sm text-[#171717] focus:border-black focus:ring-1 focus:ring-black placeholder:text-[#8C8C8C] rounded-full h-11 px-4 transition-colors"
                  required
                />
              </Field>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#171717] hover:bg-black text-white font-medium rounded-full h-11 text-sm border border-[#2E2E2F] shadow-xs hover:border-[#3F3F3F] cursor-pointer transition-colors mt-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
                    Mendaftarkan Akun...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} className="mr-2 text-white" />
                    Daftar Akun Sekarang
                  </>
                )}
              </Button>
            </FieldGroup>
          </form>

          {/* Navigation Links */}
          <div className="mt-5 pt-4 border-t border-[#EDEDED] flex flex-col gap-2.5 text-center text-xs">
            <p className="text-[#666666]">
              Sudah memiliki akun terdaftar?{" "}
              <Link
                href="/login"
                className="text-[#737373] hover:text-[#171717] hover:underline font-semibold"
              >
                Masuk di Sini
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
