import React from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <main className="flex-1 w-full max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-stone-200 dark:border-stone-800">
        <p>&copy; 2026 Chillax Coffee. All rights reserved.</p>
      </footer>
    </div>
  );
}
