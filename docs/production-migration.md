# Migrasi produksi: Vercel + Supabase

Website masih memakai D1/R2 secara lokal agar seluruh fitur /admin dapat diuji
tanpa akun layanan eksternal. Fondasi Supabase tersedia pada migration SQL di
folder supabase/migrations.

## Urutan aktivasi

1. Buat satu proyek Supabase dan jalankan migration SQL melalui SQL Editor.
2. Salin .env.example menjadi .env.local, lalu isi URL dan service role key.
3. Ganti adapter penyimpanan D1/R2 di lib/cms-server.ts dengan adapter Supabase.
   API publik tidak perlu berubah.
4. Migrasikan record CMS dan media lokal, lalu verifikasi jumlah record serta
   tautan media.
5. Hubungkan repository GitHub ke Vercel dan pasang variabel lingkungan yang
   sama pada Production serta Preview.
6. Isi NEXT_PUBLIC_SITE_URL dengan domain Vercel final, lalu jalankan build.

Service role key hanya boleh dipakai pada server. Jangan memberi nama variabel
tersebut dengan awalan NEXT_PUBLIC_ dan jangan memasukkannya ke Git.
