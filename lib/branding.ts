export type BrandContext = 'public' | 'cms' | 'login';

export type BrandingSource = Readonly<Record<string, unknown>>;

export type ResolvedBranding = {
  monogram: string;
  subtitle: string;
  label: string;
  altText: string;
  primaryLogo: string;
  publicLogo: string;
  cmsLogo: string;
  loginLogo: string;
  favicon: string;
};

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function nestedRecord(value: unknown): BrandingSource {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as BrandingSource
    : {};
}

export function resolveBranding(
  siteContent: BrandingSource = {},
  profile: BrandingSource = {},
): ResolvedBranding {
  const branding = nestedRecord(siteContent.branding);
  const primaryLogo = text(branding.primaryLogo);

  return {
    monogram: text(profile.monogram) || 'ANH',
    subtitle: text(siteContent.brandSubtitle) || 'Portofolio Pribadi',
    label: text(branding.label) || text(profile.name) || 'ANH',
    altText: text(branding.altText) || `Logo ${text(branding.label) || text(profile.name) || 'ANH'}`,
    primaryLogo,
    publicLogo: text(branding.publicLogo) || primaryLogo,
    cmsLogo: text(branding.cmsLogo) || primaryLogo,
    loginLogo: text(branding.loginLogo) || primaryLogo,
    favicon: text(branding.favicon),
  };
}

export function logoForContext(branding: ResolvedBranding, context: BrandContext) {
  if (context === 'cms') return branding.cmsLogo;
  if (context === 'login') return branding.loginLogo;
  return branding.publicLogo;
}
