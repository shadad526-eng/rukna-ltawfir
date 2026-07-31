// Client-side image optimization before upload.
// - Never upscales: images smaller than the cap are only re-encoded when that
//   actually produces a smaller file.
// - Converts to WebP when the browser can encode it, otherwise leaves the file
//   untouched (returns the original blob + content type).
const MAX_DIMENSION = 2000;
const QUALITY = 0.85;

export type OptimizedImage = { blob: Blob; contentType: string; filename: string };

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function optimizeImageForUpload(file: File): Promise<OptimizedImage> {
  const fallback: OptimizedImage = {
    blob: file,
    contentType: file.type || "application/octet-stream",
    filename: file.name,
  };
  if (typeof window === "undefined") return fallback;
  if (!file.type.startsWith("image/")) return fallback;
  // Vector and animated formats must not be rasterized.
  if (/svg|gif/i.test(file.type)) return fallback;

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height)); // never > 1 → no upscaling
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return fallback;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    const webp = await canvasToBlob(canvas, "image/webp", QUALITY);
    if (!webp || webp.type !== "image/webp") return fallback;
    // Keep the original when re-encoding did not help and no resize happened.
    if (scale === 1 && webp.size >= file.size) return fallback;

    const base = file.name.replace(/\.[^.]+$/, "") || "image";
    return { blob: webp, contentType: "image/webp", filename: `${base}.webp` };
  } catch {
    return fallback;
  }
}
