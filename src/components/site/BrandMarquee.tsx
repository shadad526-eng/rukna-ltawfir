import { LLink } from "@/i18n/LLink";
import { Link } from "@tanstack/react-router";

type BrandLite = { id: string; slug: string; name_ar: string; name_en: string; logo_url: string | null };

export function BrandMarquee({ brands }: { brands: BrandLite[] }) {
  if (!brands.length) return null;
  const loop = [...brands, ...brands];
  return (
    <div className="relative overflow-hidden rounded-3xl glass premium-shadow">
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-card to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-card to-transparent" aria-hidden />
      <div className="marquee-track flex w-max gap-8 py-5 px-6">
        {loop.map((b, i) => (
          <Link
            key={`${b.id}-${i}`}
            to="/$lang/brands/$slug"
            params={{ slug: b.slug }}
            className="group grid h-16 w-36 shrink-0 place-items-center rounded-xl border border-border bg-card/70 px-4 transition-transform hover:-translate-y-0.5"
            title={b.name_ar}
          >
            {b.logo_url ? (
              <img
                src={b.logo_url}
                alt={`شعار ${b.name_ar}`}
                className="max-h-10 w-auto object-contain transition-opacity"
                loading="lazy"
              />
            ) : (
              <span className="text-[11px] font-bold text-muted-foreground">{b.name_en}</span>
            )}
          </LLink>
        ))}
      </div>
    </div>
  );
}
