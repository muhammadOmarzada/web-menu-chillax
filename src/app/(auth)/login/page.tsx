"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Coffee, Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Mohon masukkan email dan password");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Login gagal", {
          description: error.message === "Invalid login credentials"
            ? "Email atau password yang Anda masukkan salah."
            : error.message,
        });
        setIsLoading(false);
        return;
      }

      toast.success("Login Berhasil", {
        description: "Mengalihkan ke Dashboard Admin...",
      });
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
      toast.error("Gagal terhubung", {
        description: message,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0C0D0E] text-stone-100 p-4 relative overflow-hidden font-sans">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C5A880]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Card */}
        <div className="bg-[#141517] border border-stone-800/90 rounded-xl p-8 shadow-2xl backdrop-blur-sm">
          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center space-y-3 mb-8">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white p-1 ring-1 ring-stone-700 shadow-lg">
              <Image
                src="/images/logo.png"
                alt="Chillax Coffee Logo"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-heading font-extrabold tracking-[0.2em] uppercase text-stone-100">
                CHILLAX COFFEE
              </h1>
              <p className="text-xs text-[#C5A880] font-heading font-semibold tracking-widest uppercase mt-0.5">
                Admin Management Portal
              </p>
            </div>
            <p className="text-xs text-stone-400 font-sans max-w-xs leading-relaxed pt-1">
              Masuk untuk mengelola katalog menu, ketersediaan stok, dan konfigurasi QR meja.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label 
                htmlFor="email" 
                className="block text-xs font-heading font-semibold tracking-wider text-stone-300 uppercase"
              >
                Email Admin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@chillax.com"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0C0D0E] border border-stone-800 rounded-lg text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label 
                htmlFor="password" 
                className="block text-xs font-heading font-semibold tracking-wider text-stone-300 uppercase"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0C0D0E] border border-stone-800 rounded-lg text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C5A880] hover:bg-[#d4b78f] text-stone-950 font-heading font-bold text-xs tracking-widest uppercase rounded-lg shadow-md transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Back Link */}
          <div className="mt-6 pt-5 border-t border-stone-800/80 text-center">
            <a
              href="/"
              className="text-xs text-stone-400 hover:text-[#C5A880] transition-colors inline-flex items-center gap-1.5"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Lihat Tampilan Menu Pelanggan &rarr;</span>
            </a>
          </div>
        </div>

        {/* Note info */}
        <p className="text-center text-[11px] text-stone-400 mt-4">
          Chillax Coffee System &bull; Secure Supabase Authentication
        </p>
      </div>
    </div>
  );
}
