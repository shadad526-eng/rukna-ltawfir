import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  getBrandBySlug,
  getCorporateIdentity,
  listBrandProducts,
  listInsightsBySlugs,
} from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";
import { StickyWhatsApp } from "@/components/site/StickyWhatsApp";
import { LLink } from "@/i18n/LLink";
import { useLocale } from "@/i18n/LocaleProvider";
import { useLocalizedIdentity } from "@/i18n/identity";
import { productAlt, brandLogoAlt } from "@/lib/seo-alt";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const ykelinQO = queryOptions({ queryKey: ["brand", "y-kelin"], queryFn: () => getBrandBySlug({ data: { slug: "y-kelin" } }) });
const ykelinProductsQO = queryOptions({ queryKey: ["brand-products", "y-kelin"], queryFn: () => listBrandProducts({ data: { brandSlug: "y-kelin" } }) });
const relatedArticlesQO = queryOptions({ queryKey: ["insights-by-slugs", "daily-dental-care-routine"], queryFn: () => listInsightsBySlugs({ data: { slugs: ["daily-dental-care-routine"] } }) });

const BASE = "https://ruknaltawfer.com";

type FAQ = { q: { ar: string; en: string }; a: { ar: string; en: string } };

const FAQS: FAQ[] = [
  {
    q: { ar: "ما هي منتجات العناية بأطقم الأسنان المتوفرة في اليمن؟", en: "Which denture care products are available in Yemen?" },
    a: {
      ar: "تقدّم Y-Kelin عبر ركن التوفير كوزمتك للتجارة تشكيلة متخصصة في العناية بأطقم الأسنان تشمل لاصق أطقم الأسنان، فرش تنظيف الأطقم، وأقراص التنظيف، بأحجام عبوات متنوعة للاستخدام اليومي. [للمراجعة البشرية قبل النشر]",
      en: "Y-Kelin offers, through Rukn Al-Tawfir Cosmetic for Trade, a specialized denture care range including denture adhesive, denture brushes and cleansing tablets, in several pack sizes for everyday use. [For human review before publication]",
    },
  },
  {
    q: { ar: "كيف أستخدم لاصق أطقم الأسنان بشكل صحيح؟", en: "How is denture adhesive typically used?" },
    a: {
      ar: "بشكل عام يُوضع لاصق أطقم الأسنان على الطقم النظيف والجاف قبل تركيبه في الفم. تختلف الكمية والطريقة حسب التوصيات المطبوعة على العبوة. [للمراجعة البشرية قبل النشر]",
      en: "Generally, denture adhesive is applied to a clean and dry denture before placement. The exact amount and method follow the instructions printed on the pack. [For human review before publication]",
    },
  },
  {
    q: { ar: "ما هي مكوّنات تشكيلة Y-Kelin للعناية بالفم؟", en: "What does the Y-Kelin oral care line include?" },
    a: {
      ar: "تشمل تشكيلة Y-Kelin منتجات للعناية بأطقم الأسنان، فرش أسنان متخصصة (بما فيها فرش للتقويم)، وفرشاة Sonic Electric Toothbrush بتقنية صوتية متقدمة، عمر بطارية طويل، ومقاومة كاملة للماء IPX7. [للمراجعة البشرية قبل النشر]",
      en: "The Y-Kelin range covers denture care, specialized toothbrushes (including orthodontic brushes), and a Sonic Electric Toothbrush with advanced sonic technology, long battery life and IPX7 full waterproofing. [For human review before publication]",
    },
  },
  {
    q: { ar: "هل تتوفر فرش أسنان مخصصة لتقويم الأسنان؟", en: "Are orthodontic toothbrushes available?" },
    a: {
      ar: "نعم، تقدّم Y-Kelin فرش أسنان مصمّمة لمن يرتدون تقويم الأسنان، بشكل شعيرات يساعد الوصول حول أسلاك التقويم. [للمراجعة البشرية قبل النشر]",
      en: "Yes — Y-Kelin offers toothbrushes shaped for users wearing braces, with bristle layouts that help reach around the orthodontic wires. [For human review before publication]",
    },
  },
  {
    q: { ar: "كم مرة يُنصح بتبديل رأس الفرشاة؟", en: "How often should I replace the brush head?" },
    a: {
      ar: "تتضمن إرشادات العناية بالفم الشائعة تبديل رأس الفرشاة كل 3 أشهر تقريبًا أو عند ظهور علامات التآكل على الشعيرات. [للمراجعة البشرية قبل النشر]",
      en: "Common oral care guidance is to replace the brush head roughly every 3 months or when the bristles show wear. [For human review before publication]",
    },
  },
  {
    q: { ar: "كيف أطلب منتجات Y-Kelin في اليمن؟", en: "How do I order Y-Kelin products in Yemen?" },
    a: {
      ar: "تتم جميع الطلبات والاستفسارات حصريًا عبر واتساب الأعمال على الرقم +967 774040383. ركن التوفير كوزمتك للتجارة هو الوكيل الرسمي لـ Y-Kelin في الجمهورية اليمنية. [للمراجعة البشرية قبل النشر]",
      en: "All orders and inquiries are handled exclusively via WhatsApp Business at +967 774040383. Rukn Al-Tawfir Cosmetic for Trade is the official agent for Y-Kelin in the Republic of Yemen. [For human review before publication]",
    },
  },
];

