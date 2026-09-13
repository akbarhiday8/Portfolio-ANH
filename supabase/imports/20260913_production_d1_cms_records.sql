-- Prepared from the authoritative production D1 backup.
-- Source: production-d1-20260913/production-cms-records.json
-- Source SHA-256: 94986DCB5D9B530E212D3EFB4D3EED9F06CAF33C00D9004130F5D80FB37696B8
-- This is a one-time import artifact, not an automatically applied schema migration.
-- The source has no version or published_at columns. The import initializes version=1
-- and uses created_at as the deterministic published_at for each published record.

begin;

set local lock_timeout = '10s';
set local statement_timeout = '60s';

lock table public.cms_records in exclusive mode;

create temporary table cms_records_import_source (
  id text,
  collection text,
  slug text,
  sort_order integer,
  status text,
  data_json_text text,
  version integer,
  published_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
) on commit drop;

insert into cms_records_import_source (
  id, collection, slug, sort_order, status, data_json_text,
  version, published_at, created_at, updated_at
) values
  (
    'articles-dari-masalah-operasional-ke-solusi-digital-2', 'articles', 'dari-masalah-operasional-ke-solusi-digital',
    1, 'published', '{"slug":"dari-masalah-operasional-ke-solusi-digital","title":"Dari Masalah Operasional ke Solusi Digital","category":"Teknologi","publishedAt":"11 September 2026","readTime":"6 menit baca","excerpt":"Solusi digital yang baik dimulai dari pemahaman proses kerja—bukan dari memilih teknologi yang paling baru.","lead":"Digitalisasi paling berguna ketika ia menyederhanakan pekerjaan nyata. Karena itu, langkah pertama selalu memahami proses, hambatan, dan orang yang menjalankannya.","takeaways":["Pahami proses sebelum menentukan teknologi.","Prioritaskan alur inti dan kemudahan adopsi.","Ukur perubahan yang benar-benar dirasakan pengguna."],"quote":"Teknologi menjadi berarti ketika ia mengurangi hambatan dalam pekerjaan nyata.","closingHeading":"Menjadikan solusi lebih relevan.","closing":"Solusi digital yang profesional bukan yang memiliki fitur paling banyak, melainkan yang mengurangi hambatan dan membuat pekerjaan penting menjadi lebih jelas.","sections":[{"heading":"Petakan proses sebelum membuat fitur","paragraphs":["Amati bagaimana pekerjaan dilakukan saat ini, informasi apa yang berpindah, serta bagian mana yang sering menimbulkan keterlambatan atau kesalahan. Peta proses memberi gambaran yang lebih jujur daripada daftar fitur.","Dari sana, kebutuhan dapat dipisahkan menjadi kebutuhan utama, pendukung, dan hal yang sebenarnya belum perlu dibangun."]},{"heading":"Prioritaskan kejelasan dan adopsi","paragraphs":["Sistem tidak akan membantu jika pengguna kesulitan memahami alurnya. Bahasa yang familiar, hierarki informasi yang jelas, dan umpan balik yang tepat sering lebih penting daripada banyaknya fungsi.","Mulailah dari alur inti yang kecil, uji bersama pengguna, lalu perbaiki berdasarkan hambatan yang benar-benar muncul."]},{"heading":"Ukur perubahan yang relevan","paragraphs":["Keberhasilan tidak selalu berupa angka besar. Waktu pencarian yang lebih singkat, pencatatan yang lebih konsisten, dan berkurangnya pertanyaan berulang adalah tanda perbaikan yang nyata.","Ukuran tersebut membantu tim menentukan apakah solusi perlu diperluas, disederhanakan, atau justru dihentikan."]}]}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'articles-dokumentasi-kerja-yang-dapat-dipakai-kembali-1', 'articles', 'dokumentasi-kerja-yang-dapat-dipakai-kembali',
    0, 'published', '{"slug":"dokumentasi-kerja-yang-dapat-dipakai-kembali","title":"Dokumentasi Kerja yang Dapat Dipakai Kembali","category":"Produktivitas","publishedAt":"11 September 2026","readTime":"5 menit baca","excerpt":"Dokumentasi yang baik bukan sekadar arsip. Ia membantu orang memahami konteks, mengambil keputusan, dan melanjutkan pekerjaan dengan lebih percaya diri.","lead":"Dokumentasi menjadi bernilai ketika seseorang yang tidak mengikuti proses sejak awal tetap dapat memahami apa yang terjadi, mengapa keputusan dibuat, dan apa yang perlu dilakukan berikutnya.","takeaways":["Tentukan pembaca dan keputusan yang perlu mereka ambil.","Gunakan struktur yang konsisten dan mudah diperbarui.","Jadikan dokumentasi bagian dari proses kerja sehari-hari."],"quote":"Catatan yang baik tidak berhenti pada informasi; ia membantu orang memahami dan mengambil langkah berikutnya.","closingHeading":"Merangkum gagasan menjadi tindakan.","closing":"Dokumentasi yang matang tidak diukur dari panjangnya, tetapi dari seberapa mudah informasi itu ditemukan, dipahami, dan digunakan kembali oleh orang berikutnya.","sections":[{"heading":"Mulai dari kebutuhan pembaca","paragraphs":["Sebelum menulis, tentukan siapa yang akan menggunakan dokumen dan keputusan apa yang perlu mereka ambil. Informasi untuk pelaksana operasional tentu berbeda dengan ringkasan yang dibutuhkan pengambil keputusan.","Dengan tujuan yang jelas, dokumentasi dapat tetap ringkas tanpa kehilangan konteks penting."]},{"heading":"Susun struktur yang konsisten","paragraphs":["Gunakan pola yang dapat diulang: konteks, tujuan, langkah kerja, hasil, hambatan, dan tindak lanjut. Struktur yang konsisten mengurangi waktu pencarian serta memudahkan pembaruan.","Nama file, status versi, dan pemilik informasi juga perlu ditulis secara eksplisit agar dokumen tidak berubah menjadi arsip tanpa arah."]},{"heading":"Jadikan dokumentasi bagian dari proses","paragraphs":["Dokumentasi sebaiknya diperbarui ketika pekerjaan berlangsung, bukan menunggu semuanya selesai. Catatan kecil yang teratur biasanya lebih akurat daripada rekonstruksi panjang di akhir proyek.","Tujuan akhirnya bukan menghasilkan lebih banyak dokumen, melainkan menciptakan sumber informasi yang benar-benar dapat digunakan kembali."]}]}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'articles-membuat-informasi-tetap-jelas-di-antarmuka-3', 'articles', 'membuat-informasi-tetap-jelas-di-antarmuka',
    2, 'published', '{"slug":"membuat-informasi-tetap-jelas-di-antarmuka","title":"Membuat Informasi Tetap Jelas di Antarmuka","category":"Desain Sistem","publishedAt":"11 September 2026","readTime":"4 menit baca","excerpt":"Antarmuka profesional tidak harus ramai. Kejelasan lahir dari prioritas visual, ritme, dan keputusan yang konsisten.","lead":"Desain antarmuka yang matang membantu pengguna melihat hal terpenting terlebih dahulu, memahami hubungan antarbagian, dan bergerak tanpa banyak menebak.","takeaways":["Bangun hierarki yang mudah dipindai.","Gunakan ruang untuk memisahkan konteks.","Berikan fungsi yang konsisten pada warna aksen."],"quote":"Kejelasan bukan kekosongan; ia adalah hasil dari prioritas yang tepat.","closingHeading":"Menyatukan keputusan visual.","closing":"Kejelasan visual adalah hasil dari keputusan kecil yang konsisten. Ketika hierarki, ruang, dan warna bekerja sebagai satu sistem, antarmuka terasa lebih tenang dan dapat dipercaya.","sections":[{"heading":"Bentuk hierarki yang dapat dipindai","paragraphs":["Perbedaan ukuran, bobot, warna, dan jarak perlu menunjukkan tingkatan informasi. Jika semua elemen sama kuatnya, pengguna harus bekerja lebih keras untuk menemukan titik masuk.","Gunakan penekanan hanya pada informasi dan tindakan yang benar-benar membutuhkan perhatian."]},{"heading":"Biarkan ruang bekerja","paragraphs":["Ruang kosong bukan area yang gagal diisi. Ia memisahkan kelompok informasi, menciptakan ritme, dan membantu elemen penting memperoleh fokus.","Konsistensi jarak juga membuat halaman terasa tenang dan profesional, terutama ketika kontennya padat."]},{"heading":"Gunakan warna sebagai sistem","paragraphs":["Warna aksen sebaiknya memiliki tugas yang jelas: menandai status aktif, tindakan penting, atau detail yang perlu diingat. Penggunaan yang konsisten membuat warna dapat dipahami, bukan hanya dilihat.","Palet yang terbatas juga membantu foto, tipografi, dan isi tulisan tampil lebih meyakinkan."]}]}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'capabilities-minat-6', 'capabilities', 'capabilities-minat-6',
    5, 'published', '{"title":"Minat","description":"Menjelajah melampaui batas, selalu ingin tahu.","icon":"compass"}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'capabilities-pelatihan-3', 'capabilities', 'capabilities-pelatihan-3',
    2, 'published', '{"title":"Pelatihan","description":"Peningkatan berkelanjutan untuk menjadi lebih baik.","icon":"pencil"}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'capabilities-pendidikan-1', 'capabilities', 'capabilities-pendidikan-1',
    0, 'published', '{"title":"Pendidikan","description":"Fondasi yang kokoh untuk terus berkembang.","icon":"book"}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'capabilities-pengalaman-2', 'capabilities', 'capabilities-pengalaman-2',
    1, 'published', '{"title":"Pengalaman","description":"Mengubah pengetahuan menjadi praktik nyata.","icon":"briefcase"}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'capabilities-proyek-4', 'capabilities', 'capabilities-proyek-4',
    3, 'published', '{"title":"Proyek","description":"Gagasan yang menjadi solusi nyata.","icon":"grid"}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'capabilities-sertifikasi-5', 'capabilities', 'capabilities-sertifikasi-5',
    4, 'published', '{"title":"Sertifikasi","description":"Keahlian dan kompetensi yang tervalidasi.","icon":"award"}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'certifications-sertifikasi-ahli-microsoft-excel-3', 'certifications', 'certifications-sertifikasi-ahli-microsoft-excel-3',
    2, 'published', '{"name":"Sertifikasi Ahli Microsoft Excel","issuer":"Instansi penerbit akan ditambahkan","year":"2024","category":"Produktivitas","image":null,"description":"Validasi keterampilan pengolahan data dan penggunaan perangkat produktivitas.","topics":["Pengelolaan data terstruktur","Formula dan fungsi","Visualisasi serta pelaporan","Pemeriksaan konsistensi data"]}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'certifications-sertifikasi-dukungan-ti-1', 'certifications', 'certifications-sertifikasi-dukungan-ti-1',
    0, 'published', '{"name":"Sertifikasi Dukungan TI","issuer":"Instansi penerbit akan ditambahkan","year":"2025","category":"Teknologi","image":null,"description":"Validasi pembelajaran dan kompetensi pada bidang dukungan teknologi informasi.","topics":["Dasar perangkat keras dan sistem operasi","Pemecahan masalah teknis","Jaringan dan keamanan dasar","Layanan serta komunikasi pengguna"]}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'certifications-sertifikasi-peretasan-etis-2', 'certifications', 'certifications-sertifikasi-peretasan-etis-2',
    1, 'published', '{"name":"Sertifikasi Peretasan Etis","issuer":"Instansi penerbit akan ditambahkan","year":"2025","category":"Keamanan","image":null,"description":"Dokumentasi pembelajaran mengenai prinsip keamanan sistem dan pengujian yang bertanggung jawab.","topics":["Prinsip keamanan informasi","Pemetaan kerentanan","Pengujian keamanan yang etis","Dokumentasi temuan dan mitigasi"]}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'certifications-sertifikat-lainnya-4', 'certifications', 'certifications-sertifikat-lainnya-4',
    3, 'published', '{"name":"Sertifikat Lainnya","issuer":"Arsip Pembelajaran","year":"Berkelanjutan","category":"Pengembangan","image":null,"description":"Kumpulan sertifikat pelatihan dan pembelajaran tambahan yang akan dilengkapi secara bertahap.","topics":["Materi pelatihan akan ditambahkan","Kompetensi yang diujikan akan ditambahkan"]}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'education-sarjana-s1-2', 'education', 'education-sarjana-s1-2',
    1, 'published', '{"period":"Pendidikan Tinggi","title":"Sarjana (S1)","description":"Pengembangan cara berpikir analitis, riset, dan pemecahan masalah."}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'education-sekolah-menengah-kejuruan-smk-1', 'education', 'education-sekolah-menengah-kejuruan-smk-1',
    0, 'published', '{"period":"Pendidikan Menengah","title":"Sekolah Menengah Kejuruan (SMK)","description":"Fondasi pembelajaran berbasis praktik, kedisiplinan, dan kesiapan kerja."}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'experience-experience-1', 'experience', 'experience-experience-1',
    0, 'published', '{"index":"01","role":"Staf Operasional","organization":"Operasional Profesional","period":"2020 — 2022","description":"Mendukung operasional harian dan meningkatkan efisiensi alur kerja melalui pelaksanaan yang jelas dan dapat diandalkan.","responsibilities":["Menjalankan dan memantau aktivitas operasional harian.","Mencatat perkembangan pekerjaan serta memastikan alur berjalan sesuai kebutuhan.","Mengoordinasikan tindak lanjut pekerjaan dengan pihak terkait.","Membantu mengidentifikasi hambatan dan peluang perbaikan proses."],"image":"/work-building.jpg","tone":"charcoal"}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'experience-experience-2', 'experience', 'experience-experience-2',
    1, 'published', '{"index":"02","role":"Dukungan Administratif","organization":"Administrasi Bisnis","period":"2022 — 2024","description":"Menata arsip, mengoordinasikan proses, dan memastikan pekerjaan penting berjalan dengan akurat.","responsibilities":["Mengelola dokumen dan arsip agar tersusun serta mudah ditelusuri.","Melakukan pencatatan, pemeriksaan, dan pembaruan data administratif.","Mendukung koordinasi jadwal, kebutuhan dokumen, dan pelaporan rutin.","Menjaga ketelitian serta konsistensi informasi dalam proses kerja."],"image":"/work-code.jpg","tone":"paper"}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'experience-experience-3', 'experience', 'experience-experience-3',
    2, 'published', '{"index":"03","role":"Kontributor Proyek Digital","organization":"Praktik Mandiri","period":"2024 — Sekarang","description":"Menghubungkan riset, teknologi, dan dokumentasi untuk menciptakan hasil digital yang bermanfaat.","responsibilities":["Mengumpulkan kebutuhan dan menyusun konteks awal proyek digital.","Mendokumentasikan struktur, proses, serta keputusan selama pengerjaan.","Mendukung implementasi, pengujian, dan penyempurnaan hasil.","Menjaga agar solusi tetap jelas, relevan, dan mudah dikembangkan."],"image":"/work-laptop.jpg","tone":"crimson"}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'profile', 'profile', 'profile',
    0, 'published', '{"name":"Akbar Nur Hidayanto","monogram":"ANH","eyebrow":"Discipline turns plans into progress","tagline":"A Journey of Work, Learning & Creation.","introduction":"Profesional multidisiplin yang bersemangat memecahkan masalah nyata melalui teknologi, pemikiran terstruktur, dan pembelajaran berkelanjutan.","about":"Saya bekerja di bidang teknologi, operasional, administrasi, dan dokumentasi—menghadirkan struktur pada pekerjaan kompleks serta mengubah gagasan menjadi hasil yang nyata.","artwork":"/profile-hero-941.webp"}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'projects-arsip-operasional-2', 'projects', 'arsip-operasional',
    1, 'published', '{"index":"02","slug":"arsip-operasional","title":"Arsip Operasional","category":"Operasional · Dokumentasi","year":"2025","layout":"tall","image":"/work-mobile.jpg","role":"Penyusun Sistem Dokumentasi","discipline":"Operasional","artifactType":"Dokumen & sistem arsip","challenge":"Informasi operasional tersebar dan belum memiliki pola penyimpanan yang mudah dipahami oleh pengguna berikutnya.","approach":"Membentuk klasifikasi, aturan penamaan, dan alur pemeliharaan yang sederhana serta dapat diterapkan bertahap.","evidence":{"label":"Lihat bukti sistem arsip","href":null},"summary":"Penyusunan alur dokumentasi untuk membantu informasi operasional tetap rapi, konsisten, dan mudah ditelusuri.","scope":["Inventarisasi kebutuhan dokumen","Pengelompokan dan penamaan arsip","Penyusunan alur pembaruan informasi"],"process":[{"title":"Inventarisasi","description":"Mengidentifikasi jenis dokumen, pengguna, dan kebutuhan pencarian informasi."},{"title":"Standardisasi","description":"Menyusun struktur kategori serta aturan penamaan yang lebih konsisten."},{"title":"Pemeliharaan","description":"Menyiapkan alur pembaruan agar arsip tetap relevan dan dapat digunakan."}],"outcome":"Struktur arsip menjadi lebih mudah dipahami dan siap dilengkapi dengan dokumentasi implementasi sebenarnya."}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'projects-byd-harmony-auto-1', 'projects', 'byd-harmony-auto',
    0, 'published', '{"index":"01","slug":"byd-harmony-auto","title":"BYD Harmony Auto","category":"Aplikasi Web","year":"2026","layout":"wide","image":"/work-dashboard.jpg","role":"Kontributor Pengembangan","discipline":"Teknologi Informasi","artifactType":"Website / aplikasi web","challenge":"Menyusun pengalaman digital yang tetap jelas ketika informasi, fitur, dan kebutuhan pengguna berkembang bersamaan.","approach":"Mengutamakan arsitektur informasi, alur inti, dan komponen yang konsisten sebelum memperluas fungsi.","evidence":{"label":"Lihat website / bukti proyek","href":null},"summary":"Dokumentasi proyek aplikasi web dengan fokus pada struktur informasi, kemudahan penggunaan, dan konsistensi antarmuka.","scope":["Pemetaan kebutuhan dan struktur informasi","Perancangan alur serta komponen antarmuka","Pengujian tampilan dan penyempurnaan hasil"],"process":[{"title":"Memahami konteks","description":"Mengurai kebutuhan utama dan menyusun prioritas informasi yang perlu ditampilkan."},{"title":"Menyusun solusi","description":"Menerjemahkan kebutuhan menjadi struktur halaman dan pola interaksi yang konsisten."},{"title":"Meninjau hasil","description":"Memeriksa keterbacaan, responsivitas, dan detail visual sebelum penyempurnaan."}],"outcome":"Hasil proyek disusun sebagai fondasi solusi digital yang jelas, mudah dipahami, dan siap dikembangkan lebih lanjut."}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'projects-catatan-lapangan-4', 'projects', 'catatan-lapangan',
    3, 'published', '{"index":"04","slug":"catatan-lapangan","title":"Catatan Lapangan","category":"Riset · Pekerjaan Profesional","year":"2024","layout":"wide","image":"/work-building.jpg","role":"Kontributor Riset dan Dokumentasi","discipline":"Riset & Manajemen","artifactType":"Laporan dan dokumentasi","challenge":"Observasi lapangan yang beragam perlu diterjemahkan menjadi temuan yang dapat ditindaklanjuti.","approach":"Menggabungkan catatan, bukti, dan konteks ke dalam struktur laporan yang memisahkan fakta, analisis, dan tindak lanjut.","evidence":{"label":"Lihat laporan dan dokumentasi","href":null},"summary":"Dokumentasi pekerjaan lapangan yang menyatukan observasi, catatan proses, dan temuan menjadi informasi yang lebih terstruktur.","scope":["Pencatatan konteks dan observasi","Pengelompokan temuan utama","Penyusunan dokumentasi untuk tindak lanjut"],"process":[{"title":"Observasi","description":"Merekam konteks, aktivitas, dan informasi penting secara sistematis."},{"title":"Sintesis","description":"Mengelompokkan catatan menjadi tema dan temuan yang lebih mudah dipahami."},{"title":"Dokumentasi","description":"Menyusun hasil menjadi referensi kerja yang jelas untuk proses berikutnya."}],"outcome":"Catatan lapangan berubah menjadi dokumentasi yang lebih terarah dan mudah digunakan untuk tindak lanjut."}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'projects-sistem-pelaporan-3', 'projects', 'sistem-pelaporan',
    2, 'published', '{"index":"03","slug":"sistem-pelaporan","title":"Sistem Pelaporan","category":"Data · Administrasi","year":"2025","layout":"square","image":"/work-branding.jpg","role":"Kontributor Data dan Administrasi","discipline":"Analisis Data","artifactType":"Spreadsheet & laporan","challenge":"Data perlu dicatat dengan konsisten sekaligus disajikan dalam bentuk yang cepat dipahami untuk pemeriksaan.","approach":"Menetapkan struktur data, aturan validasi, dan hierarki laporan sebelum menyusun visualisasi.","evidence":{"label":"Lihat workbook dan laporan","href":null},"summary":"Konsep sistem pelaporan yang mengutamakan ketepatan pencatatan, keterbacaan informasi, dan alur pemeriksaan yang jelas.","scope":["Pemetaan data yang perlu dicatat","Penyusunan format dan hierarki laporan","Pemeriksaan konsistensi hasil"],"process":[{"title":"Pemetaan data","description":"Menentukan informasi penting serta hubungan antarbagian dalam laporan."},{"title":"Penyusunan format","description":"Membentuk struktur yang memudahkan pengisian, pembacaan, dan pemeriksaan."},{"title":"Validasi","description":"Meninjau konsistensi data dan memperbaiki bagian yang berpotensi menimbulkan ambiguitas."}],"outcome":"Format pelaporan menjadi lebih terstruktur dan dapat dikembangkan sesuai kebutuhan operasional nyata."}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'siteContent', 'siteContent', NULL,
    0, 'published', '{"brandSubtitle":"Portofolio Pribadi","aboutTitle":"Tentang Saya","aboutCaption":"Manusia / Gagasan / Kemajuan","aboutHeading":"Pikiran yang ingin tahu.\nPencipta solusi nyata.","aboutBody":"Saya adalah pemecah masalah yang senang mengubah gagasan kompleks menjadi solusi sederhana dan bermakna. Dengan latar belakang teknologi, desain, dan semangat belajar berkelanjutan, saya selalu antusias menghadapi tantangan baru dan menciptakan dampak positif.","aboutCta":"Kenali Lebih Dekat","educationTitle":"Pendidikan","educationCaption":"Fondasi / Pembelajaran","educationNote":"Belajar\nbertumbuh\nberkarya","experienceTitle":"Pengalaman","experienceCaption":"Kerja nyata / Dampak nyata","portfolioTitle":"Portfolio Pilihan","portfolioCaption":"Gagasan / Menjadi karya","certificatesTitle":"Sertifikasi","certificatesCaption":"Validasi / Untuk kemajuan","contactTitle":"Mari Terhubung","contactCaption":"Ruang untuk dialog / dan kolaborasi","contactHeading":"Mari Ciptakan Sesuatu yang Bermakna.","contactDescription":"Untuk diskusi proyek, pertukaran gagasan, dan kolaborasi yang bermakna.","contactAvailability":"Tautan kontak sedang disiapkan","contactNote":"Same\ncuriosity\na brighter\nhorizon","articleEyebrow":"Artikel / Catatan","articleHeading":"Pengetahuan yang dirapikan menjadi gagasan.","articleDescription":"Catatan tentang teknologi, dokumentasi, produktivitas, desain sistem, dan cara kerja yang lebih terstruktur.","footerName":"Akbar Nur Hidayanto","footerSubtitle":"Portofolio Profesional","copyrightText":"Akbar Nur Hidayanto. Seluruh hak cipta dilindungi."}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'socials-github-3', 'socials', 'socials-github-3',
    2, 'published', '{"label":"GitHub","href":null}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'socials-instagram-4', 'socials', 'socials-instagram-4',
    3, 'published', '{"label":"Instagram","href":null}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'socials-linkedin-1', 'socials', 'socials-linkedin-1',
    0, 'published', '{"label":"LinkedIn","href":null}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'socials-surel-2', 'socials', 'socials-surel-2',
    1, 'published', '{"label":"Surel","href":null}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'socials-whatsapp-5', 'socials', 'socials-whatsapp-5',
    4, 'published', '{"label":"WhatsApp","href":null}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T12:30:09.577Z'::timestamptz
  ),
  (
    'statistics-proyek-2', 'statistics', 'statistics-proyek-2',
    1, 'published', '{"value":"10+","label":"Proyek"}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T18:14:08.104Z'::timestamptz
  ),
  (
    'statistics-sertifikasi-3', 'statistics', 'statistics-sertifikasi-3',
    2, 'published', '{"value":"15+","label":"Sertifikasi"}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T18:14:08.104Z'::timestamptz
  ),
  (
    'statistics-tahun-pengalaman-1', 'statistics', 'statistics-tahun-pengalaman-1',
    0, 'published', '{"value":"4+","label":"Tahun Pengalaman"}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T18:14:08.104Z'::timestamptz
  ),
  (
    'statistics-terus-belajar-4', 'statistics', 'statistics-terus-belajar-4',
    3, 'published', '{"value":"∞","label":"Terus Belajar"}',
    1, '2026-09-11T12:30:09.577Z'::timestamptz,
    '2026-09-11T12:30:09.577Z'::timestamptz, '2026-09-11T18:14:08.104Z'::timestamptz
  );

