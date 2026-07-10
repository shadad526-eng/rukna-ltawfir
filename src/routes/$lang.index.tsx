import { LLink } from "@/i18n/LLink";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  getCorporateIdentity,
  listBrands,
  listFeaturedProducts,
  listCatalogs,
  listInsights,
} from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";
import { StickyWhatsApp } from "@/components/site/StickyWhatsApp";
import { HeroLogoStage, HeroBrandStrip, HeroFeaturesStrip } from "@/components/site/HeroLogos";
import { BrandCard } from "@/components/site/BrandCard";
import { useLocale } from "@/i18n/LocaleProvider";
import { useLocalizedIdentity } from "@/i18n/identity";
import { productAlt } from "@/lib/seo-alt";
import { useRef } from "react";

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
const insightsQO = queryOptions({ queryKey: ["insights"], queryFn: () => listInsights() });

export const Route = createFileRoute("/$lang/")({
  head: ({ params }) => {
    const url = `https://ruknaltawfer.com/${params.lang}`;
    const isAr = params.lang === "ar";
    const title = isAr
      ? "ركن التوفير كوزمتك | جمال وصحة وعناية بالأطفال في اليمن"
      : "Rukn Al-Tawfir — Leading Health & Beauty Brands Distributor in Yemen";
    const desc = isAr
      ? "الوكيل الحصري في اليمن لعلامات صحية عالمية: مستحضرات تجميل، عناية شخصية، منتجات صحية، وعناية بالأطفال من علامات موثوقة."
      : "Exclusive agent in Yemen for global health brands: NO CAL, Steviola, Monivo, Baby Tawfir, Bambo, Y-Kelin, iSiS, SEKEM.";
    const ogTitle = isAr ? "ركن التوفير كوزمتك للتجارة" : "Rukn Al-Tawfir Cosmetic for Trade";
    const ogDesc = isAr
      ? "منظومة علامات صحية عالمية برعاية ركن التوفير في اليمن."
      : "A system of global health brands managed by Rukn Al-Tawfir in Yemen.";
    const keywords = isAr
      ? "ركن التوفير, ركن التوفير كوزمتك, مستحضرات التجميل اليمن, العناية الشخصية اليمن, منتجات صحية اليمن, منتجات الأطفال اليمن, ايزيس, سيكم, ستيفيولا, نو كال, مونيفو, بيبي توفير, بامبو, واي كيلين, صنعاء, اليمن"
      : "Rukn Al-Tawfir, cosmetics Yemen, personal care Yemen, health products Yemen, baby care Yemen, iSiS, SEKEM, Steviola, NO CAL, Monivo, Baby Tawfir, Bambo, Y-Kelin";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: keywords },
        { property: "og:title", content: ogTitle },
        { property: "og:description", content: ogDesc },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: isAr ? "ar_YE" : "en_US" },
        { property: "og:locale:alternate", content: isAr ? "en_US" : "ar_YE" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: ogTitle },
        { name: "twitter:description", content: ogDesc },
      ],
      links: [
        { rel: "canonical", href: url },
        { rel: "alternate", hrefLang: "ar", href: "https://ruknaltawfer.com/ar" },
        { rel: "alternate", hrefLang: "en", href: "https://ruknaltawfer.com/en" },
        { rel: "alternate", hrefLang: "x-default", href: "https://ruknaltawfer.com/ar" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                "@id": `${url}#webpage`,
                url,
                name: title,
                description: desc,
                inLanguage: isAr ? "ar" : "en",
                isPartOf: { "@id": "https://ruknaltawfer.com/#website" },
                about: { "@id": "https://ruknaltawfer.com/#organization" },
              },
              {
                "@type": "FAQPage",
                mainEntity: isAr
                  ? [
                      {
                        "@type": "Question",
                        name: "ما هي ركن التوفير كوزمتك للتجارة؟",
                        acceptedAnswer: { "@type": "Answer", text: "ركن التوفير كوزمتك للتجارة هي الوكيل الحصري في الجمهورية اليمنية لمنظومة من العلامات التجارية الصحية والاستهلاكية العالمية: iSiS وSEKEM وSteviola وNO CAL وMonivo وBaby Tawfir وBambo وY-Kelin." },
                      },
                      {
                        "@type": "Question",
                        name: "ما هي العلامات التجارية التي تمثلها ركن التوفير في اليمن؟",
                        acceptedAnswer: { "@type": "Answer", text: "iSiS (منتجات عشبية وأغذية صحية)، SEKEM (أعشاب وشاي بيوديناميكي)، Steviola (محليات ستيفيا الطبيعية)، NO CAL (بدائل سكر خالية من السعرات لمرضى السكري)، Monivo (مكملات غذائية وفيتامينات)، Baby Tawfir (منتجات العناية بالأطفال)، Bambo (حفاضات إيكولوجية)، Y-Kelin (العناية بالفم والأسنان)." },
                      },
                      {
                        "@type": "Question",
                        name: "كيف يمكنني طلب منتج أو الاستفسار عن الأسعار؟",
                        acceptedAnswer: { "@type": "Answer", text: "يتم الطلب والاستفسار حصراً عبر واتساب الأعمال الرسمي لركن التوفير على الرقم +967 774040383، حيث يقوم فريق المبيعات بالرد على جميع الاستفسارات التجارية وطلبات التوزيع." },
                      },
                      {
                        "@type": "Question",
                        name: "هل توفر ركن التوفير منتجات لمرضى السكري؟",
                        acceptedAnswer: { "@type": "Answer", text: "نعم، نوفر علامتي NO CAL وSteviola المتخصصتين في بدائل السكر الطبيعية الخالية من السعرات الحرارية والآمنة لمرضى السكري والباحثين عن نمط حياة صحي." },
                      },
                      {
                        "@type": "Question",
                        name: "هل أنتم وكلاء حصريون أم موزعون عاديون؟",
                        acceptedAnswer: { "@type": "Answer", text: "ركن التوفير هي الوكيل الحصري والرسمي لجميع العلامات المذكورة في الجمهورية اليمنية، مع شبكة توزيع تغطي المحافظات الرئيسية." },
                      },
                    ]
                  : [
                      {
                        "@type": "Question",
                        name: "What is Rukn Al-Tawfir Cosmetic for Trade?",
                        acceptedAnswer: { "@type": "Answer", text: "Rukn Al-Tawfir Cosmetic for Trade is the exclusive agent in the Republic of Yemen for a portfolio of international health and consumer brands: iSiS, SEKEM, Steviola, NO CAL, Monivo, Baby Tawfir, Bambo, and Y-Kelin." },
                      },
                      {
                        "@type": "Question",
                        name: "Which brands does Rukn Al-Tawfir represent in Yemen?",
                        acceptedAnswer: { "@type": "Answer", text: "iSiS (herbal & healthy foods), SEKEM (biodynamic herbs & teas), Steviola (natural stevia sweeteners), NO CAL (zero-calorie sugar substitutes for diabetics), Monivo (vitamins & supplements), Baby Tawfir (baby care), Bambo (eco diapers), Y-Kelin (oral & dental care)." },
                      },
                      {
                        "@type": "Question",
                        name: "How can I order or inquire about pricing?",
                        acceptedAnswer: { "@type": "Answer", text: "All orders and commercial inquiries are handled via the official WhatsApp Business line at +967 774040383, where the sales team responds to all business and distribution requests." },
                      },
                      {
                        "@type": "Question",
                        name: "Do you offer products for diabetics?",
                        acceptedAnswer: { "@type": "Answer", text: "Yes — NO CAL and Steviola are specialized in natural, zero-calorie sugar substitutes that are safe for diabetics and anyone pursuing a healthier lifestyle." },
                      },
                      {
                        "@type": "Question",
                        name: "Are you exclusive agents or regular distributors?",
                        acceptedAnswer: { "@type": "Answer", text: "Rukn Al-Tawfir is the exclusive official agent for all listed brands across the Republic of Yemen, with a distribution network covering all major governorates." },
                      },
                    ],
              },
            ],
          }),
        },
      ],
    };
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(brandsQO),
      context.queryClient.ensureQueryData(featuredQO),
      context.queryClient.ensureQueryData(catalogsQO),
      context.queryClient.ensureQueryData(insightsQO),
    ]);
  },
  component: Home,
});

