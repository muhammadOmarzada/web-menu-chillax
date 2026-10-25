# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, PostgreSQL (Supabase), Node.js v26.12.1.

## Users

- **Pelanggan Coffeeshop**: Pengunjung yang sedang berada di meja Chillax Coffee. Menggunakan smartphone pribadi untuk memindai QR code universal di meja guna melihat daftar menu, mengecek ketersediaan stok, harga, dan deskripsi produk secara mandiri dan cepat.
- **Admin / Pengelola Kafe**: Pemilik atau staf kafe yang mengelola katalog menu, memperbarui ketersediaan stok menu (Tersedia vs Habis / Sold Out) secara instan, mengubah harga, mengelola kategori, serta mengunggah foto produk.

## Product Purpose

Menyediakan katalog menu digital responsif dan modern untuk Chillax Coffee yang dapat diakses langsung oleh pelanggan melalui pemindaian QR Code di meja, serta menyediakan dashboard admin terproteksi untuk pengelolaan data menu dan kategori secara fleksibel dan *real-time*.

## Positioning

Katalog menu digital bergaya *raw aesthetics & artisanal coffee* yang fokus pada kecepatan akses dan kenyamanan navigasi tanpa distraksi sistem pemesanan online rumit. Menghilangkan friksi buku menu fisik yang usang atau informasi harga yang tidak mutakhir.

## Operating Context

- **Pelanggan**: Mengakses web via mobile browser (Safari/Chrome/dsb.) setelah memindai QR code meja fisik di kafe dengan koneksi internet seluler atau Wi-Fi kafe. Interaksi bersifat cepat (*glanceable* dan *browseable*).
- **Admin**: Mengakses dashboard via laptop/desktop atau tablet di meja bar/kasir dengan autentikasi email & password Supabase.

## Capabilities and Constraints

- **Confirmed Capabilities**:
  - Tampilan menu responsif mobile-first dan desktop.
  - Navigasi kategori utama (Food, Drinks, Bundling, Merch, Beans) dan sub-kategori (Snack, Pastry Manis, Pastry Gurih, Dessert, Main Course, Coffee, Non-Coffee, dsb.).
  - Indikator ketersediaan stok (*In Stock* vs *Habis*).
  - Format harga ringkas (*13K*, *15K*) dan format Rupiah resmi.
  - Dashboard manajemen menu (CRUD kategori & menu, toggle ketersediaan, upload foto ke Supabase Storage).
  - Generator QR Code meja untuk dicetak.
- **Constraints**:
  - **View-only**: Website khusus menampilkan katalog menu; tidak ada keranjang belanja, pemesanan online mandiri, ataupun integrasi payment gateway (pelanggan memesan langsung ke kasir/waiter).
  - **Universal QR Code**: Menggunakan satu tautan katalog menu umum tanpa pelacakan nomor meja otomatis.

## Brand Commitments

- **Brand Name**: Chillax Coffee
- **Tagline**: *"Where raw aesthetics meet artisanal coffee. Experience the perfect blend of urban edge and cozy comfort in every cup."*
- **Jam Operasional**: *"OPEN DAILY 07:00 - 23:00"*
- **Logo Aset**: Logo resmi lingkaran Chillax (ilustrasi tangan shaka, kereta, dan matahari) tersimpan di `public/images/logo.png`.
- **Tema Visual**: Estetika gelap (*matte dark aesthetic*), latar arang gelap (`#0C0D0E`), elemen kartu abu-abu gelap (`#161719`), serta aksen warna emas/khaki hangat (`#C5A880`).

## Evidence on Hand

- Mockup desain terverifikasi untuk tampilan mobile dan desktop ([`src/components/public/customer-menu-view.tsx`](file:///d:/web-menu-chillax/src/components/public/customer-menu-view.tsx)).
- Logo resmi tersimpan di [`public/images/logo.png`](file:///d:/web-menu-chillax/public/images/logo.png).
- Skema database relasional & seed data tersimpan di [`supabase/schema.sql`](file:///d:/web-menu-chillax/supabase/schema.sql).

## Product Principles

1. **Fast to Scan & Browse**: Halaman menu harus ringan, cepat terbuka, dan responsif saat dipindai via smartphone tanpa loading berat.
2. **Real-time Stock Clarity**: Pelanggan harus segera mengetahui apabila suatu menu sedang habis (*Sold Out*) sebelum memanggil pelayan atau memesan ke kasir.
3. **True to Brand Edge**: Menjaga identitas visual kafe tetap terasa artisanal, konsisten, dan elegan baik di layar smartphone pelanggan maupun di dashboard pengelola.

## Accessibility & Inclusion

- Rasio kontras teks tinggi pada latar gelap untuk keterbacaan optimal di berbagai kondisi pencahayaan ruangan kafe.
- Area sentuh tombol (*touch targets*) minimal 44x44px untuk kemudahan navigasi di layar smartphone.
