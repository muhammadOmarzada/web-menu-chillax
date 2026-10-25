export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export interface SubCategory {
  id: string
  category_id: string
  name: string
  slug: string
  order_index: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface MenuItem {
  id: string
  sku: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category_id: string
  sub_category_id: string | null
  is_available: boolean // Ketersediaan Stok (In Stock vs Habis)
  is_visible: boolean   // Tampilkan di Web QR Pelanggan
  is_featured?: boolean // Tag Rekomendasi/Favorit (FAV)
  order_index: number   // Urutan tampilan (#01, #02, dst.)
  created_at: string
  updated_at: string
  category?: Category
  sub_category?: SubCategory
}

export interface TableQRCode {
  table_number: number
  qr_url: string
}