export const Route = createFileRoute("/$lang/oral-care")({
  head: ({ params }) => {
    const isAr = params.lang === "ar";
    const url = `${BASE}/${params.lang}/oral-care`;
    const title = isAr
      ? "العناية بأطقم الأسنان وصحة الفم — Y-Kelin | ركن التوفير"
      : "Denture Care & Advanced Oral Care — Y-Kelin | Rukn Al-Tawfir";
    const desc = isAr
      ? "الدليل الشامل للعناية بأطقم الأسنان وصحة الفم في اليمن: لاصق الأطقم، فرش التقويم، الفرشاة الكهربائية الصوتية، ومنتجات Y-Kelin الرسمية عبر ركن التوفير."
      : "The complete guide to denture care and advanced oral health in Yemen: denture adhesive, orthodontic brushes, sonic electric toothbrush and official Y-Kelin products via Rukn Al-Tawfir.";

    const ogImage = `${BASE}/rukn-logo.webp`;

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: isAr ? "الرئيسية" : "Home", item: `${BASE}/${params.lang}` },
        { "@type": "ListItem", position: 2, name: isAr ? "العناية بأطقم الأسنان" : "Denture & Oral Care", item: url },
      ],
    };

    const collection = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": url,
      url,
      name: title,
      description: desc,
      inLanguage: isAr ? "ar" : "en",
      isPartOf: { "@type": "WebSite", name: "Rukn Al-Tawfir", url: BASE },
      about: [
        { "@type": "Thing", name: isAr ? "العناية بأطقم الأسنان" : "Denture care" },
        { "@type": "Thing", name: isAr ? "صحة الفم" : "Oral hygiene" },
        { "@type": "Thing", name: isAr ? "فرش التقويم" : "Orthodontic brushes" },
        { "@type": "Thing", name: isAr ? "الفرشاة الكهربائية" : "Electric toothbrush" },
      ],
      mentions: [{ "@type": "Brand", name: "Y-Kelin", url: `${BASE}/${params.lang}/brands/y-kelin` }],
    };

    const itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: isAr ? "منتجات Y-Kelin للعناية بأطقم الأسنان وصحة الفم" : "Y-Kelin denture & oral care products",
      itemListElement: [
        { "@type": "ListItem", position: 1, item: { "@type": "Brand", name: "Y-Kelin", url: `${BASE}/${params.lang}/brands/y-kelin` } },
      ],
    };

    const faq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q[isAr ? "ar" : "en"],
        acceptedAnswer: { "@type": "Answer", text: f.a[isAr ? "ar" : "en"] },
      })),
    };

    return {
      meta: [
        { title },
        { name: "description", content: desc },
        {
          name: "keywords",
          content: isAr
            ? "العناية بأطقم الأسنان, لاصق أطقم الأسنان, فرش أسنان للتقويم, العناية بالفم, Y-Kelin, فرشاة كهربائية, صحة الأسنان, اليمن"
            : "denture care, denture adhesive, orthodontic toothbrush, oral care, Y-Kelin, electric toothbrush, dental hygiene, Yemen",
        },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:locale", content: isAr ? "ar_YE" : "en_US" },
        { property: "og:image", content: ogImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: ogImage },
      ],
      links: [
        { rel: "canonical", href: url },
        { rel: "alternate", hreflang: "ar", href: `${BASE}/ar/oral-care` },
        { rel: "alternate", hreflang: "en", href: `${BASE}/en/oral-care` },
        { rel: "alternate", hreflang: "x-default", href: `${BASE}/ar/oral-care` },
      ],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(breadcrumb) },
        { type: "application/ld+json", children: JSON.stringify(collection) },
        { type: "application/ld+json", children: JSON.stringify(itemList) },
        { type: "application/ld+json", children: JSON.stringify(faq) },
      ],
    };
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(ykelinQO),
      context.queryClient.ensureQueryData(ykelinProductsQO),
      context.queryClient.ensureQueryData(relatedArticlesQO),
    ]);
  },
  component: OralCareHub,
});

