-- ==========================================
-- SKEMA DATABASE COFFEESHOP: CHILLAX COFFEE
-- Eksekusi skrip ini di Supabase Dashboard -> SQL Editor
-- ==========================================

-- 1. Enable extension UUID jika belum aktif
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Buat Tabel Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Buat Tabel Menus
CREATE TABLE IF NOT EXISTS public.menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Aktifkan Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

-- 5. Kebijakan RLS untuk Categories
-- Siapa saja (termasuk publik / pelanggan) dapat membaca kategori
CREATE POLICY "Public categories are viewable by everyone" 
ON public.categories FOR SELECT 
USING (true);

-- Hanya user yang terautentikasi (admin) yang dapat menambah, mengubah, dan menghapus kategori
CREATE POLICY "Only authenticated users can insert categories" 
ON public.categories FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Only authenticated users can update categories" 
ON public.categories FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Only authenticated users can delete categories" 
ON public.categories FOR DELETE 
TO authenticated 
USING (true);

-- 6. Kebijakan RLS untuk Menus
-- Siapa saja dapat melihat daftar menu
CREATE POLICY "Public menus are viewable by everyone" 
ON public.menus FOR SELECT 
USING (true);

-- Hanya user yang terautentikasi (admin) yang dapat memodifikasi menu
CREATE POLICY "Only authenticated users can insert menus" 
ON public.menus FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Only authenticated users can update menus" 
ON public.menus FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Only authenticated users can delete menus" 
ON public.menus FOR DELETE 
TO authenticated 
USING (true);

-- 7. Data Awal Kategori (Opsional / Starter Data)
INSERT INTO public.categories (name, slug, order_index)
VALUES 
    ('Coffee', 'coffee', 1),
    ('Non-Coffee', 'non-coffee', 2),
    ('Pastry & Snack', 'pastry-snack', 3),
    ('Main Course', 'main-course', 4)
ON CONFLICT (slug) DO NOTHING;

-- 8. Setup Storage Bucket untuk Foto Menu
-- Catatan: Bucket 'menu-images' juga dapat dibuat langsung di dashboard Supabase Storage -> New Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- Kebijakan Storage: Publik bisa melihat foto
CREATE POLICY "Menu images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

-- Kebijakan Storage: Hanya admin terautentikasi yang bisa upload foto
CREATE POLICY "Authenticated users can upload menu images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu-images');

CREATE POLICY "Authenticated users can update menu images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'menu-images');

CREATE POLICY "Authenticated users can delete menu images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'menu-images');
