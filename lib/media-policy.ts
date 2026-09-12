export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';

export const DOCUMENT_ACCEPT = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  'text/plain',
  'text/csv',
].join(',');

export const MEDIA_ACCEPT = `${IMAGE_ACCEPT},${DOCUMENT_ACCEPT}`;
export const MAX_SOURCE_IMAGE_SIZE = 24 * 1024 * 1024;
export const MAX_OPTIMIZED_IMAGE_SIZE = 8 * 1024 * 1024;
export const MAX_DOCUMENT_SIZE = 24 * 1024 * 1024;

export type MediaItem = {
  id: string;
  url: string;
  name: string;
  contentType: string;
  size: number;
  originalSize?: number;
  width?: number;
  height?: number;
  optimized?: boolean;
  temporary?: boolean;
  createdAt: string;
};

export function formatMediaSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
