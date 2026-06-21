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

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const babyQO = queryOptions({ queryKey: ["brand", "baby-tawfir"], queryFn: () => getBrandBySlug({ data: { slug: "baby-tawfir" } }) });
const bamboQO = queryOptions({ queryKey: ["brand", "bambo"], queryFn: () => getBrandBySlug({ data: { slug: "bambo" } }) });
const babyProductsQO = queryOptions({ queryKey: ["brand-products", "baby-tawfir"], queryFn: () => listBrandProducts({ data: { brandSlug: "baby-tawfir" } }) });
const bamboProductsQO = queryOptions({ queryKey: ["brand-products", "bambo"], queryFn: () => listBrandProducts({ data: { brandSlug: "bambo" } }) });

const BASE = "https://ruknaltawfer.com";

type FAQ = { q: { ar: string; en: string }; a: { ar: string; en: string } };

const FAQS: FAQ[] = [
  {
    q: { ar: "ما هي منتجات العناية بالطفل المتوفرة لدى ركن التوفير؟", en: "Which baby care products are available at Rukn Al-Tawfir?" },
    a: {
      ar: "يقدّم ركن التوفير كوزمتك للتجارة تشكيلتي Baby Tawfir و Bambo، وتشمل المناديل المبللة للأطفال ولوازم العناية اليومية بالرضّع، بأحجام عبوات متعددة. [للمراجعة البشرية قبل النشر]",
      en: "Rukn Al-Tawfir Cosmetic for Trade offers Baby Tawfir and Bambo ranges, including baby wet wipes and everyday infant essentials in various pack sizes. [For human review before publication]",
    },
  },
  {
    q: { ar: "ما الذي يميّز حفاضات Bambo الإيكولوجية؟", en: "What makes Bambo eco diapers distinctive?" },
    a: {
      ar: "Bambo علامة دانماركية معروفة بحفاضاتها الإيكولوجية المختبَرة دلائلياً للبشرة الحساسة، مع التزام بمعايير الاستدامة والتغليف المسؤول. [للمراجعة البشرية قبل النشر]",
      en: "Bambo is a Danish brand known for eco diapers dermatologically tested for sensitive skin, with a strong sustainability and responsible-packaging commitment. [For human review before publication]",
    },
  },
  {
    q: { ar: "هل المناديل المبللة من Baby Tawfir مناسبة للاستخدام اليومي؟", en: "Are Baby Tawfir wet wipes suitable for daily use?" },
    a: {
      ar: "تأتي مناديل Baby Tawfir بصيغ مصمَّمة للاستخدام اليومي لتغيير الحفاض وتنظيف اليدين والوجه. يُفضَّل قراءة الملصق على العبوة للتأكد من ملاءمة الصيغة لعمر الطفل. [للمراجعة البشرية قبل النشر]",
      en: "Baby Tawfir wet wipes come in formats designed for daily diaper changes and hand/face cleaning. We recommend reading the pack label to confirm the formula fits the child's age. [For human review before publication]",
    },
  },
  {
    q: { ar: "كيف يمكنني الحفاظ على بشرة الطفل أثناء تغيير الحفاض؟", en: "How can I look after baby skin during diaper changes?" },
    a: {
      ar: "تتضمن الممارسات الشائعة تغيير الحفاض بانتظام، التجفيف اللطيف للبشرة، واستخدام مناديل لطيفة وحفاضات مناسبة للحجم. تختلف التوصيات حسب عمر الطفل ونوع البشرة. [للمراجعة البشرية قبل النشر]",
      en: "Common practices include frequent diaper changes, gentle drying, and using mild wipes and correctly-sized diapers. Recommendations vary by age and skin type. [For human review before publication]",
    },
  },
  {
    q: { ar: "هل منتجات Bambo و Baby Tawfir معتمدة وآمنة؟", en: "Are Bambo and Baby Tawfir products certified?" },
    a: {
      ar: "تحمل علامة Bambo اعتمادات أوروبية شائعة في فئة الحفاضات الإيكولوجية، ويتم تصنيع منتجات Baby Tawfir وفق معايير صناعية معتمدة لمنتجات الأطفال. [للمراجعة البشرية قبل النشر]",
      en: "Bambo carries widely-recognized European certifications for the eco diaper category, and Baby Tawfir products are manufactured to recognized industry standards for baby products. [For human review before publication]",
    },
  },
  {
    q: { ar: "كيف أطلب منتجات الأطفال في اليمن؟", en: "How do I order baby products in Yemen?" },
    a: {
      ar: "جميع الطلبات والاستفسارات حصرًا عبر واتساب الأعمال على الرقم +967 774040383. ركن التوفير كوزمتك للتجارة هو الجهة الموثوقة لتوفير Baby Tawfir و Bambo في الجمهورية اليمنية. [للمراجعة البشرية قبل النشر]",
      en: "All orders and inquiries are handled exclusively via WhatsApp Business at +967 774040383. Rukn Al-Tawfir Cosmetic for Trade is the trusted source for Baby Tawfir and Bambo in the Republic of Yemen. [For human review before publication]",
    },
  },
];

