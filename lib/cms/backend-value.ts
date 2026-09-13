export type CmsDataBackend = 'd1' | 'supabase';

export class CmsBackendConfigurationError extends Error {
  constructor(value: string) {
    super(`CMS_DATA_BACKEND tidak valid: ${value}`);
    this.name = 'CmsBackendConfigurationError';
  }
}

export function parseCmsDataBackend(value: string | undefined): CmsDataBackend {
  const normalized = value?.trim().toLowerCase();
  if (!normalized || normalized === 'd1') return 'd1';
  if (normalized === 'supabase') return 'supabase';
  throw new CmsBackendConfigurationError(normalized);
}
