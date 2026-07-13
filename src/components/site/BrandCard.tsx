import { LLink } from "@/i18n/LLink";
import { ArrowLeft } from "lucide-react";
import type { BrandSummary } from "@/lib/site.functions";
import { useLocale } from "@/i18n/LocaleProvider";

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
  ctaLabel,
  className = "",
}: BrandCardProps) {
  const { lang, t } = useLocale();
  const isAr = lang === "ar";
  const accent = (brand.brand_tokens?.accent as string) || "var(--trust-700)";
  const mediaUrl = brand.hero_url;
  const displayName = isAr ? brand.name_ar : brand.name_en;
  const subName = isAr ? brand.name_en : brand.name_ar;
  const cta = ctaLabel ?? t("cta.enterBrandPortal");

  return (
    <LLink
      to="/$lang/brands/$slug"
      params={{ slug: brand.slug }}
      className={`brand-card brand-card--${compact ? "compact" : "full"} group relative flex flex-col ${className}`.trim()}
    >
      {typeof index === "number" ? (
        <div
          className="absolute right-3 top-3 z-30 grid size-7 place-items-center rounded-full bg-white/95 text-[10px] font-bold tracking-wider text-trust-700"
          style={{
            boxShadow:
              "0 1px 0 oklch(1 0 0 / 0.9) inset, 0 6px 14px -6px oklch(0.32 0.13 245 / 0.35)",
            border: "1px solid oklch(0.46 0.16 245 / 0.15)",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>
      ) : null}

      <div
        className="absolute inset-x-0 top-0 z-20 h-px opacity-80"
        style={{ background: accent }}
        aria-hidden
      />

      <div className="brand-card__media relative overflow-hidden">
        {mediaUrl ? (
          <img
            src={mediaUrl}
            alt={t("header.brandLogoAlt", { name: displayName })}
            className="brand-card__image size-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="podium relative grid h-full place-items-center p-6 md:p-8">
            {brand.logo_url ? (
              <img
                src={brand.logo_url}
                alt={t("header.brandLogoAlt", { name: displayName })}
                className="relative max-h-28 w-auto object-contain transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105"
                style={{ mixBlendMode: "multiply" }}
                loading="lazy"
              />
            ) : (
              <span className="text-sm font-bold text-muted-foreground">{brand.name_en}</span>
            )}
          </div>
        )}
      </div>

      <div className="brand-card__panel relative z-10 -mt-7 mx-3 mb-3 rounded-[22px] bg-white p-5 md:-mt-9 md:mx-4 md:mb-4 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-arabic text-lg font-bold leading-tight text-foreground md:text-xl">
              {displayName}
            </h3>
            <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-600">
              {subName}
            </div>
          </div>
          {brand.is_partner ? (
            <span className="brand-card__badge shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold text-leaf-700">
              {t("common.officialPartner")}
            </span>
          ) : null}
        </div>

        {brand.tagline_ar ? (
          <p className={`mt-3 text-[13px] leading-loose text-ink-600 ${compact ? "line-clamp-2" : "line-clamp-3"}`}>
            {brand.tagline_ar}
          </p>
        ) : null}

        <div className="mt-5">
          <span className="brand-card__cta group/cta inline-flex items-center gap-2 rounded-full bg-trust-50 px-4 py-2.5 text-xs font-bold text-trust-700 transition-all duration-300 group-hover:bg-trust-700 group-hover:text-white md:text-[13px]">
            <span>{cta}</span>
            <span
              className="grid size-5 place-items-center rounded-full bg-white/80 text-trust-700 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:bg-white"
              aria-hidden
            >
              <ArrowLeft className="size-3" strokeWidth={2.5} />
            </span>
          </span>
        </div>
      </div>
    </LLink>
  );
}
