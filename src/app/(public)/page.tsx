import Link from "next/link";
import { Coffee, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CustomerMenuPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
      <div className="p-4 bg-amber-100 dark:bg-amber-950/60 rounded-full text-amber-700 dark:text-amber-400">
        <Coffee className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          Chillax Coffee
        </h1>
        <p className="text-stone-600 dark:text-stone-400 max-w-sm mx-auto text-sm">
          Selamat datang! Halaman menu digital responsif siap dibangun.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: "default" }), "w-full gap-2")}
        >
          <ShieldCheck className="w-4 h-4" />
          Dashboard Admin
        </Link>
      </div>
    </div>
  );
}
