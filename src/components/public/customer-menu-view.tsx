"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { 
  Utensils, 
  Camera, 
  Clock 
} from "lucide-react";
import { Category, SubCategory, MenuItem } from "@/types/database";
import { formatPriceK } from "@/lib/utils";
import { getCategoryIconComponent } from "@/lib/category-icons";

interface CustomerMenuViewProps {
  initialCategories: Category[];
  initialSubCategories: SubCategory[];
  initialMenus: MenuItem[];
}

export function CustomerMenuView({
  initialCategories,
  initialSubCategories,
  initialMenus,
}: CustomerMenuViewProps) {
  // State kategori utama aktif (default: slug kategori pertama jika ada)
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>(() => {
    return initialCategories[0]?.slug || "";
  });

  // Ambil objek kategori yang sedang aktif
  const activeCategory = useMemo(() => {
    return initialCategories.find((c) => c.slug === activeCategorySlug) || initialCategories[0];
  }, [initialCategories, activeCategorySlug]);

  // Sub-kategori yang dimiliki oleh kategori aktif
  const subCategoriesForActiveCategory = useMemo(() => {
    if (!activeCategory) return [];
    return initialSubCategories.filter((sc) => sc.category_id === activeCategory.id);
  }, [initialSubCategories, activeCategory]);

  // State sub-kategori aktif (default: sub-kategori pertama dalam kategori aktif jika ada)
  const [activeSubCategorySlug, setActiveSubCategorySlug] = useState<string>(() => {
    return subCategoriesForActiveCategory[0]?.slug || "";
  });

  // Jika kategori berganti, reset sub-kategori ke yang pertama di bawah kategori tersebut
  const handleSelectCategory = (slug: string) => {
    setActiveCategorySlug(slug);
    const cat = initialCategories.find((c) => c.slug === slug);
    if (cat) {
      const subs = initialSubCategories.filter((sc) => sc.category_id === cat.id);
      if (subs.length > 0) {
        setActiveSubCategorySlug(subs[0].slug);
      } else {
        setActiveSubCategorySlug("");
      }
    }
  };

  // Filter daftar menu berdasarkan kategori utama dan sub-kategori aktif
  const filteredMenus = useMemo(() => {
    if (!activeCategory) return [];
    return initialMenus.filter((menu) => {
      const matchCategory = menu.category_id === activeCategory.id;
      if (!matchCategory) return false;

      // Jika ada sub-kategori yang dipilih
      if (activeSubCategorySlug && subCategoriesForActiveCategory.length > 0) {
        const activeSub = subCategoriesForActiveCategory.find(
          (sc) => sc.slug === activeSubCategorySlug
        );
        if (activeSub) {
          return menu.sub_category_id === activeSub.id;
        }
      }
      return true;
    });
  }, [initialMenus, activeCategory, activeSubCategorySlug, subCategoriesForActiveCategory]);

  // Nama sub-kategori untuk judul section
  const currentSubCategoryName = useMemo(() => {
    const sub = subCategoriesForActiveCategory.find((s) => s.slug === activeSubCategorySlug);
    return sub?.name || activeCategory?.name || "MENU";
  }, [subCategoriesForActiveCategory, activeSubCategorySlug, activeCategory]);

  return (
    <div className="w-full text-stone-100 pb-12 font-sans">
      {/* =========================================================================
          1. HEADER SECTION (Responsive: Compact di Mobile, Centered Hero di Desktop)
         ========================================================================= */}
      
      {/* Tampilan Header Desktop */}
      <header className="hidden md:flex flex-col items-center text-center pt-10 pb-8 px-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white p-1 shadow-2xl ring-1 ring-stone-800 transition-transform duration-300 hover:scale-105">
          <Image
            src="/images/logo.png"
            alt="Chillax Coffee Logo"
            fill
            className="object-contain p-0.5"
            priority
          />
        </div>
        <h1 className="mt-5 text-3xl sm:text-4xl font-heading font-extrabold tracking-[0.2em] text-stone-100 uppercase leading-none">
          CHILLAX COFFEE
        </h1>
        <p className="mt-3 text-stone-400 font-sans text-xs sm:text-sm max-w-lg font-normal leading-relaxed tracking-wide">
          Where raw aesthetics meet artisanal coffee. Experience the perfect blend of urban edge and cozy comfort in every cup.
        </p>
      </header>

      {/* Tampilan Header Mobile */}
      <header className="flex md:hidden items-center justify-between gap-3 pt-4 pb-3 px-1 border-b border-stone-800/80 mb-5">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative w-11 h-11 shrink-0 rounded-full overflow-hidden bg-white p-0.5 ring-1 ring-stone-700 shadow-md">
            <Image
              src="/images/logo.png"
              alt="Chillax Coffee Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-sm sm:text-base font-heading font-bold tracking-[0.18em] text-stone-100 uppercase leading-none">
              CHILLAX COFFEE
            </h1>
            <p className="text-[11px] font-sans text-stone-400 truncate mt-1 tracking-tight">
              Where raw aesthetics meet artisanal coffee
            </p>
          </div>
        </div>
        {/* Indikator Jam Buka di Mobile Header */}
        <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161719] border border-stone-800 text-[10px] font-heading text-[#C5A880] font-semibold tracking-wider uppercase">
          <Clock className="w-3 h-3 text-[#C5A880]" aria-hidden="true" />
          <span>07:00 - 23:00</span>
        </div>
      </header>

      {initialCategories.length === 0 ? (
        /* Empty State ketika database Supabase kosong */
        <div className="w-full py-20 px-4 text-center bg-[#141517] border border-stone-800 rounded-lg flex flex-col items-center justify-center my-6">
          <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 mb-3 shadow-inner">
            <Utensils className="w-6 h-6 stroke-[1.5] text-[#C5A880]/70" />
          </div>
          <h2 className="font-heading font-bold text-sm sm:text-base tracking-widest uppercase text-stone-200 mb-1">
            Menu Belum Tersedia
          </h2>
          <p className="font-sans text-xs text-stone-400 max-w-sm leading-relaxed">
            Daftar menu saat ini belum tersedia atau database masih kosong.
          </p>
        </div>
      ) : (
        <>
          {/* =========================================================================
              2. MAIN CATEGORIES TABS (FOOD, DRINKS, BUNDLING, MERCH, BEANS)
             ========================================================================= */}
          <nav 
            aria-label="Kategori Utama Menu" 
            className="w-full mb-3"
          >
            <div className="flex md:justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
              {initialCategories.map((category) => {
                const IconComponent = getCategoryIconComponent(category.icon || category.slug);
                const isActive = category.slug === activeCategorySlug;

                return (
                  <button
                    key={category.id}
                    onClick={() => handleSelectCategory(category.slug)}
                    aria-current={isActive ? "page" : undefined}
                    className={`min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded font-heading text-xs font-bold tracking-[0.08em] uppercase transition-all duration-150 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] ${
                      isActive
                        ? "bg-[#C5A880] text-stone-950 shadow-md"
                        : "bg-[#161719] border border-stone-800 text-stone-300 hover:text-stone-100 hover:border-stone-700"
                    }`}
                  >
                    <IconComponent className="w-4 h-4 stroke-[2]" aria-hidden="true" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* =========================================================================
              3. SUB-CATEGORIES PILLS (SNACK, PASTRY MANIS, PASTRY GURIH, DESSERT, etc.)
             ========================================================================= */}
          {subCategoriesForActiveCategory.length > 0 && (
            <nav 
              aria-label="Sub Kategori Menu" 
              className="w-full mb-6"
            >
              <div className="flex md:justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
                {subCategoriesForActiveCategory.map((subCategory) => {
                  const isActive = subCategory.slug === activeSubCategorySlug;

                  return (
                    <button
                      key={subCategory.id}
                      onClick={() => setActiveSubCategorySlug(subCategory.slug)}
                      aria-current={isActive ? "page" : undefined}
                      className={`min-h-[44px] flex items-center px-4 py-2.5 rounded-full font-heading text-xs font-bold tracking-[0.08em] uppercase transition-all duration-150 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] ${
                        isActive
                          ? "bg-[#C5A880] text-stone-950 shadow-sm"
                          : "bg-[#161719] border border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700"
                      }`}
                    >
                      {subCategory.name}
                    </button>
                  );
                })}
              </div>
            </nav>
          )}

          {/* =========================================================================
              4. SECTION HEADER (TITLE & ITEM COUNT, misal: "SNACK 5 ITEMS")
             ========================================================================= */}
          <div className="flex items-baseline justify-between mb-4 border-b border-stone-800/60 pb-2.5 px-1">
            <h2 className="font-heading font-bold text-sm sm:text-base tracking-[0.22em] text-[#C5A880] uppercase">
              {currentSubCategoryName}
            </h2>
            <span className="font-heading text-stone-400 text-xs tracking-wider uppercase font-medium">
              {filteredMenus.length} ITEMS
            </span>
          </div>

          {/* =========================================================================
              5. MENU CARDS GRID
             ========================================================================= */}
          {filteredMenus.length === 0 ? (
            <div className="w-full py-16 text-center text-stone-400 font-sans text-sm bg-[#141517] border border-stone-800 rounded-lg">
              Belum ada menu yang tersedia untuk kategori ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredMenus.map((menu) => (
                <article
                  key={menu.id}
                  className={`group rounded-md overflow-hidden bg-[#161719] border border-stone-800/90 hover:border-stone-700 transition duration-200 flex flex-col shadow-sm ${
                    !menu.is_available ? "opacity-75" : ""
                  }`}
                >
                  {/* Slot Foto Produk */}
                  <div className="relative w-full aspect-[4/3] bg-[#1E2024] flex flex-col items-center justify-center border-b border-stone-800/80 overflow-hidden">
                    {menu.image_url ? (
                      <Image
                        src={menu.image_url}
                        alt={menu.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                          !menu.is_available ? "grayscale" : ""
                        }`}
                      />
                    ) : (
                      <>
                        <div className="w-11 h-11 rounded-lg border border-stone-700/80 flex items-center justify-center text-stone-400 mb-2">
                          <Camera className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
                        </div>
                        <span className="font-heading text-[10px] tracking-[0.2em] text-stone-400 uppercase font-semibold">
                          PRODUCT IMAGE SLOT
                        </span>
                      </>
                    )}

                    {/* Badge Harga Web (Contoh: "13K") */}
                    <div 
                      className={`absolute top-2.5 right-2.5 z-10 font-heading font-bold text-xs tracking-wider px-2 py-0.5 rounded shadow ${
                        menu.is_available
                          ? "bg-[#C5A880] text-stone-950"
                          : "bg-stone-800 text-stone-400 border border-stone-700 line-through"
                      }`}
                    >
                      {formatPriceK(menu.price)}
                    </div>

                    {/* Overlay Badge Habis / Sold Out jika tidak tersedia */}
                    {!menu.is_available && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <span className="font-heading bg-red-950/90 text-red-200 border border-red-700 font-bold text-xs px-3 py-1 rounded uppercase tracking-widest shadow-lg">
                          HABIS / SOLD OUT
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Detail Menu Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-heading font-bold text-base leading-snug tracking-tight ${
                          menu.is_available ? "text-stone-100" : "text-stone-400"
                        }`}>
                          {menu.name}
                        </h3>
                        {menu.is_featured && (
                          <span className="font-heading text-[10px] bg-stone-800 border border-stone-700 text-[#C5A880] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            SIGNATURE
                          </span>
                        )}
                      </div>
                      {menu.description && (
                        <p className="font-sans text-stone-400 text-xs sm:text-sm mt-1.5 line-clamp-2 leading-relaxed font-normal">
                          {menu.description}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
