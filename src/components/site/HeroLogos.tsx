import { useState } from "react";
import { LLink } from "@/i18n/LLink";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Award, Truck, Headphones } from "lucide-react";
import { useT, useLocale } from "@/i18n/LocaleProvider";
import type { BrandSummary } from "@/lib/site.functions";

/* ─────────────── HERO STAGE: Glass orb on a 3-tier blue podium ─────────────── */
export function HeroLogoStage({ logoUrl }: { logoUrl: string | null }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]">
      {/* Ambient conic glow behind orb (very subtle premium lighting) */}
      <div
        className="pointer-events-none absolute inset-[-6%] rounded-full"
        style={{
          background:
            "conic-gradient(from 210deg at 50% 50%, oklch(0.46 0.16 245 / 0.16), oklch(0.68 0.17 138 / 0.08), oklch(0.46 0.16 245 / 0.14), oklch(0.32 0.13 245 / 0.20), oklch(0.46 0.16 245 / 0.16))",
          filter: "blur(46px)",
          opacity: 0.85,
        }}
        aria-hidden
      />

      {/* Decorative curved blue wave behind orb (outer side) */}
      <svg
        className="pointer-events-none absolute -right-[18%] -top-[10%] h-[130%] w-[130%] opacity-90"
        viewBox="0 0 600 600"
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="wave1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.46 0.16 245)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="oklch(0.46 0.16 245)" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="wave2" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.32 0.13 245)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="oklch(0.46 0.16 245)" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <path d="M620 80 C 520 220, 560 380, 640 520 L 700 700 L 700 0 Z" fill="url(#wave1)" />
        <path d="M640 60 C 470 220, 520 420, 700 560 L 700 700 L 700 0 Z" fill="url(#wave2)" opacity="0.7" />
      </svg>

      {/* Outer soft halo */}
      <div
        className="absolute inset-[4%] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.46 0.16 245 / 0.20), transparent 70%)",
          filter: "blur(28px)",
        }}
        aria-hidden
      />

      {/* Glass orb */}
      <div
        className="absolute inset-[8%] rounded-full border border-white/80 backdrop-blur-xl"
        style={{
          background:
            "radial-gradient(120% 120% at 30% 20%, oklch(1 0 0 / 0.96) 0%, oklch(0.97 0.02 245 / 0.72) 45%, oklch(0.92 0.05 245 / 0.55) 75%, oklch(0.85 0.07 245 / 0.45) 100%)",
          boxShadow:
            "0 50px 120px -32px oklch(0.32 0.13 245 / 0.50), 0 20px 50px -20px oklch(0.32 0.13 245 / 0.32), inset 0 2px 0 oklch(1 0 0 / 0.96), inset 0 -30px 60px oklch(0.46 0.16 245 / 0.14), inset 0 0 0 1px oklch(0.68 0.17 138 / 0.06)",
        }}
        aria-hidden
      />
      {/* Inner green ring */}
      <div
        className="pointer-events-none absolute inset-[10%] rounded-full"
        style={{
          border: "1.5px solid oklch(0.68 0.17 138 / 0.55)",
          boxShadow: "inset 0 0 40px oklch(0.68 0.17 138 / 0.10)",
        }}
        aria-hidden
      />
      {/* Highlight glare */}
      <div
        className="pointer-events-none absolute inset-[10%] rounded-full"
        style={{
          background:
            "radial-gradient(40% 25% at 30% 18%, oklch(1 0 0 / 0.85), transparent 70%)",
        }}
        aria-hidden
      />

      {/* Rukn logo center */}
      <RuknHeroLogo logoUrl={logoUrl} />
    </div>
  );
}

function RuknHeroLogo({ logoUrl }: { logoUrl: string | null }) {
  const { lang } = useLocale();
  const alt =
    lang === "ar"
      ? "شعار شركة ركن التوفير كوزمتك للتجارة — الموزّع الرسمي للعلامات الصحية في اليمن"
      : "Official Rukn Al-Tawfir Cosmetic for Trade company emblem — health brands distributor in Yemen";
  return (
    <div className="absolute inset-0 grid place-items-center">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={alt}
          width={560}
          height={560}
          className="prem-float relative z-10 h-[68%] w-auto object-contain drop-shadow-[0_18px_36px_oklch(0.32_0.13_245/0.30)]"
          style={{ clipPath: "circle(46% at 50% 50%)" }}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      ) : null}

      {/* 3-tier blue podium under orb */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        {/* Top tier */}
        <div
          className="h-3 w-[58%] rounded-[50%]"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.58 0.15 245) 0%, oklch(0.46 0.16 245) 60%, oklch(0.32 0.13 245) 100%)",
            boxShadow:
              "0 12px 24px -8px oklch(0.32 0.13 245 / 0.55), inset 0 1px 0 oklch(1 0 0 / 0.4)",
          }}
        />
        <div
          className="-mt-[6px] h-7 w-[58%] rounded-b-[16px]"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.46 0.16 245) 0%, oklch(0.32 0.13 245) 100%)",
          }}
        />
        {/* Middle tier */}
        <div
          className="mt-1 h-3 w-[72%] rounded-[50%]"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.58 0.15 245) 0%, oklch(0.42 0.15 245) 100%)",
            boxShadow: "0 10px 20px -6px oklch(0.32 0.13 245 / 0.45)",
          }}
        />
        <div
          className="-mt-[6px] h-5 w-[72%]"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.42 0.15 245) 0%, oklch(0.30 0.12 245) 100%)",
          }}
        />
        {/* Base */}
        <div
          className="mt-1 h-3 w-[88%] rounded-[50%]"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.52 0.15 245) 0%, oklch(0.36 0.13 245) 100%)",
            boxShadow: "0 14px 30px -8px oklch(0.32 0.13 245 / 0.55)",
          }}
        />
      </div>
    </div>
  );
}

