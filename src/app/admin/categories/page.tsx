import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kategori Menu</h1>
          <p className="text-sm text-muted-foreground">
            Kelola kategori untuk pengelompokan menu pelanggan.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Kategori
        </Button>
      </div>

      <div className="rounded-md border bg-white dark:bg-stone-900 p-8 text-center text-muted-foreground">
        Belum ada kategori yang ditampilkan.
      </div>
    </div>
  );
}
