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
          className="prem-float relative z-10 h-[60%] w-auto object-contain drop-shadow-[0_18px_36px_oklch(0.32_0.13_245/0.30)]"
          style={{ mixBlendMode: "multiply" }}
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

/* ─────────────── Colored brand strip (white pill below hero) ─────────────── */
export function HeroBrandStrip({ brands }: { brands: BrandSummary[] }) {
  const { lang } = useLocale();
  const isAr = lang === "ar";
  return (
    <div
      className="relative overflow-hidden rounded-[40px] border border-white/90"
      style={{
        background:
          "linear-gradient(180deg, oklch(1 0 0 / 0.96) 0%, oklch(0.99 0.005 245 / 0.90) 100%)",
        backdropFilter: "saturate(220%) blur(36px)",
        WebkitBackdropFilter: "saturate(220%) blur(36px)",
        boxShadow:
          "0 1px 0 oklch(1 0 0 / 0.95) inset, 0 0 0 1px oklch(0.46 0.16 245 / 0.07), 0 8px 18px oklch(0.32 0.13 245 / 0.08), 0 40px 80px -30px oklch(0.32 0.13 245 / 0.40), 0 80px 160px -60px oklch(0.32 0.13 245 / 0.34)",
      }}
    >
      {/* Top hairline gradient */}
      <div
        className="pointer-events-none absolute inset-x-12 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.46 0.16 245 / 0.50) 30%, oklch(0.68 0.17 138 / 0.50) 70%, transparent)",
        }}
        aria-hidden
      />
      {/* Soft inner top sheen */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20"
        style={{
          background:
            "linear-gradient(180deg, oklch(1 0 0 / 0.65), transparent)",
        }}
        aria-hidden
      />
      {/* Premium corner glow */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.46 0.16 245 / 0.20), transparent 70%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 -bottom-20 size-60 rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.68 0.17 138 / 0.18), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative grid grid-cols-4 gap-x-2 gap-y-8 px-5 py-10 md:grid-cols-8 md:gap-x-4 md:px-14 md:py-14">
        {brands.map((b, i) => {
          const name = isAr ? b.name_ar : b.name_en;
          return (
          <LLink
            key={b.slug}
            to="/$lang/brands/$slug"
            params={{ slug: b.slug }}
            title={name}
            className={`group relative grid h-28 place-items-center transition-all duration-300 hover:-translate-y-1.5 md:h-36 ${
              i > 0 && i % 4 !== 0 ? "md:before:absolute md:before:right-[calc(100%+8px)] md:before:top-1/2 md:before:h-12 md:before:w-px md:before:-translate-y-1/2 md:before:bg-gradient-to-b md:before:from-transparent md:before:via-trust-300/50 md:before:to-transparent" : ""
            }`}
          >
            {b.logo_url ? (
              <div
                className="relative grid size-24 place-items-center overflow-hidden rounded-full bg-white transition-all duration-300 group-hover:scale-[1.06] md:size-32"
                style={{
                  boxShadow:
                    "0 1px 0 oklch(1 0 0 / 0.95) inset, 0 0 0 1px oklch(0.46 0.16 245 / 0.10), 0 12px 24px -12px oklch(0.32 0.13 245 / 0.35)",
                }}
              >
                <img
                  src={b.logo_url}
                  alt={`شعار العلامة التجارية ${name} — متوفرة عبر ركن التوفير في اليمن`}
                  className="max-h-[78%] max-w-[82%] object-contain"
                  loading="lazy"
                  decoding="async"
                  style={{ mixBlendMode: "multiply" }}
                />
              </div>
            ) : null}
          </LLink>
        );
        })}
      </div>
    </div>
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

