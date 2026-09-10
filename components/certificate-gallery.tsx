'use client';

import Image from 'next/image';
import { BarChart3, Eye, FileBadge2, Maximize2, Monitor, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type CertificateItem = {
  name: string;
  issuer: string;
  year: string;
  category: string;
  image: string | null;
  description: string;
};

const certificateIcons = [Monitor, ShieldCheck, BarChart3, FileBadge2];

export function CertificateGallery({ items }: { items: readonly CertificateItem[] }) {
  return (
    <div className="certificate-grid" id="certificates-heading">
      {items.map((item, index) => {
        const Icon = certificateIcons[index] ?? FileBadge2;

        return (
          <Dialog key={item.name}>
            <DialogTrigger className="certificate-card" aria-label={`Lihat detail ${item.name}`}>
              <span className={`certificate-preview${item.image ? ' has-image' : ''}`} aria-hidden="true">
                {item.image ? (
                  <Image src={item.image} fill sizes="(max-width: 520px) 100vw, (max-width: 850px) 50vw, 20vw" alt="" />
                ) : (
                  <span className="certificate-paper">
                    <Icon size={38} strokeWidth={1.3} />
                    <i>Arsip sertifikat</i>
                  </span>
                )}
                <span className="certificate-view"><Eye size={15} /> Lihat detail</span>
              </span>
              <span className="certificate-details">
                <span className="certificate-category">{item.category}</span>
                <strong>{item.name}</strong>
                <span className="certificate-issuer">{item.issuer}</span>
                <span className="certificate-year">{item.year}<Maximize2 size={15} /></span>
              </span>
            </DialogTrigger>

            <DialogContent className="certificate-dialog">
              <div className="certificate-dialog-preview">
                {item.image ? (
                  <Image src={item.image} fill sizes="90vw" alt={`Bukti ${item.name}`} />
                ) : (
                  <div className="certificate-dialog-placeholder">
                    <Icon size={58} strokeWidth={1.1} />
                    <span>Bukti sertifikat belum ditambahkan</span>
                  </div>
                )}
              </div>
              <DialogHeader className="certificate-dialog-copy">
                <span className="certificate-category">{item.category}</span>
                <DialogTitle>{item.name}</DialogTitle>
                <DialogDescription>{item.description}</DialogDescription>
                <dl className="certificate-facts">
                  <div><dt>Diterbitkan oleh</dt><dd>{item.issuer}</dd></div>
                  <div><dt>Tahun</dt><dd>{item.year}</dd></div>
                </dl>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        );
      })}
    </div>
  );
}
