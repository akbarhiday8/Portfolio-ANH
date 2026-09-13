# Migrasi produksi: Vercel + Supabase

Website masih memakai D1/R2 agar seluruh fitur `/admin` tetap berjalan selama
migrasi. Stage 1 sudah menetapkan skema Supabase final pada
`supabase/migrations/0001_portfolio_cms.sql`, tetapi migration tersebut belum
diterapkan dan runtime belum terhubung ke Supabase.

Backup D1 produksi dengan 33 record adalah sumber migrasi resmi. Jangan memakai
D1 lokal sebagai sumber utama karena 11 `data_json` berbeda dan seluruh
timestamp produksi lebih baru.

## Urutan aktivasi

1. Buat satu proyek Supabase dan uji migration pada database kosong.
2. Buat pengguna admin Supabase Auth melalui prosedur tepercaya, lalu tambahkan
   UUID-nya ke `cms_admin_users`; tidak ada registrasi admin publik.
3. Salin `.env.example` menjadi `.env.local` dan isi kredensial tanpa
   memasukkannya ke Git.
4. Ganti adapter D1/R2 di aplikasi dengan adapter PostgreSQL/Storage Supabase
   tanpa mengubah kontrak UI/API CMS.
5. Migrasikan 33 record dari backup D1 produksi, lalu cocokkan ID, koleksi,
   slug, status, urutan, JSON, dan timestamp.
6. Migrasikan aset yang benar-benar digunakan dan isi `cms_record_media`.
7. Hubungkan repository GitHub ke Vercel dan pasang variabel lingkungan yang
   sama pada Production serta Preview.
8. Isi `NEXT_PUBLIC_SITE_URL` dengan domain Vercel final, lalu jalankan build.

Rincian tabel, RLS, bucket, RPC, dan variabel lingkungan tersedia di
`docs/SUPABASE-SCHEMA.md`. Service role hanya boleh dipakai pada server, tidak
boleh diberi awalan `NEXT_PUBLIC_`, dan tidak boleh dimasukkan ke Git.
