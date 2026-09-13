import { LegalPage, legalMetadata, type LegalSection } from '@/components/legal-page';

export const dynamic = 'force-dynamic';

const description = 'Penjelasan ringkas tentang informasi yang diproses ketika Anda mengunjungi situs, menghubungi pemilik, atau menggunakan CMS administrator.';

export const metadata = legalMetadata('Kebijakan Privasi', description, '/privasi');

const sections: LegalSection[] = [
  {
    heading: 'Cakupan situs',
    paragraphs: [
      'Portofolio ini dikelola oleh Akbar Nur Hidayanto. Pengunjung tidak perlu membuat akun dan situs tidak menyediakan formulir kontak publik. Jika Anda memilih menghubungi melalui email, WhatsApp, atau layanan sosial yang tercantum, informasi yang Anda kirim diproses melalui layanan tersebut dan diterima oleh pemilik akun tujuan.',
      'Penyedia hosting dan layanan teknis dapat memproses informasi koneksi seperti alamat IP, jenis peramban, waktu permintaan, dan catatan keamanan untuk mengoperasikan serta melindungi layanan.',
    ],
  },
  {
    heading: 'CMS dan berkas yang diunggah',
    paragraphs: [
      'Area CMS hanya untuk administrator. Supabase Auth memproses identitas akun dan sesi login; database CMS menyimpan konten, catatan perubahan administratif, serta metadata berkas. Supabase Storage menyimpan gambar dan dokumen yang diunggah oleh administrator.',
      'Berkas pada penyimpanan publik dapat diakses melalui URL-nya. Jangan unggah dokumen rahasia atau data pribadi pihak lain kecuali Anda berwenang dan memang bermaksud menampilkannya. Berkas yang tidak lagi dirujuk konten akan masuk ke proses penghapusan otomatis; antrean dan salinan cadangan teknis dapat bertahan sementara sesuai proses dan kebijakan penyedia layanan.',
    ],
  },
  {
    heading: 'Cookie dan penyimpanan lokal',
    paragraphs: [
      'Pilihan tema terang atau gelap disimpan di penyimpanan lokal peramban agar tampilan pilihan Anda tetap digunakan. Pengunjung biasa tidak memerlukan akun atau cookie sesi. Cookie sesi digunakan pada area administrator untuk mempertahankan autentikasi dan melindungi CMS.',
    ],
  },
  {
    heading: 'Tujuan dan penyedia layanan',
    paragraphs: [
      'Informasi diproses seperlunya untuk menampilkan portofolio, menjalankan dan mengamankan CMS, menyimpan konten dan berkas yang dipilih administrator, serta menanggapi pesan yang dikirim secara langsung. Situs ini tidak menjual data pengunjung atau menggunakan informasi kontak untuk mengirim promosi yang tidak diminta.',
      'Vercel menyediakan hosting aplikasi, sedangkan Supabase menyediakan database, autentikasi, dan penyimpanan berkas. Layanan kontak dan tautan eksternal memiliki kebijakan privasinya sendiri. Infrastruktur penyedia dapat memproses data di lokasi yang berbeda sesuai konfigurasi layanan mereka.',
    ],
  },
  {
    heading: 'Penyimpanan, keamanan, dan pilihan Anda',
    paragraphs: [
      'Konten publik disimpan selama masih digunakan pada situs. Informasi akun dan catatan keamanan dikelola selama diperlukan untuk mengoperasikan CMS dan memenuhi kewajiban yang berlaku. Langkah teknis yang wajar diterapkan untuk membatasi akses, tetapi keamanan transmisi atau penyimpanan elektronik tidak dapat dijamin secara mutlak.',
      'Anda dapat meminta akses, koreksi, atau penghapusan informasi yang Anda kirim kepada pemilik situs melalui kanal Kontak di beranda. Permintaan dapat memerlukan verifikasi identitas dan tetap tunduk pada kewajiban hukum serta batas retensi teknis dari penyedia layanan.',
    ],
  },
  {
    heading: 'Perubahan kebijakan',
    paragraphs: [
      'Kebijakan ini dapat diperbarui ketika cara kerja situs atau layanan yang digunakan berubah. Tanggal pembaruan di bagian atas halaman menunjukkan versi yang berlaku pada situs ini.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Informasi / Privasi"
      title="Kebijakan Privasi"
      description={description}
      sections={sections}
    />
  );
}
