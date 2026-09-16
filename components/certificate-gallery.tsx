import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BarChart3, FileBadge2, Monitor, ShieldCheck } from 'lucide-react';
import { certificationSlug } from '@/lib/certification-routes';

type CertificateItem = {
  name: string;
  issuer: string;
  year: string;
  category: string;
  image: string | null;
  description: string;
  topics: readonly string[];
};

const certificateIcons = [Monitor, ShieldCheck, BarChart3, FileBadge2];

export function CertificateGallery({ items }: { items: readonly CertificateItem[] }) {
  return (
    <div className="certificate-grid">
      {items.map((item, index) => {
        const Icon = certificateIcons[index] ?? FileBadge2;
        const href = `/sertifikasi/${certificationSlug(item.name)}`;
        return (
          <article className="certificate-card" key={`${item.name}-${item.year}`}>
            <Link href={href} aria-label={`Lihat detail ${item.name}`}>
              <span className={`certificate-preview${item.image ? ' has-image' : ''}`} aria-hidden="true">
                {item.image ? <Image src={item.image} fill sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 24vw" alt="" /> : (
                  <span className="certificate-paper"><Icon size={38} strokeWidth={1.3} /><i>Arsip sertifikat</i></span>
                )}
              </span>
              <span className="certificate-details">
                <span className="certificate-category">{item.category}</span>
                <strong>{item.name}</strong>
                <span className="certificate-issuer">{item.issuer}</span>
                {item.description ? <span className="certificate-summary">{item.description}</span> : null}
                <span className="certificate-year"><span>{item.year}</span><span className="certificate-detail-link">Lihat detail <ArrowRight size={14} /></span></span>
              </span>
            </Link>
          </article>
        );
      })}
    </div>
  );
}
