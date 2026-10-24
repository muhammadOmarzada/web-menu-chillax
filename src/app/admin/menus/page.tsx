import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminMenusPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Menu</h1>
          <p className="text-sm text-muted-foreground">
            Tambah, edit, hapus, dan atur ketersediaan menu makanan & minuman.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Menu Baru
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Input placeholder="Cari nama menu..." />
      </div>

      <div className="rounded-md border bg-white dark:bg-stone-900 p-8 text-center text-muted-foreground">
        Belum ada menu yang ditampilkan. Siapkan koneksi Supabase untuk memuat data.
      </div>
    </div>
  );
}
