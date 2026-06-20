import { LLink } from "@/i18n/LLink";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  getCorporateIdentity,
  getBrandBySlug,
  listBrandProducts,
  listBrands,
  listCatalogs,
  type BrandDetail,
  type ProductSummary,
} from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";
import { BrandCard } from "@/components/site/BrandCard";
import { SekemExtraProducts } from "@/components/site/SekemExtraProducts";
import { IsisExtraProducts } from "@/components/site/IsisExtraProducts";
import { SteviolaExtraProducts } from "@/components/site/SteviolaExtraProducts";
import { NocalExtraProducts } from "@/components/site/NocalExtraProducts";
import { useLocale } from "@/i18n/LocaleProvider";
import { useLocalizedIdentity } from "@/i18n/identity";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const brandQO = (slug: string) =>
  queryOptions({ queryKey: ["brand", slug], queryFn: () => getBrandBySlug({ data: { slug } }) });
const productsQO = (brandSlug: string) =>
  queryOptions({ queryKey: ["brand-products", brandSlug], queryFn: () => listBrandProducts({ data: { brandSlug } }) });
const brandsQO = queryOptions({ queryKey: ["brands"], queryFn: () => listBrands() });
const catalogsQO = queryOptions({ queryKey: ["catalogs"], queryFn: () => listCatalogs() });

const BRAND_TOPICS: Record<string, string[]> = {
  nocal: ["بدائل السكر", "محليات خالية من السعرات", "منتجات مرضى السكري", "Sugar alternatives", "Zero-calorie sweetener", "Diabetic-friendly"],
  steviola: ["ستيفيا", "المحليات الطبيعية", "بدائل السكر", "منتجات مرضى السكري", "Natural stevia sweetener", "Sugar alternatives"],
  monivo: ["فيتامين C", "دعم المناعة", "مكملات غذائية", "الحياة الصحية", "Vitamin C", "Immunity support", "Dietary supplements"],
  "y-kelin": ["العناية بالفم والأسنان", "العناية بأطقم الأسنان", "صحة الأسنان", "Oral care", "Dental care", "Denture care"],
  "baby-tawfir": ["منتجات الأطفال", "العناية بالطفل", "Baby care", "Infant care"],
  bambo: ["حفاضات إيكولوجية", "منتجات الأطفال", "العناية بالطفل", "Eco diapers", "Baby care"],
  sekem: ["أعشاب وأغذية صحية", "التغذية الصحية", "الحياة الصحية", "Biodynamic herbs", "Healthy lifestyle"],
  isis: ["أعشاب وأغذية صحية", "التغذية الصحية", "الحياة الصحية", "Herbal foods", "Healthy teas", "Healthy lifestyle"],
};

const RELATED_BRANDS: Record<string, string[]> = {
  nocal: ["steviola", "monivo", "sekem"],
  steviola: ["nocal", "isis", "sekem"],
  monivo: ["isis", "sekem", "steviola"],
  "y-kelin": ["bambo", "baby-tawfir", "monivo"],
  "baby-tawfir": ["bambo", "y-kelin", "monivo"],
  bambo: ["baby-tawfir", "y-kelin", "sekem"],
  sekem: ["isis", "steviola", "monivo"],
  isis: ["sekem", "steviola", "monivo"],
};