export const Route = createFileRoute("/$lang/baby-care")({
  head: ({ params }) => {
    const isAr = params.lang === "ar";
    const url = `${BASE}/${params.lang}/baby-care`;
    const title = isAr
      ? "منتجات الأطفال والعناية بالطفل — Baby Tawfir و Bambo | ركن التوفير"
      : "Baby Care Products — Baby Tawfir & Bambo | Rukn Al-Tawfir";
    const desc = isAr
      ? "الدليل الشامل لمنتجات الأطفال في اليمن: مناديل مبللة، حفاضات إيكولوجية، والعناية ببشرة الطفل عبر Baby Tawfir و Bambo من ركن التوفير كوزمتك للتجارة."
      : "Complete guide to baby care products in Yemen: wet wipes, eco diapers, and baby skin care via Baby Tawfir and Bambo from Rukn Al-Tawfir.";
    const ogImage = `${BASE}/rukn-logo.webp`;

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: isAr ? "الرئيسية" : "Home", item: `${BASE}/${params.lang}` },
        { "@type": "ListItem", position: 2, name: isAr ? "منتجات الأطفال" : "Baby care", item: url },
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
        { "@type": "Thing", name: isAr ? "منتجات الأطفال" : "Baby care" },
        { "@type": "Thing", name: isAr ? "مناديل مبللة للأطفال" : "Baby wet wipes" },
        { "@type": "Thing", name: isAr ? "حفاضات إيكولوجية" : "Eco diapers" },
        { "@type": "Thing", name: isAr ? "العناية ببشرة الطفل" : "Baby skin care" },
      ],
      mentions: [
        { "@type": "Brand", name: "Baby Tawfir", url: `${BASE}/${params.lang}/brands/baby-tawfir` },
        { "@type": "Brand", name: "Bambo", url: `${BASE}/${params.lang}/brands/bambo` },
      ],
    };
    const itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: isAr ? "علامات منتجات الأطفال لدى ركن التوفير" : "Baby care brands at Rukn Al-Tawfir",
      itemListElement: [
        { "@type": "ListItem", position: 1, item: { "@type": "Brand", name: "Baby Tawfir", url: `${BASE}/${params.lang}/brands/baby-tawfir` } },
        { "@type": "ListItem", position: 2, item: { "@type": "Brand", name: "Bambo", url: `${BASE}/${params.lang}/brands/bambo` } },
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
            ? "منتجات الأطفال, مناديل مبللة للأطفال, العناية ببشرة الطفل, حفاضات إيكولوجية, Bambo, Baby Tawfir, ركن التوفير, اليمن"
            : "baby care, baby wet wipes, eco diapers, baby skin care, Bambo, Baby Tawfir, Rukn Al-Tawfir, Yemen",
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
        { rel: "alternate", hreflang: "ar", href: `${BASE}/ar/baby-care` },
        { rel: "alternate", hreflang: "en", href: `${BASE}/en/baby-care` },
        { rel: "alternate", hreflang: "x-default", href: `${BASE}/ar/baby-care` },
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
      context.queryClient.ensureQueryData(babyQO),
      context.queryClient.ensureQueryData(bamboQO),
      context.queryClient.ensureQueryData(babyProductsQO),
      context.queryClient.ensureQueryData(bamboProductsQO),
    ]);
  },
  component: BabyCareHub,
});

