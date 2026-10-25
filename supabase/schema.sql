-- ==============================================================================
-- DATABASE SCHEMA: CHILLAX COFFEE (MENU DIGITAL & ADMIN DASHBOARD)
-- ==============================================================================
-- Eksekusi seluruh skrip ini di:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABEL KATEGORI UTAMA (Categories: Food, Drinks, Bundling, Merch, Beans)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT 'Utensils',
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. TABEL SUB-KATEGORI (Sub-categories: Snack, Pastry, Dessert, Coffee, etc.)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sub_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_category_sub_slug UNIQUE (category_id, slug)
);

-- ==============================================================================
-- 4. TABEL DAFTAR MENU (Menus: SKU, nama, harga, deskripsi, stok, visibilitas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(255),
    price INT NOT NULL CHECK (price >= 0),
    image_url TEXT,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    sub_category_id UUID REFERENCES public.sub_categories(id) ON DELETE SET NULL,
    is_available BOOLEAN NOT NULL DEFAULT true, -- Stok: true = Tersedia (In Stock), false = Habis (Sold Out)
    is_visible BOOLEAN NOT NULL DEFAULT true,   -- Tampilkan di Web QR Pelanggan: true = Tampil, false = Sembunyi
    order_index INT NOT NULL DEFAULT 0,        -- Urutan tampilan (#01, #02, dst.)
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 5. FUNCTION & TRIGGER UNTUK AUTO-UPDATE TIMESTAMP updated_at
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_categories ON public.categories;
CREATE TRIGGER trigger_update_categories
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_update_sub_categories ON public.sub_categories;
CREATE TRIGGER trigger_update_sub_categories
    BEFORE UPDATE ON public.sub_categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_update_menus ON public.menus;
CREATE TRIGGER trigger_update_menus
    BEFORE UPDATE ON public.menus
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

-- --- Kebijakan Tabel categories ---
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" 
ON public.categories FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Authenticated can insert categories" ON public.categories;
CREATE POLICY "Authenticated can insert categories" 
ON public.categories FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update categories" ON public.categories;
CREATE POLICY "Authenticated can update categories" 
ON public.categories FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Authenticated can delete categories" ON public.categories;
CREATE POLICY "Authenticated can delete categories" 
ON public.categories FOR DELETE 
TO authenticated 
USING (true);

-- --- Kebijakan Tabel sub_categories ---
DROP POLICY IF EXISTS "Public can view sub_categories" ON public.sub_categories;
CREATE POLICY "Public can view sub_categories" 
ON public.sub_categories FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Authenticated can insert sub_categories" ON public.sub_categories;
CREATE POLICY "Authenticated can insert sub_categories" 
ON public.sub_categories FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update sub_categories" ON public.sub_categories;
CREATE POLICY "Authenticated can update sub_categories" 
ON public.sub_categories FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Authenticated can delete sub_categories" ON public.sub_categories;
CREATE POLICY "Authenticated can delete sub_categories" 
ON public.sub_categories FOR DELETE 
TO authenticated 
USING (true);

-- --- Kebijakan Tabel menus ---
-- Pelanggan (anon) hanya dapat melihat menu yang 'is_visible = true'
DROP POLICY IF EXISTS "Public can view visible menus" ON public.menus;
CREATE POLICY "Public can view visible menus" 
ON public.menus FOR SELECT 
TO anon
USING (is_visible = true);

-- Admin (authenticated) dapat melihat semua menu (termasuk yang disembunyikan)
DROP POLICY IF EXISTS "Admins can view all menus" ON public.menus;
CREATE POLICY "Admins can view all menus" 
ON public.menus FOR SELECT 
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated can insert menus" ON public.menus;
CREATE POLICY "Authenticated can insert menus" 
ON public.menus FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update menus" ON public.menus;
CREATE POLICY "Authenticated can update menus" 
ON public.menus FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Authenticated can delete menus" ON public.menus;
CREATE POLICY "Authenticated can delete menus" 
ON public.menus FOR DELETE 
TO authenticated 
USING (true);

-- ==============================================================================
-- 7. SUPABASE STORAGE BUCKET: menu-images
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view menu images" ON storage.objects;
CREATE POLICY "Public can view menu images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "Authenticated can upload menu images" ON storage.objects;
CREATE POLICY "Authenticated can upload menu images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "Authenticated can update menu images" ON storage.objects;
CREATE POLICY "Authenticated can update menu images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "Authenticated can delete menu images" ON storage.objects;
CREATE POLICY "Authenticated can delete menu images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'menu-images');

-- ==============================================================================
-- 8. SEED DATA (DATA AWAL SESUAI DESAIN & SCREENSHOT CHILLAX COFFEE)
-- ==============================================================================

-- Kategori Utama
INSERT INTO public.categories (name, slug, icon, order_index)
VALUES 
    ('Food', 'food', 'Utensils', 1),
    ('Drinks', 'drinks', 'Coffee', 2),
    ('Bundling', 'bundling', 'Package', 3),
    ('Merch', 'merch', 'ShoppingBag', 4),
    ('Beans', 'beans', 'Sparkles', 5)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, icon = EXCLUDED.icon, order_index = EXCLUDED.order_index;

-- Sub-kategori untuk Food
DO $$
DECLARE
    food_id UUID;
    drinks_id UUID;
BEGIN
    SELECT id INTO food_id FROM public.categories WHERE slug = 'food' LIMIT 1;
    SELECT id INTO drinks_id FROM public.categories WHERE slug = 'drinks' LIMIT 1;

    -- Sub Food
    IF food_id IS NOT NULL THEN
        INSERT INTO public.sub_categories (category_id, name, slug, order_index)
        VALUES 
            (food_id, 'Snack', 'snack', 1),
            (food_id, 'Pastry Manis', 'pastry-manis', 2),
            (food_id, 'Pastry Gurih', 'pastry-gurih', 3),
            (food_id, 'Dessert', 'dessert', 4),
            (food_id, 'Main Course', 'main-course', 5)
        ON CONFLICT (category_id, slug) DO UPDATE
        SET name = EXCLUDED.name, order_index = EXCLUDED.order_index;
    END IF;

    -- Sub Drinks
    IF drinks_id IS NOT NULL THEN
        INSERT INTO public.sub_categories (category_id, name, slug, order_index)
        VALUES 
            (drinks_id, 'Coffee', 'coffee', 1),
            (drinks_id, 'Non-Coffee', 'non-coffee', 2),
            (drinks_id, 'Tea', 'tea', 3),
            (drinks_id, 'Signature', 'signature', 4)
        ON CONFLICT (category_id, slug) DO UPDATE
        SET name = EXCLUDED.name, order_index = EXCLUDED.order_index;
    END IF;
END $$;

-- Menu Awal Sesuai Gambar
DO $$
DECLARE
    food_id UUID;
    drinks_id UUID;
    sub_snack_id UUID;
    sub_pastry_gurih_id UUID;
    sub_coffee_id UUID;
BEGIN
    SELECT id INTO food_id FROM public.categories WHERE slug = 'food' LIMIT 1;
    SELECT id INTO drinks_id FROM public.categories WHERE slug = 'drinks' LIMIT 1;

    SELECT id INTO sub_snack_id FROM public.sub_categories WHERE slug = 'snack' AND category_id = food_id LIMIT 1;
    SELECT id INTO sub_pastry_gurih_id FROM public.sub_categories WHERE slug = 'pastry-gurih' AND category_id = food_id LIMIT 1;
    SELECT id INTO sub_coffee_id FROM public.sub_categories WHERE slug = 'coffee' AND category_id = drinks_id LIMIT 1;

    -- 1. French Fries (Tersedia, 13K)
    INSERT INTO public.menus (sku, name, description, price, category_id, sub_category_id, is_available, is_visible, order_index, image_url)
    VALUES (
        'SKU-001',
        'French Fries',
        'Crispy golden French fries with a perfectly seasoned exterior',
        13000,
        food_id,
        sub_snack_id,
        true,
        true,
        1,
        'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80'
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        is_available = EXCLUDED.is_available, is_visible = EXCLUDED.is_visible, order_index = EXCLUDED.order_index;

    -- 2. Cireng Ayam (Tersedia, 15K)
    INSERT INTO public.menus (sku, name, description, price, category_id, sub_category_id, is_available, is_visible, order_index, image_url)
    VALUES (
        'SKU-002',
        'Cireng Ayam',
        'Cireng isi ayam blend rendang (isi 4)',
        15000,
        food_id,
        sub_snack_id,
        true,
        true,
        2,
        'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80'
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price;

    -- 3. Risol Mayo (Tersedia, 13K)
    INSERT INTO public.menus (sku, name, description, price, category_id, sub_category_id, is_available, is_visible, order_index, image_url)
    VALUES (
        'SKU-003',
        'Risol Mayo',
        'Risol dengan isian ayam, keju, telur, dan mayonnaise (isi 3)',
        13000,
        food_id,
        sub_snack_id,
        true,
        true,
        3,
        'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80'
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price;

    -- 4. Tahu Walik Crispy (Tersedia, 10K)
    INSERT INTO public.menus (sku, name, description, price, category_id, sub_category_id, is_available, is_visible, order_index, image_url)
    VALUES (
        'SKU-004',
        'Tahu Walik Crispy',
        'Tahu goreng isi adonan bakso ayam gurih renyah dengan saus cocolan kecap pedas (isi 5)',
        10000,
        food_id,
        sub_snack_id,
        true,
        true,
        4,
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80'
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price;

    -- 5. Singkong Keju Gurih (HABIS / SOLD OUT, 12K - Sesuai status merah di Dashboard)
    INSERT INTO public.menus (sku, name, description, price, category_id, sub_category_id, is_available, is_visible, order_index, image_url)
    VALUES (
        'SKU-005',
        'Singkong Keju Gurih',
        'Singkong empuk merekah bertabur keju cheddar gurih berlimpah',
        12000,
        food_id,
        sub_snack_id,
        false, -- Habis / Sold Out
        true,
        5,
        'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        is_available = EXCLUDED.is_available;

    -- 6. Chicken Wings BBQ (Tersedia, 17K)
    INSERT INTO public.menus (sku, name, description, price, category_id, sub_category_id, is_available, is_visible, order_index, image_url)
    VALUES (
        'SKU-006',
        'Chicken Wings BBQ',
        'Sayap ayam panggang glaze BBQ smoky manis gurih dengan taburan biji wijen (isi 4)',
        17000,
        food_id,
        sub_snack_id,
        true,
        true,
        6,
        'https://images.unsplash.com/photo-1527477378408-1bc09c2a5c32?auto=format&fit=crop&w=800&q=80'
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price;

    -- 7. Kopi Susu Chillax (Tersedia, 18K)
    IF drinks_id IS NOT NULL AND sub_coffee_id IS NOT NULL THEN
        INSERT INTO public.menus (sku, name, description, price, category_id, sub_category_id, is_available, is_visible, order_index, image_url)
        VALUES (
            'SKU-007',
            'Kopi Susu Chillax',
            'Espresso house blend Chillax, susu segar creamy, gula aren asli',
            18000,
            drinks_id,
            sub_coffee_id,
            true,
            true,
            7,
            'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80'
        )
        ON CONFLICT (sku) DO UPDATE SET
            name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price;
    END IF;

    -- 8. Croissant Butter (Tersedia, 22K)
    IF food_id IS NOT NULL AND sub_pastry_gurih_id IS NOT NULL THEN
        INSERT INTO public.menus (sku, name, description, price, category_id, sub_category_id, is_available, is_visible, order_index, image_url)
        VALUES (
            'SKU-008',
            'Croissant Butter',
            'Pastry lapis renyah dengan aroma dan cita rasa butter premium',
            22000,
            food_id,
            sub_pastry_gurih_id,
            true,
            true,
            8,
            'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80'
        )
        ON CONFLICT (sku) DO UPDATE SET
            name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price;
    END IF;
END $$;
