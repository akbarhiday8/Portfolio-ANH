# Skema Supabase final — Stage 1

Dokumen ini menjelaskan fondasi PostgreSQL, Supabase Auth, dan Supabase Storage
yang disiapkan untuk arsitektur akhir Next.js + Vercel. Stage 1 belum
menghubungkan aplikasi ke Supabase dan belum memigrasikan data produksi.

## Sumber data migrasi

Backup D1 produksi adalah satu-satunya sumber utama untuk migrasi berikutnya.
Backup tersebut berisi 33 record dan lebih baru daripada D1 lokal. Sebelas
`data_json` berbeda dari backup lokal, sehingga data D1 lokal tidak boleh
menimpa data produksi.

## Tabel

| Tabel | Fungsi |
| --- | --- |
| `cms_admin_users` | Allowlist pengguna Supabase Auth yang menjadi administrator. |
| `cms_records` | Konten aktif/draft, urutan, versi, dan waktu publikasi. ID lama dipertahankan sebagai `text`. |
| `cms_revisions` | Snapshot sebelum mutasi. RPC memangkas riwayat menjadi maksimal 10 per record. |
| `cms_audit_log` | Jejak create, update, publish, delete, reorder, dan siklus media. |
| `cms_media` | Metadata aset, checksum, ukuran asli/optimal, dimensi, bucket, dan status. |
| `cms_record_media` | Relasi eksplisit record–media berdasarkan `field_path`. |
| `cms_media_deletion_queue` | Transactional outbox untuk penghapusan objek Storage. |
| `cms_auth_attempts` | Rate limit tambahan berbasis kunci hash; tidak menyimpan email/IP mentah. |

Allowlist admin juga memiliki indeks unik konstan sehingga hanya satu akun
admin yang dapat aktif, sesuai kebutuhan CMS ini.

`profile` dan `siteContent` dilindungi sebagai singleton. `projects` dan
`articles` wajib memiliki slug. Slug unik per koleksi, status hanya `draft` atau
`published`, dan record publik wajib memiliki `published_at`.

## Model autentikasi dan otorisasi

Supabase Auth menjadi pemilik identitas, password, refresh token, dan sesi.
Tidak ada tabel password atau sesi kustom. Pengguna terautentikasi baru menjadi
admin jika `auth.uid()` tercantum di `cms_admin_users`.

Tidak tersedia policy atau RPC untuk mendaftarkan diri sebagai admin. Admin
pertama harus dibuat melalui alur bootstrap tepercaya pada Stage 2 atau secara
manual melalui Dashboard/server dengan service role. Ini mencegah akun pertama
diambil oleh pengunjung anonim.

## RLS

- `anon` dan pengguna terautentikasi non-admin hanya dapat membaca
  `cms_records` berstatus `published`.
- Draft tidak dapat dibaca oleh anonim/non-admin.
- Tidak ada grant tulis langsung ke tabel CMS untuk `anon` atau
  `authenticated`.
- Admin dapat membaca data pengelolaan, revisi, audit, media, dan antrean.
- Mutasi admin dilakukan melalui RPC `security definer` yang selalu memanggil
  pemeriksaan allowlist.
- `anon` tidak dapat menjalankan `cms_is_admin()`; hanya `authenticated` yang
  dapat memakainya untuk evaluasi policy/RPC.
- `anon` maupun `authenticated` tidak dapat menjalankan `rls_auto_enable()`.
- RPC CMS tetap dapat dipanggil oleh `authenticated` secara sengaja, tetapi
  setiap mutasi admin selalu menegakkan `cms_assert_admin()`.
- Metadata media publik hanya terlihat saat bucket `portfolio-public` dan
  status `ready`.
- Relasi media publik hanya terlihat jika record-nya dipublikasikan dan
  medianya siap-publik.

Service role hanya digunakan pada server dan worker antrean. Kunci tersebut
tidak boleh dikirim ke browser.

## Storage

### `portfolio-public`

Bucket publik untuk aset yang sudah siap dan digunakan konten publik. Pengunjung
dapat membaca objeknya. Penulisan/penghapusan tidak diberikan langsung kepada
browser admin; proses promosi dari staging dilakukan server tepercaya.

### `portfolio-staging`

Bucket privat untuk unggahan sementara dan aset draft. Admin dapat mengelola
objek hanya di prefix `<auth.uid()>/...`. Non-admin dan anonim tidak dapat
membaca bucket ini.

Kedua bucket membatasi berkas hingga 24 MiB dan hanya menerima format gambar,
PDF, dokumen kantor/OpenDocument, TXT, dan CSV yang telah ditentukan. SVG tidak
diizinkan untuk mengurangi risiko konten aktif.

SQL tidak menghapus `storage.objects` secara langsung. Penghapusan menggunakan
alur berikut:

1. transaksi CMS menandai media `pending_delete` dan menulis outbox;
2. worker server mengambil antrean dengan `FOR UPDATE SKIP LOCKED`;
3. worker menghapus objek lewat Supabase Storage API;
4. worker mengakui hasil melalui RPC sehingga metadata dibersihkan atau dicoba
   ulang dengan backoff.

