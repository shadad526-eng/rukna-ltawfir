import { LLink } from "@/i18n/LLink";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  getCorporateIdentity,
  listBrands,
  listFeaturedProducts,
  listCatalogs,
} from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";
import { StickyWhatsApp } from "@/components/site/StickyWhatsApp";
import { HeroLogoStage, HeroBrandStrip, HeroFeaturesStrip } from "@/components/site/HeroLogos";
import { BrandCard } from "@/components/site/BrandCard";

const identityQO = queryOptions({
  queryKey: ["corporate-identity"],
  queryFn: () => getCorporateIdentity(),
});
const brandsQO = queryOptions({ queryKey: ["brands"], queryFn: () => listBrands() });
const featuredQO = queryOptions({
  queryKey: ["featured-products"],
  queryFn: () => listFeaturedProducts(),
});
const catalogsQO = queryOptions({ queryKey: ["catalogs"], queryFn: () => listCatalogs() });

export const Route = createFileRoute("/$lang/")({
  head: ({ params }) => {
    const url = `https://rukna-ltawfir.lovable.app/${params.lang}`;
    return {
      meta: [
        { title: "ركن التوفير كوزمتك للتجارة — المقرّ الرقمي الرسمي" },
        {
          name: "description",
          content:
            "الوكيل الحصري لمنظومة من العلامات الصحية العالمية في اليمن: NO CAL، Steviola، Monivo، Baby Tawfir، Bambo، Y-Kelin، iSiS، SEKEM.",
        },
        { property: "og:title", content: "ركن التوفير كوزمتك للتجارة" },
        { property: "og:description", content: "منظومة علامات صحية عالمية برعاية ركن التوفير في اليمن." },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(brandsQO),
      context.queryClient.ensureQueryData(featuredQO),
      context.queryClient.ensureQueryData(catalogsQO),
    ]);
  },
  component: Home,
});

const TRUST_BADGES = [
  { i: "◇", t: "منتجات أصلية", d: "وكالة رسمية ١٠٠٪" },
  { i: "✦", t: "جودة عالمية", d: "بمعايير معتمدة" },
  { i: "❖", t: "شركاء موثوقون", d: "أكبر شبكة توزيع" },
  { i: "✺", t: "توصيل وطني", d: "تغطية كل المحافظات" },
];

const WHY_CARDS = [
  { i: "◆", t: "وكالات حصرية", d: "تمثيل رسمي لعلامات دولية مختارة داخل السوق اليمنية." },
  { i: "✦", t: "منتجات أصلية", d: "أصول رسمية وعبوات معتمدة، دون أي إعادة تصميم." },
  { i: "✺", t: "جودة عالمية", d: "معايير تصنيع وتعبئة موثّقة من الشركات الأم." },
  { i: "✪", t: "توزيع وطني", d: "شبكة شركاء معتمدين تغطّي جميع المحافظات." },
  { i: "❖", t: "شراكات قوية", d: "اتفاقيات طويلة الأمد مع موزعين وصيدليات ومحلات." },
  { i: "✧", t: "دعم احترافي", d: "إسناد تقني وتجاري متواصل عبر واتساب الأعمال." },
];

const KNOWLEDGE = [
  {
    eyebrow: "نصائح صحية",
    title: "فوائد المحليات الطبيعية للصحة اليومية",
    body: "كيف تساهم المحليات الطبيعية في توازن السكر اليومي وتقليل السعرات.",
  },
  {
    eyebrow: "دليل المنتجات",
    title: "دليل فيتامين C وأهميته للمناعة والطاقة",
    body: "نظرة عملية على دور فيتامين C في دعم المناعة وأفضل ممارسات الجرعة.",
  },
  {
    eyebrow: "العناية الشخصية",
    title: "كيف تحافظ على صحة أسنانك يوميًا",
    body: "روتين بسيط من Y-Kelin للحفاظ على أسنان قوية ولثة سليمة طوال اليوم.",
  },
];

