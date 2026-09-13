export function BrandLoader({ label = 'Memuat halaman' }: { label?: string }) {
  return (
    <output className="brand-loader" aria-live="polite" aria-label={label}>
      <span className="brand-loader-mark" aria-hidden="true">
        <span className="brand-loader-ring" />
        <strong>ANH</strong>
      </span>
      <span className="sr-only">{label}</span>
    </output>
  );
}
