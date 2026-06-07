import { Link } from "@tanstack/react-router";
import rukn from "@/assets/brands/rukn.json";
import steviola from "@/assets/brands/steviola.json";
import nocal from "@/assets/brands/nocal.json";
import babyTawfir from "@/assets/brands/baby-tawfir.json";
import monivo from "@/assets/brands/monivo.json";
import vkelin from "@/assets/brands/vkelin.json";
import sekem from "@/assets/brands/sekem.json";
import isis from "@/assets/brands/isis.json";
import bambo from "@/assets/brands/bambo.json";

export const RUKN_LOGO_URL = rukn.url;

const BRANDS = [
  { name: "iSiS", slug: "isis", url: isis.url },
  { name: "SEKEM", slug: "sekem", url: sekem.url },
  { name: "Steviola", slug: "steviola", url: steviola.url },
  { name: "NO CAL", slug: "no-cal", url: nocal.url },
  { name: "Monivo", slug: "monivo", url: monivo.url },
  { name: "Baby Tawfir", slug: "baby-tawfir", url: babyTawfir.url },
  { name: "Bambo Fresh", slug: "bambo", url: bambo.url },
  { name: "Y-Kelin", slug: "y-kelin", url: vkelin.url },
];

export function HeroLogoStage() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {/* Outer soft halo */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.46 0.16 245 / 0.18), transparent 70%)",
          filter: "blur(20px)",
        }}
        aria-hidden
      />

      {/* Glass orb */}
      <div className="absolute inset-[6%] rounded-full border border-leaf-300/60 bg-white/70 shadow-[0_30px_80px_-30px_oklch(0.32_0.13_245/0.35),inset_0_1px_0_oklch(1_0_0/0.9)] backdrop-blur-xl" />

      {/* Inner ring */}
      <div className="absolute inset-[12%] rounded-full border border-trust-300/40" aria-hidden />

      {/* Podium */}
      <div
        className="absolute inset-x-[20%] bottom-[18%] h-[10%] rounded-[50%]"
        style={{
          background:
            "radial-gradient(50% 100% at 50% 0%, oklch(0.46 0.16 245 / 0.25), transparent 70%)",
          filter: "blur(14px)",
        }}
        aria-hidden
      />

      {/* Rukn logo center */}
      <div className="absolute inset-0 grid place-items-center">
        <img
          src={rukn.url}
          alt="شعار ركن التوفير كوزمتك للتجارة"
          className="prem-float h-[58%] w-auto object-contain drop-shadow-[0_12px_24px_oklch(0.32_0.13_245/0.25)]"
          loading="eager"
        />
      </div>

      {/* Floating brand logos orbiting the orb */}
      {BRANDS.map((b, i) => {
        // Distribute evenly around the orb in a circle
        const angle = (i / BRANDS.length) * Math.PI * 2 - Math.PI / 2;
        const radius = 50; // % from center
        const x = 50 + Math.cos(angle) * radius;
        const y = 50 + Math.sin(angle) * radius;
        return (
          <Link
            key={b.slug}
            to="/brands/$slug"
            params={{ slug: b.slug }}
            title={b.name}
            className="absolute grid size-[18%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-border bg-card/95 p-2.5 shadow-[0_10px_24px_-10px_oklch(0.32_0.13_245/0.30)] backdrop-blur transition-all hover:-translate-y-[55%] hover:scale-105 hover:border-leaf-300"
            style={{ left: `${x}%`, top: `${y}%`, animation: `prem-float 7s ease-in-out infinite`, animationDelay: `${i * 0.35}s` }}
          >
            <img src={b.url} alt={`شعار ${b.name}`} className="max-h-full max-w-full object-contain" loading="lazy" />
          </Link>
        );
      })}
    </div>
  );
}

export function HeroBrandStrip() {
  const loop = [...BRANDS, ...BRANDS];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur premium-shadow">
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-card to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-card to-transparent" aria-hidden />
      <div className="marquee-track flex w-max items-center gap-10 py-5 px-8">
        {loop.map((b, i) => (
          <Link
            key={`${b.slug}-${i}`}
            to="/brands/$slug"
            params={{ slug: b.slug }}
            title={b.name}
            className="grid h-14 w-28 shrink-0 place-items-center grayscale transition hover:grayscale-0"
          >
            <img src={b.url} alt={`شعار ${b.name}`} className="max-h-12 w-auto object-contain" loading="lazy" />
          </Link>
        ))}
      </div>
    </div>
  );
}
