# Rekonsiliasi Migrasi CMS Produksi D1 ke Supabase

Status: **PASS — artefak siap, belum dieksekusi ke Supabase remote.**

## Sumber otoritatif

- Direktori: `C:\Users\AKBAR NUR\Herd\Portfolio-ANH-backups\pre-supabase-20260913-033924\production-d1-20260913`
- File record: `production-cms-records.json`
- SHA-256 sumber: `94986DCB5D9B530E212D3EFB4D3EED9F06CAF33C00D9004130F5D80FB37696B8`
- SHA-256 pada manifest: `94986DCB5D9B530E212D3EFB4D3EED9F06CAF33C00D9004130F5D80FB37696B8`
- Checksum cocok: **ya**
- Local D1 digunakan sebagai sumber: **tidak**

## Validasi sumber

- Jumlah record: **33/33**
- Status record: **33 published**
- ID duplikat: **0**
- Pasangan collection/slug duplikat: **0**
- JSON malformed: **0**
- JSON bukan object: **0**
- Timestamp invalid: **0**
- Urutan setiap koleksi kontinu mulai dari 0: **ya**
- Singleton `profile`: **1, ID sesuai**
- Singleton `siteContent`: **1, ID sesuai**

## Jumlah per koleksi

| Koleksi | Sumber | Artefak | Hasil |
| --- | ---: | ---: | --- |
| articles | 3 | 3 | PASS |
| capabilities | 6 | 6 | PASS |
| certifications | 4 | 4 | PASS |
| education | 2 | 2 | PASS |
| experience | 3 | 3 | PASS |
| profile | 1 | 1 | PASS |
| projects | 4 | 4 | PASS |
| siteContent | 1 | 1 | PASS |
| socials | 5 | 5 | PASS |
| statistics | 4 | 4 | PASS |

## Pemetaan nilai

| Nilai | Sumber D1 | Artefak Supabase |
| --- | --- | --- |
| id, collection, sort_order, status | Tersedia | Dipertahankan persis |
| slug | Tersedia | 32 dipertahankan; slug singleton siteContent dipetakan ke NULL agar memenuhi constraint lowercase Supabase |
| data_json | Tersedia sebagai teks JSON valid | Nilai semantik dipertahankan sebagai JSONB |
| created_at, updated_at | Tersedia | Dipertahankan persis |
| version | Tidak tersedia pada schema/export D1 | Diinisialisasi menjadi 1 |
| published_at | Tidak tersedia pada schema/export D1 | Ditentukan dari created_at karena seluruh record published |

Checksum proyeksi field yang dipertahankan:

- Sumber: `1019C5A2BB486AA8735951E740BB5030EA38F1347159965D0025DF8817906A52`
- Artefak: `1019C5A2BB486AA8735951E740BB5030EA38F1347159965D0025DF8817906A52`
- Cocok: **ya**

## Indeks rekonsiliasi record

