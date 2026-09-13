# Supabase CMS â€” arsitektur final

Supabase adalah satu-satunya backend runtime untuk repository ini. PostgreSQL
menyimpan konten, Supabase Auth memegang identitas/sesi, dan Supabase Storage
menyimpan media CMS. Aplikasi hanya memakai publishable key serta sesi pengguna;
tidak ada service-role atau secret key pada source code maupun environment
publik.

## Data dan tabel

| Tabel | Fungsi |
| --- | --- |
| `cms_admin_users` | Allowlist satu pengguna Supabase Auth yang boleh mengelola CMS. |
| `cms_records` | Konten, status draft/published, urutan, versi, dan timestamp. |
| `cms_revisions` | Maksimal 10 snapshot sebelum mutasi per record. |
| `cms_audit_log` | Jejak mutasi konten dan siklus media. |
| `cms_media` | Metadata, checksum, ukuran, dimensi, bucket, dan status media. |
| `cms_record_media` | Relasi eksplisit field konten dengan media. |
| `cms_media_deletion_queue` | Outbox untuk penghapusan objek Storage yang dapat dicoba ulang. |
| `cms_auth_attempts` | Warisan schema; tidak digunakan runtime login. |

`cms_records` berisi 33 record produksi yang telah direkonsiliasi. Singleton
`profile` dan `siteContent` dilindungi, sedangkan slug proyek/artikel unik per
koleksi. Frontend hanya membaca record `published`; CMS admin dapat membaca
draft melalui RLS.

## Auth dan otorisasi

Login memakai `signInWithPassword`. Route terlindungi memvalidasi identitas
dengan `getClaims()`, lalu RPC `cms_is_admin()` dan tabel allowlist memastikan
pengguna benar-benar admin. Tidak ada registrasi publik. `/admin/register` tidak
tersedia. Proxy native Next.js memperbarui cookie sesi pada route `/admin` dan
`/api/cms`.

- `anon` tidak dapat menjalankan `cms_is_admin()`;
- `authenticated` dapat menjalankannya untuk evaluasi policy;
- mutasi CMS hanya melalui RPC yang memanggil `cms_assert_admin()`;
- Origin validation tetap diterapkan pada seluruh mutation route;
- pembatasan login mengikuti rate limit bawaan Supabase Auth.

## CRUD dan konsistensi

RPC `cms_create_record`, `cms_update_record`, `cms_set_publication`,
`cms_delete_record`, dan `cms_reorder_collection` menangani validasi, audit,
revision, relasi media, dan optimistic concurrency. Aplikasi tidak melakukan
direct write ke `cms_records`. Query gagal atau koleksi kosong tidak pernah
jatuh kembali ke data bawaan atau backend lain.

## Media

Browser mengoptimalkan JPG/PNG/WebP menjadi WebP sebelum upload. Server kembali
memeriksa metadata, batas ukuran, checksum, nama, dan metadata objek setelah
upload; browser juga memeriksa signature file sebelum meminta URL upload. Objek
memakai key `<auth.uid()>/<uuid>.<ext>` agar path tidak dipengaruhi nama
pengguna. Upload memakai signed upload URL langsung ke Supabase agar dokumen
tidak melewati batas payload Vercel Function, sambil mempertahankan progress dan
pembatalan di CMS.

Media final disimpan di bucket publik `portfolio-public`; operasi upload/delete
tetap dibatasi policy kepada admin dan prefix miliknya. Metadata didaftarkan
melalui `cms_register_ready_media`. URL di field konten diubah menjadi relasi
`cms_record_media` saat RPC create/update berjalan. Media yang diganti, record
yang dihapus, atau upload yang ditinggalkan masuk ke deletion queue dan diproses
melalui Storage API tanpa service-role.

Penyimpanan objek dan transaksi PostgreSQL tidak dapat menjadi satu transaksi
ACID. Runtime menghapus objek baru bila pendaftaran metadata gagal dan memakai
outbox idempoten untuk penghapusan, sehingga kegagalan dapat dicoba ulang pada
request admin berikutnya.

## Migration

- `0001_portfolio_cms.sql`: schema, RLS, RPC konten, bucket, dan fondasi outbox;
- `0002_stage1_5_security_hardening.sql`: pencabutan execute yang tidak perlu;
- `0003_native_next_media_runtime.sql`: policy/RPC media untuk runtime native
  Next.js tanpa privileged key.

## Environment variables

```dotenv
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_PUBLIC_BUCKET=portfolio-public
```

Cloudflare D1/R2/Vinext/Workers/Sites sudah retired dan bukan opsi backend.
