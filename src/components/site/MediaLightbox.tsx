import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";

/**
 * Global content-image lightbox.
 *
 * Opt-in via `data-content-image` on an <img>, plus every image inside
 * `.article-prose` (article body). Interface icons, logos, and decorative
 * backgrounds are untouched.
 */
type Shot = { src: string; alt: string };

function filenameFor(src: string, alt: string) {
  try {
    const u = new URL(src, window.location.href);
    const base = decodeURIComponent(u.pathname.split("/").pop() || "");
    if (base && /\.[a-z0-9]{2,5}$/i.test(base)) return base;
  } catch {
    /* noop */
  }
  const safe = (alt || "image").replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 60) || "image";
  return `${safe}.jpg`;
}

export function MediaLightbox() {
  const { lang, dir } = useLocale();
  const isAr = lang === "ar";
  const [shot, setShot] = useState<Shot | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const target = e.target as HTMLElement | null;
      const img = target?.closest?.("img") as HTMLImageElement | null;
      if (!img) return;
      const opted = img.hasAttribute("data-content-image") || !!img.closest(".article-prose");
      if (!opted) return;
      const src = img.currentSrc || img.src;
      if (!src) return;
      e.preventDefault();
      e.stopPropagation();
      setShot({ src, alt: img.alt || "" });
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!shot) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShot(null); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [shot]);

  const download = useCallback(async () => {
    if (!shot) return;
    setBusy(true);
    const name = filenameFor(shot.src, shot.alt);
    try {
      const res = await fetch(shot.src, { mode: "cors" });
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch {
      // Cross-origin storage without CORS: fall back to opening the original.
      window.open(shot.src, "_blank", "noopener,noreferrer");
    } finally {
      setBusy(false);
    }
  }, [shot]);

  if (!shot) return null;

  return (
    <div
      dir={dir}
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? "معاينة الصورة" : "Image preview"}
      className="fixed inset-0 z-[100] flex flex-col bg-black/85 backdrop-blur-sm p-3 md:p-6"
      onClick={() => setShot(null)}
    >
      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={download}
          disabled={busy}
          className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow hover:bg-slate-100 disabled:opacity-60"
        >
          {busy ? (isAr ? "جارٍ التحميل…" : "Downloading…") : isAr ? "تنزيل الصورة" : "Download"}
        </button>
        <button
          type="button"
          onClick={() => setShot(null)}
          aria-label={isAr ? "إغلاق" : "Close"}
          className="grid size-10 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
        >
          ✕
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-auto py-4">
        <img
          src={shot.src}
          alt={shot.alt}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full object-contain"
        />
      </div>
      {shot.alt ? (
        <div className="pb-1 text-center text-xs text-white/80">{shot.alt}</div>
      ) : null}
    </div>
  );
}