/* ─────────────── Brands carousel (below hero) ─────────────── */
export function HeroBrandStrip({ brands }: { brands: BrandSummary[] }) {
  const { lang, dir } = useLocale();
  const isAr = lang === "ar";
  const [failed, setFailed] = useState<Record<string, true>>({});

  // A card without a usable image is never rendered on the public site.
  const items = brands.filter((b) => b.logo_url && !failed[b.slug]);
  if (!items.length) return null;

  return (
    <section className="w-full" dir={dir} aria-labelledby="brands-strip-title">
      <h2
        id="brands-strip-title"
        className="font-arabic text-2xl font-black tracking-tight text-foreground md:text-4xl"
      >
        {isAr ? "علاماتنا التجارية" : "Our Brands"}
      </h2>
      <div className="mt-2 h-1 w-16 rounded-full bg-leaf-500/80" aria-hidden />

      <div
        className="mt-6 rounded-[32px] border border-white/90 px-3 py-5 md:px-5 md:py-6"
        style={{
          background:
            "linear-gradient(180deg, oklch(1 0 0 / 0.96) 0%, oklch(0.99 0.005 245 / 0.90) 100%)",
          boxShadow:
            "0 1px 0 oklch(1 0 0 / 0.95) inset, 0 0 0 1px oklch(0.46 0.16 245 / 0.07), 0 24px 48px -28px oklch(0.32 0.13 245 / 0.35)",
        }}
      >
        {/* Static responsive grid — no carousel, no overlapping cards. */}
        <div>
          <ul className="grid list-none grid-cols-2 items-stretch gap-4 p-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">

              const name = isAr ? b.name_ar : b.name_en;
              return (
                <li key={b.slug} className="w-[132px] shrink-0 md:w-[164px]">
                  <LLink
                    to="/$lang/brands/$slug"
                    params={{ slug: b.slug }}
                    title={name}
                    className="group flex h-full flex-col items-center gap-2 rounded-2xl border border-trust-300/25 bg-white p-3 transition-transform duration-300 hover:-translate-y-1 md:p-4"
                    style={{
                      boxShadow:
                        "0 1px 0 oklch(1 0 0 / 0.95) inset, 0 10px 22px -14px oklch(0.32 0.13 245 / 0.35)",
                    }}
                  >
                    <div className="grid aspect-square w-full place-items-center">
                      <img
                        src={b.logo_url as string}
                        alt={
                          isAr
                            ? `شعار العلامة التجارية ${name} — متوفرة عبر ركن التوفير في اليمن`
                            : `${name} brand logo — available through Rukn Al-Tawfir in Yemen`
                        }
                        className="h-full w-full"
                        style={{ objectFit: "contain", objectPosition: "center" }}
                        loading="lazy"
                        decoding="async"
                        onError={() => {
                          console.error("[brand-strip] image failed to load:", b.logo_url);
                          setFailed((f) => ({ ...f, [b.slug]: true }));
                        }}
                      />
                    </div>
                    <span className="line-clamp-1 text-center text-[11px] font-semibold text-ink-600 md:text-xs">
                      {name}
                    </span>
                  </LLink>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}



/* ─────────────── Dark blue features strip (under brand strip) ─────────────── */
export function HeroFeaturesStrip() {
  const t = useT();
  const { dir } = useLocale();
  const FEATURES = [
    { i: ShieldCheck, t: t("home.features.exclusive"), d: t("home.features.exclusiveDesc") },
    { i: Award, t: t("home.features.quality"), d: t("home.features.qualityDesc") },
    { i: Truck, t: t("home.features.distribution"), d: t("home.features.distributionDesc") },
    { i: Headphones, t: t("home.features.service"), d: t("home.features.serviceDesc") },
  ];
  return (
    <div
      className="relative overflow-hidden rounded-[28px] border border-white/10"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.32 0.13 245) 0%, oklch(0.42 0.15 245) 60%, oklch(0.32 0.13 245) 100%)",
        boxShadow: "0 30px 60px -25px oklch(0.32 0.13 245 / 0.55)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(60% 80% at 20% 0%, oklch(0.58 0.15 245 / 0.5), transparent 60%), radial-gradient(60% 80% at 90% 100%, oklch(0.68 0.17 138 / 0.15), transparent 60%)",
        }}
        aria-hidden
      />
      <ul className="relative grid grid-cols-2 gap-y-6 px-4 py-6 md:grid-cols-4 md:gap-0 md:px-8 md:py-7">
        {FEATURES.map((f, i) => {
          const Icon = f.i;
          return (
            <li
              key={f.t}
              className={`flex items-center gap-4 px-2 text-sand-50 md:px-6 ${
                i < FEATURES.length - 1 ? "md:border-l md:border-white/15" : ""
              }`}
              dir={dir}
            >
              <div
                className="grid size-12 shrink-0 place-items-center rounded-full border border-white/40 bg-white/95 text-trust-700 shadow-[0_8px_20px_-6px_oklch(0_0_0/0.35),inset_0_1px_0_oklch(1_0_0/0.9)]"
                aria-hidden
              >
                <Icon className="size-5" strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <div className="font-arabic text-sm font-bold leading-tight md:text-base">
                  {f.t}
                </div>
                <div className="mt-0.5 text-[11px] leading-snug text-white/75 md:text-xs">
                  {f.d}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

