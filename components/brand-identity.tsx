import Image from 'next/image';

import {
  logoForContext,
  resolveBranding,
  type BrandContext,
  type BrandingSource,
} from '@/lib/branding';

type BrandIdentityProps = {
  context?: BrandContext;
  siteContent?: BrandingSource;
  profile?: BrandingSource;
  className?: string;
};

export function BrandIdentity({
  context = 'public',
  siteContent = {},
  profile = {},
  className = '',
}: BrandIdentityProps) {
  const branding = resolveBranding(siteContent, profile);
  const logo = logoForContext(branding, context);

  return (
    <span className={`brand-lockup brand-lockup--${context}${className ? ` ${className}` : ''}`}>
      {logo ? (
        <span className="brand-lockup-image">
          <Image src={logo} width={168} height={52} sizes="168px" alt={branding.altText} />
        </span>
      ) : (
        <>
          <strong>{branding.monogram}</strong>
          <span className="brand-lockup-subtitle">{branding.subtitle}</span>
        </>
      )}
    </span>
  );
}
