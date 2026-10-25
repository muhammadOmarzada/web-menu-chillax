import React from "react";
import {
  Coffee,
  CupSoda,
  Bean,
  Milk,
  Citrus,
  GlassWater,
  Wine,
  Beer,
  Croissant,
  Sandwich,
  Donut,
  CakeSlice,
  Cookie,
  IceCream,
  Pizza,
  UtensilsCrossed,
  Soup,
  Salad,
  Utensils,
  Package,
  Shirt,
} from "lucide-react";

export interface CategoryIconOption {
  name: string;
  label: string;
  icon: React.ElementType;
}

/**
 * Daftar ikon terkurasi yang murni berkaitan dengan:
 * FnB (Food & Beverages), Coffeeshop, dan Cafe.
 */
export const FNB_CATEGORY_ICONS: CategoryIconOption[] = [
  // Minuman & Kopi
  { name: "Coffee", label: "Kopi & Espresso", icon: Coffee },
  { name: "CupSoda", label: "Es Kopi / Dingin", icon: CupSoda },
  { name: "Bean", label: "Biji Kopi (Beans)", icon: Bean },
  { name: "Milk", label: "Susu & Latte", icon: Milk },
  { name: "Citrus", label: "Teh Lemon & Jus", icon: Citrus },
  { name: "GlassWater", label: "Air Mineral / Segar", icon: GlassWater },
  { name: "Wine", label: "Mocktail & Dingin", icon: Wine },
  { name: "Beer", label: "Minuman Khusus", icon: Beer },

  // Makanan, Pastry & Cafe Bites
  { name: "Croissant", label: "Croissant & Pastry", icon: Croissant },
  { name: "Sandwich", label: "Toast & Sandwich", icon: Sandwich },
  { name: "Donut", label: "Donat & Manis", icon: Donut },
  { name: "CakeSlice", label: "Cake & Tart", icon: CakeSlice },
  { name: "Cookie", label: "Cookies & Snack", icon: Cookie },
  { name: "IceCream", label: "Gelato & Es Krim", icon: IceCream },
  { name: "Pizza", label: "Pizza & Gurih", icon: Pizza },
  { name: "UtensilsCrossed", label: "Makanan Utama", icon: UtensilsCrossed },
  { name: "Soup", label: "Sup & Hangat", icon: Soup },
  { name: "Salad", label: "Salad & Sayuran", icon: Salad },

  // Bundling & Merchandise
  { name: "Package", label: "Kardus / Paket Bundling", icon: Package },
  { name: "Shirt", label: "Baju / Merchandise Kaos", icon: Shirt },
];

/**
 * Helper untuk mengambil komponen icon berdasarkan nama icon yang tersimpan di DB
 */
export function getCategoryIconComponent(iconName: string | null | undefined): React.ElementType {
  if (!iconName) return Coffee;
  const match = FNB_CATEGORY_ICONS.find(
    (item) => item.name.toLowerCase() === iconName.trim().toLowerCase()
  );
  if (match) return match.icon;

  // Fallback untuk backward compatibility nama icon lama
  if (iconName.toLowerCase() === "utensils") return UtensilsCrossed;
  if (iconName.toLowerCase() === "cake") return CakeSlice;
  if (iconName.toLowerCase() === "beans" || iconName.toLowerCase() === "sparkles") return Bean;
  if (iconName.toLowerCase() === "food") return UtensilsCrossed;
  if (iconName.toLowerCase() === "drinks") return Coffee;
  if (iconName.toLowerCase() === "package" || iconName.toLowerCase() === "box" || iconName.toLowerCase() === "bundling") return Package;
  if (iconName.toLowerCase() === "shirt" || iconName.toLowerCase() === "merch" || iconName.toLowerCase() === "shoppingbag") return Shirt;

  return Coffee;
}