Promosi atau penghapusan objek Storage dan transaksi PostgreSQL tidak dapat menjadi
satu transaksi ACID. Outbox, object key yang idempoten, dan proses rekonsiliasi
di Stage 2 wajib dipakai untuk menutup kemungkinan orphan object ketika salah
satu sisi gagal.

## RPC dan transaksi

| RPC | Jaminan utama |
| --- | --- |
| `cms_create_record` | Create, validasi publikasi, relasi media, dan audit dalam satu transaksi. |
| `cms_update_record` | Lock record, expected version, revision, update, relasi media, dan audit secara atomik. |
| `cms_set_publication` | Publish/unpublish atomik dan menolak media staging pada record publik. |
| `cms_delete_record` | Melindungi singleton, menghapus record, mengaudit, dan mengantrekan media orphan. |
| `cms_reorder_collection` | Mengunci koleksi, memverifikasi himpunan ID/versi, menyimpan revision, lalu mengurutkan atomik. |
| `cms_register_staged_media` | Mendaftarkan metadata staging dan memakai checksum untuk deteksi duplikat. |
| `cms_mark_media_ready` | Mengubah metadata menjadi publik setelah Storage API berhasil mempromosikan objek. |
| `cms_claim_media_deletion_batch` | Mengambil pekerjaan outbox secara aman untuk worker. |
| `cms_complete_media_deletion` | Menyelesaikan atau menjadwalkan ulang penghapusan. |
| `cms_cleanup_auth_attempts` | Membersihkan state rate-limit yang kedaluwarsa. |

Semua perubahan record memakai `version` dan `expected_version` untuk mencegah
lost update. Revision menyimpan keadaan sebelum perubahan dan dipangkas menjadi
10 record terbaru.

## Validasi publikasi

`cms_validate_record` mengulang persyaratan minimum yang saat ini diterapkan
CMS: field utama per koleksi, responsibilities untuk pengalaman, scope dan
process untuk proyek, topics untuk sertifikasi, serta sections untuk artikel.
Validasi detail tipe/panjang tetap dilakukan aplikasi pada Stage 2, sedangkan
constraint PostgreSQL menjaga keadaan yang tidak boleh dilanggar.

## Variabel lingkungan untuk tahap berikutnya

```dotenv
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_PUBLIC_BUCKET=portfolio-public
SUPABASE_STAGING_BUCKET=portfolio-staging
```

Stage 2 menyediakan factory client browser dan server yang keduanya hanya
memakai publishable key. Tidak ada secret atau service-role key pada repository
atau konfigurasi runtime saat ini. Client server menerima adapter cookie per
request; adapter tersebut baru akan dipasang ketika migrasi Supabase Auth
dikerjakan. Jangan menyimpan dump produksi, password, session, atau
kredensial di repositori.

## Batas Stage 1

- Migration belum dijalankan pada proyek Supabase nyata.
- Runtime masih Vinext + Cloudflare D1/R2.
- Factory client Supabase tersedia, tetapi belum dihubungkan ke CMS atau Auth.
- Belum ada data yang dipindahkan.
- Belum ada bucket atau akun admin produksi yang dibuat.

### Matriks verifikasi saat ini

| Pemeriksaan | Hasil Stage 1 |
| --- | --- |
| Anon tidak dapat menulis CMS | Terverifikasi statis: hanya grant `select`; tidak ada policy tulis. |
| Anon tidak dapat melihat draft | Terverifikasi statis: policy publik mensyaratkan `published`. |
| Non-admin tidak dapat menulis | Terverifikasi statis: RPC memanggil `cms_assert_admin`. |
| Admin bergantung pada allowlist | Terverifikasi statis: `cms_is_admin` membaca `cms_admin_users`. |
| Singleton tidak dapat diduplikasi | Terverifikasi statis: ID check dan unique partial index. |
| Slug duplikat ditolak | Terverifikasi statis: unique partial index per koleksi. |
| Relasi revision valid | Terverifikasi statis: FK ke record dan unique record/version. |
| Relasi audit valid | Actor memakai FK Auth; record ID sengaja bukan FK agar audit delete tidak hilang. |
| Relasi media valid | Terverifikasi statis: kedua sisi memakai FK dan field path unik per record. |
| Staging tidak terekspos | Terverifikasi statis: tidak ada policy anon dan bucket bersifat privat. |
| Migration berlaku bersih | Belum dieksekusi: membutuhkan Supabase kosong dengan schema Auth/Storage. |

Pengujian runtime RLS dan penerapan migration masih wajib dilakukan pada
Supabase lokal/preview. CLI Supabase, PostgreSQL lokal, dan daemon Docker tidak
tersedia pada lingkungan pengerjaan ini, sehingga hasil eksekusi tidak dibuat-
buat.

Sebelum Stage 2, migration harus diuji pada database Supabase kosong. Setelah
itu admin Auth pertama dapat dibuat melalui prosedur tepercaya, lalu user ID-nya
ditambahkan ke `cms_admin_users` menggunakan Dashboard/server tepercaya.
