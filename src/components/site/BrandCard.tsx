import { Link } from "@tanstack/react-router";
import type { BrandSummary } from "@/lib/site.functions";
import { getBrandCardMedia } from "@/lib/brand-card-media";

type BrandCardProps = {
  brand: BrandSummary;
  index?: number;
  compact?: boolean;
  ctaLabel?: string;
  className?: string;
};

export function BrandCard({
  brand,
  index,
  compact = false,
  ctaLabel = "دخول بوابة العلامة",
  className = "",
}: BrandCardProps) {
  const accent = (brand.brand_tokens?.accent as string) || "var(--trust-700)";
  const mediaUrl = getBrandCardMedia(brand.slug);

  return (
    <Link
      to="/brands/$slug"
      params={{ slug: brand.slug }}
      className={`brand-card brand-card--${compact ? "compact" : "full"} group relative flex flex-col overflow-hidden ${className}`.trim()}
    >
      {typeof index === "number" ? (
        <div className="absolute right-4 top-4 z-20 rounded-full glass px-2.5 py-1 text-[10px] font-bold tracking-widest text-trust-700">
          {String(index + 1).padStart(2, "0")}
        </div>
      ) : null}

      <div className="absolute inset-x-0 top-0 z-10 h-px opacity-80" style={{ background: accent }} aria-hidden />

      <div className="brand-card__media relative overflow-hidden">
        {mediaUrl ? (
          <>
            <img
              src={mediaUrl}
              alt={`الصورة الرسمية لعلامة ${brand.name_ar}`}
              className="brand-card__image size-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.035]"
              loading="lazy"
            />
            <div className="brand-card__overlay absolute inset-0" aria-hidden />
            <div className="brand-card__glow absolute inset-x-[10%] bottom-2 h-20 rounded-full" aria-hidden />
          </>
        ) : (
          <div className="podium relative grid h-full place-items-center p-6 md:p-8">
            {brand.logo_url ? (
              <img
                src={brand.logo_url}
                alt={`شعار ${brand.name_ar}`}
                className="relative max-h-28 w-auto object-contain transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <span className="text-sm font-bold text-muted-foreground">{brand.name_en}</span>
            )}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 prem-shimmer opacity-0 group-hover:opacity-100" />
          </div>
        )}
      </div>

      <div className="brand-card__content relative z-10 flex flex-1 flex-col p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-arabic text-lg font-bold text-foreground md:text-xl">{brand.name_ar}</h3>
            <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-600">{brand.name_en}</div>
          </div>
          {brand.is_partner ? (
            <span className="brand-card__badge shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold text-leaf-700">
              شريك رسمي
            </span>
          ) : null}
        </div>

        {brand.tagline_ar ? (
          <p className={`mt-3 text-[13px] leading-loose text-ink-600 ${compact ? "line-clamp-2" : "line-clamp-3"}`}>
            {brand.tagline_ar}
          </p>
        ) : null}

        <div className="mt-auto pt-5">
          <div className="brand-card__footer inline-flex items-center gap-2 text-xs font-bold text-trust-700 md:text-sm">
            <span>{ctaLabel}</span>
            <span aria-hidden className="transition-transform group-hover:-translate-x-1">←</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