function Home() {
  const { lang, t } = useLocale();
  const isAr = lang === "ar";
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: brands } = useSuspenseQuery(brandsQO);
  const { data: featured } = useSuspenseQuery(featuredQO);
  const { data: catalogs } = useSuspenseQuery(catalogsQO);
  const ident = useLocalizedIdentity(id);

  const WHY_CARDS = [
    { i: "◆", t: t("home.why.exclusive"), d: t("home.why.exclusiveDesc") },
    { i: "✦", t: t("home.why.authentic"), d: t("home.why.authenticDesc") },
    { i: "✺", t: t("home.why.global"), d: t("home.why.globalDesc") },
    { i: "✪", t: t("home.why.national"), d: t("home.why.nationalDesc") },
    { i: "❖", t: t("home.why.partnerships"), d: t("home.why.partnershipsDesc") },
    { i: "✧", t: t("home.why.support"), d: t("home.why.supportDesc") },
  ];

  const NEWS_CARDS = NEWS.map((n) => ({
    slug: n.slug,
    cover: n.cover,
    eyebrow: n.eyebrow[isAr ? "ar" : "en"],
    title: n.title[isAr ? "ar" : "en"],
    body: n.excerpt[isAr ? "ar" : "en"],
  }));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        legalName={ident.legalName}
        parentGroup={ident.parentGroup}
        whatsappNumber={id.whatsapp_number}
        logoUrl={id.logo_url}
      />

      <section
        className="relative overflow-hidden"
        style={{
          background:
            "radial-gradient(120% 80% at 100% 0%, oklch(0.86 0.07 245) 0%, transparent 55%), radial-gradient(90% 70% at 0% 100%, oklch(0.96 0.025 138) 0%, transparent 55%), linear-gradient(180deg, #F6FAFE 0%, #EAF2FB 55%, #DCE8F5 100%)",
        }}
      >
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
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

        <span className="leaf-drift absolute right-[6%] top-[14%] text-4xl text-leaf-500/80 md:text-5xl" aria-hidden>🍃</span>
        <span className="leaf-drift absolute left-[6%] top-[55%] text-3xl text-leaf-500/70 md:text-4xl" style={{ animationDelay: "1.8s" }} aria-hidden>🍃</span>
        <span className="leaf-drift absolute left-[14%] bottom-[28%] text-2xl text-leaf-500/60 md:text-3xl" style={{ animationDelay: "3.2s" }} aria-hidden>🍃</span>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pt-14 pb-32 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-14 md:px-8 md:pt-24 md:pb-48">
          <div className="prem-fade-up order-2 md:order-1">
            <div
              className="inline-flex items-center gap-2 rounded-full border border-trust-300/60 px-5 py-2 text-[11px] font-semibold tracking-wider text-trust-700 md:text-xs"
              style={{
                background: "linear-gradient(180deg, oklch(1 0 0 / 0.92), oklch(0.97 0.018 245 / 0.78))",
                boxShadow: "0 10px 24px -10px oklch(0.32 0.13 245 / 0.28), inset 0 1px 0 oklch(1 0 0 / 0.95)",
              }}
            >
              <span className="size-1.5 rounded-full bg-leaf-500 shadow-[0_0_0_4px_oklch(0.68_0.17_138/0.18)]" />
              {t("home.heroBadge")}
            </div>

            <h1
              className="mt-7 font-black tracking-tight"
              style={{ fontFamily: 'var(--font-brand)', fontWeight: 900 }}
            >
              <span className="sr-only">
                {isAr
                  ? "ركن التوفير كوزمتك للتجارة — الموزّع الرائد لعلامات الصحة والجمال والعناية بالأطفال في اليمن"
                  : "Rukn Al-Tawfir Cosmetic for Trade — Leading Health, Beauty & Baby-Care Brands Distributor in Yemen"}
              </span>
              <span
                aria-hidden
                className="block text-[2.2rem] md:text-[3.4rem] lg:text-[4.1rem]"
                style={{
                  lineHeight: 1.45,
                  paddingBlock: "0.15em",
                  background: "linear-gradient(180deg, oklch(0.32 0.13 245) 0%, oklch(0.42 0.15 245) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {t("home.heroTitleLine1")}
              </span>
              <span
                aria-hidden
                className="mt-3 block text-[2.1rem] md:text-[3.2rem] lg:text-[3.9rem]"
                style={{
                  lineHeight: 1.45,
                  paddingBlock: "0.15em",
                  background: "linear-gradient(180deg, oklch(0.62 0.17 138) 0%, oklch(0.50 0.16 138) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {t("home.heroTitleLine2")}
              </span>
            </h1>

            <div className="mt-6 flex items-center gap-3">
              <span className="h-px w-14 bg-gradient-to-l from-transparent to-trust-700/60" />
              <span className="size-1.5 rounded-full bg-leaf-500" />
              <span className="h-px w-24 bg-gradient-to-r from-transparent via-trust-700/40 to-transparent" />
            </div>

            <p className="mt-6 max-w-xl text-base leading-loose text-ink-600 md:text-lg">
              {t("home.heroSubtitle")}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <LLink
                to="/$lang/brands"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-8 py-4 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 md:text-[15px]"
                style={{
                  background: "linear-gradient(180deg, oklch(0.56 0.16 245), oklch(0.38 0.15 245))",
                  boxShadow:
                    "0 22px 44px -16px oklch(0.32 0.13 245 / 0.65), 0 6px 14px -6px oklch(0.32 0.13 245 / 0.35), inset 0 1px 0 oklch(1 0 0 / 0.30), inset 0 -1px 0 oklch(0 0 0 / 0.12)",
                }}
              >
                <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-60"
                  style={{ background: "linear-gradient(180deg, oklch(1 0 0 / 0.20), transparent)" }}
                />
                <span aria-hidden className="relative transition-transform group-hover:-translate-x-0.5">{isAr ? "←" : "→"}</span>
                <span className="relative">{t("home.heroCtaExplore")}</span>
              </LLink>
              <WhatsAppCTA number={id.whatsapp_number}>{t("home.heroCtaContact")}</WhatsAppCTA>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <HeroLogoStage />
          </div>
        </div>
      </section>

      <div className="relative z-30 mx-auto -mt-16 max-w-6xl px-4 md:-mt-24 md:px-8">
        <HeroBrandStrip />
      </div>

      <section className="relative z-10 bg-card pt-14 md:pt-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <HeroFeaturesStrip />
        </div>
      </section>

      <section className="bg-card pt-16 md:pt-20">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="hq-eyebrow">{t("home.whyEyebrow")}</div>
            <h2 className="mt-3 font-arabic text-3xl font-bold leading-tight text-foreground md:text-5xl">
              {t("home.whyTitle")}
            </h2>
            <p className="mt-5 text-base leading-loose text-ink-600">{t("home.whySubtitle")}</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CARDS.map((c) => (
              <article key={c.t} className="prem-card relative p-6 md:p-7">
                <div className="grid size-12 place-items-center rounded-2xl bg-trust-50 text-2xl text-trust-700">{c.i}</div>
                <h3 className="mt-5 font-arabic text-lg font-bold text-foreground">{c.t}</h3>
                <p className="mt-3 text-[14px] leading-loose text-ink-600">{c.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="ecosystem" className="relative border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <div className="mb-12 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="hq-eyebrow">{t("home.ecosystemEyebrow")}</div>
              <h2 className="mt-3 font-arabic text-3xl font-bold leading-tight text-foreground md:text-5xl">
                {t("home.ecosystemTitle")}
              </h2>
              <p className="mt-4 text-base leading-loose text-ink-600">{t("home.ecosystemDesc")}</p>
            </div>
            <LLink
              to="/$lang/brands"
              className="inline-flex items-center gap-1.5 rounded-full border border-trust-700/20 bg-secondary px-4 py-2 text-sm font-semibold text-trust-700 transition-colors hover:bg-trust-700 hover:text-sand-50"
            >
              {t("home.ecosystemFullGuide")}
            </LLink>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {brands.map((b, idx) => (
              <BrandCard key={b.id} brand={b} index={idx} ctaLabel={t("cta.enterBrandPortal")} />
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
            <div className="mb-10 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="hq-eyebrow">{t("home.featuredEyebrow")}</div>
                <h2 className="mt-3 font-arabic text-3xl font-bold leading-tight text-foreground md:text-4xl">
                  {t("home.featuredTitle")}
                </h2>
              </div>
              <LLink to="/$lang/brands" className="text-sm font-semibold text-trust-700 hover:underline">
                {t("home.featuredAll")}
              </LLink>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {featured.map((p) => {
                const pname = isAr ? p.name_ar : p.name_en;
                return (
                  <LLink
                    key={p.id}
                    to="/$lang/brands/$slug/$productSlug"
                    params={{ slug: p.brand_slug, productSlug: p.slug }}
                    className="prem-card group flex flex-col"
                  >
                    <div className="podium relative grid aspect-square place-items-center p-5">
                      {p.cover_url ? (
                        <img src={p.cover_url} alt={productAlt(p.brand_slug, p.brand_slug, pname, isAr ? "ar" : "en")} className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <span className="text-[11px] text-muted-foreground">{t("common.officialImage")}</span>
                      )}
                    </div>
                    <div className="flex-1 p-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-600">{p.brand_slug}</div>
                      <div className="mt-1 font-arabic text-[13px] font-bold leading-tight text-foreground line-clamp-2">
                        {pname}
                      </div>
                    </div>
                  </LLink>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
          <div className="mb-10 flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="hq-eyebrow">{t("home.knowledgeEyebrow")}</div>
              <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
                {t("home.knowledgeTitle")}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {NEWS_CARDS.map((k) => (
              <LLink
                key={k.slug}
                to="/$lang/news/$slug"
                params={{ slug: k.slug }}
                className="prem-card group flex h-full flex-col overflow-hidden transition-transform hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden rounded-b-[2rem] bg-muted">
                  <img
                    src={k.cover}
                    alt={k.title}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-6 top-6 flex justify-start">
                    <div className="rounded-full glass-dark px-3 py-1 text-[10px] font-bold tracking-[0.22em] text-sand-50">
                      {k.eyebrow}
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-arabic text-lg font-bold leading-snug text-foreground">{k.title}</h3>
                  <p className="mt-3 text-sm leading-loose text-ink-600">{k.body}</p>
                  <div className="mt-auto pt-6 text-xs font-bold text-trust-700 transition-transform group-hover:-translate-x-1">
                    {t("home.knowledgeReadMore")}
                  </div>
                </div>
              </LLink>
            ))}
          </div>

        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="premium-panel overflow-hidden p-8 md:p-10">
            <div className="absolute -right-16 -top-16 size-56 rounded-full bg-trust-700/10 blur-3xl" aria-hidden />
            <div className="hq-eyebrow">{t("home.catalogsEyebrow")}</div>
            <h3 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
              {t("home.catalogsTitle")}
            </h3>
            <p className="mt-3 max-w-md text-sm leading-loose text-ink-600">
              {catalogs.length > 0
                ? t("home.catalogsDescWithCount", { count: catalogs.length })
                : t("home.catalogsDescEmpty")}
            </p>
            <LLink
              to="/$lang/catalogs"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-trust-700 px-5 py-2.5 text-sm font-semibold text-sand-50 transition-transform hover:-translate-y-0.5"
            >
              {t("home.catalogsEnter")} <span aria-hidden>{isAr ? "←" : "→"}</span>
            </LLink>
          </div>
          <div className="premium-panel overflow-hidden p-8 md:p-10">
            <div className="absolute -left-16 -top-16 size-56 rounded-full bg-leaf-500/15 blur-3xl" aria-hidden />
            <div className="hq-eyebrow" style={{ color: "var(--leaf-700)" }}>{t("home.partnersEyebrow")}</div>
            <h3 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
              {t("home.partnersTitle")}
            </h3>
            <p className="mt-3 max-w-md text-sm leading-loose text-ink-600">{t("home.partnersDesc")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <LLink
                to="/$lang/partners"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-trust-700 hover:text-trust-700"
              >
                {t("home.partnersPage")}
              </LLink>
              <WhatsAppCTA number={id.whatsapp_number} message={t("home.partnersWaMsg")} variant="pill">
                {t("home.partnersOpenChat")}
              </WhatsAppCTA>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-[1fr_auto] md:items-center md:px-8">
          <div>
            <div className="hq-eyebrow">{t("home.contactEyebrow")}</div>
            <h2 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-4xl">
              {t("home.contactTitle")}
            </h2>
            <div className="mt-5 grid gap-4 text-sm text-ink-600 sm:grid-cols-3">
              <div>
                <div className="text-xs font-semibold text-foreground">{t("home.contactWaLabel")}</div>
                <div className="mt-1 font-arabic text-trust-700">+967 {id.whatsapp_number}</div>
              </div>
              {id.email ? (
                <div>
                  <div className="text-xs font-semibold text-foreground">{t("home.contactEmailLabel")}</div>
                  <div className="mt-1 break-words">{id.email}</div>
                </div>
              ) : null}
              {ident.address ? (
                <div>
                  <div className="text-xs font-semibold text-foreground">{t("home.contactAddressLabel")}</div>
                  <div className="mt-1">{ident.address}</div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <WhatsAppCTA number={id.whatsapp_number}>{t("home.contactWaCta")}</WhatsAppCTA>
            <LLink
              to="/$lang/contact"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-trust-700 hover:text-trust-700"
            >
              {t("home.contactFullPage")}
            </LLink>
          </div>
        </div>
      </section>

      <SiteFooter
        legalName={ident.legalName}
        parentGroup={ident.parentGroup}
        whatsappNumber={id.whatsapp_number}
        email={id.email}
        address={ident.address}
      />

      <StickyWhatsApp number={id.whatsapp_number} />
    </div>
  );
}
