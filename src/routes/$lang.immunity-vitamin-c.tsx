import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  getBrandBySlug,
  getCorporateIdentity,
  listBrandProducts,
} from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";
import { StickyWhatsApp } from "@/components/site/StickyWhatsApp";
import { LLink } from "@/i18n/LLink";
import { useLocale } from "@/i18n/LocaleProvider";
import { useLocalizedIdentity } from "@/i18n/identity";
import { productAlt, brandLogoAlt } from "@/lib/seo-alt";
import { NEWS } from "@/data/news";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const monivoQO = queryOptions({ queryKey: ["brand", "monivo"], queryFn: () => getBrandBySlug({ data: { slug: "monivo" } }) });
const monivoProductsQO = queryOptions({ queryKey: ["brand-products", "monivo"], queryFn: () => listBrandProducts({ data: { brandSlug: "monivo" } }) });

const BASE = "https://ruknaltawfer.com";

type FAQ = { q: { ar: string; en: string }; a: { ar: string; en: string } };

const FAQS: FAQ[] = [
  {
    q: { ar: "ما هي منتجات Monivo لدعم المناعة؟", en: "What Monivo products support immunity?" },
    a: {
      ar: "تقدّم Monivo أقراص استحلاب مدعَّمة بفيتامين C بنكهات متعددة (برتقال، ليمون ومنثول، نعناع وأوكاليبتوس، فراولة، عسل وبروبوليس) بتركيبة خالية من السكر، تتوفر بأحجام عبوات يومية. [للمراجعة البشرية قبل النشر]",
      en: "Monivo offers vitamin C-enriched lozenges in multiple flavors (orange, lemon & menthol, mint & eucalyptus, strawberry, honey & propolis) in a sugar-free formula, in daily-use pack sizes. [For human review before publication]",
    },
  },
  {
    q: { ar: "ما هو الفرق بين النكهات المختلفة لأقراص Monivo؟", en: "What is the difference between Monivo flavor variants?" },
    a: {
      ar: "تتشابه النكهات في كونها مصاصات استحلاب مدعَّمة بفيتامين C وخالية من السكر، وتختلف بشكل أساسي في الطعم والمكونات المساعدة لراحة الحلق (مثل المنثول أو الأوكاليبتوس أو العسل والبروبوليس). [للمراجعة البشرية قبل النشر]",
      en: "Flavors share the same vitamin C-enriched, sugar-free lozenge format. They mainly differ in taste and supporting throat-comfort ingredients such as menthol, eucalyptus, or honey and propolis. [For human review before publication]",
    },
  },
  {
    q: { ar: "هل أقراص Monivo خالية من السكر؟", en: "Are Monivo lozenges sugar-free?" },
    a: {
      ar: "نعم، أقراص Monivo مصمَّمة بتركيبة خالية من السكر، ما يجعلها خيارًا عمليًا لمن يتجنّب السكر في نظامه اليومي. [للمراجعة البشرية قبل النشر]",
      en: "Yes, Monivo lozenges are formulated sugar-free, making them a practical choice for anyone avoiding sugar in their daily routine. [For human review before publication]",
    },
  },
  {
    q: { ar: "متى يُفضَّل استخدام أقراص الاستحلاب لراحة الحلق؟", en: "When are throat lozenges typically used?" },
    a: {
      ar: "تُستخدم أقراص الاستحلاب بشكل شائع لتلطيف الحلق عند الإحساس بالخشونة أو الجفاف اليومي، مع الالتزام بالكمية المطبوعة على العبوة. تختلف الاحتياجات الفردية ويُنصح بمراجعة الطبيب عند استمرار الأعراض. [للمراجعة البشرية قبل النشر]",
      en: "Throat lozenges are commonly used to soothe a scratchy or dry throat sensation, following the daily amount printed on the pack. Individual needs vary; consult a physician if symptoms persist. [For human review before publication]",
    },
  },
  {
    q: { ar: "هل يحتاج البالغون إلى مكمل فيتامين C يوميًا؟", en: "Do adults need a daily vitamin C supplement?" },
    a: {
      ar: "تختلف الحاجة الفردية لفيتامين C بحسب النظام الغذائي ونمط الحياة. توصي المراجع الغذائية الشائعة عمومًا بـ 75–90 ملغ يوميًا للبالغين، ويمكن الحصول عليه من مزيج بين الغذاء والمكملات. [للمراجعة البشرية قبل النشر]",
      en: "Individual vitamin C needs vary by diet and lifestyle. General nutrition references commonly cite 75–90 mg daily for adults, achievable through a mix of food and supplements. [For human review before publication]",
    },
  },
  {
    q: { ar: "كيف أطلب منتجات Monivo في اليمن؟", en: "How do I order Monivo products in Yemen?" },
    a: {
      ar: "جميع الطلبات والاستفسارات تتم حصرًا عبر واتساب الأعمال على الرقم +967 774040383. ركن التوفير كوزمتك للتجارة هو الجهة الموثوقة لتوفير Monivo في الجمهورية اليمنية. [للمراجعة البشرية قبل النشر]",
      en: "All orders and inquiries are handled exclusively via WhatsApp Business at +967 774040383. Rukn Al-Tawfir Cosmetic for Trade is the trusted source for Monivo in the Republic of Yemen. [For human review before publication]",
    },
  },
];