type BrandFAQ = { q: string; a: string };
const BRAND_FAQS: Record<string, { ar: BrandFAQ[]; en: BrandFAQ[] }> = {
  nocal: {
    ar: [
      { q: "ما هو NO CAL وما الذي يميّزه؟", a: "NO CAL محلٍّ منخفض السعرات الحرارية يُستخدم كبديل آمن للسكر التقليدي، متوفر بصيغ عملية للاستخدام اليومي وأحجام عائلية مناسبة للخبز والطهي، وخالٍ من الأسبارتام في الحجم العائلي." },
      { q: "هل NO CAL آمن لمرضى السكري؟", a: "نعم، يُعتبر NO CAL خياراً مناسباً لمرضى السكري ومن يتبعون أنظمة غذائية منخفضة الكربوهيدرات لأنه لا يرفع مستوى السكر في الدم بشكل ملحوظ." },
      { q: "أين أجد NO CAL في اليمن؟", a: "ركن التوفير كوزمتك للتجارة هي الوكيل الحصري لـ NO CAL في الجمهورية اليمنية. للطلب والاستفسار: واتساب الأعمال +967 774040383." },
    ],
    en: [
      { q: "What is NO CAL and what makes it different?", a: "NO CAL is a low-calorie sweetener used as a safe alternative to regular sugar. It comes in everyday formats and family-size packs suitable for baking and cooking, and is aspartame-free in the family size." },
      { q: "Is NO CAL safe for diabetics?", a: "Yes. NO CAL is considered a suitable choice for diabetics and low-carb diets because it does not meaningfully raise blood sugar." },
      { q: "Where can I find NO CAL in Yemen?", a: "Rukn Al-Tawfir Cosmetic for Trade is the exclusive agent for NO CAL in the Republic of Yemen. Orders and inquiries via WhatsApp Business: +967 774040383." },
    ],
  },
  steviola: {
    ar: [
      { q: "ما هي Steviola وممَّ تُصنع؟", a: "Steviola محلٍّ طبيعي بنسبة 100% مستخلص من أوراق نبتة ستيفيا (Stevia rebaudiana)، خالٍ من السعرات الحرارية، وعملي بصيغ نقط وأقراص وأكياس وأحجام عائلية." },
      { q: "هل Steviola مناسبة لمرضى السكري؟", a: "نعم، ستيفيا لا ترفع مستوى السكر في الدم بشكل ملحوظ، وهي ضمن الخيارات الموصى بها لمرضى السكري وحميات الكيتو ومنخفضي الكربوهيدرات." },
      { q: "هل يمكن استخدام Steviola في الخبز؟", a: "نعم، الأحجام العائلية من Steviola مصممة للخبز والطهي وتحافظ على ثباتها في درجات الحرارة العالية." },
    ],
    en: [
      { q: "What is Steviola and what is it made from?", a: "Steviola is a 100% natural sweetener extracted from the leaves of the Stevia rebaudiana plant. It is calorie-free and available as drops, tablets, sachets and family-size packs." },
      { q: "Is Steviola suitable for diabetics?", a: "Yes. Stevia does not meaningfully raise blood sugar and is among the recommended options for diabetics, keto and low-carb diets." },
      { q: "Can Steviola be used for baking?", a: "Yes. The Steviola family-size packs are designed for baking and cooking and stay heat-stable at high temperatures." },
    ],
  },
  monivo: {
    ar: [
      { q: "ما هي منتجات Monivo؟", a: "Monivo علامة متخصصة في المكملات الغذائية والفيتامينات، أبرزها أقراص استحلاب فيتامين C بنكهات متعددة (برتقال، ليمون ومنثول، نعناع وأوكاليبتوس، فراولة، عسل وبروبوليس) بتركيبة خالية من السكر." },
      { q: "ما الجرعة اليومية الموصى بها من فيتامين C؟", a: "تتراوح الجرعة اليومية للبالغين عادةً بين 75 و90 ملغ، مع حدّ أعلى يبلغ 2000 ملغ من جميع المصادر. يُنصح باتباع تعليمات الملصق ومراجعة الطبيب عند وجود حالات مزمنة." },
      { q: "هل Monivo خالٍ من السكر؟", a: "نعم، أقراص استحلاب Monivo مصمَّمة بتركيبة خالية من السكر، ما يجعلها خياراً مناسباً للاستخدام اليومي." },
    ],
    en: [
      { q: "What are Monivo products?", a: "Monivo is a brand specialized in dietary supplements and vitamins, most notably vitamin C lozenges in several flavors (orange, lemon & menthol, mint & eucalyptus, strawberry, honey & propolis) in a sugar-free formula." },
      { q: "What is the recommended daily vitamin C intake?", a: "Typical adult intake ranges 75–90 mg per day, with an upper limit of 2,000 mg from all sources. Follow the label and consult a physician for chronic conditions." },
      { q: "Is Monivo sugar-free?", a: "Yes, Monivo lozenges are formulated sugar-free, making them suitable for daily use." },
    ],
  },
  "y-kelin": {
    ar: [
      { q: "ما الذي تقدمه Y-Kelin للعناية بالفم؟", a: "Y-Kelin علامة متخصصة في العناية بالفم والأسنان وأطقم الأسنان، من بينها فرشاة Sonic Electric Toothbrush بتقنية صوتية متقدمة، عمر بطارية طويل، ومقاومة كاملة للماء IPX7." },
      { q: "هل لدى Y-Kelin منتجات للعناية بأطقم الأسنان؟", a: "نعم، تقدّم Y-Kelin حلولاً متخصصة في تنظيف أطقم الأسنان والعناية بها للحفاظ على نظافة وراحة المستخدم." },
      { q: "كم مرة يجب تبديل رأس الفرشاة؟", a: "يُوصى بتبديل رأس الفرشاة كل 3 أشهر، مع تجنّب الضغط الزائد أثناء التنظيف وزيارة طبيب الأسنان دوريًا." },
    ],
    en: [
      { q: "What does Y-Kelin offer for oral care?", a: "Y-Kelin is specialized in oral, dental and denture care, including the Sonic Electric Toothbrush with advanced sonic technology, long battery life, and IPX7 full waterproofing." },
      { q: "Does Y-Kelin offer denture care products?", a: "Yes — Y-Kelin offers dedicated solutions for cleaning and caring for dentures to keep them hygienic and comfortable." },
      { q: "How often should I replace the brush head?", a: "Replace the brush head every 3 months, avoid pressing too hard while brushing, and schedule regular dental check-ups." },
    ],
  },
  "baby-tawfir": {
    ar: [
      { q: "ما هي Baby Tawfir؟", a: "Baby Tawfir علامة متخصصة في منتجات العناية بالأطفال والرضع، مصمَّمة لتوفير الراحة والأمان للأهل والطفل." },
      { q: "هل منتجات Baby Tawfir آمنة لبشرة الأطفال؟", a: "نعم، مُصمَّمة وفق معايير دقيقة لمناسبة بشرة الرضع والأطفال الحساسة." },
    ],
    en: [
      { q: "What is Baby Tawfir?", a: "Baby Tawfir is a brand specialized in baby and infant care products, designed to provide comfort and safety for parents and children." },
      { q: "Are Baby Tawfir products safe for babies' skin?", a: "Yes — designed to suit sensitive infant and toddler skin." },
    ],
  },
  bambo: {
    ar: [
      { q: "ما الذي يميّز حفاضات Bambo؟", a: "حفاضات Bambo إيكولوجية مختبَرة طبياً، مصمَّمة لتوفير امتصاص عالٍ ولطف على بشرة الطفل، مع التزام بمعايير الاستدامة." },
      { q: "هل Bambo مناسبة للبشرة الحساسة؟", a: "نعم، Bambo معتمدة دلائلياً للبشرة الحساسة وخالية من العديد من المواد المثيرة للحساسية." },
    ],
    en: [
      { q: "What makes Bambo diapers different?", a: "Bambo are eco-friendly, dermatologically tested diapers designed for high absorption and gentleness on baby skin, with a commitment to sustainability." },
      { q: "Are Bambo suitable for sensitive skin?", a: "Yes — Bambo are dermatologically approved for sensitive skin and free of many common allergens." },
    ],
  },
  sekem: {
    ar: [
      { q: "ما هي SEKEM؟", a: "SEKEM علامة مصرية مشهورة بالزراعة البيوديناميكية، تقدّم أعشاباً وشاياً ومنتجات صحية طبيعية." },
      { q: "ما الذي يميّز شاي SEKEM؟", a: "يتميّز شاي SEKEM بكونه عضوياً بيوديناميكياً ومستخلصاً من نباتات منتقاة بعناية." },
    ],
    en: [
      { q: "What is SEKEM?", a: "SEKEM is an Egyptian brand renowned for biodynamic agriculture, offering herbs, teas and natural wellness products." },
      { q: "What makes SEKEM teas distinctive?", a: "SEKEM teas are biodynamic organic and crafted from carefully selected plants." },
    ],
  },
  isis: {
    ar: [
      { q: "ما هي iSiS؟", a: "iSiS علامة متخصصة في الأغذية العشبية والشاي الصحي والمنتجات الطبيعية، تشمل تشكيلة واسعة من الأعشاب وزيت الزيتون والتمور والمنتجات الصحية." },
      { q: "هل منتجات iSiS طبيعية؟", a: "نعم، تركّز iSiS على المصادر النباتية والطبيعية ضمن تركيبات مناسبة للحياة الصحية اليومية." },
    ],
    en: [
      { q: "What is iSiS?", a: "iSiS is a brand specialized in herbal foods, healthy teas and natural products, including a wide range of herbs, olive oil, dates and wellness items." },
      { q: "Are iSiS products natural?", a: "Yes — iSiS focuses on plant-based and natural sources in formulas suitable for a daily healthy lifestyle." },
    ],
  },
};

