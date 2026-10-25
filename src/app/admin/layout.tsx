"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Utensils, LogOut, Menu as MenuIcon, X, FolderTree } from "lucide-react";
import { toast } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Berhasil Logout", {
        description: "Sampai jumpa kembali di Chillax Admin.",
      });
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Gagal logout, silakan coba lagi.");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0C0D0E] text-stone-100 font-sans antialiased">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#101113] border-b border-stone-800/80 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white p-0.5 ring-1 ring-stone-700">
            <Image
              src="/images/logo.png"
              alt="Chillax Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <span className="font-heading font-bold text-xs tracking-wider uppercase text-stone-100 block leading-none">
              CHILLAX COFFEE
            </span>
            <span className="text-[10px] font-heading font-semibold text-[#C5A880] tracking-widest uppercase">
              ADMIN
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-stone-400 hover:text-stone-100 rounded-md hover:bg-stone-800 transition-colors"
          aria-label="Toggle Navigation"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar (Desktop Persistent & Mobile Slide) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-[#101113] border-r border-stone-800/90 p-5 flex flex-col justify-between transition-transform duration-200 md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-7">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-1 py-0.5">
            <div className="relative w-10 h-10 shrink-0 rounded-full overflow-hidden bg-white p-0.5 ring-1 ring-stone-700 shadow-md">
              <Image
                src="/images/logo.png"
                alt="Chillax Coffee Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="overflow-hidden">
              <h2 className="font-heading font-bold text-sm tracking-[0.16em] uppercase text-stone-100 leading-tight">
                CHILLAX COFFEE
              </h2>
              <span className="text-[10px] font-heading font-bold text-[#C5A880] tracking-widest uppercase block mt-0.5">
                ADMIN
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Admin Navigation">
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md font-heading font-bold text-xs tracking-wider uppercase transition-all ${
                pathname === "/admin" || pathname === "/admin/menus"
                  ? "bg-[#C5A880] text-stone-950 shadow-sm"
                  : "text-stone-400 hover:text-stone-100 hover:bg-stone-900/60"
              }`}
            >
              <Utensils className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
              <span>Menu Management</span>
            </Link>

            <Link
              href="/admin/categories"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md font-heading font-bold text-xs tracking-wider uppercase transition-all ${
                pathname.startsWith("/admin/categories")
                  ? "bg-[#C5A880] text-stone-950 shadow-sm"
                  : "text-stone-400 hover:text-stone-100 hover:bg-stone-900/60"
              }`}
            >
              <FolderTree className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
              <span>Kategori & Sub</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Actions: Log Out */}
        <div className="pt-4 border-t border-stone-800/80">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-stone-400 hover:text-red-400 hover:bg-stone-900/60 font-heading font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>{isLoggingOut ? "Keluar..." : "Log Out"}</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for Mobile */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