function Home() {
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: brands } = useSuspenseQuery(brandsQO);
  const { data: featured } = useSuspenseQuery(featuredQO);
  const { data: catalogs } = useSuspenseQuery(catalogsQO);


  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        legalNameAr={id.legal_name_ar}
        parentGroupAr={id.parent_group_ar}
        whatsappNumber={id.whatsapp_number}
        logoUrl={id.logo_url}
      />

      {/* ───────── 1. FLAGSHIP HERO ───────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "radial-gradient(120% 80% at 100% 0%, oklch(0.86 0.07 245) 0%, transparent 55%), radial-gradient(90% 70% at 0% 100%, oklch(0.96 0.025 138) 0%, transparent 55%), linear-gradient(180deg, #F6FAFE 0%, #EAF2FB 55%, #DCE8F5 100%)",
        }}
      >
        {/* Layered abstract curves — premium depth */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <defs>
            <linearGradient id="heroCurve1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.46 0.16 245)" stopOpacity="0.10" />
              <stop offset="100%" stopColor="oklch(0.46 0.16 245)" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="heroCurve2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.68 0.17 138)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="oklch(0.68 0.17 138)" stopOpacity="0.04" />
            </linearGradient>
            <pattern id="heroDots" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="oklch(0.46 0.16 245 / 0.10)" />
            </pattern>
          </defs>
          <rect width="1440" height="900" fill="url(#heroDots)" opacity="0.55" />
          <path d="M0 720 C 320 620, 540 760, 820 660 S 1280 540, 1440 620 L 1440 900 L 0 900 Z" fill="url(#heroCurve1)" />
          <path d="M1440 0 C 1180 120, 1240 320, 1080 420 S 800 540, 720 460 L 720 0 Z" fill="url(#heroCurve2)" />
          <path d="M0 80 C 200 40, 380 160, 540 120" stroke="oklch(0.46 0.16 245 / 0.18)" strokeWidth="1" fill="none" />
        </svg>

        {/* Soft floating leaves */}
        <span className="leaf-drift absolute right-[6%] top-[14%] text-4xl text-leaf-500/80 md:text-5xl" aria-hidden>🍃</span>
        <span className="leaf-drift absolute left-[6%] top-[55%] text-3xl text-leaf-500/70 md:text-4xl" style={{ animationDelay: "1.8s" }} aria-hidden>🍃</span>
        <span className="leaf-drift absolute left-[14%] bottom-[28%] text-2xl text-leaf-500/60 md:text-3xl" style={{ animationDelay: "3.2s" }} aria-hidden>🍃</span>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pt-14 pb-32 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-14 md:px-8 md:pt-24 md:pb-48">
          <div className="prem-fade-up order-2 md:order-1">
            <div
              className="inline-flex items-center gap-2 rounded-full border border-trust-300/60 px-5 py-2 text-[11px] font-semibold tracking-wider text-trust-700 md:text-xs"
              style={{
                background:
                  "linear-gradient(180deg, oklch(1 0 0 / 0.92), oklch(0.97 0.018 245 / 0.78))",
                boxShadow:
                  "0 10px 24px -10px oklch(0.32 0.13 245 / 0.28), inset 0 1px 0 oklch(1 0 0 / 0.95)",
              }}
            >
              <span className="size-1.5 rounded-full bg-leaf-500 shadow-[0_0_0_4px_oklch(0.68_0.17_138/0.18)]" />
              منظومة علامات عالمية في مظلّة واحدة
            </div>

            <h1 className="mt-7 font-arabic font-bold leading-[1.04] tracking-tight">
              <span
                className="block text-[2.2rem] md:text-[3.4rem] lg:text-[4.1rem]"
                style={{
                  background:
                    "linear-gradient(180deg, oklch(0.32 0.13 245) 0%, oklch(0.42 0.15 245) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                نبني حياة أكثر صحة...
              </span>
              <span
                className="mt-2 block text-[2.1rem] md:text-[3.2rem] lg:text-[3.9rem]"
                style={{
                  background:
                    "linear-gradient(180deg, oklch(0.62 0.17 138) 0%, oklch(0.50 0.16 138) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ونصنع مستقبلاً أقوى
              </span>
            </h1>

            {/* Premium accent rule */}
            <div className="mt-6 flex items-center gap-3">
              <span className="h-px w-14 bg-gradient-to-l from-transparent to-trust-700/60" />
              <span className="size-1.5 rounded-full bg-leaf-500" />
              <span className="h-px w-24 bg-gradient-to-r from-transparent via-trust-700/40 to-transparent" />
            </div>

            <p className="mt-6 max-w-xl text-base leading-loose text-ink-600 md:text-lg">
              الشريك الاستراتيجي والبوابة الأولى للعلامات التجارية الصحية في اليمن.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <LLink
                to="/$lang/brands"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-8 py-4 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 md:text-[15px]"
                style={{
                  background:
                    "linear-gradient(180deg, oklch(0.56 0.16 245), oklch(0.38 0.15 245))",
                  boxShadow:
                    "0 22px 44px -16px oklch(0.32 0.13 245 / 0.65), 0 6px 14px -6px oklch(0.32 0.13 245 / 0.35), inset 0 1px 0 oklch(1 0 0 / 0.30), inset 0 -1px 0 oklch(0 0 0 / 0.12)",
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-60"
                  style={{
                    background:
                      "linear-gradient(180deg, oklch(1 0 0 / 0.20), transparent)",
                  }}
                />
                <span aria-hidden className="relative transition-transform group-hover:-translate-x-0.5">←</span>
                <span className="relative">استكشف المنتجات</span>
              </LLink>
              <WhatsAppCTA number={id.whatsapp_number}>تواصل معنا</WhatsAppCTA>
            </div>
          </div>

          {/* Glass orb stage */}
          <div className="order-1 md:order-2">
            <HeroLogoStage />
          </div>
        </div>
      </section>

      {/* ───────── FLOATING BRAND BAR — sits between hero and features with real layout space ───────── */}
      <div className="relative z-30 mx-auto -mt-16 max-w-6xl px-4 md:-mt-24 md:px-8">
        <HeroBrandStrip />
      </div>

      {/* Features strip — clear breathing room below the floating bar */}
      <section className="relative z-10 bg-card pt-14 md:pt-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <HeroFeaturesStrip />
        </div>
      </section>

      {/* ───────── 2. WHY RUKN AL-TAWFIR ───────── */}
      <section className="bg-card pt-16 md:pt-20">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="hq-eyebrow">لماذا ركن التوفير</div>
            <h2 className="mt-3 font-arabic text-3xl font-bold leading-tight text-foreground md:text-5xl">
              مرجعية مؤسسية تحمي العلامة والعميل والشريك
            </h2>
            <p className="mt-5 text-base leading-loose text-ink-600">
              ستة محاور تشكّل الحوكمة التي نلتزم بها مع كل علامة وكل شريك تجاري.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CARDS.map((c) => (
              <article key={c.t} className="prem-card relative p-6 md:p-7">
                <div className="grid size-12 place-items-center rounded-2xl bg-trust-50 text-2xl text-trust-700">
                  {c.i}
                </div>
                <h3 className="mt-5 font-arabic text-lg font-bold text-foreground">{c.t}</h3>
                <p className="mt-3 text-[14px] leading-loose text-ink-600">{c.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── 3. INTERNATIONAL BRAND ECOSYSTEM ───────── */}
      <section id="ecosystem" className="relative border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <div className="mb-12 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="hq-eyebrow">العلامات الدولية الحصرية</div>
              <h2 className="mt-3 font-arabic text-3xl font-bold leading-tight text-foreground md:text-5xl">
                منظومة علامات عالمية في مظلّة واحدة
              </h2>
              <p className="mt-4 text-base leading-loose text-ink-600">
                علامات تجارية عالمية موثوقة، تُدار ضمن منظومة احترافية واحدة تجمع بين الجودة والحوكمة والشراكات الاستراتيجية، مع الحفاظ على الهوية المستقلة لكل علامة.
              </p>
            </div>
            <LLink
              to="/$lang/brands"
              className="inline-flex items-center gap-1.5 rounded-full border border-trust-700/20 bg-secondary px-4 py-2 text-sm font-semibold text-trust-700 transition-colors hover:bg-trust-700 hover:text-sand-50"
            >
              دليل العلامات الكامل <span aria-hidden>←</span>
            </LLink>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {brands.map((b, idx) => (
              <BrandCard key={b.id} brand={b} index={idx} ctaLabel="دخول بوابة العلامة" />
            ))}
          </div>
        </div>
      </section>

      {/* ───────── 4. FEATURED PRODUCTS ───────── */}
      {featured.length > 0 ? (
        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
            <div className="mb-10 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="hq-eyebrow">منتجات مختارة</div>
                <h2 className="mt-3 font-arabic text-3xl font-bold leading-tight text-foreground md:text-4xl">
                  لمحة من منتجات المنظومة
                </h2>
              </div>
              <LLink to="/$lang/brands" className="text-sm font-semibold text-trust-700 hover:underline">
                استعراض جميع العلامات ←
              </LLink>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {featured.map((p) => (
                <LLink
                  key={p.id}
                  to="/$lang/brands/$slug/$productSlug"
                  params={{ slug: p.brand_slug, productSlug: p.slug }}
                  className="prem-card group flex flex-col"
                >
                  <div className="podium relative grid aspect-square place-items-center p-5">
                    {p.cover_url ? (
                      <img
                        src={p.cover_url}
                        alt={p.name_ar}
                        className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-[11px] text-muted-foreground">صورة رسمية</span>
                    )}
                  </div>
                  <div className="flex-1 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-600">{p.brand_slug}</div>
                    <div className="mt-1 font-arabic text-[13px] font-bold leading-tight text-foreground line-clamp-2">
                      {p.name_ar}
                    </div>
                  </div>
                </LLink>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ───────── 5. BRAND COLLECTIONS (Bento, equal weight, official logos only) ───────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
        <div className="mb-10 flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="hq-eyebrow">المجموعات الرسمية</div>
            <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
              تصفّح المجموعات حسب العلامة
            </h2>
          </div>
          <LLink to="/$lang/brands" className="text-sm font-semibold text-trust-700 hover:underline">
            عرض الكل ←
          </LLink>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {brands.map((b) => (
            <BrandCard
              key={b.id}
              brand={b}
              compact
              ctaLabel="استكشف المجموعة"
            />
          ))}
        </div>
      </section>

      {/* ───────── 6. KNOWLEDGE CENTER ───────── */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
          <div className="mb-10 flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="hq-eyebrow">المركز المعرفي</div>
              <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
                مقالات ودلائل من خبراء المنظومة
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {KNOWLEDGE.map((k) => {
              const waText = `السلام عليكم، أرغب بمعرفة المزيد حول: ${k.title}`;
              const waHref = `https://wa.me/967${id.whatsapp_number}?text=${encodeURIComponent(waText)}`;
              return (
                <a
                  key={k.title}
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="prem-card group flex h-full flex-col overflow-hidden transition-transform hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden rounded-b-[2rem]">
                    <div className="absolute inset-0 aurora-mesh" aria-hidden />
                    <div className="absolute inset-x-6 top-6 flex justify-start">
                      <div className="rounded-full glass-dark px-3 py-1 text-[10px] font-bold tracking-[0.22em] text-sand-50">
                        {k.eyebrow}
                      </div>
                    </div>
                    <div className="absolute inset-x-6 bottom-5 h-px prem-divider opacity-70" aria-hidden />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-arabic text-lg font-bold leading-snug text-foreground">{k.title}</h3>
                    <p className="mt-3 text-sm leading-loose text-ink-600">{k.body}</p>
                    <div className="mt-auto pt-6 text-xs font-bold text-trust-700 transition-transform group-hover:-translate-x-1">
                      استفسر عبر واتساب ←
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── 7. PARTNERSHIP ───────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="premium-panel overflow-hidden p-8 md:p-10">
            <div className="absolute -right-16 -top-16 size-56 rounded-full bg-trust-700/10 blur-3xl" aria-hidden />
            <div className="hq-eyebrow">الكتالوجات الرسمية</div>
            <h3 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
              تصفّح مكتبة الكتالوجات
            </h3>
            <p className="mt-3 max-w-md text-sm leading-loose text-ink-600">
              {catalogs.length > 0
                ? `${catalogs.length} كتالوج رسمي قابل للتنزيل أو الطلب وفق سياسة الوصول.`
                : "كتالوجات رسمية لكل علامة، مع ملفات قابلة للتنزيل وفق سياسة الوصول."}
            </p>
            <LLink
              to="/$lang/catalogs"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-trust-700 px-5 py-2.5 text-sm font-semibold text-sand-50 transition-transform hover:-translate-y-0.5"
            >
              دخول مكتبة الكتالوجات <span aria-hidden>←</span>
            </LLink>
          </div>
          <div className="premium-panel overflow-hidden p-8 md:p-10">
            <div className="absolute -left-16 -top-16 size-56 rounded-full bg-leaf-500/15 blur-3xl" aria-hidden />
            <div className="hq-eyebrow" style={{ color: "var(--leaf-700)" }}>شراكات الأعمال</div>
            <h3 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
              ابدأ شراكتك التجارية معنا
            </h3>
            <p className="mt-3 max-w-md text-sm leading-loose text-ink-600">
              للموزعين والمشترين بالجملة: قناة موحّدة عبر واتساب الأعمال للحصول على شروط الشراكة.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <LLink
                to="/$lang/partners"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-trust-700 hover:text-trust-700"
              >
                صفحة الشراكات
              </LLink>
              <WhatsAppCTA
                number={id.whatsapp_number}
                message="السلام عليكم، أرغب في فتح حساب شراكة تجارية مع ركن التوفير."
                variant="pill"
              >
                فتح محادثة شراكة
              </WhatsAppCTA>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── 8. CONTACT ───────── */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-[1fr_auto] md:items-center md:px-8">
          <div>
            <div className="hq-eyebrow">تواصل معنا</div>
            <h2 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-4xl">
              قناة تجارية موحّدة وردّ سريع
            </h2>
            <div className="mt-5 grid gap-4 text-sm text-ink-600 sm:grid-cols-3">
              <div>
                <div className="text-xs font-semibold text-foreground">واتساب الأعمال</div>
                <div className="mt-1 font-arabic text-trust-700">+967 {id.whatsapp_number}</div>
              </div>
              {id.email ? (
                <div>
                  <div className="text-xs font-semibold text-foreground">البريد الإلكتروني</div>
                  <div className="mt-1 break-words">{id.email}</div>
                </div>
              ) : null}
              {id.address_ar ? (
                <div>
                  <div className="text-xs font-semibold text-foreground">العنوان</div>
                  <div className="mt-1">{id.address_ar}</div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <WhatsAppCTA number={id.whatsapp_number}>تواصل واتساب</WhatsAppCTA>
            <LLink
              to="/$lang/contact"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-trust-700 hover:text-trust-700"
            >
              صفحة التواصل الكاملة
            </LLink>
          </div>
        </div>
      </section>

      <SiteFooter
        legalNameAr={id.legal_name_ar}
        parentGroupAr={id.parent_group_ar}
        whatsappNumber={id.whatsapp_number}
        email={id.email}
        addressAr={id.address_ar}
      />

      <StickyWhatsApp number={id.whatsapp_number} />
    </div>
  );
}
