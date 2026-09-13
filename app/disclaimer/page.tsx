import { LegalPage, legalMetadata, type LegalSection } from '@/components/legal-page';

export const dynamic = 'force-dynamic';

const description = 'Batas penggunaan informasi, tulisan, dan contoh karya yang ditampilkan pada portofolio ini.';

export const metadata = legalMetadata('Disclaimer', description, '/disclaimer');

const sections: LegalSection[] = [
  {
    heading: 'Informasi umum',
    paragraphs: [
      'Tulisan, catatan, dan materi pada situs ini disediakan untuk informasi dan pembelajaran umum berdasarkan pengalaman serta pemahaman penulis pada saat diterbitkan. Materi tersebut bukan pengganti nasihat profesional, pemeriksaan independen, atau keputusan yang mempertimbangkan keadaan khusus Anda.',
      'Topik teknis dapat berubah. Periksa dokumentasi dan sumber terbaru sebelum menerapkan langkah atau contoh yang dibahas.',
    ],
  },
  {
    heading: 'Portofolio dan contoh proyek',
    paragraphs: [
      'Ringkasan proyek menjelaskan peran, proses, dan hasil sejauh informasi yang dapat ditampilkan. Konteks, ruang lingkup, teknologi, dan hasil pada proyek lain dapat berbeda; contoh yang ditampilkan tidak menjamin hasil yang sama pada pekerjaan Anda.',
      'Hak atas nama, merek, produk, dan materi pihak ketiga tetap berada pada pemiliknya masing-masing. Penyebutan atau tautan ke pihak lain tidak dengan sendirinya berarti dukungan atau afiliasi.',
    ],
  },
  {
    heading: 'Tautan dan layanan eksternal',
    paragraphs: [
      'Situs dapat menautkan ke situs, dokumen, atau platform yang dikelola pihak lain. Isi, ketersediaan, keamanan, dan praktik privasi layanan tersebut berada di luar kendali pemilik portofolio. Tinjau ketentuan layanan terkait sebelum menggunakannya atau mengirimkan informasi.',
    ],
  },
  {
    heading: 'Tanggung jawab dan kontak',
    paragraphs: [
      'Informasi disajikan dengan upaya menjaga ketepatan dan kemutakhiran, tetapi kekeliruan atau perubahan dapat terjadi. Disclaimer ini tidak dimaksudkan untuk mengurangi hak atau tanggung jawab yang tidak dapat dikesampingkan berdasarkan hukum yang berlaku.',
      'Untuk pertanyaan mengenai isi situs atau permintaan koreksi, silakan gunakan kanal Kontak yang tersedia di beranda.',
    ],
  },
];

export default function DisclaimerPage() {
  return (
    <LegalPage
      eyebrow="Informasi / Penggunaan"
      title="Disclaimer"
      description={description}
      sections={sections}
    />
  );
}
