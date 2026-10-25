-- ==============================================================================
-- QUERY SQL: MEMBUAT AKUN ADMIN CHILLAX COFFEE
-- Eksekusi di: Supabase Dashboard -> SQL Editor
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
    new_user_id UUID := gen_random_uuid();
    -- Silakan ubah email dan password sesuai keinginan Anda:
    admin_email TEXT := 'admin@chillax.com';
    admin_password TEXT := 'ChillaxAdmin2026!';
BEGIN
    -- Periksa apakah user dengan email tersebut sudah ada
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
        -- 1. Tambahkan ke tabel auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud,
            confirmation_token
        ) VALUES (
            new_user_id,
            '00000000-0000-0000-0000-000000000000',
            admin_email,
            crypt(admin_password, gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Admin Chillax"}',
            now(),
            now(),
            'authenticated',
            'authenticated',
            ''
        );

        -- 2. Tambahkan ke tabel auth.identities agar bisa login via email & password
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            new_user_id,
            format('{"sub":"%s","email":"%s"}', new_user_id::text, admin_email)::jsonb,
            'email',
            admin_email,
            now(),
            now(),
            now()
        );

        RAISE NOTICE 'Sukses! Akun Admin % berhasil dibuat.', admin_email;
    ELSE
        RAISE NOTICE 'Info: Akun Admin % sudah terdaftar.', admin_email;
    END IF;
END $$;
