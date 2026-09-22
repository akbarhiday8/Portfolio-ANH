import 'client-only';

const PREVIEW_MAX_EDGE = 1_800;
const PREVIEW_QUALITY = 0.82;

function filenameWithoutExtension(name: string) {
  const dot = name.lastIndexOf('.');
  return (dot > 0 ? name.slice(0, dot) : name)
    .replace(/[\\/:*?"<>|]+/g, '-')
    .trim() || 'sertifikat';
}

function canvasToWebp(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/webp', PREVIEW_QUALITY);
  });
}

export async function createPdfPreview(file: File, signal?: AbortSignal) {
  signal?.throwIfAborted();
  if (file.type !== 'application/pdf') throw new Error('Berkas yang dipilih bukan PDF.');

  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();
  }

  signal?.throwIfAborted();
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
  });
  const abortLoading = () => { void loadingTask.destroy(); };
  signal?.addEventListener('abort', abortLoading, { once: true });

  try {
    const pdfDocument = await loadingTask.promise;
    signal?.throwIfAborted();
    if (pdfDocument.numPages > 1_000) {
      throw new Error('PDF memiliki terlalu banyak halaman untuk diproses dengan aman.');
    }
    const page = await pdfDocument.getPage(1);
    const initialViewport = page.getViewport({ scale: 1 });
    const longestEdge = Math.max(initialViewport.width, initialViewport.height);
    if (!Number.isFinite(longestEdge) || longestEdge <= 0) {
      throw new Error('Ukuran halaman PDF tidak valid.');
    }
    const scale = Math.min(2.5, PREVIEW_MAX_EDGE / longestEdge);
    const viewport = page.getViewport({ scale });
    const width = Math.max(1, Math.round(viewport.width));
    const height = Math.max(1, Math.round(viewport.height));
    const canvas = window.document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Browser tidak dapat membuat preview PDF.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);

    const renderTask = page.render({ canvas, canvasContext: context, viewport });
    const abortRender = () => renderTask.cancel();
    signal?.addEventListener('abort', abortRender, { once: true });
    try {
      await renderTask.promise;
    } finally {
      signal?.removeEventListener('abort', abortRender);
    }
    signal?.throwIfAborted();

    const blob = await canvasToWebp(canvas);
    if (!blob) throw new Error('Preview PDF tidak dapat dikonversi ke WebP.');
    return {
      file: new File([blob], `${filenameWithoutExtension(file.name)}-preview.webp`, {
        type: 'image/webp',
        lastModified: Date.now(),
      }),
      width,
      height,
      pageCount: pdfDocument.numPages,
    };
  } catch (error) {
    if (signal?.aborted) throw new DOMException('Pembuatan preview dibatalkan.', 'AbortError');
    if (error instanceof Error && /password/i.test(error.name + error.message)) {
      throw new Error('PDF yang dilindungi kata sandi belum dapat dibuatkan preview.');
    }
    throw error instanceof Error ? error : new Error('PDF tidak dapat dibaca.');
  } finally {
    signal?.removeEventListener('abort', abortLoading);
    await loadingTask.destroy().catch(() => undefined);
  }
}
