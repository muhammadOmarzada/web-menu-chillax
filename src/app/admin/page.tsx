"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Category, SubCategory, MenuItem } from "@/types/database";
import { formatPriceK, formatRupiah } from "@/lib/utils";
import { 
  Plus, 
  Search, 
  Utensils, 
  Coffee, 
  Package, 
  ShoppingBag, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  EyeOff, 
  Pencil, 
  Trash2, 
  UploadCloud, 
  Camera, 
  X, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  LayoutGrid
} from "lucide-react";
import { toast } from "sonner";

export default function AdminMenuManagementPage() {
  const supabase = useMemo(() => createClient(), []);

  // Data State
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("all");
  const [selectedSubCategorySlug, setSelectedSubCategorySlug] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "unavailable">("all");
  const [selectedMenuIds, setSelectedMenuIds] = useState<Set<string>>(new Set());

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Drawer (Add / Edit) State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [formId, setFormId] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formName, setFormName] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formSubCategoryId, setFormSubCategoryId] = useState("");
  const [formPrice, setFormPrice] = useState<number | "">("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formIsVisible, setFormIsVisible] = useState(true);
  const [formImageUrl, setFormImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);

  // 1. Fetch Data dari Supabase
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [catRes, subRes, menuRes] = await Promise.all([
        supabase.from("categories").select("*").order("order_index", { ascending: true }),
        supabase.from("sub_categories").select("*").order("order_index", { ascending: true }),
        supabase.from("menus").select("*, category:categories(*), sub_category:sub_categories(*)").order("order_index", { ascending: true }),
      ]);

      if (catRes.data) setCategories(catRes.data);
      if (subRes.data) setSubCategories(subRes.data);
      if (menuRes.data) setMenus(menuRes.data);
    } catch {
      toast.error("Gagal memuat data dari Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Sub-kategori yang sesuai dengan kategori terpilih
  const currentCategoryObj = useMemo(() => {
    return categories.find((c) => c.slug === selectedCategorySlug);
  }, [categories, selectedCategorySlug]);

  const availableSubCategories = useMemo(() => {
    if (!currentCategoryObj) return [];
    return subCategories.filter((sc) => sc.category_id === currentCategoryObj.id);
  }, [subCategories, currentCategoryObj]);

  // Sub-kategori untuk form drawer berdasarkan formCategoryId
  const formSubCategories = useMemo(() => {
    if (!formCategoryId) return [];
    return subCategories.filter((sc) => sc.category_id === formCategoryId);
  }, [subCategories, formCategoryId]);

  // 4. Filtering Logic
  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => {
      // Filter Kategori
      if (selectedCategorySlug !== "all") {
        if (!currentCategoryObj || menu.category_id !== currentCategoryObj.id) {
          return false;
        }
      }

      // Filter Sub-Kategori
      if (selectedSubCategorySlug !== "all") {
        const activeSub = availableSubCategories.find((s) => s.slug === selectedSubCategorySlug);
        if (activeSub && menu.sub_category_id !== activeSub.id) {
          return false;
        }
      }

      // Filter Status
      if (statusFilter === "available" && !menu.is_available) return false;
      if (statusFilter === "unavailable" && menu.is_available) return false;

      // Filter Pencarian (nama, sku, deskripsi)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = menu.name.toLowerCase().includes(q);
        const matchSku = menu.sku.toLowerCase().includes(q);
        const matchDesc = menu.description?.toLowerCase().includes(q);
        return matchName || matchSku || matchDesc;
      }

      return true;
    });
  }, [menus, selectedCategorySlug, selectedSubCategorySlug, statusFilter, searchQuery, currentCategoryObj, availableSubCategories]);

  // 5. Pagination Logic
  const totalPages = Math.ceil(filteredMenus.length / itemsPerPage) || 1;
  const paginatedMenus = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMenus.slice(start, start + itemsPerPage);
  }, [filteredMenus, currentPage]);

  // 6. Quick Stats
  const totalCount = menus.length;
  const outOfStockCount = useMemo(() => menus.filter((m) => !m.is_available || !m.is_visible).length, [menus]);
  const categoryMasterCount = categories.length;
  const subCategoryMasterCount = subCategories.length;

  // 7. Toggle Ketersediaan Stok (Inline Click)
  const handleToggleAvailability = async (menu: MenuItem) => {
    const newStatus = !menu.is_available;
    // Optimistic UI Update
    setMenus((prev) =>
      prev.map((m) => (m.id === menu.id ? { ...m, is_available: newStatus } : m))
    );

    const { error } = await supabase
      .from("menus")
      .update({ is_available: newStatus })
      .eq("id", menu.id);

    if (error) {
      toast.error("Gagal mengubah status ketersediaan");
      fetchData();
    } else {
      toast.success(
        newStatus ? `"${menu.name}" sekarang Tersedia` : `"${menu.name}" ditandai Habis`
      );
    }
  };

  // 8. Toggle Visibilitas Web (Inline Click)
  const handleToggleVisibility = async (menu: MenuItem) => {
    const newStatus = !menu.is_visible;
    setMenus((prev) =>
      prev.map((m) => (m.id === menu.id ? { ...m, is_visible: newStatus } : m))
    );

    const { error } = await supabase
      .from("menus")
      .update({ is_visible: newStatus })
      .eq("id", menu.id);

    if (error) {
      toast.error("Gagal mengubah visibilitas menu");
      fetchData();
    } else {
      toast.success(
        newStatus ? `"${menu.name}" ditampilkan di Web QR` : `"${menu.name}" disembunyikan dari Web QR`
      );
    }
  };

  // 9. Hapus Menu
  const handleDeleteMenu = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${name}"?`)) return;

    setMenus((prev) => prev.filter((m) => m.id !== id));
    const { error } = await supabase.from("menus").delete().eq("id", id);

    if (error) {
      toast.error("Gagal menghapus menu");
      fetchData();
    } else {
      toast.success(`"${name}" berhasil dihapus`);
    }
  };

  // 10. Drawer Open Handler (Add / Edit)
  const handleOpenAdd = () => {
    setDrawerMode("add");
    setFormId("");
    setFormSku(`SKU-${String(menus.length + 1).padStart(3, "0")}`);
    setFormName("");
    setFormCategoryId(categories[0]?.id || "");
    setFormSubCategoryId("");
    setFormPrice(15000);
    setFormDescription("");
    setFormIsAvailable(true);
    setFormIsVisible(true);
    setFormImageUrl(null);
    setSelectedFile(null);
    setPreviewFileUrl(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (menu: MenuItem) => {
    setDrawerMode("edit");
    setFormId(menu.id);
    setFormSku(menu.sku);
    setFormName(menu.name);
    setFormCategoryId(menu.category_id);
    setFormSubCategoryId(menu.sub_category_id || "");
    setFormPrice(menu.price);
    setFormDescription(menu.description || "");
    setFormIsAvailable(menu.is_available);
    setFormIsVisible(menu.is_visible);
    setFormImageUrl(menu.image_url);
    setSelectedFile(null);
    setPreviewFileUrl(null);
    setIsDrawerOpen(true);
  };

  // 11. Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 2MB");
        return;
      }
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewFileUrl(objectUrl);
    }
  };

  // 12. Simpan Menu (Insert / Update)
  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCategoryId) {
      toast.error("Nama menu dan kategori utama wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrl = formImageUrl;

      // Upload file gambar ke Supabase Storage jika ada file baru dipilih
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `menu-items/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("menu-images")
          .upload(filePath, selectedFile, { upsert: true });

        if (uploadError) {
          toast.warning("Gagal mengunggah gambar ke Storage, menyimpan tanpa update gambar.", {
            description: uploadError.message,
          });
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("menu-images")
            .getPublicUrl(filePath);
          finalImageUrl = publicUrlData.publicUrl;
        }
      }

      const payload = {
        sku: formSku || `SKU-${Date.now().toString().slice(-4)}`,
        name: formName.trim(),
        category_id: formCategoryId,
        sub_category_id: formSubCategoryId || null,
        price: Number(formPrice) || 0,
        description: formDescription.trim(),
        is_available: formIsAvailable,
        is_visible: formIsVisible,
        image_url: finalImageUrl,
        order_index: drawerMode === "add" ? menus.length + 1 : undefined,
      };

      if (drawerMode === "add") {
        const { error } = await supabase.from("menus").insert([payload]);
        if (error) throw error;
        toast.success(`Menu "${formName}" berhasil ditambahkan.`);
      } else {
        const { error } = await supabase.from("menus").update(payload).eq("id", formId);
        if (error) throw error;
        toast.success(`Perubahan menu "${formName}" berhasil disimpan.`);
      }

      setIsDrawerOpen(false);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan menu.";
      toast.error("Gagal menyimpan data", { description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  // 13. Batch Action: Ubah Status / Hapus
  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMenuIds(new Set(paginatedMenus.map((m) => m.id)));
    } else {
      setSelectedMenuIds(new Set());
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedMenuIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchToggleStatus = async () => {
    if (selectedMenuIds.size === 0) {
      toast.info("Pilih minimal satu menu untuk mengubah status.");
      return;
    }

    const ids = Array.from(selectedMenuIds);
    // Ubah kebalikannya berdasarkan menu pertama
    const firstMenu = menus.find((m) => m.id === ids[0]);
    const targetStatus = firstMenu ? !firstMenu.is_available : true;

    const { error } = await supabase
      .from("menus")
      .update({ is_available: targetStatus })
      .in("id", ids);

    if (error) {
      toast.error("Gagal memperbarui status menu terpilih.");
    } else {
      toast.success(`${ids.length} menu berhasil diubah menjadi ${targetStatus ? "Tersedia" : "Habis"}.`);
      setSelectedMenuIds(new Set());
      fetchData();
    }
  };

  const handleBatchDelete = async () => {
    if (selectedMenuIds.size === 0) {
      toast.info("Pilih minimal satu menu untuk dihapus.");
      return;
    }

    if (!confirm(`Hapus permanen ${selectedMenuIds.size} menu terpilih?`)) return;

    const ids = Array.from(selectedMenuIds);
    const { error } = await supabase.from("menus").delete().in("id", ids);

    if (error) {
      toast.error("Gagal menghapus menu terpilih.");
    } else {
      toast.success(`${ids.length} menu berhasil dihapus.`);
      setSelectedMenuIds(new Set());
      fetchData();
    }
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {/* =========================================================================
          PAGE HEADER
         ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-800/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight uppercase text-stone-100">
            MANAJEMEN MENU & KATALOG
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 font-sans mt-1 max-w-3xl leading-relaxed">
            Kelola daftar item makanan, minuman, penyesuaian harga instan, ketersediaan stok outlet, serta kurasi visual menu web responsif QR Chillax.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchData}
            title="Refresh Data"
            className="p-2.5 rounded bg-[#161719] border border-stone-800 text-stone-300 hover:text-white hover:border-stone-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded bg-[#C5A880] hover:bg-[#d8bb93] text-stone-950 font-heading font-bold text-xs tracking-wider uppercase shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Menu Baru</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          3 STAT CARDS (TOTAL MENU, HABIS/NONAKTIF, KATEGORI MASTER)
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Menu */}
        <div className="p-4 sm:p-5 rounded-lg bg-[#141517] border border-stone-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="font-heading text-[11px] font-bold tracking-widest text-stone-400 uppercase block">
              TOTAL MENU
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-heading font-extrabold text-stone-100">
                {totalCount}
              </span>
              <span className="text-xs text-stone-400 font-sans">Menu Terdaftar</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400">
            <Utensils className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Habis / Nonaktif */}
        <div className="p-4 sm:p-5 rounded-lg bg-[#141517] border border-stone-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="font-heading text-[11px] font-bold tracking-widest text-stone-400 uppercase block">
              HABIS / NONAKTIF
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-heading font-extrabold text-red-400">
                {outOfStockCount}
              </span>
              <span className="text-xs text-red-400/80 font-sans">Perlu Restock</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/60 text-red-400">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Kategori Master */}
        <div className="p-4 sm:p-5 rounded-lg bg-[#141517] border border-stone-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="font-heading text-[11px] font-bold tracking-widest text-stone-400 uppercase block">
              KATEGORI MASTER
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-heading font-extrabold text-stone-100">
                {categoryMasterCount}
              </span>
              <span className="text-xs text-stone-400 font-sans">
                {subCategoryMasterCount} Subkategori
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400">
            <LayoutGrid className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          FILTER & ACTIONS BAR
         ========================================================================= */}
      <div className="space-y-3 pt-2">
        {/* Baris 1: Search Input & Category Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Cari nama menu, kode SKU, atau deskripsi..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-[#141517] border border-stone-800 rounded-lg text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-[#C5A880] transition-colors"
            />
          </div>

          {/* Kategori Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => {
                setSelectedCategorySlug("all");
                setSelectedSubCategorySlug("all");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded text-xs font-heading font-bold uppercase tracking-wider shrink-0 transition-colors ${
                selectedCategorySlug === "all"
                  ? "bg-[#C5A880] text-stone-950 shadow-sm"
                  : "bg-[#161719] border border-stone-800 text-stone-400 hover:text-stone-200"
              }`}
            >
              Semua ({menus.length})
            </button>

            {categories.map((c) => {
              const count = menus.filter((m) => m.category_id === c.id).length;
              const isActive = selectedCategorySlug === c.slug;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCategorySlug(c.slug);
                    setSelectedSubCategorySlug("all");
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-2 rounded text-xs font-heading font-bold uppercase tracking-wider shrink-0 transition-colors ${
                    isActive
                      ? "bg-[#C5A880] text-stone-950 shadow-sm"
                      : "bg-[#161719] border border-stone-800 text-stone-400 hover:text-stone-200"
                  }`}
                >
                  {c.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Baris 2: Sub-Kategori Pills, Status Dropdown, Batch Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Sub Categories Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="font-heading font-bold text-stone-500 uppercase tracking-widest text-[11px] mr-1">
              SUB:
            </span>

            <button
              onClick={() => {
                setSelectedSubCategorySlug("all");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1.5 rounded-sm text-[11px] font-heading font-bold uppercase tracking-wider shrink-0 transition-colors ${
                selectedSubCategorySlug === "all"
                  ? "bg-stone-200 text-stone-950"
                  : "bg-[#161719] border border-stone-800 text-stone-400 hover:text-stone-200"
              }`}
            >
              Semua Sub
            </button>

            {availableSubCategories.map((s) => {
              const count = menus.filter((m) => m.sub_category_id === s.id).length;
              const isActive = selectedSubCategorySlug === s.slug;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSubCategorySlug(s.slug);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1.5 rounded-sm text-[11px] font-heading font-bold uppercase tracking-wider shrink-0 transition-colors ${
                    isActive
                      ? "bg-[#C5A880] text-stone-950"
                      : "bg-[#161719] border border-stone-800 text-stone-400 hover:text-stone-200"
                  }`}
                >
                  {s.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Status Dropdown & Batch Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "all" | "available" | "unavailable");
                setCurrentPage(1);
              }}
              className="bg-[#141517] border border-stone-800 rounded px-2.5 py-1.5 text-stone-300 text-xs focus:outline-none focus:border-[#C5A880]"
            >
              <option value="all">Status: Semua Status</option>
              <option value="available">Status: Hanya Tersedia</option>
              <option value="unavailable">Status: Hanya Habis</option>
            </select>

            <button
              onClick={handleBatchToggleStatus}
              disabled={selectedMenuIds.size === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#161719] border border-stone-800 hover:border-stone-700 text-stone-300 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Ubah Status</span>
            </button>

            <button
              onClick={handleBatchDelete}
              disabled={selectedMenuIds.size === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#161719] border border-stone-800 hover:border-red-900 text-red-400 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TABLE MENU & KATALOG
         ========================================================================= */}
      <div className="rounded-lg border border-stone-800 bg-[#141517] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#101113] border-b border-stone-800 text-stone-400 font-heading font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedMenus.length > 0 &&
                      paginatedMenus.every((m) => selectedMenuIds.has(m.id))
                    }
                    onChange={(e) => handleToggleSelectAll(e.target.checked)}
                    className="rounded bg-stone-900 border-stone-700 text-[#C5A880] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="p-3.5 w-20">VISUAL</th>
                <th className="p-3.5">MENU & INFO DESKRIPSI</th>
                <th className="p-3.5">KATEGORI MASTER</th>
                <th className="p-3.5">HARGA POS</th>
                <th className="p-3.5">KETERSEDIAAN</th>
                <th className="p-3.5 text-center">URUTAN</th>
                <th className="p-3.5 text-right pr-5">AKSI</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-stone-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#C5A880] mb-2" />
                    <span>Memuat data menu Chillax...</span>
                  </td>
                </tr>
              ) : paginatedMenus.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-stone-500">
                    Tidak ada menu yang sesuai dengan filter atau kata kunci pencarian.
                  </td>
                </tr>
              ) : (
                paginatedMenus.map((menu, idx) => {
                  const isChecked = selectedMenuIds.has(menu.id);
                  const displayOrder = String(menu.order_index || idx + 1).padStart(2, "0");

                  return (
                    <tr
                      key={menu.id}
                      className={`hover:bg-stone-900/60 transition-colors ${
                        isChecked ? "bg-stone-900/40" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectRow(menu.id)}
                          className="rounded bg-stone-900 border-stone-700 text-[#C5A880] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Visual Thumbnail */}
                      <td className="p-3.5">
                        <div className="relative w-12 h-12 rounded bg-[#1E2024] border border-stone-800 overflow-hidden flex items-center justify-center shrink-0">
                          {menu.image_url ? (
                            <Image
                              src={menu.image_url}
                              alt={menu.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Camera className="w-4 h-4 text-stone-600" />
                          )}
                        </div>
                      </td>

                      {/* Menu & Deskripsi */}
                      <td className="p-3.5 max-w-xs">
                        <div className="font-heading font-bold text-sm text-stone-100">
                          {menu.name}
                        </div>
                        <div className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                          {menu.description || "-"}
                        </div>
                        <span className="text-[10px] text-stone-500 font-mono">
                          {menu.sku}
                        </span>
                      </td>

                      {/* Kategori Master */}
                      <td className="p-3.5">
                        <div className="font-heading font-semibold text-stone-200">
                          {menu.category?.name || "Uncategorized"}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {menu.sub_category?.name || "-"}
                        </div>
                      </td>

                      {/* Harga POS */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-xs bg-[#C5A880] text-stone-950 px-1.5 py-0.5 rounded">
                            {formatPriceK(menu.price)}
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono">
                            {formatRupiah(menu.price)}
                          </span>
                        </div>
                      </td>

                      {/* Ketersediaan Stok (Clickable Pill) */}
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleAvailability(menu)}
                          title="Klik untuk ubah status ketersediaan"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            menu.is_available
                              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900/60"
                              : "bg-red-950/60 text-red-300 border border-red-800/80 hover:bg-red-900/60"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              menu.is_available ? "bg-emerald-400" : "bg-red-400"
                            }`}
                          />
                          <span>{menu.is_available ? "Tersedia" : "Habis"}</span>
                        </button>
                      </td>

                      {/* Urutan */}
                      <td className="p-3.5 text-center font-mono text-stone-400">
                        #{displayOrder}
                      </td>

                      {/* Aksi (Visibility, Edit, Delete) */}
                      <td className="p-3.5 text-right pr-5">
                        <div className="flex items-center justify-end gap-1.5 text-stone-400">
                          {/* Toggle Visibility */}
                          <button
                            onClick={() => handleToggleVisibility(menu)}
                            title={menu.is_visible ? "Sembunyikan dari web QR" : "Tampilkan di web QR"}
                            className="p-1.5 rounded hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
                          >
                            {menu.is_visible ? (
                              <Eye className="w-4 h-4 text-[#C5A880]" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-stone-600" />
                            )}
                          </button>

                          {/* Edit Menu */}
                          <button
                            onClick={() => handleOpenEdit(menu)}
                            title="Edit Menu"
                            className="p-1.5 rounded hover:text-[#C5A880] hover:bg-stone-800 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Delete Menu */}
                          <button
                            onClick={() => handleDeleteMenu(menu.id, menu.name)}
                            title="Hapus Menu"
                            className="p-1.5 rounded hover:text-red-400 hover:bg-stone-800 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* =========================================================================
            PAGINATION BAR
           ========================================================================= */}
        <div className="p-4 bg-[#101113] border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <div>
            Menampilkan{" "}
            <span className="text-stone-200 font-semibold">
              {filteredMenus.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            -{" "}
            <span className="text-stone-200 font-semibold">
              {Math.min(currentPage * itemsPerPage, filteredMenus.length)}
            </span>{" "}
            dari{" "}
            <span className="text-stone-200 font-semibold">{filteredMenus.length}</span> item menu
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-stone-800 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed text-stone-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              const isActive = currentPage === page;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded text-xs font-heading font-semibold transition-colors ${
                    isActive
                      ? "bg-[#C5A880] text-stone-950 font-bold"
                      : "border border-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-800"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-stone-800 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed text-stone-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DRAWER: EDIT MENU & TAMBAH MENU BARU (SESUAI GAMBAR 1 & 2)
         ========================================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => !isSaving && setIsDrawerOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-[#141517] border-l border-stone-800 shadow-2xl flex flex-col justify-between">
              {/* Drawer Header */}
              <div className="p-6 border-b border-stone-800/80 flex items-start justify-between">
                <div>
                  <span className="font-heading font-bold text-xs tracking-widest text-[#C5A880] uppercase block">
                    EDITOR MENU POS &bull; {formSku || "SKU-BARU"}
                  </span>
                  <h2 className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight uppercase text-stone-100 mt-1">
                    {drawerMode === "add" ? "TAMBAH MENU BARU" : `EDIT MENU: ${formName || "ITEM"}`}
                  </h2>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-100 rounded-md hover:bg-stone-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body Form */}
              <form id="menu-drawer-form" onSubmit={handleSaveMenu} className="flex-1 p-6 space-y-5 overflow-y-auto font-sans">
                {/* 1. Foto Produk Menu */}
                <div className="space-y-2">
                  <label className="block font-heading font-semibold text-xs tracking-wider uppercase text-stone-300">
                    Foto Produk Menu
                  </label>

                  <div className="grid grid-cols-2 gap-3 items-center">
                    {/* Preview Area */}
                    <div className="relative aspect-[4/3] rounded-lg bg-[#1E2024] border border-stone-800 overflow-hidden flex items-center justify-center">
                      {previewFileUrl ? (
                        <Image
                          src={previewFileUrl}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      ) : formImageUrl ? (
                        <Image
                          src={formImageUrl}
                          alt={formName || "Menu Image"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="text-center text-stone-600">
                          <Camera className="w-8 h-8 mx-auto stroke-[1.2]" />
                          <span className="text-[10px] tracking-wider uppercase block mt-1">Kosong</span>
                        </div>
                      )}
                    </div>

                    {/* Upload Dropzone Button */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-[4/3] rounded-lg border border-dashed border-stone-700 hover:border-[#C5A880] bg-[#101113] p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
                    >
                      <UploadCloud className="w-7 h-7 text-stone-500 group-hover:text-[#C5A880] transition-colors mb-1.5" />
                      <span className="text-xs font-heading font-semibold text-stone-200 group-hover:text-[#C5A880]">
                        Pilih File Foto Baru
                      </span>
                      <span className="text-[10px] text-stone-500 mt-1 leading-tight">
                        Format JPG/PNG, Maks. 2MB (Rasio 1:1 atau 4:3)
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Nama Menu */}
                <div className="space-y-1.5">
                  <label className="block font-heading font-semibold text-xs tracking-wider uppercase text-stone-300">
                    Nama Menu
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: French Fries, Kopi Susu Chillax"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#0C0D0E] border border-stone-800 rounded-lg text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                {/* 3. Kategori Utama & Sub-kategori */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block font-heading font-semibold text-xs tracking-wider uppercase text-stone-300">
                      Kategori Utama
                    </label>
                    <select
                      value={formCategoryId}
                      onChange={(e) => {
                        setFormCategoryId(e.target.value);
                        setFormSubCategoryId("");
                      }}
                      required
                      className="w-full px-3 py-2.5 bg-[#0C0D0E] border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-[#C5A880]"
                    >
                      <option value="">Pilih Kategori...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-heading font-semibold text-xs tracking-wider uppercase text-stone-300">
                      Sub-kategori
                    </label>
                    <select
                      value={formSubCategoryId}
                      onChange={(e) => setFormSubCategoryId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#0C0D0E] border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-[#C5A880]"
                    >
                      <option value="">Pilih Sub-kategori (Opsional)</option>
                      {formSubCategories.map((sc) => (
                        <option key={sc.id} value={sc.id}>
                          {sc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Harga Jual & Format Web */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-heading font-semibold text-xs tracking-wider uppercase text-stone-300">
                      Harga Jual (IDR)
                    </label>
                    <span className="text-xs text-stone-400">
                      Format Web:{" "}
                      <strong className="text-[#C5A880]">
                        {formPrice ? formatPriceK(Number(formPrice)) : "0K"}
                      </strong>
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="13000"
                      min={0}
                      step={500}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0C0D0E] border border-stone-800 rounded-lg text-sm text-stone-100 focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>

                {/* 5. Deskripsi Singkat Menu */}
                <div className="space-y-1.5">
                  <label className="block font-heading font-semibold text-xs tracking-wider uppercase text-stone-300">
                    Deskripsi Singkat Menu
                  </label>
                  <textarea
                    rows={3}
                    maxLength={160}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Contoh: Kentang goreng renyah bumbu racik istimewa dengan saus cocolan khas Chillax."
                    className="w-full px-3.5 py-2.5 bg-[#0C0D0E] border border-stone-800 rounded-lg text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-[#C5A880] leading-relaxed resize-none"
                  />
                  <div className="text-right text-[11px] text-stone-500 font-mono">
                    {formDescription.length}/160 Karakter
                  </div>
                </div>

                {/* 6. Toggle Ketersediaan Stok (In Stock) */}
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#0C0D0E] border border-stone-800">
                  <div>
                    <span className="font-heading font-bold text-xs uppercase tracking-wider text-stone-200 block">
                      Ketersediaan Stok (In Stock)
                    </span>
                    <span className="text-[11px] text-stone-400 block mt-0.5">
                      Jika dimatikan, status langsung berubah menjadi &apos;Habis&apos; di web
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formIsAvailable}
                    onChange={(e) => setFormIsAvailable(e.target.checked)}
                    className="w-5 h-5 rounded bg-stone-900 border-stone-700 text-[#C5A880] focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* 7. Toggle Tampilkan di Web QR Pelanggan */}
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#0C0D0E] border border-stone-800">
                  <div>
                    <span className="font-heading font-bold text-xs uppercase tracking-wider text-stone-200 block">
                      Tampilkan di Web QR Pelanggan
                    </span>
                    <span className="text-[11px] text-stone-400 block mt-0.5">
                      Izinkan pelanggan melihat dan memesan menu ini
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formIsVisible}
                    onChange={(e) => setFormIsVisible(e.target.checked)}
                    className="w-5 h-5 rounded bg-stone-900 border-stone-700 text-[#C5A880] focus:ring-0 cursor-pointer"
                  />
                </div>
              </form>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-stone-800/80 bg-[#101113] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-lg bg-[#222428] hover:bg-stone-800 text-stone-300 font-heading font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  form="menu-drawer-form"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#C5A880] hover:bg-[#d8bb93] text-stone-950 font-heading font-bold text-xs tracking-wider uppercase shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