const TOPIC_HUBS: Record<string, { href: string; ar: string; en: string }> = {
  nocal: { href: "/sugar-alternatives", ar: "افتح دليل بدائل السكر", en: "Open the sugar alternatives hub" },
  steviola: { href: "/sugar-alternatives", ar: "افتح دليل بدائل السكر", en: "Open the sugar alternatives hub" },
};

export const Route = createFileRoute("/$lang/brands/$slug/")({
  loader: async ({ context, params }) => {
    const brand = await context.queryClient.ensureQueryData(brandQO(params.slug));
    if (!brand) throw notFound();
    const [, products] = await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(productsQO(params.slug)),
      context.queryClient.ensureQueryData(brandsQO),
      context.queryClient.ensureQueryData(catalogsQO),
    ]);
    return { brand, products };
  },
  head: ({ params, loaderData }) => {
    const url = `https://ruknaltawfer.com/${params.lang}/brands/${params.slug}`;
    const isAr = params.lang === "ar";
    const ld = loaderData as { brand?: BrandDetail; products?: ProductSummary[] } | undefined;
    const brand = ld?.brand;
    const products: ProductSummary[] = ld?.products ?? [];
    const nameAr = brand?.name_ar ?? params.slug;
    const nameEn = brand?.name_en ?? params.slug;
    const displayName = isAr ? nameAr : nameEn;
    const tagline = brand?.tagline_ar ?? "";
    const title = isAr
      ? `${nameAr} (${nameEn}) — العلامات التجارية | ركن التوفير كوزمتك`
      : `${nameEn} (${nameAr}) — Brands | Rukn Al-Tawfir Cosmetic for Trade`;
    const desc = isAr
      ? `${nameAr} — العلامة التجارية الرسمية ضمن منظومة ركن التوفير كوزمتك للتجارة في اليمن. ${tagline} تصفّح منتجات ${nameAr} والكتالوج الرسمي واطلب عبر واتساب.`
      : `${nameEn} — official brand within the Rukn Al-Tawfir Cosmetic for Trade ecosystem in Yemen. Browse ${nameEn} products, the official catalog, and inquire via WhatsApp.`;
    const ogImage = brand?.logo_url ?? "https://ruknaltawfer.com/rukn-logo.webp";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: `${nameAr}, ${nameEn}, ركن التوفير, ${nameAr} اليمن, ${nameEn} Yemen` },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:image", content: ogImage },
        { property: "og:locale", content: isAr ? "ar_YE" : "en_US" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: ogImage },
      ],
      links: [
        { rel: "canonical", href: url },
        { rel: "alternate", hrefLang: "ar", href: `https://ruknaltawfer.com/ar/brands/${params.slug}` },
        { rel: "alternate", hrefLang: "en", href: `https://ruknaltawfer.com/en/brands/${params.slug}` },
        { rel: "alternate", hrefLang: "x-default", href: `https://ruknaltawfer.com/ar/brands/${params.slug}` },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Brand",
                "@id": `${url}#brand`,
                name: nameEn,
                alternateName: nameAr,
                url,
                logo: brand?.logo_url ?? undefined,
                description: brand?.description_ar ?? tagline ?? desc,
                slogan: tagline || undefined,
                knowsAbout: BRAND_TOPICS[params.slug] ?? [],
                isRelatedTo: (RELATED_BRANDS[params.slug] ?? []).map((s: string) => ({
                  "@type": "Brand",
                  "@id": `https://ruknaltawfer.com/${params.lang}/brands/${s}#brand`,
                  name: s,
                  url: `https://ruknaltawfer.com/${params.lang}/brands/${s}`,
                })),
                parentOrganization: { "@id": "https://ruknaltawfer.com/#organization" },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: isAr ? "الرئيسية" : "Home", item: `https://ruknaltawfer.com/${params.lang}` },
                  { "@type": "ListItem", position: 2, name: isAr ? "العلامات التجارية" : "Brands", item: `https://ruknaltawfer.com/${params.lang}/brands` },
                  { "@type": "ListItem", position: 3, name: displayName, item: url },
                ],
              },
              {
                "@type": "CollectionPage",
                "@id": `${url}#collection`,
                url,
                name: title,
                description: desc,
                inLanguage: isAr ? "ar" : "en",
                isPartOf: { "@id": "https://ruknaltawfer.com/#website" },
                about: { "@id": `${url}#brand` },
                mainEntity: {
                  "@type": "ItemList",
                  numberOfItems: products.length,
                  itemListElement: products.slice(0, 25).map((p, i) => ({
                    "@type": "ListItem",
                    position: i + 1,
                    url: `https://ruknaltawfer.com/${params.lang}/brands/${params.slug}/${p.slug}`,
                    name: isAr ? p.name_ar : p.name_en,
                  })),
                },
              },
              ...((BRAND_FAQS[params.slug]?.[isAr ? "ar" : "en"]?.length ?? 0) > 0
                ? [
                    {
                      "@type": "FAQPage",
                      "@id": `${url}#faq`,
                      mainEntity: BRAND_FAQS[params.slug][isAr ? "ar" : "en"].map((f: BrandFAQ) => ({
                        "@type": "Question",
                        name: f.q,
                        acceptedAnswer: { "@type": "Answer", text: f.a },
                      })),
                    },
                  ]
                : []),
            ],
          }),
        },
      ],
    };
  },
  component: BrandDetail,
  notFoundComponent: () => <BrandNotFound />,
  errorComponent: ({ error }) => <BrandError message={error.message} />,
});

