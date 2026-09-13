import { BrandLoader } from '@/components/brand-loader';

export default function Loading() {
  return (
    <main className="system-loading-page" aria-live="polite" aria-busy="true">
      <BrandLoader label="Menyiapkan halaman" />
    </main>
  );
}
