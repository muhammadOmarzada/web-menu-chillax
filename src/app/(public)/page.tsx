import { Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import { CustomerMenuView } from "@/components/public/customer-menu-view";
import { Category, SubCategory, MenuItem } from "@/types/database";

async function MenuDataLoader() {
  let categories: Category[] = [];
  let subCategories: SubCategory[] = [];
  let menus: MenuItem[] = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const [catRes, subRes, menuRes] = await Promise.all([
        supabase
          .from("categories")
          .select("*")
          .order("order_index", { ascending: true }),
        supabase
          .from("sub_categories")
          .select("*")
          .order("order_index", { ascending: true }),
        supabase
          .from("menus")
          .select("*")
          .eq("is_visible", true)
          .order("order_index", { ascending: true }),
      ]);

      if (catRes.data) categories = catRes.data;
      if (subRes.data) subCategories = subRes.data;
      if (menuRes.data) menus = menuRes.data;
    } catch {
      // Jika terjadi error koneksi, data tetap kosong
    }
  }

  // Murni data dari Supabase tanpa data dummy / fallback
  return (
    <CustomerMenuView
      initialCategories={categories}
      initialSubCategories={subCategories}
      initialMenus={menus}
    />
  );
}

export default function CustomerPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-stone-500 space-y-4 font-sans">
          <div className="w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-heading tracking-widest uppercase">Memuat Menu Chillax...</p>
        </div>
      }
    >
      <MenuDataLoader />
    </Suspense>
  );
}
