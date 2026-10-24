export interface Category {
  id: string
  name: string
  slug: string
  order_index: number
  created_at: string
}

export interface MenuItem {
  id: string
  category_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  category?: Category
}

export interface TableQRCode {
  table_number: number
  qr_url: string
}