function BrandNotFound() {
  const { t } = useLocale();
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">{t("errors.brandNotFound")}</h1>
      <LLink to="/$lang/brands" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
        {t("errors.backToBrands")}
      </LLink>
    </div>
  );
}

function BrandError({ message }: { message: string }) {
  const { t } = useLocale();
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">{t("errors.brandLoadFailed")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function BrandDetail() {
  const { lang, t } = useLocale();
  const isAr = lang === "ar";
  const { slug } = Route.useParams();
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: brand } = useSuspenseQuery(brandQO(slug));
  const { data: products } = useSuspenseQuery(productsQO(slug));
  const { data: allBrands } = useSuspenseQuery(brandsQO);
  const { data: catalogs } = useSuspenseQuery(catalogsQO);
  const ident = useLocalizedIdentity(id);
  if (!brand) return null;

  const accent = brand.brand_tokens.accent ?? "var(--leaf-500)";
  const brandCatalogs = catalogs.filter((c) => c.brand_slug === brand.slug);
  const related = allBrands.filter((b) => b.slug !== brand.slug).slice(0, 4);
  const gallery = products.filter((p) => p.cover_url).slice(0, 6);
  const brandName = isAr ? brand.name_ar : brand.name_en;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        legalName={ident.legalName}
        parentGroup={ident.parentGroup}
        whatsappNumber={id.whatsapp_number}
        logoUrl={id.logo_url}
      />

      <section className="relative overflow-hidden cinema-hero">
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} aria-hidden />
        <div
          className="pointer-events-none absolute -top-40 -right-40 size-[480px] rounded-full opacity-25 blur-3xl"
          style={{ background: accent }}
          aria-hidden
        />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[auto_1fr] md:items-center md:gap-14 md:px-8 md:py-24">
          <div className="relative">
            <div
              className="absolute -inset-6 -z-10 rounded-[2rem] opacity-30 blur-2xl"
              style={{ background: accent }}
              aria-hidden
            />
            <div className="podium premium-shadow grid size-44 place-items-center p-6 md:size-56 md:p-8">
              {brand.logo_url ? (
                <img src={brand.logo_url} alt={t("header.brandLogoAlt", { name: brandName })} className="max-h-full max-w-full object-contain prem-float" />
              ) : (
                <span className="text-sm font-bold text-muted-foreground">{brand.name_en}</span>
              )}
            </div>
          </div>
          <div className="prem-fade-up">
            <nav className="text-xs text-ink-600">
              <LLink to="/$lang/" className="hover:text-trust-700">{t("brand.breadcrumbHome")}</LLink>
              <span className="mx-2">/</span>
              <LLink to="/$lang/brands" className="hover:text-trust-700">{t("brand.breadcrumbBrands")}</LLink>
              <span className="mx-2">/</span>
              <span className="text-foreground">{brandName}</span>
            </nav>
            <h1 className="mt-4 font-arabic text-4xl font-bold leading-[1.05] text-foreground md:text-6xl">{brandName}</h1>
            <div className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-ink-600">{isAr ? brand.name_en : brand.name_ar}</div>
            <div className="mt-6 h-px w-24 prem-divider" />
            {brand.tagline_ar ? (
              <p className="mt-5 max-w-2xl text-base leading-loose text-ink-600 md:text-lg">{brand.tagline_ar}</p>
            ) : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <WhatsAppCTA
                number={id.whatsapp_number}
                message={t("brand.askWaMsg", { name: brandName })}
              >
                {t("brand.askAbout", { name: brandName })}
              </WhatsAppCTA>
              {brandCatalogs.length > 0 ? (
                <a
                  href="#catalogs"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-trust-700 hover:text-trust-700"
                >
                  {t("brand.officialCatalog")}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {brand.description_ar ? (
        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-16 md:px-8 md:py-20">
            <div className="hq-eyebrow">{t("brand.storyEyebrow")}</div>
            <h2 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
              {t("brand.storyTitle", { name: brandName })}
            </h2>
            <div className="mt-4 h-px w-16 prem-divider" />
            <p className="mt-6 text-[15px] leading-loose text-foreground/85 md:text-base">
              {brand.description_ar}
            </p>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="hq-eyebrow" style={{ color: accent as string }}>{t("brand.officialCollection")}</div>
            <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">{t("brand.productsOf", { name: brandName })}</h2>
          </div>
          {products.length > 0 ? (
            <span className="text-xs text-muted-foreground">{t("brand.productsPublished", { count: products.length })}</span>
          ) : null}
        </div>

        {products.length === 0 ? null : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const pname = isAr ? p.name_ar : p.name_en;
              return (
                <LLink
                  key={p.id}
                  to="/$lang/brands/$slug/$productSlug"
                  params={{ slug: brand.slug, productSlug: p.slug }}
                  className="prem-card group flex flex-col"
                >
                  <div className="podium relative grid aspect-[4/3] place-items-center p-6">
                    {p.cover_url ? (
                      <img
                        src={p.cover_url}
                        alt={pname}
                        className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">{t("common.officialPackageImage")}</span>
                    )}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 prem-shimmer opacity-0 group-hover:opacity-100" />
                  </div>
                  <div className="flex-1 p-5">
                    <div className="font-arabic text-base font-bold text-foreground">{pname}</div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-ink-600">{isAr ? p.name_en : p.name_ar}</div>
                    {p.short_description_ar ? (
                      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-600">{p.short_description_ar}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between border-t border-border bg-secondary/40 px-5 py-3 text-xs font-semibold text-trust-700">
                    <span>{t("brand.productDetails")}</span>
                    <span aria-hidden className="transition-transform group-hover:-translate-x-1">{isAr ? "←" : "→"}</span>
                  </div>
                </LLink>
              );
            })}
          </div>
        )}
      </section>

      {brand.slug === "sekem" ? <SekemExtraProducts whatsappNumber={id.whatsapp_number} accent={accent as string} /> : null}
      {brand.slug === "isis" ? <IsisExtraProducts whatsappNumber={id.whatsapp_number} accent={accent as string} /> : null}
      {brand.slug === "steviola" ? <SteviolaExtraProducts whatsappNumber={id.whatsapp_number} accent={accent as string} /> : null}
      {brand.slug === "nocal" || brand.slug === "no-cal" ? <NocalExtraProducts whatsappNumber={id.whatsapp_number} accent={accent as string} /> : null}

      {gallery.length > 0 ? (
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
            <div className="hq-eyebrow">{t("brand.officialGallery")}</div>
            <h2 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
              {t("brand.galleryTitle", { name: brandName })}
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {gallery.map((p) => {
                const pname = isAr ? p.name_ar : p.name_en;
                return (
                  <LLink
                    key={p.id}
                    to="/$lang/brands/$slug/$productSlug"
                    params={{ slug: brand.slug, productSlug: p.slug }}
                    className="podium grid aspect-square place-items-center p-4 transition-transform hover:-translate-y-1"
                    title={pname}
                  >
                    {p.cover_url ? (
                      <img src={p.cover_url} alt={pname} className="max-h-full w-auto object-contain" loading="lazy" />
                    ) : null}
                  </LLink>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {brandCatalogs.length > 0 ? (
        <section id="catalogs" className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="hq-eyebrow">{t("brand.catalogsEyebrow")}</div>
          <h2 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
            {t("brand.catalogsTitle", { name: brandName })}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brandCatalogs.map((c) => (
              <article key={c.id} className="prem-card flex items-center gap-4 p-5 md:p-6">
                <div className="grid size-16 shrink-0 place-items-center rounded-[1.35rem] border border-border/70 bg-secondary/75 text-2xl text-trust-700 shadow-[0_18px_32px_-24px_oklch(0.32_0.13_245/0.32)]">📕</div>
                <div className="min-w-0 flex-1">
                  <div className="font-arabic text-sm font-bold text-foreground md:text-base">{c.title_ar}</div>
                  {c.year ? <div className="mt-1 text-[11px] text-ink-600">{c.year}</div> : null}
                  <div className="mt-3">
                    {c.pdf_url ? (
                      <a
                        href={c.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-trust-700 hover:underline"
                      >
                        {t("brand.downloadPdf")}
                      </a>
                    ) : (
                      <LLink to="/$lang/catalogs" className="inline-flex items-center gap-1 text-xs font-bold text-trust-700 hover:underline">
                        {t("brand.requestAccess")}
                      </LLink>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
            <div className="hq-eyebrow">{t("brand.relatedEyebrow")}</div>
            <h2 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
              {t("brand.relatedTitle")}
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {related.map((b) => (
                <BrandCard key={b.id} brand={b} compact ctaLabel={t("cta.exploreBrand")} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <SiteFooter
        legalName={ident.legalName}
        parentGroup={ident.parentGroup}
        whatsappNumber={id.whatsapp_number}
        email={id.email}
        address={ident.address}
      />
    </div>
  );
}
