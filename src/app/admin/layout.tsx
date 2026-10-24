import React from "react";
import Link from "next/link";
import { Coffee, LayoutDashboard, UtensilsCrossed, Tags, QrCode } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-stone-100 dark:bg-stone-950">
      {/* Sidebar Desktop / Navbar Mobile */}
      <aside className="w-full md:w-64 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 p-4 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="p-2 bg-amber-600 rounded-lg text-white">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Chillax Admin</h2>
              <p className="text-xs text-muted-foreground">Coffeeshop Management</p>
            </div>
          </div>

          <nav className="space-y-1">
            <Link
              href="/admin"
              className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start gap-2")}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/menus"
              className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start gap-2")}
            >
              <UtensilsCrossed className="w-4 h-4" />
              Kelola Menu
            </Link>
            <Link
              href="/admin/categories"
              className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start gap-2")}
            >
              <Tags className="w-4 h-4" />
              Kategori
            </Link>
            <Link
              href="/admin/qrcode"
              className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start gap-2")}
            >
              <QrCode className="w-4 h-4" />
              QR Code Meja
            </Link>
          </nav>
        </div>

        <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-start gap-2")}
          >
            <Coffee className="w-4 h-4" />
            Lihat Menu Pelanggan
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