| Koleksi | ID | Slug sumber | Slug target | Urutan | Versi target | Published at target | Created at | Updated at |
| --- | --- | --- | --- | ---: | ---: | --- | --- | --- |
| articles | articles-dokumentasi-kerja-yang-dapat-dipakai-kembali-1 | dokumentasi-kerja-yang-dapat-dipakai-kembali | dokumentasi-kerja-yang-dapat-dipakai-kembali | 0 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| articles | articles-dari-masalah-operasional-ke-solusi-digital-2 | dari-masalah-operasional-ke-solusi-digital | dari-masalah-operasional-ke-solusi-digital | 1 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| articles | articles-membuat-informasi-tetap-jelas-di-antarmuka-3 | membuat-informasi-tetap-jelas-di-antarmuka | membuat-informasi-tetap-jelas-di-antarmuka | 2 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| capabilities | capabilities-pendidikan-1 | capabilities-pendidikan-1 | capabilities-pendidikan-1 | 0 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| capabilities | capabilities-pengalaman-2 | capabilities-pengalaman-2 | capabilities-pengalaman-2 | 1 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| capabilities | capabilities-pelatihan-3 | capabilities-pelatihan-3 | capabilities-pelatihan-3 | 2 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| capabilities | capabilities-proyek-4 | capabilities-proyek-4 | capabilities-proyek-4 | 3 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| capabilities | capabilities-sertifikasi-5 | capabilities-sertifikasi-5 | capabilities-sertifikasi-5 | 4 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| capabilities | capabilities-minat-6 | capabilities-minat-6 | capabilities-minat-6 | 5 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| certifications | certifications-sertifikasi-dukungan-ti-1 | certifications-sertifikasi-dukungan-ti-1 | certifications-sertifikasi-dukungan-ti-1 | 0 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| certifications | certifications-sertifikasi-peretasan-etis-2 | certifications-sertifikasi-peretasan-etis-2 | certifications-sertifikasi-peretasan-etis-2 | 1 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| certifications | certifications-sertifikasi-ahli-microsoft-excel-3 | certifications-sertifikasi-ahli-microsoft-excel-3 | certifications-sertifikasi-ahli-microsoft-excel-3 | 2 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| certifications | certifications-sertifikat-lainnya-4 | certifications-sertifikat-lainnya-4 | certifications-sertifikat-lainnya-4 | 3 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| education | education-sekolah-menengah-kejuruan-smk-1 | education-sekolah-menengah-kejuruan-smk-1 | education-sekolah-menengah-kejuruan-smk-1 | 0 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| education | education-sarjana-s1-2 | education-sarjana-s1-2 | education-sarjana-s1-2 | 1 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| experience | experience-experience-1 | experience-experience-1 | experience-experience-1 | 0 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| experience | experience-experience-2 | experience-experience-2 | experience-experience-2 | 1 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| experience | experience-experience-3 | experience-experience-3 | experience-experience-3 | 2 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| profile | profile | profile | profile | 0 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| projects | projects-byd-harmony-auto-1 | byd-harmony-auto | byd-harmony-auto | 0 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| projects | projects-arsip-operasional-2 | arsip-operasional | arsip-operasional | 1 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| projects | projects-sistem-pelaporan-3 | sistem-pelaporan | sistem-pelaporan | 2 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| projects | projects-catatan-lapangan-4 | catatan-lapangan | catatan-lapangan | 3 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| siteContent | siteContent | siteContent | NULL | 0 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| socials | socials-linkedin-1 | socials-linkedin-1 | socials-linkedin-1 | 0 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| socials | socials-surel-2 | socials-surel-2 | socials-surel-2 | 1 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| socials | socials-github-3 | socials-github-3 | socials-github-3 | 2 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| socials | socials-instagram-4 | socials-instagram-4 | socials-instagram-4 | 3 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| socials | socials-whatsapp-5 | socials-whatsapp-5 | socials-whatsapp-5 | 4 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z |
| statistics | statistics-tahun-pengalaman-1 | statistics-tahun-pengalaman-1 | statistics-tahun-pengalaman-1 | 0 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T18:14:08.104Z |
| statistics | statistics-proyek-2 | statistics-proyek-2 | statistics-proyek-2 | 1 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T18:14:08.104Z |
| statistics | statistics-sertifikasi-3 | statistics-sertifikasi-3 | statistics-sertifikasi-3 | 2 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T18:14:08.104Z |
| statistics | statistics-terus-belajar-4 | statistics-terus-belajar-4 | statistics-terus-belajar-4 | 3 | 1 | 2026-09-11T12:30:09.577Z | 2026-09-11T12:30:09.577Z | 2026-09-11T18:14:08.104Z |

## Keamanan eksekusi SQL

Artefak SQL menggunakan satu transaksi, mengunci `cms_records` selama impor,
mensyaratkan target kosong, memvalidasi count/koleksi/ID/slug/JSON/singleton/
status/timestamp/urutan, dan melakukan perbandingan dua arah dengan `EXCEPT ALL`
sebelum `COMMIT`. Setiap kegagalan membatalkan seluruh transaksi.

- SQL: `supabase/imports/20260913_production_d1_cms_records.sql`
- SHA-256 SQL: `136684AF624AF60C989B201E2E32CA90C256CAFFB3BE9FB2EE35A8A3F0CD5765`
- R2/media dimigrasikan: **tidak**
- Eksekusi remote dilakukan: **tidak**
