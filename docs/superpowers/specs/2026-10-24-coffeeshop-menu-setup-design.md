# Architecture & Setup Specification: Responsive QR Menu & Admin Dashboard

- **Project**: Chillax Coffee (Digital Menu & Admin Dashboard)
- **Date**: 2026-10-24
- **Tech Stack**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, PostgreSQL, Supabase

## 1. Objectives & Scope
1. **Customer View**: Responsive, mobile-first digital menu catalog accessed via QR code scan at coffeeshop tables. Fast loading, category navigation, search, and real-time availability indicator.
2. **Admin Dashboard**: Secure management system to perform CRUD on menu items and categories, toggle item availability instantly, upload product photography to Supabase Storage, and generate printable table QR codes.
3. **Database & Infrastructure**: Managed PostgreSQL database and Storage on Supabase with Row Level Security (RLS) guaranteeing that public visitors can only read menu data, while write/edit operations require admin authentication.

## 2. Architecture & File Structure
```text
web-menu-chillax/
├── .env.example
├── .env.local
├── components.json
├── next.config.ts
├── supabase/
│   └── schema.sql             # Complete database schema, RLS policies, & storage
├── src/
│   ├── app/
│   │   ├── (public)/          # Customer facing view (QR scan landing)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── (auth)/            # Authentication
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── admin/             # Admin protected management
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx       # Summary metrics
│   │   │   ├── menus/         # Menu CRUD
│   │   │   ├── categories/    # Category CRUD
│   │   │   └── qrcode/        # QR Code generator & print
│   │   ├── globals.css
│   │   └── layout.tsx         # Root layout with Toaster
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── public/            # Customer menu widgets
│   │   └── admin/             # Admin management forms & dialogs
│   ├── lib/
│   │   ├── supabase/          # client, server, & middleware helpers
│   │   └── utils.ts           # currency format & utility functions
│   ├── middleware.ts          # Auth route guards
│   └── types/
│       └── database.ts        # Database type contracts
```

## 3. Database Schema Overview
- **`categories`**: `id` (UUID), `name`, `slug`, `order_index`, `created_at`.
- **`menus`**: `id` (UUID), `category_id` (FK), `name`, `description`, `price`, `image_url`, `is_available`, `is_featured`, `created_at`, `updated_at`.
- **Storage Bucket**: `menu-images` (public read, authenticated insert/update/delete).
- **RLS**: Public read allowed on `categories`, `menus`, and `storage.objects`. CUD restricted to authenticated users.

## 4. Next Implementation Phases
- **Phase 1: Database Setup & Seeding**: Run `supabase/schema.sql` in Supabase SQL Editor and add credentials to `.env.local`.
- **Phase 2: Customer Facing Menu**: Implement category tabs, search bar, menu item cards, availability badges, and item detail modal.
- **Phase 3: Admin Auth & Session Management**: Connect login page with Supabase Auth (`signInWithPassword`).
- **Phase 4: Admin CRUD (Categories & Menus)**: Implement form dialogs, image upload to Supabase Storage, and instant availability toggle.
- **Phase 5: Table QR Code Generator**: Generate dynamic table QR codes with download and print layout.
