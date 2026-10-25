import React from "react";
import { Clock } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0C0D0E] text-stone-100 antialiased selection:bg-[#C5A880] selection:text-stone-950">
      {/* Main Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6">
        {children}
      </main>

      {/* Footer (Tampil di Desktop & Mobile) */}
      <footer className="w-full bg-[#0C0D0E] border-t border-stone-800/80 py-4 px-4 sm:px-8 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-semibold tracking-widest uppercase">
          <span className="text-[#C5A880]">CHILLAX COFFEE</span>
          <div className="flex items-center gap-2 text-stone-400">
            <Clock className="w-3.5 h-3.5 text-[#C5A880]" aria-hidden="true" />
            <span>OPEN DAILY 07:00 - 23:00</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