export const Route = createFileRoute("/$lang/immunity-vitamin-c")({
  head: ({ params }) => {
    const isAr = params.lang === "ar";
    const url = `${BASE}/${params.lang}/immunity-vitamin-c`;
    const title = isAr
      ? "فيتامين C ودعم المناعة — Monivo | ركن التوفير"
      : "Vitamin C & Immune Support — Monivo | Rukn Al-Tawfir";
    const desc = isAr
      ? "الدليل الشامل لفيتامين C ودعم المناعة في اليمن: أقراص استحلاب Monivo الخالية من السكر بنكهات متعددة لدعم المناعة وراحة الحلق عبر ركن التوفير."
      : "Complete guide to vitamin C and immune support in Yemen: sugar-free Monivo lozenges in multiple flavors for immunity and throat comfort, via Rukn Al-Tawfir.";
    const ogImage = `${BASE}/rukn-logo.webp`;

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: isAr ? "الرئيسية" : "Home", item: `${BASE}/${params.lang}` },
        { "@type": "ListItem", position: 2, name: isAr ? "فيتامين C ودعم المناعة" : "Vitamin C & immunity", item: url },
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
        { "@type": "Thing", name: isAr ? "فيتامين سي" : "Vitamin C" },
        { "@type": "Thing", name: isAr ? "دعم المناعة" : "Immune support" },
        { "@type": "Thing", name: isAr ? "مصاصات الحلق" : "Throat lozenges" },
      ],
      mentions: [{ "@type": "Brand", name: "Monivo", url: `${BASE}/${params.lang}/brands/monivo` }],
    };
    const itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: isAr ? "منتجات Monivo لدعم المناعة" : "Monivo immune-support products",
      itemListElement: [
        { "@type": "ListItem", position: 1, item: { "@type": "Brand", name: "Monivo", url: `${BASE}/${params.lang}/brands/monivo` } },
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
            ? "فيتامين سي, دعم المناعة, مصاصات الحلق, Monivo, أقراص استحلاب, مكملات فيتامين C, ركن التوفير, اليمن"
            : "vitamin C, immune support, throat lozenges, Monivo, vitamin C supplement, Rukn Al-Tawfir, Yemen",
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
        { rel: "alternate", hreflang: "ar", href: `${BASE}/ar/immunity-vitamin-c` },
        { rel: "alternate", hreflang: "en", href: `${BASE}/en/immunity-vitamin-c` },
        { rel: "alternate", hreflang: "x-default", href: `${BASE}/ar/immunity-vitamin-c` },
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
      context.queryClient.ensureQueryData(monivoQO),
      context.queryClient.ensureQueryData(monivoProductsQO),
    ]);
  },
  component: ImmunityVitaminCHub,
});

