"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Category, SubCategory, MenuItem } from "@/types/database";
import { 
  Plus, 
  Search, 
  FolderTree,
  Pencil, 
  Trash2, 
  X, 
  AlertCircle, 
  RefreshCw,
  LayoutGrid,
  Utensils
} from "lucide-react";
import { toast } from "sonner";
import { FNB_CATEGORY_ICONS, getCategoryIconComponent } from "@/lib/category-icons";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export default function AdminCategoriesManagementPage() {
  const supabase = useMemo(() => createClient(), []);

  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParentFilter, setSelectedParentFilter] = useState<string>("all");

  // Drawer Kategori Utama (Add / Edit) State
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [categoryDrawerMode, setCategoryDrawerMode] = useState<"add" | "edit">("add");
  const [catFormId, setCatFormId] = useState("");
  const [catFormName, setCatFormName] = useState("");
  const [catFormSlug, setCatFormSlug] = useState("");
  const [catFormIcon, setCatFormIcon] = useState("Coffee");
  const [catFormOrder, setCatFormOrder] = useState<number>(1);
  const [isAutoSlugCategory, setIsAutoSlugCategory] = useState(true);

  // Drawer Sub-kategori (Add / Edit) State
  const [isSubCategoryDrawerOpen, setIsSubCategoryDrawerOpen] = useState(false);
  const [subCategoryDrawerMode, setSubCategoryDrawerMode] = useState<"add" | "edit">("add");
  const [subFormId, setSubFormId] = useState("");
  const [subFormCategoryId, setSubFormCategoryId] = useState("");
  const [subFormName, setSubFormName] = useState("");
  const [subFormSlug, setSubFormSlug] = useState("");
  const [subFormOrder, setSubFormOrder] = useState<number>(1);
  const [isAutoSlugSub, setIsAutoSlugSub] = useState(true);

  // Modal Konfirmasi Hapus
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "category" | "sub_category";
    id: string;
    name: string;
    associatedMenuCount: number;
    associatedSubCount?: number;
  }>({
    isOpen: false,
    type: "category",
    id: "",
    name: "",
    associatedMenuCount: 0,
    associatedSubCount: 0,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Fetch Data dari Supabase
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [catRes, subRes, menuRes] = await Promise.all([
        supabase.from("categories").select("*").order("order_index", { ascending: true }),
        supabase.from("sub_categories").select("*").order("order_index", { ascending: true }),
        supabase.from("menus").select("id, name, category_id, sub_category_id"),
      ]);

      if (catRes.data) setCategories(catRes.data);
      if (subRes.data) setSubCategories(subRes.data);
      if (menuRes.data) setMenus(menuRes.data as MenuItem[]);
    } catch {
      toast.error("Gagal memuat data kategori dari Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Statistik Ringkasan
  const totalCategories = categories.length;
  const totalSubCategories = subCategories.length;
  const totalLinkedMenus = menus.length;

  // 3. Filter Kategori berdasarkan Pencarian
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      // Filter tab kategori induk
      if (selectedParentFilter !== "all" && cat.id !== selectedParentFilter) {
        return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      // Cocok nama atau slug kategori
      if (cat.name.toLowerCase().includes(q) || cat.slug.toLowerCase().includes(q)) {
        return true;
      }

      // Cocok nama atau slug salah satu sub-kategorinya
      const hasMatchingSub = subCategories.some(
        (sub) => sub.category_id === cat.id && (sub.name.toLowerCase().includes(q) || sub.slug.toLowerCase().includes(q))
      );

      return hasMatchingSub;
    });
  }, [categories, subCategories, selectedParentFilter, searchQuery]);

  // =========================================================================
  // HANDLER: KATEGORI UTAMA
  // =========================================================================

  const handleOpenAddCategory = () => {
    setCategoryDrawerMode("add");
    setCatFormId("");
    setCatFormName("");
    setCatFormSlug("");
    setCatFormIcon("Coffee");
    setCatFormOrder(categories.length + 1);
    setIsAutoSlugCategory(true);
    setIsCategoryDrawerOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setCategoryDrawerMode("edit");
    setCatFormId(cat.id);
    setCatFormName(cat.name);
    setCatFormSlug(cat.slug);
    setCatFormIcon(cat.icon || "Coffee");
    setCatFormOrder(cat.order_index);
    setIsAutoSlugCategory(false);
    setIsCategoryDrawerOpen(true);
  };

  const handleCategoryNameChange = (val: string) => {
    setCatFormName(val);
    if (isAutoSlugCategory) {
      setCatFormSlug(slugify(val));
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormName.trim() || !catFormSlug.trim()) {
      toast.error("Nama kategori dan slug wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: catFormName.trim(),
        slug: catFormSlug.trim().toLowerCase(),
        icon: catFormIcon || "Utensils",
        order_index: Number(catFormOrder) || 0,
      };

      if (categoryDrawerMode === "add") {
        const { error } = await supabase.from("categories").insert([payload]);
        if (error) throw error;
        toast.success(`Kategori "${catFormName}" berhasil ditambahkan.`);
      } else {
        const { error } = await supabase.from("categories").update(payload).eq("id", catFormId);
        if (error) throw error;
        toast.success(`Perubahan kategori "${catFormName}" berhasil disimpan.`);
      }

      setIsCategoryDrawerOpen(false);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      toast.error("Gagal menyimpan kategori", { description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================================================
  // HANDLER: SUB-KATEGORI
  // =========================================================================

  const handleOpenAddSubCategory = (parentCatId?: string) => {
    setSubCategoryDrawerMode("add");
    setSubFormId("");
    setSubFormCategoryId(parentCatId || categories[0]?.id || "");
    setSubFormName("");
    setSubFormSlug("");
    
    // Hitung order index berikutnya di bawah kategori ini
    const existingCount = subCategories.filter((s) => s.category_id === (parentCatId || categories[0]?.id)).length;
    setSubFormOrder(existingCount + 1);
    setIsAutoSlugSub(true);
    setIsSubCategoryDrawerOpen(true);
  };

  const handleOpenEditSubCategory = (sub: SubCategory) => {
    setSubCategoryDrawerMode("edit");
    setSubFormId(sub.id);
    setSubFormCategoryId(sub.category_id);
    setSubFormName(sub.name);
    setSubFormSlug(sub.slug);
    setSubFormOrder(sub.order_index);
    setIsAutoSlugSub(false);
    setIsSubCategoryDrawerOpen(true);
  };

  const handleSubNameChange = (val: string) => {
    setSubFormName(val);
    if (isAutoSlugSub) {
      setSubFormSlug(slugify(val));
    }
  };

  const handleSaveSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subFormName.trim() || !subFormSlug.trim() || !subFormCategoryId) {
      toast.error("Kategori induk, nama sub-kategori, dan slug wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        category_id: subFormCategoryId,
        name: subFormName.trim(),
        slug: subFormSlug.trim().toLowerCase(),
        order_index: Number(subFormOrder) || 0,
      };

      if (subCategoryDrawerMode === "add") {
        const { error } = await supabase.from("sub_categories").insert([payload]);
        if (error) throw error;
        toast.success(`Sub-kategori "${subFormName}" berhasil ditambahkan.`);
      } else {
        const { error } = await supabase.from("sub_categories").update(payload).eq("id", subFormId);
        if (error) throw error;
        toast.success(`Perubahan sub-kategori "${subFormName}" berhasil disimpan.`);
      }

      setIsSubCategoryDrawerOpen(false);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      toast.error("Gagal menyimpan sub-kategori", { description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================================================
  // HANDLER: HAPUS (DELETE MODAL & CONFIRMATION)
  // =========================================================================

  const handlePromptDeleteCategory = (cat: Category) => {
    const linkedMenus = menus.filter((m) => m.category_id === cat.id).length;
    const linkedSubs = subCategories.filter((s) => s.category_id === cat.id).length;

    setDeleteModal({
      isOpen: true,
      type: "category",
      id: cat.id,
      name: cat.name,
      associatedMenuCount: linkedMenus,
      associatedSubCount: linkedSubs,
    });
  };

  const handlePromptDeleteSubCategory = (sub: SubCategory) => {
    const linkedMenus = menus.filter((m) => m.sub_category_id === sub.id).length;

    setDeleteModal({
      isOpen: true,
      type: "sub_category",
      id: sub.id,
      name: sub.name,
      associatedMenuCount: linkedMenus,
    });
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteModal.type === "category") {
        // Cek proteksi jika masih ada menu
        if (deleteModal.associatedMenuCount > 0) {
          toast.error("Tidak dapat menghapus kategori!", {
            description: `Masih ada ${deleteModal.associatedMenuCount} menu terdaftar di kategori ini. Hapus atau pindahkan menu tersebut terlebih dahulu.`,
          });
          setIsDeleting(false);
          return;
        }

        const { error } = await supabase.from("categories").delete().eq("id", deleteModal.id);
        if (error) {
          if (error.code === "23503") {
            toast.error("Database menolak penghapusan", {
              description: "Masih terdapat menu yang terikat dengan kategori ini.",
            });
          } else {
            throw error;
          }
        } else {
          toast.success(`Kategori "${deleteModal.name}" berhasil dihapus.`);
          setDeleteModal((prev) => ({ ...prev, isOpen: false }));
          fetchData();
        }
      } else {
        // Hapus Sub-kategori (menus.sub_category_id otomatis diset ke null oleh postgres)
        const { error } = await supabase.from("sub_categories").delete().eq("id", deleteModal.id);
        if (error) throw error;

        toast.success(`Sub-kategori "${deleteModal.name}" berhasil dihapus.`);
        setDeleteModal((prev) => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      toast.error("Gagal menghapus data", { description: msg });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* =========================================================================
          PAGE HEADER
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-stone-100 uppercase">
            Kategori & Sub-Kategori
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 font-sans mt-1 max-w-3xl leading-relaxed">
            Atur struktur taksonomi menu, kategori utama, ikon navigasi visual, serta relasi sub-kategori untuk katalog web responsif Chillax Coffee.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchData}
            title="Muat Ulang Data"
            className="p-2.5 rounded bg-[#161719] border border-stone-800 text-stone-300 hover:text-white hover:border-stone-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => handleOpenAddSubCategory()}
            disabled={categories.length === 0}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded bg-[#161719] border border-stone-800 hover:border-stone-700 text-stone-200 hover:text-white font-heading font-bold text-xs tracking-wider uppercase transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 text-[#C5A880] stroke-[2.5]" />
            <span>Sub-Kategori</span>
          </button>

          <button
            onClick={handleOpenAddCategory}
            className="flex items-center gap-2 px-4 py-2.5 rounded bg-[#C5A880] hover:bg-[#d8bb93] text-stone-950 font-heading font-bold text-xs tracking-wider uppercase shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Kategori</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          3 STAT CARDS
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Kategori */}
        <div className="p-4 sm:p-5 rounded-lg bg-[#141517] border border-stone-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="font-heading text-[11px] font-bold tracking-widest text-stone-400 uppercase block">
              TOTAL KATEGORI UTAMA
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-heading font-extrabold text-stone-100">
                {totalCategories}
              </span>
              <span className="text-xs text-stone-400 font-sans">Kategori Terdaftar</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400">
            <LayoutGrid className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Total Sub-kategori */}
        <div className="p-4 sm:p-5 rounded-lg bg-[#141517] border border-stone-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="font-heading text-[11px] font-bold tracking-widest text-stone-400 uppercase block">
              TOTAL SUB-KATEGORI
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-heading font-extrabold text-[#C5A880]">
                {totalSubCategories}
              </span>
              <span className="text-xs text-stone-400 font-sans">Sub-Kategori Aktif</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-[#C5A880]">
            <FolderTree className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Total Menu Terkait */}
        <div className="p-4 sm:p-5 rounded-lg bg-[#141517] border border-stone-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="font-heading text-[11px] font-bold tracking-widest text-stone-400 uppercase block">
              TOTAL MENU TERDISTRIBUSI
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-heading font-extrabold text-stone-100">
                {totalLinkedMenus}
              </span>
              <span className="text-xs text-stone-400 font-sans">Item Menu</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400">
            <Utensils className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          TOOLBAR PENCARIAN & FILTER TAB
         ========================================================================= */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Cari kategori, sub-kategori, atau slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#141517] border border-stone-800 rounded-lg text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-[#C5A880] transition-colors"
            />
          </div>

          {/* Filter Tab Kategori Induk */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedParentFilter("all")}
              className={`px-3.5 py-2 rounded text-xs font-heading font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
                selectedParentFilter === "all"
                  ? "bg-[#C5A880] text-stone-950 shadow-sm"
                  : "bg-[#161719] border border-stone-800 text-stone-400 hover:text-stone-200"
              }`}
            >
              Semua Kategori ({categories.length})
            </button>

            {categories.map((c) => {
              const subsCount = subCategories.filter((s) => s.category_id === c.id).length;
              const isActive = selectedParentFilter === c.id;

              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedParentFilter(c.id)}
                  className={`px-3.5 py-2 rounded text-xs font-heading font-bold uppercase tracking-wider shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-[#C5A880] text-stone-950 shadow-sm"
                      : "bg-[#161719] border border-stone-800 text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <span>{c.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                    isActive ? "bg-stone-900/40 text-stone-950" : "bg-stone-800 text-stone-400"
                  }`}>
                    {subsCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          DAFTAR KARTU HIERARKI KATEGORI & SUB-KATEGORI
         ========================================================================= */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-stone-500 gap-3">
          <div className="w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
          <span className="font-heading text-xs tracking-widest uppercase">Memuat Taksonomi...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-20 text-center bg-[#141517] border border-stone-800 rounded-lg p-6">
          <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 mx-auto mb-3">
            <FolderTree className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="font-heading font-bold text-sm text-stone-200 tracking-wider uppercase mb-1">
            Tidak Ada Kategori Ditemukan
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery
              ? `Tidak ada kategori atau sub-kategori yang sesuai dengan kata kunci "${searchQuery}".`
              : "Belum ada kategori yang dibuat di Supabase."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCategories.map((category) => {
            const IconComponent = getCategoryIconComponent(category.icon);
            const subs = subCategories.filter((s) => s.category_id === category.id);
            const menuCount = menus.filter((m) => m.category_id === category.id).length;

            return (
              <div
                key={category.id}
                className="rounded-lg bg-[#141517] border border-stone-800/90 overflow-hidden shadow-sm hover:border-stone-700/80 transition-colors"
              >
                {/* Header Kategori Utama */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800/60 bg-[#161719]/60">
                  <div className="flex items-center gap-3.5">
                    {/* Icon Kategori */}
                    <div className="w-11 h-11 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-[#C5A880] shrink-0 shadow-inner">
                      <IconComponent className="w-5 h-5 stroke-[2]" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-heading text-xs font-bold text-[#C5A880] bg-stone-900 border border-stone-800 px-2 py-0.5 rounded">
                          #{String(category.order_index).padStart(2, "0")}
                        </span>
                        <h2 className="font-heading font-bold text-base sm:text-lg text-stone-100 uppercase tracking-wide">
                          {category.name}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-stone-400 font-mono">
                        <span>slug: /{category.slug}</span>
                        <span>•</span>
                        <span className="text-stone-500">ikon: {category.icon || "Utensils"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-xs font-heading font-semibold">
                      <span className="px-2.5 py-1 rounded bg-stone-900 border border-stone-800 text-stone-300">
                        {subs.length} Sub-Kategori
                      </span>
                      <span className="px-2.5 py-1 rounded bg-stone-900 border border-stone-800 text-[#C5A880]">
                        {menuCount} Menu
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pl-2 border-l border-stone-800">
                      <button
                        onClick={() => handleOpenAddSubCategory(category.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-xs font-heading font-bold text-[#C5A880] uppercase tracking-wider transition-colors cursor-pointer"
                        title="Tambah Sub-Kategori di bawah kategori ini"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Sub</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditCategory(category)}
                        className="p-1.5 rounded text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
                        title="Edit Kategori Utama"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handlePromptDeleteCategory(category)}
                        className="p-1.5 rounded text-stone-400 hover:text-red-400 hover:bg-stone-900 transition-colors cursor-pointer"
                        title="Hapus Kategori Utama"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-kategori Container */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-heading text-[11px] font-bold tracking-widest uppercase text-stone-400">
                      SUB-KATEGORI ({subs.length})
                    </span>
                    <span className="text-[11px] text-stone-500 font-sans">
                      Menu akan dikelompokkan ke sub-kategori ini di Web QR
                    </span>
                  </div>

                  {subs.length === 0 ? (
                    <div className="p-6 rounded-md border border-dashed border-stone-800 bg-stone-900/30 text-center flex flex-col items-center justify-center">
                      <p className="text-xs text-stone-400 mb-2">
                        Belum ada sub-kategori untuk kategori {category.name}.
                      </p>
                      <button
                        onClick={() => handleOpenAddSubCategory(category.id)}
                        className="text-xs font-heading font-bold text-[#C5A880] hover:underline flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Sub-Kategori Pertama</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {subs.map((sub) => {
                        const subMenuCount = menus.filter((m) => m.sub_category_id === sub.id).length;

                        return (
                          <div
                            key={sub.id}
                            className="p-3 rounded-md bg-[#181a1d] border border-stone-800/80 flex items-center justify-between gap-2 hover:border-stone-700 transition-colors group"
                          >
                            <div className="overflow-hidden">
                              <div className="flex items-center gap-1.5">
                                <span className="font-heading text-[10px] font-bold text-stone-500">
                                  #{String(sub.order_index).padStart(2, "0")}
                                </span>
                                <h3 className="font-heading font-bold text-xs text-stone-200 uppercase truncate">
                                  {sub.name}
                                </h3>
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-stone-500 font-mono">
                                <span className="truncate">/{sub.slug}</span>
                                <span>•</span>
                                <span className="text-[#C5A880] font-sans font-semibold shrink-0">
                                  {subMenuCount} menu
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenEditSubCategory(sub)}
                                className="p-1 rounded text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
                                title="Edit Sub-Kategori"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handlePromptDeleteSubCategory(sub)}
                                className="p-1 rounded text-stone-400 hover:text-red-400 hover:bg-stone-900 transition-colors cursor-pointer"
                                title="Hapus Sub-Kategori"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          DRAWER: TAMBAH / EDIT KATEGORI UTAMA
         ========================================================================= */}
      {isCategoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCategoryDrawerOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[#101113] border-l border-stone-800 h-full overflow-y-auto p-6 z-10 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header Drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div>
                  <span className="font-heading text-xs font-semibold tracking-wider text-[#C5A880] uppercase">
                    {categoryDrawerMode === "add" ? "Kategori Baru" : "Edit Kategori"}
                  </span>
                  <h2 className="text-xl font-heading font-extrabold uppercase text-stone-100 tracking-wide mt-0.5">
                    {categoryDrawerMode === "add" ? "Tambah Kategori Utama" : `Edit: ${catFormName}`}
                  </h2>
                </div>
                <button
                  onClick={() => setIsCategoryDrawerOpen(false)}
                  className="p-2 rounded-md text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Input */}
              <form id="category-form" onSubmit={handleSaveCategory} className="space-y-4">
                {/* Nama Kategori */}
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                    Nama Kategori <span className="text-[#C5A880]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Food, Drinks, Specialty..."
                    value={catFormName}
                    onChange={(e) => handleCategoryNameChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded bg-[#161719] border border-stone-800 text-sm text-stone-100 focus:outline-none focus:border-[#C5A880] transition-colors"
                  />
                </div>

                {/* Slug Kategori */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-heading font-bold uppercase tracking-wider text-stone-300">
                      Slug URL <span className="text-[#C5A880]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAutoSlugCategory(!isAutoSlugCategory)}
                      className="text-[10px] text-stone-400 hover:text-[#C5A880] cursor-pointer"
                    >
                      {isAutoSlugCategory ? "Mode: Auto-Generate" : "Mode: Manual"}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="contoh: food, drinks, specialty"
                    value={catFormSlug}
                    onChange={(e) => {
                      setIsAutoSlugCategory(false);
                      setCatFormSlug(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 rounded bg-[#161719] border border-stone-800 text-sm font-mono text-stone-200 focus:outline-none focus:border-[#C5A880] transition-colors"
                  />
                  <span className="text-[11px] text-stone-500 font-sans block mt-1">
                    Digunakan untuk URL navigasi tab web menu (huruf kecil, tanpa spasi).
                  </span>
                </div>

                {/* Urutan Tampilan */}
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                    Urutan Tampilan (#)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={catFormOrder}
                    onChange={(e) => setCatFormOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded bg-[#161719] border border-stone-800 text-sm text-stone-100 focus:outline-none focus:border-[#C5A880] transition-colors"
                  />
                  <span className="text-[11px] text-stone-500 font-sans block mt-1">
                    Menentukan urutan tombol tab kategori dari kiri ke kanan (#01, #02, dst.).
                  </span>
                </div>

                {/* Pilihan Ikon Visual */}
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-stone-300 mb-2">
                    Ikon Navigasi Menu
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto p-1.5 border border-stone-800/80 rounded bg-[#141517] scrollbar-thin">
                    {FNB_CATEGORY_ICONS.map((item) => {
                      const Icon = item.icon;
                      const isSelected = catFormIcon.toLowerCase() === item.name.toLowerCase();

                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setCatFormIcon(item.name)}
                          title={item.label}
                          className={`flex flex-col items-center justify-center p-2.5 rounded text-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#C5A880] text-stone-950 font-bold shadow"
                              : "bg-[#181a1d] text-stone-300 hover:bg-stone-800 border border-stone-800/80"
                          }`}
                        >
                          <Icon className="w-5 h-5 mb-1 stroke-[2]" />
                          <span className="text-[10px] truncate max-w-full font-heading">
                            {item.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </form>
            </div>

            {/* Tombol Aksi Bawah */}
            <div className="pt-6 border-t border-stone-800 flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsCategoryDrawerOpen(false)}
                className="px-4 py-2.5 rounded bg-transparent border border-stone-800 hover:bg-stone-800 text-stone-300 font-heading font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                form="category-form"
                disabled={isSaving}
                className="px-5 py-2.5 rounded bg-[#C5A880] hover:bg-[#d8bb93] text-stone-950 font-heading font-bold text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? "Menyimpan..." : categoryDrawerMode === "add" ? "Tambah Kategori" : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DRAWER: TAMBAH / EDIT SUB-KATEGORI
         ========================================================================= */}
      {isSubCategoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSubCategoryDrawerOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[#101113] border-l border-stone-800 h-full overflow-y-auto p-6 z-10 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header Drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div>
                  <span className="font-heading text-xs font-semibold tracking-wider text-[#C5A880] uppercase">
                    {subCategoryDrawerMode === "add" ? "Sub-Kategori Baru" : "Edit Sub-Kategori"}
                  </span>
                  <h2 className="text-xl font-heading font-extrabold uppercase text-stone-100 tracking-wide mt-0.5">
                    {subCategoryDrawerMode === "add" ? "Tambah Sub-Kategori" : `Edit: ${subFormName}`}
                  </h2>
                </div>
                <button
                  onClick={() => setIsSubCategoryDrawerOpen(false)}
                  className="p-2 rounded-md text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Input */}
              <form id="sub-category-form" onSubmit={handleSaveSubCategory} className="space-y-4">
                {/* Pilihan Kategori Induk */}
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                    Kategori Induk (Parent) <span className="text-[#C5A880]">*</span>
                  </label>
                  <select
                    required
                    value={subFormCategoryId}
                    onChange={(e) => setSubFormCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded bg-[#161719] border border-stone-800 text-sm text-stone-100 focus:outline-none focus:border-[#C5A880] transition-colors"
                  >
                    <option value="" disabled>Pilih Kategori Utama...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.slug})
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-stone-500 font-sans block mt-1">
                    Sub-kategori ini akan muncul di bawah kelompok kategori utama yang dipilih.
                  </span>
                </div>

                {/* Nama Sub-kategori */}
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                    Nama Sub-Kategori <span className="text-[#C5A880]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Snack, Pastry Gurih, Cold Brew..."
                    value={subFormName}
                    onChange={(e) => handleSubNameChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded bg-[#161719] border border-stone-800 text-sm text-stone-100 focus:outline-none focus:border-[#C5A880] transition-colors"
                  />
                </div>

                {/* Slug Sub-kategori */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-heading font-bold uppercase tracking-wider text-stone-300">
                      Slug URL <span className="text-[#C5A880]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAutoSlugSub(!isAutoSlugSub)}
                      className="text-[10px] text-stone-400 hover:text-[#C5A880] cursor-pointer"
                    >
                      {isAutoSlugSub ? "Mode: Auto-Generate" : "Mode: Manual"}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="contoh: pastry-gurih, snack, cold-brew"
                    value={subFormSlug}
                    onChange={(e) => {
                      setIsAutoSlugSub(false);
                      setSubFormSlug(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 rounded bg-[#161719] border border-stone-800 text-sm font-mono text-stone-200 focus:outline-none focus:border-[#C5A880] transition-colors"
                  />
                  <span className="text-[11px] text-stone-500 font-sans block mt-1">
                    Harus unik dalam satu kategori induk yang sama.
                  </span>
                </div>

                {/* Urutan Tampilan */}
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                    Urutan Tampilan (#)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={subFormOrder}
                    onChange={(e) => setSubFormOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded bg-[#161719] border border-stone-800 text-sm text-stone-100 focus:outline-none focus:border-[#C5A880] transition-colors"
                  />
                  <span className="text-[11px] text-stone-500 font-sans block mt-1">
                    Menentukan urutan pil sub-kategori di halaman menu.
                  </span>
                </div>
              </form>
            </div>

            {/* Tombol Aksi Bawah */}
            <div className="pt-6 border-t border-stone-800 flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsSubCategoryDrawerOpen(false)}
                className="px-4 py-2.5 rounded bg-transparent border border-stone-800 hover:bg-stone-800 text-stone-300 font-heading font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                form="sub-category-form"
                disabled={isSaving}
                className="px-5 py-2.5 rounded bg-[#C5A880] hover:bg-[#d8bb93] text-stone-950 font-heading font-bold text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? "Menyimpan..." : subCategoryDrawerMode === "add" ? "Tambah Sub-Kategori" : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: KONFIRMASI HAPUS AMAN
         ========================================================================= */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !isDeleting && setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
          />
          <div className="relative w-full max-w-md rounded-lg bg-[#141517] border border-stone-800 p-6 z-10 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-950/50 border border-red-800/80 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-stone-100 uppercase tracking-wide">
                  Konfirmasi Hapus {deleteModal.type === "category" ? "Kategori" : "Sub-Kategori"}
                </h3>
                <span className="text-xs text-stone-400">Tindakan ini tidak dapat dibatalkan</span>
              </div>
            </div>

            <div className="space-y-3 text-sm text-stone-300">
              <p>
                Apakah Anda yakin ingin menghapus{" "}
                <span className="font-heading font-bold text-stone-100 uppercase">
                  &ldquo;{deleteModal.name}&rdquo;
                </span>
                ?
              </p>

              {deleteModal.type === "category" && (
                <>
                  {deleteModal.associatedMenuCount > 0 ? (
                    <div className="p-3 rounded bg-red-950/40 border border-red-800/80 text-xs text-red-200 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        Peringatan Database: Masih Ada {deleteModal.associatedMenuCount} Menu Aktif!
                      </p>
                      <p className="text-red-300/90 leading-relaxed">
                        Database memproteksi relasi kategori (`RESTRICT`). Anda tidak dapat menghapus kategori ini sebelum memindahkan atau menghapus menu yang terdaftar di dalamnya.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded bg-stone-900 border border-stone-800 text-xs text-stone-400">
                      Menghapus kategori ini juga akan menghapus otomatis seluruh {deleteModal.associatedSubCount || 0} sub-kategori di bawahnya (`CASCADE`).
                    </div>
                  )}
                </>
              )}

              {deleteModal.type === "sub_category" && (
                <div className="p-3 rounded bg-stone-900 border border-stone-800 text-xs text-stone-400">
                  {deleteModal.associatedMenuCount > 0 ? (
                    <p>
                      Terdapat {deleteModal.associatedMenuCount} menu yang menggunakan sub-kategori ini. Menghapusnya akan mengubah status sub-kategori menu tersebut menjadi kosong (tanpa menghapus item menunya).
                    </p>
                  ) : (
                    <p>Sub-kategori ini saat ini belum memiliki menu yang terhubung.</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-stone-800">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 font-heading font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting || (deleteModal.type === "category" && deleteModal.associatedMenuCount > 0)}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded bg-red-700 hover:bg-red-600 text-white font-heading font-bold text-xs uppercase tracking-wider shadow transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