function BabyCareHub() {
  const { lang } = useLocale();
  const isAr = lang === "ar";
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: baby } = useSuspenseQuery(babyQO);
  const { data: bambo } = useSuspenseQuery(bamboQO);
  const { data: babyProducts } = useSuspenseQuery(babyProductsQO);
  const { data: bamboProducts } = useSuspenseQuery(bamboProductsQO);
  const ident = useLocalizedIdentity(id);
  const babyName = baby ? (isAr ? baby.name_ar : baby.name_en) : "Baby Tawfir";
  const bamboName = bambo ? (isAr ? bambo.name_ar : bambo.name_en) : "Bambo";

  const Section = ({ slug, brandName, brandData, products }: { slug: string; brandName: string; brandData: typeof baby; products: typeof babyProducts }) => (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="flex items-center gap-4">
        {brandData?.logo_url ? <img src={brandData.logo_url} alt={brandLogoAlt(slug, brandName, isAr ? "ar" : "en")} className="max-h-16 w-auto" /> : null}
        <div>
          <div className="hq-eyebrow">{brandName}</div>
          <h2 className="mt-1 font-arabic text-2xl font-bold text-foreground md:text-3xl">
            {isAr ? `منتجات ${brandName}` : `${brandName} products`}
          </h2>
        </div>
      </div>
      {products.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const pname = isAr ? p.name_ar : p.name_en;
            return (
              <LLink key={p.id} to="/$lang/brands/$slug/$productSlug" params={{ slug, productSlug: p.slug }} className="prem-card group flex flex-col">
                <figure className="podium relative grid aspect-[4/3] place-items-center p-6">
                  {p.cover_url ? <img src={p.cover_url} alt={productAlt(slug, brandName, pname, isAr ? "ar" : "en")} loading="lazy" className="max-h-full w-auto object-contain" /> : null}
                </figure>
                <figcaption className="px-4 pt-3 text-[11px] leading-relaxed text-ink-600">{pname} — {isAr ? "منتجات العناية بالطفل" : "baby care"}</figcaption>
                <div className="flex-1 p-4">
                  <div className="font-arabic text-sm font-bold text-foreground">{pname}</div>
                  {p.short_description_ar ? <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-600">{p.short_description_ar}</p> : null}
                </div>
              </LLink>
            );
          })}
        </div>
      ) : (
        <p className="mt-6 text-sm text-ink-600">
          <LLink to="/$lang/brands/$slug" params={{ slug }} className="text-trust-700 hover:underline">
            {isAr ? `تصفّح صفحة ${brandName}` : `Browse the ${brandName} brand page`}
          </LLink>
        </p>
      )}
    </section>
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader legalName={ident.legalName} parentGroup={ident.parentGroup} whatsappNumber={id.whatsapp_number} logoUrl={id.logo_url} />

      <nav aria-label={isAr ? "مسار التنقل" : "Breadcrumb"} className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-ink-600">
          <li><LLink to="/$lang" className="hover:text-trust-700">{isAr ? "الرئيسية" : "Home"}</LLink></li>
          <li aria-hidden>›</li>
          <li className="font-semibold text-foreground">{isAr ? "منتجات الأطفال" : "Baby care"}</li>
        </ol>
      </nav>

      <section className="cinema-hero relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="hq-eyebrow">{isAr ? "الدليل المرجعي" : "Authority guide"}</div>
          <h1 className="mt-3 font-arabic text-4xl font-bold leading-[1.1] text-foreground md:text-6xl">
            {isAr ? <>منتجات الأطفال والعناية بالطفل <span className="text-trust-700">— الدليل الشامل</span></> : <>Baby Products & Baby Care <span className="text-trust-700">— The Complete Guide</span></>}
          </h1>
          <div className="mt-6 h-px w-28 prem-divider" />
          <p className="mt-6 max-w-3xl text-base leading-loose text-ink-600 md:text-lg">
            {isAr
              ? "مرجع ركن التوفير كوزمتك للتجارة لمنتجات الأطفال في اليمن: المناديل المبللة من Baby Tawfir، الحفاضات الإيكولوجية من Bambo، والعناية اليومية ببشرة الطفل."
              : "Rukn Al-Tawfir's authoritative reference for baby products in Yemen: Baby Tawfir wet wipes, Bambo eco diapers, and everyday baby skin care."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppCTA number={id.whatsapp_number} message={isAr ? "السلام عليكم، أرغب بالاستفسار عن منتجات الأطفال (Baby Tawfir / Bambo)." : "Hello, I'd like to inquire about baby products (Baby Tawfir / Bambo)."}>
              {isAr ? "تواصل عبر واتساب" : "Inquire on WhatsApp"}
            </WhatsAppCTA>
            <LLink to="/$lang/brands/$slug" params={{ slug: "baby-tawfir" }} className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:border-trust-700 hover:text-trust-700">
              {isAr ? "تصفّح Baby Tawfir" : "Explore Baby Tawfir"}
            </LLink>
            <LLink to="/$lang/brands/$slug" params={{ slug: "bambo" }} className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:border-trust-700 hover:text-trust-700">
              {isAr ? "تصفّح Bambo" : "Explore Bambo"}
            </LLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <div className="hq-eyebrow">{isAr ? "نظرة عامة" : "Overview"}</div>
        <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
          {isAr ? "لماذا تستحق العناية بالطفل منتجات متخصصة؟" : "Why baby care needs specialized products"}
        </h2>
        <div className="prose prose-neutral mt-6 max-w-none text-base leading-loose text-ink-700">
          {isAr ? (
            <>
              <p>بشرة الطفل أرقّ من بشرة البالغ بعدة طبقات، وتفقد الرطوبة بسرعة أكبر وتتأثر بسهولة بالاحتكاك والمواد الكيميائية القوية. لهذا فإن اختيار منتجات الأطفال — من المناديل المبللة إلى الحفاضات — ليس قرارًا تجميليًا بل قرار يخصّ صحة بشرة الرضيع وراحته اليومية.</p>
              <p>تركّز Baby Tawfir على تشكيلة عملية من المناديل المبللة بصيغ مدروسة لعمليات تغيير الحفاض المتكررة وتنظيف اليدين والوجه، بحيث يبقى التنظيف لطيفًا وسريعًا دون الحاجة إلى ماء وصابون في كل مرة. بينما تأتي Bambo كعلامة دانماركية متخصصة في الحفاضات الإيكولوجية المختبَرة دلائلياً للبشرة الحساسة، مع التزام واضح بمعايير الاستدامة والتغليف المسؤول.</p>
              <p>الجمع بين هاتين العلامتين يمنح الأسر روتينًا متكاملًا للعناية بالطفل: حفاضات لطيفة وعالية الامتصاص، ومناديل مبللة للاستخدام اليومي، بحيث تقلّ احتمالات تهيّج البشرة وتزداد ساعات الراحة لكل من الطفل ووالديه. تأتي العبوات بأحجام متعددة تناسب الاستخدام المنزلي والسفر.</p>
              <p>جميع هذه المنتجات متوفرة في الجمهورية اليمنية عبر ركن التوفير كوزمتك للتجارة، ويتم الطلب والاستفسار حصريًا عبر واتساب الأعمال.</p>
            </>
          ) : (
            <>
              <p>Baby skin is several layers thinner than adult skin, loses moisture faster, and reacts more easily to friction and harsh chemicals. Choosing baby care — from wet wipes to diapers — is not a cosmetic decision but one that directly affects a child's skin health and daily comfort.</p>
              <p>Baby Tawfir focuses on a practical wet-wipe range formulated for frequent diaper changes and hand/face cleaning, so cleaning stays gentle and quick without needing soap and water every time. Bambo, in turn, is a Danish brand specialized in eco diapers dermatologically tested for sensitive skin, with a clear commitment to sustainability and responsible packaging.</p>
              <p>Together, both brands give families a complete baby care routine: gentle, highly-absorbent diapers and daily wet wipes — reducing the risk of skin irritation and increasing comfort for both baby and parents. Pack sizes are available for home and travel use.</p>
              <p>All of these products are available in the Republic of Yemen through Rukn Al-Tawfir Cosmetic for Trade, with orders and inquiries handled exclusively via WhatsApp Business.</p>
            </>
          )}
        </div>
      </section>

      <Section slug="baby-tawfir" brandName={babyName} brandData={baby} products={babyProducts} />
      <Section slug="bambo" brandName={bamboName} brandData={bambo} products={bamboProducts} />

      <section className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <div className="hq-eyebrow">{isAr ? "أسئلة شائعة" : "FAQ"}</div>
        <h2 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
          {isAr ? "الأسئلة الشائعة حول منتجات الأطفال" : "Frequently asked questions on baby care"}
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

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="rounded-2xl border border-trust-700/30 bg-trust-700/5 p-6 md:p-8">
          <div className="text-[11px] font-bold tracking-[0.18em] text-trust-700">{isAr ? "مراكز معرفية أخرى" : "Other topic hubs"}</div>
          <h2 className="mt-2 font-arabic text-lg font-bold text-foreground md:text-xl">{isAr ? "صحة العائلة بأكملها" : "Whole-family wellbeing"}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-loose text-ink-700">
            {isAr ? "العناية بالطفل تتكامل مع نمط حياة صحي للعائلة — بدائل سكر صحية، دعم المناعة، وعناية متقدمة بالفم." : "Baby care fits into a wider healthy family lifestyle — healthy sugar alternatives, immunity support, and advanced oral care."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <LLink to="/$lang/sugar-alternatives" className="inline-flex items-center justify-center rounded-full border border-trust-700/40 px-5 py-2.5 text-xs font-semibold text-trust-700">{isAr ? "بدائل السكر" : "Sugar alternatives"}</LLink>
            <LLink to="/$lang/immunity-vitamin-c" className="inline-flex items-center justify-center rounded-full border border-trust-700/40 px-5 py-2.5 text-xs font-semibold text-trust-700">{isAr ? "دعم المناعة وفيتامين C" : "Immunity & Vitamin C"}</LLink>
            <LLink to="/$lang/oral-care" className="inline-flex items-center justify-center rounded-full border border-trust-700/40 px-5 py-2.5 text-xs font-semibold text-trust-700">{isAr ? "العناية بأطقم الأسنان" : "Denture & oral care"}</LLink>
          </div>
        </div>
      </section>

      <StickyWhatsApp number={id.whatsapp_number} />
      <SiteFooter legalName={ident.legalName} parentGroup={ident.parentGroup} whatsappNumber={id.whatsapp_number} email={id.email} address={ident.address} />
    </div>
  );
}