function ImmunityVitaminCHub() {
  const { lang } = useLocale();
  const isAr = lang === "ar";
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: brand } = useSuspenseQuery(monivoQO);
  const { data: products } = useSuspenseQuery(monivoProductsQO);
  const ident = useLocalizedIdentity(id);
  const bname = brand ? (isAr ? brand.name_ar : brand.name_en) : "Monivo";
  const articles = NEWS.filter((n) => ["vitamin-c-immunity-energy"].includes(n.slug));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader legalName={ident.legalName} parentGroup={ident.parentGroup} whatsappNumber={id.whatsapp_number} logoUrl={id.logo_url} />

      <nav aria-label={isAr ? "مسار التنقل" : "Breadcrumb"} className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-ink-600">
          <li><LLink to="/$lang" className="hover:text-trust-700">{isAr ? "الرئيسية" : "Home"}</LLink></li>
          <li aria-hidden>›</li>
          <li className="font-semibold text-foreground">{isAr ? "فيتامين C ودعم المناعة" : "Vitamin C & immunity"}</li>
        </ol>
      </nav>

      <section className="cinema-hero relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="hq-eyebrow">{isAr ? "الدليل المرجعي" : "Authority guide"}</div>
          <h1 className="mt-3 font-arabic text-4xl font-bold leading-[1.1] text-foreground md:text-6xl">
            {isAr ? <>فيتامين C ودعم المناعة <span className="text-trust-700">— الدليل الشامل</span></> : <>Vitamin C & Immune Support <span className="text-trust-700">— The Complete Guide</span></>}
          </h1>
          <div className="mt-6 h-px w-28 prem-divider" />
          <p className="mt-6 max-w-3xl text-base leading-loose text-ink-600 md:text-lg">
            {isAr
              ? "مرجع ركن التوفير كوزمتك للتجارة لفيتامين C ودعم المناعة في اليمن، عبر أقراص استحلاب Monivo الخالية من السكر بنكهات متعددة لراحة الحلق ودعم نمط حياة صحي."
              : "Rukn Al-Tawfir's authoritative reference for vitamin C and immune support in Yemen, via Monivo's sugar-free lozenges in multiple flavors for throat comfort and a healthy lifestyle."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppCTA number={id.whatsapp_number} message={isAr ? "السلام عليكم، أرغب بالاستفسار عن منتجات Monivo (فيتامين C)." : "Hello, I'd like to inquire about Monivo vitamin C products."}>
              {isAr ? "تواصل عبر واتساب" : "Inquire on WhatsApp"}
            </WhatsAppCTA>
            <LLink to="/$lang/brands/$slug" params={{ slug: "monivo" }} className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:border-trust-700 hover:text-trust-700">
              {isAr ? "تصفّح Monivo" : "Explore Monivo"}
            </LLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <div className="hq-eyebrow">{isAr ? "نظرة عامة" : "Overview"}</div>
        <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
          {isAr ? "لماذا يحظى فيتامين C بهذه الأهمية اليومية؟" : "Why daily vitamin C matters"}
        </h2>
        <div className="prose prose-neutral mt-6 max-w-none text-base leading-loose text-ink-700">
          {isAr ? (
            <>
              <p>فيتامين C من العناصر الغذائية الأساسية التي لا يستطيع جسم الإنسان تصنيعها أو تخزينها بكميات كبيرة. لذلك يحتاج الجسم إلى تجديد مخزون فيتامين C بانتظام، إما عبر الغذاء (الحمضيات، الفلفل، الخضروات الورقية) أو عبر مكملات عملية مثل أقراص الاستحلاب.</p>
              <p>يلعب فيتامين C دورًا داعمًا لجهاز المناعة، ويسهم كمضاد للأكسدة في حماية الخلايا من الإجهاد التأكسدي اليومي. كما يساعد في امتصاص الحديد من المصادر النباتية وتكوين الكولاجين، وهو البروتين الذي يدعم البشرة والأنسجة الضامة. تتراوح التوصيات الغذائية الشائعة للبالغين عمومًا بين 75 و90 ملغ يوميًا، مع حد أعلى يبلغ 2000 ملغ من جميع المصادر.</p>
              <p>تأتي Monivo كخيار يومي عملي بصيغة أقراص استحلاب خالية من السكر، بنكهات متعددة (برتقال، ليمون ومنثول، نعناع وأوكاليبتوس، فراولة، عسل وبروبوليس). هذا التنوع في النكهات لا يهدف فقط إلى المتعة، بل يمنح خيارات لراحة الحلق اليومية ولمن يبحثون عن صيغة سهلة الاستخدام أثناء العمل أو السفر.</p>
              <p>منتجات Monivo متوفرة في الجمهورية اليمنية حصريًا عبر ركن التوفير كوزمتك للتجارة، ويتم التواصل والطلب عبر واتساب الأعمال. هذا الدليل معلومات عامة ولا يُغني عن الاستشارة الطبية لمن لديهم حالات خاصة.</p>
            </>
          ) : (
            <>
              <p>Vitamin C is an essential nutrient that the human body cannot synthesize or store in large amounts. The body needs to replenish vitamin C regularly, either through food (citrus, peppers, leafy greens) or through practical supplements like lozenges.</p>
              <p>Vitamin C plays a supporting role for the immune system and acts as an antioxidant that helps protect cells from daily oxidative stress. It also aids absorption of non-heme iron and contributes to collagen formation — the protein that supports skin and connective tissue. Common dietary references cite around 75–90 mg per day for adults, with an upper limit of 2,000 mg from all sources.</p>
              <p>Monivo offers a practical daily option as sugar-free lozenges in multiple flavors (orange, lemon & menthol, mint & eucalyptus, strawberry, honey & propolis). This flavor variety is not only about taste — it provides everyday throat-comfort options and an easy-to-use format during work or travel.</p>
              <p>Monivo products are available in the Republic of Yemen exclusively through Rukn Al-Tawfir Cosmetic for Trade, with orders handled via WhatsApp Business. This guide is general information and is not a substitute for medical advice for those with specific conditions.</p>
            </>
          )}
        </div>
      </section>

      {products.length > 0 ? (
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
            <div className="hq-eyebrow">{isAr ? "تشكيلة Monivo" : "Monivo range"}</div>
            <h2 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
              {isAr ? "أقراص استحلاب فيتامين C — Monivo" : "Vitamin C lozenges — Monivo"}
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => {
                const pname = isAr ? p.name_ar : p.name_en;
                return (
                  <LLink key={p.id} to="/$lang/brands/$slug/$productSlug" params={{ slug: "monivo", productSlug: p.slug }} className="prem-card group flex flex-col">
                    <figure className="podium relative grid aspect-[4/3] place-items-center p-6">
                      {p.cover_url ? <img src={p.cover_url} alt={productAlt("monivo", bname, pname, isAr ? "ar" : "en")} loading="lazy" className="max-h-full w-auto object-contain" /> : null}
                    </figure>
                    <figcaption className="px-4 pt-3 text-[11px] leading-relaxed text-ink-600">{pname} — {isAr ? "فيتامين C ودعم المناعة" : "vitamin C & immune support"}</figcaption>
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
          {isAr ? "الأسئلة الشائعة حول فيتامين C ودعم المناعة" : "Frequently asked questions on vitamin C & immunity"}
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
            <h2 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">{isAr ? "أدلة دعم المناعة وفيتامين C" : "Immunity & vitamin C guides"}</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((n) => (
                <LLink key={n.slug} to="/$lang/news/$slug" params={{ slug: n.slug }} className="prem-card overflow-hidden">
                  <img src={n.cover} alt={n.title[isAr ? "ar" : "en"]} loading="lazy" className="block aspect-[16/9] w-full object-cover" />
                  <div className="p-5">
                    <div className="text-xs font-semibold text-trust-700">{n.eyebrow[isAr ? "ar" : "en"]}</div>
                    <h3 className="mt-2 font-arabic text-base font-bold text-foreground">{n.title[isAr ? "ar" : "en"]}</h3>
                    <p className="mt-2 text-xs text-ink-600 line-clamp-3">{n.excerpt[isAr ? "ar" : "en"]}</p>
                  </div>
                </LLink>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="rounded-2xl border border-trust-700/30 bg-trust-700/5 p-6 md:p-8">
          <div className="text-[11px] font-bold tracking-[0.18em] text-trust-700">{isAr ? "مراكز معرفية أخرى" : "Other topic hubs"}</div>
          <h2 className="mt-2 font-arabic text-lg font-bold text-foreground md:text-xl">{isAr ? "صحة متكاملة لكل أفراد العائلة" : "A complete wellness ecosystem"}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-loose text-ink-700">
            {isAr ? "دعم المناعة جزء من نمط حياة صحي يشمل بدائل السكر الصحية، والعناية بالطفل، وصحة الفم." : "Immune support is part of a wider healthy lifestyle including sugar alternatives, baby care, and oral health."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <LLink to="/$lang/sugar-alternatives" className="inline-flex items-center justify-center rounded-full border border-trust-700/40 px-5 py-2.5 text-xs font-semibold text-trust-700">{isAr ? "بدائل السكر" : "Sugar alternatives"}</LLink>
            <LLink to="/$lang/oral-care" className="inline-flex items-center justify-center rounded-full border border-trust-700/40 px-5 py-2.5 text-xs font-semibold text-trust-700">{isAr ? "العناية بأطقم الأسنان" : "Denture & oral care"}</LLink>
            <LLink to="/$lang/baby-care" className="inline-flex items-center justify-center rounded-full border border-trust-700/40 px-5 py-2.5 text-xs font-semibold text-trust-700">{isAr ? "العناية بالطفل" : "Baby care"}</LLink>
          </div>
        </div>
      </section>

      {brand?.logo_url ? (
        <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <div className="flex items-center gap-4">
            <img src={brand.logo_url} alt={brandLogoAlt("monivo", bname, isAr ? "ar" : "en")} className="max-h-20 w-auto" />
            <p className="text-sm text-ink-600">{isAr ? "Monivo — متاحة حصريًا عبر ركن التوفير في اليمن." : "Monivo — available exclusively via Rukn Al-Tawfir in Yemen."}</p>
          </div>
        </section>
      ) : null}

      <StickyWhatsApp number={id.whatsapp_number} />
      <SiteFooter legalName={ident.legalName} parentGroup={ident.parentGroup} whatsappNumber={id.whatsapp_number} email={id.email} address={ident.address} />
    </div>
  );
}
