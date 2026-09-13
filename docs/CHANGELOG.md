# Changelog

## 2026-09-14 — Branding dan UI polish

- Menambahkan konfigurasi branding yang kompatibel mundur di singleton
  `siteContent`, tanpa tabel atau migrasi database baru.
- Logo yang diunggah tetap memakai alur media Supabase Storage yang sudah ada;
  URL aset disimpan di data JSON `siteContent`.
- Menambahkan fallback terpusat untuk logo website, CMS, login, dan favicon.
- Mengubah tema awal pengunjung baru menjadi terang serta memperbarui loader,
  action bar editor, dan footer tanpa mengubah arsitektur autentikasi, RLS, atau
  RPC Supabase.