function OralCareHub() {
  const { lang } = useLocale();
  const isAr = lang === "ar";
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: brand } = useSuspenseQuery(ykelinQO);
  const { data: products } = useSuspenseQuery(ykelinProductsQO);
  const { data: articles } = useSuspenseQuery(relatedArticlesQO);
  const ident = useLocalizedIdentity(id);
  const bname = brand ? (isAr ? brand.name_ar : brand.name_en) : "Y-Kelin";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader legalName={ident.legalName} parentGroup={ident.parentGroup} whatsappNumber={id.whatsapp_number} logoUrl={id.logo_url} />

      <nav aria-label={isAr ? "مسار التنقل" : "Breadcrumb"} className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-ink-600">
          <li><LLink to="/$lang" className="hover:text-trust-700">{isAr ? "الرئيسية" : "Home"}</LLink></li>
          <li aria-hidden>›</li>
          <li className="font-semibold text-foreground">{isAr ? "العناية بأطقم الأسنان وصحة الفم" : "Denture & oral care"}</li>
        </ol>
      </nav>

      <section className="cinema-hero relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="hq-eyebrow">{isAr ? "الدليل المرجعي" : "Authority guide"}</div>
          <h1 className="mt-3 font-arabic text-4xl font-bold leading-[1.1] text-foreground md:text-6xl">
            {isAr ? <>العناية بأطقم الأسنان وصحة الفم <span className="text-trust-700">— الدليل الشامل</span></> : <>Denture Care & Advanced Oral Care <span className="text-trust-700">— The Complete Guide</span></>}
          </h1>
          <div className="mt-6 h-px w-28 prem-divider" />
          <p className="mt-6 max-w-3xl text-base leading-loose text-ink-600 md:text-lg">
            {isAr
              ? "مرجع ركن التوفير كوزمتك للتجارة لكل ما يخصّ العناية بأطقم الأسنان، صحة الفم المتقدمة، فرش التقويم، والفرشاة الكهربائية الصوتية في اليمن، عبر منتجات Y-Kelin الرسمية."
              : "Rukn Al-Tawfir's authoritative reference for denture care, advanced oral hygiene, orthodontic brushes and sonic electric toothbrushes in Yemen, through the official Y-Kelin range."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppCTA number={id.whatsapp_number} message={isAr ? "السلام عليكم، أرغب بالاستفسار عن منتجات Y-Kelin للعناية بأطقم الأسنان وصحة الفم." : "Hello, I'd like to inquire about Y-Kelin denture and oral care products."}>
              {isAr ? "تواصل عبر واتساب" : "Inquire on WhatsApp"}
            </WhatsAppCTA>
            <LLink to="/$lang/brands/$slug" params={{ slug: "y-kelin" }} className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-trust-700 hover:text-trust-700">
              {isAr ? "تصفّح Y-Kelin" : "Explore Y-Kelin"}
            </LLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <div className="hq-eyebrow">{isAr ? "نظرة عامة" : "Overview"}</div>
        <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
          {isAr ? "لماذا تحتاج العناية بالفم وأطقم الأسنان إلى منتجات متخصصة؟" : "Why oral and denture care need specialized products"}
        </h2>
        <div className="prose prose-neutral mt-6 max-w-none text-base leading-loose text-ink-700">
          {isAr ? (
            <>
              <p>تختلف احتياجات العناية بأطقم الأسنان عن العناية اليومية بالأسنان الطبيعية. فالأطقم تحتاج إلى ثبات يمنحها الراحة عند الكلام والمضغ، وإلى نظافة منتظمة تمنع تراكم البلاك والروائح، وإلى أدوات تنظيف لا تخدش سطح الطقم. ومن هنا جاءت تشكيلة Y-Kelin المتخصصة لتقدّم ثلاثة محاور رئيسية: لاصق ثبات الطقم، فرش التنظيف المخصصة، وأقراص أو محاليل التنظيف العميق.</p>
              <p>إلى جانب أطقم الأسنان، تتسع الحاجة إلى منتجات متخصصة لمن يرتدون تقويم الأسنان. فالشعيرات العادية لا تصل بسهولة إلى المساحات بين أسلاك التقويم والأسنان، مما يستدعي فرش بشكل V أو فرش بين-أسنان (interdental) تساعد في إزالة بقايا الطعام والبلاك حول أجزاء التقويم. هذه التفاصيل الصغيرة هي ما يفرّق بين روتين عناية فعّال وآخر سطحي.</p>
              <p>أما الفرشاة الكهربائية الصوتية مثل Y-Kelin Sonic Electric Toothbrush فتقدّم آلاف الاهتزازات في الدقيقة لتنظيف أعمق مقارنة بالفرشاة اليدوية، مع مقاومة كاملة للماء IPX7 وعمر بطارية طويل يجعلها رفيقًا عمليًا للسفر والاستخدام اليومي. الجمع بين فرشاة كهربائية متطورة وأدوات تنظيف الطقم وفرش التقويم يبني روتينًا متكاملًا يشمل جميع احتياجات الفم في عائلة واحدة.</p>
              <p>كل هذه المنتجات متاحة عبر ركن التوفير كوزمتك للتجارة، الوكيل الرسمي لـ Y-Kelin في الجمهورية اليمنية، ويتم التواصل والطلب حصريًا عبر واتساب الأعمال.</p>
            </>
          ) : (
            <>
              <p>Denture care needs differ from daily natural-tooth care. Dentures need stability for comfortable speaking and chewing, regular hygiene to prevent plaque and odor build-up, and cleaning tools that do not scratch the denture surface. That is the reason behind Y-Kelin's three-pillar denture line: denture adhesive, dedicated cleaning brushes, and deep-cleaning tablets or solutions.</p>
              <p>Beyond dentures, specialized products matter for orthodontic patients. Regular bristles struggle to reach the spaces between braces wires and teeth, which is why V-shaped or interdental brushes are recommended to remove food debris and plaque around brackets. These small details separate an effective routine from a superficial one.</p>
              <p>A sonic electric toothbrush such as the Y-Kelin Sonic Electric Toothbrush adds thousands of vibrations per minute for deeper cleaning compared with a manual brush, with full IPX7 waterproofing and long battery life that makes it a practical travel and daily companion. Pairing an advanced sonic brush with denture cleaning and orthodontic brushes builds a complete routine that covers every mouth-care need in one family.</p>
              <p>All of these products are available through Rukn Al-Tawfir Cosmetic for Trade, the official agent for Y-Kelin in the Republic of Yemen, with orders and inquiries handled exclusively via WhatsApp Business.</p>
            </>
          )}
        </div>
      </section>

      {products.length > 0 ? (
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
            <div className="hq-eyebrow">{isAr ? "تشكيلة Y-Kelin" : "Y-Kelin range"}</div>
            <h2 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
              {isAr ? "منتجات العناية بأطقم الأسنان وصحة الفم" : "Denture & oral care products"}
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => {
                const pname = isAr ? p.name_ar : p.name_en;
                return (
                  <LLink key={p.id} to="/$lang/brands/$slug/$productSlug" params={{ slug: "y-kelin", productSlug: p.slug }} className="prem-card group flex flex-col">
                    <figure className="podium relative grid aspect-[4/3] place-items-center p-6">
                      {p.cover_url ? (
                        <img src={p.cover_url} alt={productAlt("y-kelin", bname, pname, isAr ? "ar" : "en")} loading="lazy" className="max-h-full w-auto object-contain" />
                      ) : null}
                    </figure>
                    <figcaption className="px-4 pt-3 text-[11px] leading-relaxed text-ink-600">{pname} — {isAr ? "العناية بأطقم الأسنان وصحة الفم" : "denture & oral care"}</figcaption>
                    <div className="flex-1 p-4">
                      <div className="font-arabic text-sm font-bold text-foreground">{pname}</div>
                      {p.short_description_ar ? <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-600">{p.short_description_ar}</p> : null}
                    </div>
                  </LLink>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <div className="hq-eyebrow">{isAr ? "أسئلة شائعة" : "FAQ"}</div>
        <h2 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
          {isAr ? "الأسئلة الشائعة حول العناية بأطقم الأسنان" : "Frequently asked questions on denture & oral care"}
        </h2>
        <div className="mt-6 divide-y divide-border/70">
          {FAQS.map((f, i) => (
            <details key={i} className="group py-4">
              <summary className="cursor-pointer list-none text-sm font-bold text-foreground">{f.q[isAr ? "ar" : "en"]}</summary>
              <p className="mt-2 text-sm leading-loose text-ink-700">{f.a[isAr ? "ar" : "en"]}</p>
            </details>
          ))}
        </div>
      </section>

      {articles.length > 0 ? (
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
            <div className="hq-eyebrow">{isAr ? "مقالات ذات صلة" : "Related articles"}</div>
            <h2 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">{isAr ? "أدلة العناية بالفم والأسنان" : "Oral & dental care guides"}</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((n) => {
                const title = (isAr ? n.title_ar : n.title_en || n.title_ar) || "";
                const excerpt = (isAr ? n.excerpt_ar : n.excerpt_en || n.excerpt_ar) || "";
                return (
                  <LLink key={n.slug} to="/$lang/news/$slug" params={{ slug: n.slug }} className="prem-card overflow-hidden">
                    {n.cover_url ? <img src={n.cover_url} alt={title} loading="lazy" className="block aspect-[16/9] w-full object-cover" /> : null}
                    <div className="p-5">
                      <div className="text-xs font-semibold text-trust-700">{n.tags[0] || (isAr ? "مقال" : "Article")}</div>
                      <h3 className="mt-2 font-arabic text-base font-bold text-foreground">{title}</h3>
                      <p className="mt-2 text-xs text-ink-600 line-clamp-3">{excerpt}</p>
                    </div>
                  </LLink>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="rounded-2xl border border-trust-700/30 bg-trust-700/5 p-6 md:p-8">
          <div className="text-[11px] font-bold tracking-[0.18em] text-trust-700">{isAr ? "مراكز معرفية أخرى" : "Other topic hubs"}</div>
          <h2 className="mt-2 font-arabic text-lg font-bold text-foreground md:text-xl">{isAr ? "نمط حياة صحي متكامل" : "A complete healthy-lifestyle ecosystem"}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-loose text-ink-700">
            {isAr ? "ركن التوفير يجمع العناية بالفم مع بدائل السكر الصحية، دعم المناعة، ومنتجات الأطفال ضمن منظومة موحّدة." : "Rukn Al-Tawfir unites oral care with healthy sugar alternatives, immunity support, and baby care under one ecosystem."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <LLink to="/$lang/sugar-alternatives" className="inline-flex items-center justify-center rounded-full border border-trust-700/40 px-5 py-2.5 text-xs font-semibold text-trust-700">{isAr ? "بدائل السكر" : "Sugar alternatives"}</LLink>
            <LLink to="/$lang/immunity-vitamin-c" className="inline-flex items-center justify-center rounded-full border border-trust-700/40 px-5 py-2.5 text-xs font-semibold text-trust-700">{isAr ? "دعم المناعة وفيتامين C" : "Immunity & Vitamin C"}</LLink>
            <LLink to="/$lang/baby-care" className="inline-flex items-center justify-center rounded-full border border-trust-700/40 px-5 py-2.5 text-xs font-semibold text-trust-700">{isAr ? "العناية بالطفل" : "Baby care"}</LLink>
          </div>
        </div>
      </section>

      {brand?.logo_url ? (
        <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <div className="flex items-center gap-4">
            <img src={brand.logo_url} alt={brandLogoAlt("y-kelin", bname, isAr ? "ar" : "en")} className="max-h-20 w-auto" />
            <p className="text-sm text-ink-600">{isAr ? "Y-Kelin — متاحة حصريًا عبر ركن التوفير في اليمن." : "Y-Kelin — available exclusively via Rukn Al-Tawfir in Yemen."}</p>
          </div>
        </section>
      ) : null}

      <StickyWhatsApp number={id.whatsapp_number} />
      <SiteFooter legalName={ident.legalName} parentGroup={ident.parentGroup} whatsappNumber={id.whatsapp_number} email={id.email} address={ident.address} />
    </div>
  );
}
