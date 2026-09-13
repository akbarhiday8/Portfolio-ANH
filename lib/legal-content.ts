import { siteContentDefaults } from '@/lib/site-content-defaults';

export type LegalPageKey = 'privacy' | 'disclaimer';

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export type ResolvedLegalContent = {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
};

function text(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function sections(value: unknown, fallback: readonly { readonly heading: string; readonly paragraphs: readonly string[] }[]) {
  if (!Array.isArray(value)) return fallback.map((section) => ({ heading: section.heading, paragraphs: [...section.paragraphs] }));
  const valid = value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return [];
    const candidate = entry as Record<string, unknown>;
    if (typeof candidate.heading !== 'string' || !candidate.heading.trim() || !Array.isArray(candidate.paragraphs)) return [];
    const paragraphs = candidate.paragraphs.filter((paragraph): paragraph is string => typeof paragraph === 'string' && Boolean(paragraph.trim())).map((paragraph) => paragraph.trim());
    return paragraphs.length ? [{ heading: candidate.heading.trim(), paragraphs }] : [];
  });
  return valid;
}

export function resolveLegalContent(siteContent: unknown, page: LegalPageKey): ResolvedLegalContent {
  const source = siteContent && typeof siteContent === 'object' && !Array.isArray(siteContent)
    ? siteContent as Record<string, unknown>
    : {};
  const prefix = page === 'privacy' ? 'privacy' : 'disclaimer';
  const defaults = siteContentDefaults;

  if (prefix === 'privacy') {
    return {
      eyebrow: text(source.privacyEyebrow, defaults.privacyEyebrow),
      title: text(source.privacyTitle, defaults.privacyTitle),
      description: text(source.privacyDescription, defaults.privacyDescription),
      updatedAt: text(source.privacyUpdatedAt, defaults.privacyUpdatedAt),
      sections: sections(source.privacySections, defaults.privacySections),
    };
  }

  return {
    eyebrow: text(source.disclaimerEyebrow, defaults.disclaimerEyebrow),
    title: text(source.disclaimerTitle, defaults.disclaimerTitle),
    description: text(source.disclaimerDescription, defaults.disclaimerDescription),
    updatedAt: text(source.disclaimerUpdatedAt, defaults.disclaimerUpdatedAt),
    sections: sections(source.disclaimerSections, defaults.disclaimerSections),
  };
}

export function formatLegalDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