do $$
begin
  if (select count(*) from pg_temp.cms_records_import_source) <> 33 then
    raise exception 'CMS import aborted: expected 33 staged records';
  end if;

  if exists (
    select 1 from pg_temp.cms_records_import_source group by id having count(*) > 1
  ) then
    raise exception 'CMS import aborted: duplicate record ID';
  end if;

  if exists (
    select 1 from pg_temp.cms_records_import_source
    where slug is not null
    group by collection, slug having count(*) > 1
  ) then
    raise exception 'CMS import aborted: duplicate collection/slug';
  end if;

  begin
    perform source.data_json_text::jsonb
    from pg_temp.cms_records_import_source source;
  exception when others then
    raise exception 'CMS import aborted: malformed data_json';
  end;

  if exists (
    select 1 from pg_temp.cms_records_import_source source
    where jsonb_typeof(source.data_json_text::jsonb) is distinct from 'object'
  ) then
    raise exception 'CMS import aborted: data_json must be a JSON object';
  end if;

  if exists (
    select 1 from pg_temp.cms_records_import_source source
    where source.id is null or btrim(source.id) = ''
       or source.collection not in (
         'siteContent', 'profile', 'statistics', 'capabilities', 'education',
         'experience', 'projects', 'certifications', 'articles', 'socials'
       )
       or source.sort_order < 0
       or source.status not in ('draft', 'published')
       or source.version < 1
       or source.created_at is null
       or source.updated_at is null
       or source.updated_at < source.created_at
       or (source.slug is not null and source.slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
       or (source.collection in ('projects', 'articles') and source.slug is null)
       or (source.status = 'draft' and source.published_at is not null)
       or (source.status = 'published' and source.published_at is null)
  ) then
    raise exception 'CMS import aborted: invalid staged record state';
  end if;

  if exists (
    select 1 from pg_temp.cms_records_import_source source
    where source.collection in ('projects', 'articles')
      and nullif(btrim(source.data_json_text::jsonb ->> 'slug'), '') is distinct from source.slug
  ) then
    raise exception 'CMS import aborted: detail slug does not match data_json.slug';
  end if;

  if (select count(*) from pg_temp.cms_records_import_source where collection = 'profile') <> 1
     or (select count(*) from pg_temp.cms_records_import_source where collection = 'profile' and id = 'profile') <> 1
     or (select count(*) from pg_temp.cms_records_import_source where collection = 'siteContent') <> 1
     or (select count(*) from pg_temp.cms_records_import_source where collection = 'siteContent' and id = 'siteContent') <> 1 then
    raise exception 'CMS import aborted: required singleton profile/siteContent is missing or invalid';
  end if;

  if exists (
    with expected(collection, expected_count) as (
      values
      ('articles', 3),
      ('capabilities', 6),
      ('certifications', 4),
      ('education', 2),
      ('experience', 3),
      ('profile', 1),
      ('projects', 4),
      ('siteContent', 1),
      ('socials', 5),
      ('statistics', 4)
    ), actual as (
      select collection, count(*)::integer as actual_count
      from pg_temp.cms_records_import_source group by collection
    )
    select 1 from expected full join actual using (collection)
    where expected.expected_count is distinct from actual.actual_count
  ) then
    raise exception 'CMS import aborted: collection counts do not match the production checkpoint';
  end if;

  if exists (select 1 from public.cms_records) then
    raise exception 'CMS import aborted: target cms_records must be empty';
  end if;
end;
$$;

insert into public.cms_records (
  id, collection, slug, sort_order, status, data_json,
  version, published_at, created_at, updated_at
)
select
  source.id,
  source.collection,
  source.slug,
  source.sort_order,
  source.status,
  source.data_json_text::jsonb,
  source.version,
  source.published_at,
  source.created_at,
  source.updated_at
from pg_temp.cms_records_import_source source
order by source.collection, source.sort_order, source.id;

do $$
begin
  if (select count(*) from public.cms_records) <> 33 then
    raise exception 'CMS import reconciliation failed: target count is not 33';
  end if;

  if exists (
    select 1
    from (
      (
        select id, collection, slug, sort_order, status, data_json_text::jsonb as data_json,
          version, published_at, created_at, updated_at
        from pg_temp.cms_records_import_source
        except all
        select id, collection, slug, sort_order, status, data_json,
          version, published_at, created_at, updated_at
        from public.cms_records
      )
      union all
      (
        select id, collection, slug, sort_order, status, data_json,
          version, published_at, created_at, updated_at
        from public.cms_records
        except all
        select id, collection, slug, sort_order, status, data_json_text::jsonb,
          version, published_at, created_at, updated_at
        from pg_temp.cms_records_import_source
      )
    ) mismatch
  ) then
    raise exception 'CMS import reconciliation failed: staged and target values differ';
  end if;
end;
$$;

commit;
