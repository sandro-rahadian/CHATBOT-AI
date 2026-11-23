"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  User,
  UserPlus,
  ArrowLeft,
  School,
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
import { Badge } from "@/components/ui/badge";
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
  const [role, setRole] = useState<"siswa" | "guru">("siswa");
  const [schoolId, setSchoolId] = useState<string>("all");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "https://chatbot-ai-production-b22e59af.up.railway.app";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.warning("Username Wajib Diisi", {
        description: "Masukkan username unik untuk akun Anda.",
      });
      return;
    }

    if (!password.trim() || password.length < 4) {
      toast.warning("Kata Sandi Terlalu Pendek", {
        description: "Kata sandi minimal 4 karakter.",
      });
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

      toast.success("Pendaftaran Berhasil!", {
        description: `Akun ${data.user.username} (${data.user.role}) aktif. Silakan mulai menggunakan chatbot.`,
      });

      router.push("/");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan saat pendaftaran.";
      toast.error("Gagal Mendaftar", { description: msg });
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
            Daftar Akun Baru
          </CardTitle>
          <CardDescription className="text-xs text-[#949ba4]">
            Daftarkan akun untuk mendapatkan akses chat dan kuota harian
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-2">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <FieldGroup className="space-y-3">
              {/* Nama Lengkap */}
              <Field>
                <FieldLabel htmlFor="fullName" className="text-xs text-[#dbdee1]">
                  Nama Lengkap
                </FieldLabel>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Contoh: Rian Pratama"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-[#1e1f22] border-[#383a40] text-sm text-[#f2f3f5] focus:border-[#5865f2] rounded-xl h-10 px-3"
                  required
                />
              </Field>

              {/* Username */}
              <Field>
                <FieldLabel htmlFor="signup-username" className="text-xs text-[#dbdee1]">
                  Username (Untuk Login) *
                </FieldLabel>
                <Input
                  id="signup-username"
                  type="text"
                  placeholder="Contoh: rian_siswa"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-[#1e1f22] border-[#383a40] text-sm text-[#f2f3f5] focus:border-[#5865f2] rounded-xl h-10 px-3"
                  required
                />
              </Field>

              {/* Role Selection */}
              <Field>
                <FieldLabel htmlFor="role-select" className="text-xs text-[#dbdee1]">
                  Peran / Status Pengguna *
                </FieldLabel>
                <Select
                  value={role}
                  onValueChange={(val) => setRole(val as "siswa" | "guru")}
                >
                  <SelectTrigger className="w-full bg-[#1e1f22] border-[#383a40] text-xs text-[#f2f3f5] rounded-xl h-10 px-3 focus:border-[#5865f2]">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2b2d31] border-[#3f4147] text-xs text-[#dbdee1] rounded-xl shadow-xl">
                    <SelectItem value="siswa" className="cursor-pointer py-2 focus:bg-[#383a40] focus:text-white">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sky-400">Siswa / Calon Siswa</span>
                        <Badge variant="outline" className="text-[9px] bg-sky-500/15 text-sky-300 border-sky-500/40">
                          50 kuota/hari
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="guru" className="cursor-pointer py-2 focus:bg-[#383a40] focus:text-white">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-400">Guru / Tenaga Pendidik</span>
                        <Badge variant="outline" className="text-[9px] bg-emerald-500/15 text-emerald-300 border-emerald-500/40">
                          200 kuota/hari + Web
                        </Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription className="text-[10px] text-[#949ba4]">
                  {role === "guru"
                    ? "Guru berhak mengakses Profil Sekolah, Hasil Riset Web Otomatis, dan 200 pesan/hari."
                    : "Siswa berhak mengakses Jurusan, Fasilitas, Alamat & PPDB dengan 50 pesan/hari."}
                </FieldDescription>
              </Field>

              {/* School Isolation Selection */}
              <Field>
                <FieldLabel htmlFor="school-select" className="text-xs text-[#dbdee1]">
                  Asal Sekolah (Opsional)
                </FieldLabel>
                <Select value={schoolId} onValueChange={setSchoolId}>
                  <SelectTrigger className="w-full bg-[#1e1f22] border-[#383a40] text-xs text-[#f2f3f5] rounded-xl h-10 px-3 focus:border-[#5865f2]">
                    <SelectValue placeholder="Pilih sekolah" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2b2d31] border-[#3f4147] text-xs text-[#dbdee1] rounded-xl shadow-xl">
                    <SelectItem value="all" className="cursor-pointer py-2 focus:bg-[#383a40] focus:text-white">
                      Semua Sekolah (Tanpa Filter Kunci)
                    </SelectItem>
                    <SelectItem value="1" className="cursor-pointer py-2 focus:bg-[#383a40] focus:text-white">
                      SMK Telkom Malang
                    </SelectItem>
                    <SelectItem value="2" className="cursor-pointer py-2 focus:bg-[#383a40] focus:text-white">
                      SMKN 4 Malang (Grafika)
                    </SelectItem>
                    <SelectItem value="3" className="cursor-pointer py-2 focus:bg-[#383a40] focus:text-white">
                      SMKN 5 Malang
                    </SelectItem>
                    <SelectItem value="4" className="cursor-pointer py-2 focus:bg-[#383a40] focus:text-white">
                      SMKN 3 Malang
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {/* Password Field */}
              <Field>
                <FieldLabel htmlFor="signup-password" className="text-xs text-[#dbdee1]">
                  Kata Sandi *
                </FieldLabel>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Minimal 4 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#1e1f22] border-[#383a40] text-sm text-[#f2f3f5] focus:border-[#5865f2] rounded-xl h-10 px-3"
                  required
                />
              </Field>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold rounded-xl h-10 text-xs shadow-md cursor-pointer transition-all mt-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mendaftarkan Akun...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} className="mr-2" />
                    Daftar Akun Sekarang
                  </>
                )}
              </Button>
            </FieldGroup>
          </form>

          {/* Navigation Links */}
          <div className="mt-5 pt-4 border-t border-[#383a40] flex flex-col gap-2.5 text-center text-xs">
            <p className="text-[#949ba4]">
              Sudah memiliki akun terdaftar?{" "}
              <Link
                href="/login"
                className="text-[#5865f2] hover:underline font-semibold"
              >
                Masuk di Sini
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
