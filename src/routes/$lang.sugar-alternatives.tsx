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
import { NEWS } from "@/data/news";

const identityQO = queryOptions({
  queryKey: ["corporate-identity"],
  queryFn: () => getCorporateIdentity(),
});
const nocalQO = queryOptions({
  queryKey: ["brand", "nocal"],
  queryFn: () => getBrandBySlug({ data: { slug: "nocal" } }),
});
const steviolaQO = queryOptions({
  queryKey: ["brand", "steviola"],
  queryFn: () => getBrandBySlug({ data: { slug: "steviola" } }),
});
const nocalProductsQO = queryOptions({
  queryKey: ["brand-products", "nocal"],
  queryFn: () => listBrandProducts({ data: { brandSlug: "nocal" } }),
});
const steviolaProductsQO = queryOptions({
  queryKey: ["brand-products", "steviola"],
  queryFn: () => listBrandProducts({ data: { brandSlug: "steviola" } }),
});

const BASE = "https://ruknaltawfer.com";

type FAQ = { q: { ar: string; en: string }; a: { ar: string; en: string } };

const FAQS: FAQ[] = [
  {
    q: {
      ar: "ما هي أفضل بدائل السكر المتوفرة في اليمن؟",
      en: "What are the best sugar alternatives available in Yemen?",
    },
    a: {
      ar: "أفضل بدائل السكر المتوفرة في اليمن عبر ركن التوفير كوزمتك للتجارة هي Steviola (ستيفيولا) المعتمدة على ستيفيا الطبيعية بنسبة 100%، و NO CAL (نوكال) كمحلٍّ منخفض السعرات. كلا الخيارين يأتيان بصيغ عملية (نقط، أقراص، أكياس، أحجام عائلية) تناسب المشروبات الساخنة والباردة والخبز والطهي.",
      en: "The best sugar alternatives available in Yemen through Rukn Al-Tawfir are Steviola, based on 100% natural stevia, and NO CAL, a low-calorie sweetener. Both come in practical formats (drops, tablets, sachets, family-size) for drinks, baking and cooking.",
    },
  },
  {
    q: {
      ar: "هل بدائل السكر آمنة لمرضى السكري؟",
      en: "Are sugar alternatives safe for diabetics?",
    },
    a: {
      ar: "نعم. محليات الستيفيا الطبيعية مثل Steviola لا ترفع مستوى السكر في الدم بشكل ملحوظ، وهي مدرجة ضمن الخيارات المقبولة لمرضى السكري والمتبعين لأنظمة غذائية منخفضة الكربوهيدرات. يفضّل دائمًا قراءة الملصق الغذائي ومراجعة الطبيب المختص في الحالات الخاصة.",
      en: "Yes. Natural stevia sweeteners like Steviola do not meaningfully raise blood sugar and are considered acceptable for diabetics and low-carb diets. Always read the nutrition label and consult a physician for special cases.",
    },
  },
  {
    q: {
      ar: "ما الفرق بين Steviola و NO CAL؟",
      en: "What is the difference between Steviola and NO CAL?",
    },
    a: {
      ar: "Steviola محلٍّ طبيعي بنسبة 100% مستخلص من أوراق نبتة ستيفيا، خالٍ من السعرات الحرارية ومن طعم المرارة. NO CAL محلٍّ منخفض السعرات الحرارية بتركيبة عملية للاستخدام اليومي، متوفر بأحجام عائلية مناسبة للخبز والطهي، وخالٍ من الأسبارتام في الحجم العائلي.",
      en: "Steviola is a 100% natural stevia-based sweetener, zero-calorie and free of bitter aftertaste. NO CAL is a low-calorie sweetener with a practical everyday formula, available in family-size packs suitable for baking and cooking, and aspartame-free in the family size.",
    },
  },
  {
    q: {
      ar: "هل تحتوي بدائل السكر على أسبارتام؟",
      en: "Do sugar alternatives contain aspartame?",
    },
    a: {
      ar: "محليات Steviola طبيعية بالكامل وخالية من الأسبارتام. أما NO CAL في الحجم العائلي فهو أيضًا خالٍ من الأسبارتام. ننصح دائمًا بقراءة قائمة المكونات على العبوة لتأكيد التركيبة المناسبة لاحتياجك.",
      en: "Steviola sweeteners are fully natural and aspartame-free. NO CAL family-size is also aspartame-free. We always recommend reading the ingredient list on the pack to confirm the formula that fits your needs.",
    },
  },
  {
    q: {
      ar: "هل يمكن استخدام بدائل السكر في الخبز والطهي؟",
      en: "Can sugar alternatives be used for baking and cooking?",
    },
    a: {
      ar: "نعم. الأحجام العائلية من Steviola و NO CAL مصمّمة خصيصًا للخبز والطهي وتُحافظ على ثباتها الحراري في درجات الحرارة العالية، وتمنح المذاق الحلو دون السعرات الحرارية للسكر التقليدي.",
      en: "Yes. The family-size Steviola and NO CAL packs are designed specifically for baking and cooking, are heat-stable at high temperatures, and deliver sweetness without the calories of regular sugar.",
    },
  },
  {
    q: {
      ar: "كيف أطلب بدائل السكر في اليمن؟",
      en: "How do I order sugar alternatives in Yemen?",
    },
    a: {
      ar: "جميع الطلبات والاستفسارات تتم حصريًا عبر واتساب الأعمال على الرقم +967 774040383. ركن التوفير كوزمتك للتجارة هو الوكيل الحصري في الجمهورية اليمنية لعلامتي Steviola و NO CAL وعدد من العلامات الصحية العالمية.",
      en: "All orders and inquiries are handled exclusively via WhatsApp Business at +967 774040383. Rukn Al-Tawfir Cosmetic for Trade is the exclusive agent in the Republic of Yemen for Steviola, NO CAL and several international health brands.",
    },
  },
  {
    q: {
      ar: "ما هي ستيفيا وما مصدرها؟",
      en: "What is stevia and where does it come from?",
    },
    a: {
      ar: "ستيفيا (Stevia rebaudiana) نبتة طبيعية تُستخلص من أوراقها مركبات حلوة (الستيفيوسيد والريباوديوسيد) تبلغ حلاوتها أضعاف حلاوة السكر العادي مع صفر سعرات حرارية تقريبًا، ولا ترفع مؤشر السكر في الدم.",
      en: "Stevia (Stevia rebaudiana) is a natural plant whose leaves yield sweet compounds (stevioside and rebaudioside) that are many times sweeter than regular sugar, with near-zero calories and no meaningful blood-sugar impact.",
    },
  },
  {
    q: {
      ar: "هل بدائل السكر مناسبة للأطفال؟",
      en: "Are sugar alternatives suitable for children?",
    },
    a: {
      ar: "يمكن استخدامها بكميات معتدلة ضمن نظام غذائي متوازن للأطفال فوق سن معينة، مع الالتزام بالكميات الموصى بها على العبوة. ننصح بمراجعة طبيب الأطفال لتحديد الكميات المناسبة لكل عمر.",
      en: "They can be used in moderation as part of a balanced diet for children above a certain age, sticking to the serving sizes on the pack. We recommend consulting a pediatrician to determine age-appropriate amounts.",
    },
  },
  {
    q: {
      ar: "ما هو أفضل بديل للسكر في اليمن لمتّبعي حمية الكيتو؟",
      en: "What is the best sugar substitute in Yemen for keto dieters?",
    },
    a: {
      ar: "Steviola هو الخيار الأول لمتّبعي حمية الكيتو لأنه طبيعي 100%، صفر سعرات، ولا يرفع مستوى الإنسولين. أما NO CAL فيُعدّ بديلًا منخفض الكربوهيدرات يدعم نمط الكيتو، خاصةً في الحجم العائلي للخبز والطهي.",
      en: "Steviola is the first choice for keto dieters because it is 100% natural, zero-calorie, and does not spike insulin. NO CAL is a low-carb alternative that supports keto, especially the family-size pack for baking and cooking.",
    },
  },
  {
    q: {
      ar: "هل ستيفيا تسبب ارتفاع ضغط الدم؟",
      en: "Does stevia raise blood pressure?",
    },
    a: {
      ar: "على العكس، تشير الدراسات السريرية إلى أن ستيفيا قد تساهم في خفض ضغط الدم بشكل طفيف لدى بعض الأشخاص. تبقى الاستشارة الطبية ضرورية لمن يتناولون أدوية ضغط الدم.",
      en: "On the contrary, clinical studies suggest stevia may help slightly lower blood pressure in some people. Medical consultation remains essential for those taking blood pressure medication.",
    },
  },
  {
    q: {
      ar: "هل يمكن استخدام Steviola و NO CAL أثناء الحمل والرضاعة؟",
      en: "Can Steviola and NO CAL be used during pregnancy and breastfeeding?",
    },
    a: {
      ar: "تُعتبر مستخلصات الستيفيا النقية (الموجودة في Steviola) ضمن قائمة GRAS الآمنة عمومًا. مع ذلك، نوصي بالاعتدال واستشارة الطبيب أو أخصائي التغذية خلال الحمل والرضاعة.",
      en: "Pure stevia extracts (in Steviola) are on the GRAS list of generally recognized as safe ingredients. Still, we recommend moderation and consulting a doctor or dietitian during pregnancy and breastfeeding.",
    },
  },
  {
    q: {
      ar: "هل بدائل السكر تساعد في إنقاص الوزن؟",
      en: "Do sugar alternatives help with weight loss?",
    },
    a: {
      ar: "نعم، استبدال السكر التقليدي ببدائل خالية أو منخفضة السعرات مثل Steviola و NO CAL يقلّل السعرات اليومية، وعند دمجه مع نظام غذائي متوازن ونشاط بدني منتظم يدعم خسارة الوزن.",
      en: "Yes. Swapping regular sugar for zero or low-calorie alternatives like Steviola and NO CAL reduces daily calorie intake, and when combined with a balanced diet and regular exercise it supports weight loss.",
    },
  },
];

export const Route = createFileRoute("/$lang/sugar-alternatives")({
  head: ({ params }) => {
    const isAr = params.lang === "ar";
    const url = `${BASE}/${params.lang}/sugar-alternatives`;
    const title = isAr
      ? "بدائل السكر في اليمن — Steviola و NO CAL | ركن التوفير"
      : "Sugar Alternatives in Yemen — Steviola & NO CAL | Rukn Al-Tawfir";
    const desc = isAr
      ? "الدليل الشامل لبدائل السكر الصحية في اليمن: ستيفيا الطبيعية، محليات خالية من السعرات، خيارات لمرضى السكري. تعرّف على Steviola و NO CAL من ركن التوفير كوزمتك للتجارة."
      : "The comprehensive guide to healthy sugar alternatives in Yemen: natural stevia, zero-calorie sweeteners, diabetic-friendly options. Discover Steviola and NO CAL from Rukn Al-Tawfir.";

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: isAr ? "الرئيسية" : "Home", item: `${BASE}/${params.lang}` },
        { "@type": "ListItem", position: 2, name: isAr ? "بدائل السكر" : "Sugar Alternatives", item: url },
      ],
    };

    const webpage = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": url,
      url,
      name: title,
      description: desc,
      inLanguage: isAr ? "ar" : "en",
      isPartOf: { "@type": "WebSite", name: "Rukn Al-Tawfir", url: BASE },
      about: [
        { "@type": "Thing", name: isAr ? "بدائل السكر" : "Sugar substitutes" },
        { "@type": "Thing", name: isAr ? "ستيفيا" : "Stevia" },
        { "@type": "Thing", name: isAr ? "محليات طبيعية" : "Natural sweeteners" },
        { "@type": "Thing", name: isAr ? "محليات لمرضى السكري" : "Diabetic-friendly sweeteners" },
      ],
      mentions: [
        { "@type": "Brand", name: "Steviola", url: `${BASE}/${params.lang}/brands/steviola` },
        { "@type": "Brand", name: "NO CAL", url: `${BASE}/${params.lang}/brands/nocal` },
        { "@type": "Organization", name: "Rukn Al-Tawfir Cosmetic for Trade", url: BASE },
      ],
      primaryImageOfPage: { "@type": "ImageObject", url: `${BASE}/og-default.jpg` },
    };

    const itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: isAr ? "أفضل بدائل السكر في اليمن" : "Best sugar alternatives in Yemen",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@type": "Brand",
            name: "Steviola",
            description: isAr ? "محليات ستيفيا طبيعية 100% خالية من السعرات." : "100% natural stevia sweeteners, zero calories.",
            url: `${BASE}/${params.lang}/brands/steviola`,
          },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@type": "Brand",
            name: "NO CAL",
            description: isAr ? "محلٍّ منخفض السعرات، آمن لمرضى السكري." : "Low-calorie sweetener, safe for diabetics.",
            url: `${BASE}/${params.lang}/brands/nocal`,
          },
        },
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
            ? "بدائل السكر, بديل السكر, محليات صحية, محليات طبيعية, ستيفيا, ستيفيولا, نوكال, Steviola, NO CAL, محلي لمرضى السكري, بدائل السكر في اليمن, محليات بدون أسبارتام, سكر دايت"
            : "sugar alternatives, sugar substitutes, natural sweeteners, stevia, Steviola, NO CAL, diabetic sweeteners, Yemen",
        },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:locale", content: isAr ? "ar_YE" : "en_US" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [
        { rel: "canonical", href: url },
        { rel: "alternate", hreflang: "ar", href: `${BASE}/ar/sugar-alternatives` },
        { rel: "alternate", hreflang: "en", href: `${BASE}/en/sugar-alternatives` },
        { rel: "alternate", hreflang: "x-default", href: `${BASE}/ar/sugar-alternatives` },
      ],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(breadcrumb) },
        { type: "application/ld+json", children: JSON.stringify(webpage) },
        { type: "application/ld+json", children: JSON.stringify(itemList) },
        { type: "application/ld+json", children: JSON.stringify(faq) },
      ],
    };
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(nocalQO),
      context.queryClient.ensureQueryData(steviolaQO),
      context.queryClient.ensureQueryData(nocalProductsQO),
      context.queryClient.ensureQueryData(steviolaProductsQO),
    ]);
  },
  component: SugarAlternativesHub,
});

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="hq-eyebrow">{eyebrow}</div>
      <h2 className="mt-3 font-arabic text-3xl font-bold leading-tight text-foreground md:text-4xl">{title}</h2>
      <div className="mt-4 h-px w-16 prem-divider" />
    </div>
  );
}

function SugarAlternativesHub() {
  const { lang } = useLocale();
  const isAr = lang === "ar";
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: nocal } = useSuspenseQuery(nocalQO);
  const { data: steviola } = useSuspenseQuery(steviolaQO);
  const { data: nocalProducts } = useSuspenseQuery(nocalProductsQO);
  const { data: steviolaProducts } = useSuspenseQuery(steviolaProductsQO);
  const ident = useLocalizedIdentity(id);

  const relatedArticles = NEWS.filter((n) =>
    ["natural-sweeteners-daily-health"].includes(n.slug),
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        legalName={ident.legalName}
        parentGroup={ident.parentGroup}
        whatsappNumber={id.whatsapp_number}
        logoUrl={id.logo_url}
      />

      {/* Breadcrumb */}
      <nav aria-label={isAr ? "مسار التنقل" : "Breadcrumb"} className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-ink-600">
          <li>
            <LLink to="/$lang" className="hover:text-trust-700">
              {isAr ? "الرئيسية" : "Home"}
            </LLink>
          </li>
          <li aria-hidden>›</li>
          <li className="font-semibold text-foreground">{isAr ? "بدائل السكر" : "Sugar alternatives"}</li>
        </ol>
      </nav>

      {/* HERO */}
      <section className="cinema-hero relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="hq-eyebrow">{isAr ? "الدليل المرجعي" : "Authority guide"}</div>
          <h1 className="mt-3 font-arabic text-4xl font-bold leading-[1.1] text-foreground md:text-6xl">
            {isAr ? (
              <>
                بدائل السكر في اليمن <span className="text-trust-700">— الدليل الشامل</span>
              </>
            ) : (
              <>
                Sugar Alternatives in Yemen <span className="text-trust-700">— The Complete Guide</span>
              </>
            )}
          </h1>
          <div className="mt-6 h-px w-28 prem-divider" />
          <p className="mt-6 max-w-3xl text-base leading-loose text-ink-600 md:text-lg">
            {isAr
              ? "مرجع ركن التوفير كوزمتك للتجارة لكل ما يخصّ بدائل السكر الصحية والمحليات الطبيعية في اليمن. نشرح الفروق بين السكر والمحليات، ونقدّم خيارات Steviola (ستيفيولا) و NO CAL (نوكال) الموثوقة لمرضى السكري ومتّبعي الحميات، مع إجابات عملية لأكثر الأسئلة شيوعًا."
              : "Rukn Al-Tawfir's authoritative reference for healthy sugar alternatives and natural sweeteners in Yemen. We explain the difference between sugar and sweeteners, present the trusted Steviola and NO CAL options for diabetics and dieters, and answer the most common practical questions."}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppCTA
              number={id.whatsapp_number}
              message={
                isAr
                  ? "السلام عليكم، أرغب بالاستفسار عن بدائل السكر المتوفرة (Steviola / NO CAL)."
                  : "Hello, I'd like to inquire about your sugar alternatives (Steviola / NO CAL)."
              }
            >
              {isAr ? "تواصل عبر واتساب" : "Inquire on WhatsApp"}
            </WhatsAppCTA>
            <LLink
              to="/$lang/brands/$slug"
              params={{ slug: "steviola" }}
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-trust-700 hover:text-trust-700"
            >
              {isAr ? "تصفّح Steviola" : "Explore Steviola"}
            </LLink>
            <LLink
              to="/$lang/brands/$slug"
              params={{ slug: "nocal" }}
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-trust-700 hover:text-trust-700"
            >
              {isAr ? "تصفّح NO CAL" : "Explore NO CAL"}
            </LLink>
          </div>
        </div>
      </section>

      {/* TABLE OF CONTENTS */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="prem-card p-6 md:p-8">
          <h2 className="font-arabic text-lg font-bold text-foreground">
            {isAr ? "محتويات الدليل" : "On this page"}
          </h2>
          <ol className="mt-4 grid gap-2 text-sm text-ink-700 md:grid-cols-2">
            {[
              ["what", isAr ? "ما هي بدائل السكر؟" : "What are sugar alternatives?"],
              ["diff", isAr ? "الفرق بين السكر والمحليات" : "Sugar vs. sweeteners"],
              ["stevia", isAr ? "ستيفيا — المحلي الطبيعي" : "Stevia — the natural sweetener"],
              ["steviola", isAr ? "Steviola (ستيفيولا)" : "Steviola"],
              ["nocal", isAr ? "NO CAL (نوكال)" : "NO CAL"],
              ["yemen", isAr ? "بدائل السكر في اليمن" : "Sugar alternatives in Yemen"],
              ["articles", isAr ? "مقالات ذات صلة" : "Related articles"],
              ["faq", isAr ? "الأسئلة الشائعة" : "Frequently asked questions"],
            ].map(([id2, label]) => (
              <li key={id2}>
                <a href={`#${id2}`} className="text-trust-700 hover:underline">
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* WHAT */}
      <section id="what" className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <SectionHeading
          eyebrow={isAr ? "تعريف" : "Definition"}
          title={isAr ? "ما هي بدائل السكر؟" : "What are sugar alternatives?"}
        />
        <div className="prose prose-neutral mt-6 max-w-none text-base leading-loose text-ink-700">
          <p>
            {isAr
              ? "بدائل السكر هي مواد تمنح المذاق الحلو دون أن تحمل السعرات الحرارية العالية للسكر التقليدي (السكروز). تنقسم إلى محليات طبيعية مستخلصة من النباتات مثل الستيفيا، ومحليات منخفضة السعرات مصمّمة لتقديم خيار يومي عملي لمن يرغب في خفض استهلاك السكر، أو لمرضى السكري الذين يحتاجون إلى ضبط مؤشر السكر في الدم."
              : "Sugar alternatives are substances that provide a sweet taste without the high calories of regular sugar (sucrose). They include natural sweeteners extracted from plants — such as stevia — and low-calorie sweeteners designed for daily use by those reducing sugar intake or by diabetics who need to manage blood-sugar response."}
          </p>
          <p>
            {isAr
              ? "في اليمن، يتنامى الطلب على البدائل الصحية مع تزايد الوعي بالأنماط الغذائية المتوازنة. توفّر ركن التوفير كوزمتك للتجارة، الوكيل الحصري في الجمهورية اليمنية لعدد من العلامات العالمية، خيارات موثوقة مفحوصة بمواصفات دولية."
              : "Demand for healthy alternatives is growing in Yemen with rising awareness of balanced eating. Rukn Al-Tawfir Cosmetic for Trade — exclusive agent in Yemen for several international brands — provides trusted, internationally compliant options."}
          </p>
        </div>
      </section>

      {/* DIFFERENCE */}
      <section id="diff" className="border-y border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-14 md:px-8 md:py-20">
          <SectionHeading
            eyebrow={isAr ? "مقارنة" : "Comparison"}
            title={isAr ? "الفرق بين السكر التقليدي والمحليات الصحية" : "Regular sugar vs. healthy sweeteners"}
          />
          <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-background">
            <table className="w-full min-w-[640px] text-start text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-ink-600">
                <tr>
                  <th className="px-4 py-3 text-start">{isAr ? "المعيار" : "Criterion"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "السكر التقليدي" : "Regular sugar"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "المحليات الطبيعية" : "Natural sweeteners"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink-700">
                {[
                  [isAr ? "السعرات الحرارية" : "Calories", isAr ? "~387 سعرة / 100 جم" : "~387 kcal / 100 g", isAr ? "≈ 0 سعرة" : "≈ 0 kcal"],
                  [isAr ? "مؤشر السكر" : "Glycemic index", isAr ? "65 (مرتفع)" : "65 (high)", isAr ? "0 (لا يرفع السكر)" : "0 (no blood-sugar spike)"],
                  [isAr ? "مناسب لمرضى السكري" : "Diabetic-friendly", isAr ? "لا" : "No", isAr ? "نعم" : "Yes"],
                  [isAr ? "ملائم للحميات" : "Diet-friendly", isAr ? "لا" : "No", isAr ? "نعم" : "Yes"],
                  [isAr ? "الثبات الحراري" : "Heat-stable", isAr ? "نعم" : "Yes", isAr ? "نعم" : "Yes"],
                ].map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (
                      <td key={i} className={`px-4 py-3 ${i === 0 ? "font-semibold text-foreground" : ""}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* STEVIA */}
      <section id="stevia" className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <SectionHeading
          eyebrow={isAr ? "النبتة" : "The plant"}
          title={isAr ? "ستيفيا — المحلي الطبيعي الأول عالميًا" : "Stevia — the world's leading natural sweetener"}
        />
        <div className="prose prose-neutral mt-6 max-w-none text-base leading-loose text-ink-700">
          <p>
            {isAr
              ? "ستيفيا (Stevia rebaudiana) نبتة جنوب أمريكية تُستخلص من أوراقها مركّبات حلوة (الستيفيوسيد والريباوديوسيد) تصل حلاوتها إلى 200–300 ضعف حلاوة السكر العادي مع صفر سعرات حرارية تقريبًا. اعتُمدت ستيفيا من قِبل هيئات صحية دولية، واستُخدمت لعقود في اليابان وأمريكا الجنوبية قبل انتشارها عالميًا."
              : "Stevia (Stevia rebaudiana) is a South American plant whose leaves yield sweet compounds (stevioside and rebaudioside) up to 200–300 times sweeter than regular sugar, with near-zero calories. Stevia has been approved by international health authorities and used for decades in Japan and South America before its global expansion."}
          </p>
          <h3 className="font-arabic text-xl font-bold text-foreground">
            {isAr ? "أبرز استخدامات ستيفيا" : "Key uses of stevia"}
          </h3>
          <ul>
            <li>{isAr ? "تحلية المشروبات الساخنة (الشاي، القهوة، الأعشاب)." : "Sweetening hot drinks (tea, coffee, herbal infusions)."}</li>
            <li>{isAr ? "تحلية العصائر والمشروبات الباردة." : "Sweetening juices and cold beverages."}</li>
            <li>{isAr ? "الخبز والحلويات بأحجام عائلية مخصصة للطهي." : "Baking and desserts using family-size cooking packs."}</li>
            <li>{isAr ? "حمية مرضى السكري والحميات منخفضة الكربوهيدرات." : "Diabetic diets and low-carb meal plans."}</li>
          </ul>
        </div>
      </section>

      {/* STEVIOLA */}
      <section id="steviola" className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20">
          <SectionHeading
            eyebrow={isAr ? "العلامة" : "Brand"}
            title={isAr ? "Steviola (ستيفيولا) — ستيفيا طبيعية 100%" : "Steviola — 100% natural stevia"}
          />
          <div className="mt-8 grid gap-8 md:grid-cols-[1fr,1.4fr]">
            {steviola?.logo_url && (
              <div className="podium grid aspect-square place-items-center p-8">
                <img src={steviola.logo_url} alt="Steviola" className="max-h-32 w-auto" />
              </div>
            )}
            <div className="text-base leading-loose text-ink-700">
              <p>
                {isAr
                  ? "Steviola هي علامة محليات الستيفيا الطبيعية المعتمدة بنسبة 100%، تأتي بصيغ عملية (نقط، أقراص، أكياس وحجم عائلي للخبز والطهي). خالية من السعرات، خالية من الأسبارتام، بدون طعم مرارة، ومثالية لمرضى السكري ومتّبعي الحميات."
                  : "Steviola is the 100% natural stevia-based sweetener brand, available in practical formats (drops, tablets, sachets and family-size for baking and cooking). Zero-calorie, aspartame-free, no bitter aftertaste, and ideal for diabetics and dieters."}
              </p>
              <ul className="mt-4 list-disc ps-5">
                <li>{isAr ? "100% ستيفيا طبيعية" : "100% natural stevia"}</li>
                <li>{isAr ? "صفر سعرات حرارية" : "Zero calories"}</li>
                <li>{isAr ? "خالٍ من الأسبارتام" : "Aspartame-free"}</li>
                <li>{isAr ? "مناسب لمرضى السكري" : "Diabetic-friendly"}</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <LLink
                  to="/$lang/brands/$slug"
                  params={{ slug: "steviola" }}
                  className="inline-flex items-center justify-center rounded-full bg-trust-700 px-5 py-2.5 text-xs font-semibold text-white"
                >
                  {isAr ? "صفحة Steviola الكاملة" : "Full Steviola page"}
                </LLink>
              </div>
            </div>
          </div>

          {steviolaProducts.length > 0 && (
            <div className="mt-10">
              <h3 className="font-arabic text-xl font-bold text-foreground">
                {isAr ? "منتجات Steviola" : "Steviola products"}
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {steviolaProducts.map((p) => (
                  <LLink
                    key={p.id}
                    to="/$lang/brands/$slug/$productSlug"
                    params={{ slug: "steviola", productSlug: p.slug }}
                    className="prem-card group flex gap-3 p-3 transition-transform hover:-translate-y-0.5"
                  >
                    {p.cover_url && (
                      <img src={p.cover_url} alt={p.name_ar} loading="lazy" className="size-20 shrink-0 rounded-xl bg-muted object-contain p-1" />
                    )}
                    <div className="min-w-0">
                      <div className="font-arabic text-sm font-bold text-foreground">{isAr ? p.name_ar : p.name_en}</div>
                      {p.short_description_ar && (
                        <p className="mt-1 line-clamp-2 text-xs text-ink-600">{p.short_description_ar}</p>
                      )}
                    </div>
                  </LLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* NOCAL */}
      <section id="nocal" className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20">
        <SectionHeading
          eyebrow={isAr ? "العلامة" : "Brand"}
          title={isAr ? "NO CAL (نوكال) — محلٍّ منخفض السعرات" : "NO CAL — low-calorie sweetener"}
        />
        <div className="mt-8 grid gap-8 md:grid-cols-[1.4fr,1fr]">
          <div className="text-base leading-loose text-ink-700">
            <p>
              {isAr
                ? "NO CAL محلٍّ منخفض السعرات الحرارية بتركيبة عملية للاستخدام اليومي. متوفر بأحجام عائلية مناسبة للخبز والطهي، وخالٍ من الأسبارتام في الحجم العائلي، وآمن لمرضى السكري ضمن نظام غذائي متوازن."
                : "NO CAL is a low-calorie sweetener with a practical everyday formula. Available in family-size packs suitable for baking and cooking, aspartame-free in the family size, and safe for diabetics as part of a balanced diet."}
            </p>
            <ul className="mt-4 list-disc ps-5">
              <li>{isAr ? "تركيبة عملية للاستخدام اليومي" : "Practical everyday formula"}</li>
              <li>{isAr ? "حجم عائلي للخبز والطهي" : "Family-size for baking & cooking"}</li>
              <li>{isAr ? "خالٍ من الأسبارتام (الحجم العائلي)" : "Aspartame-free (family size)"}</li>
              <li>{isAr ? "آمن لمرضى السكري" : "Safe for diabetics"}</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <LLink
                to="/$lang/brands/$slug"
                params={{ slug: "nocal" }}
                className="inline-flex items-center justify-center rounded-full bg-trust-700 px-5 py-2.5 text-xs font-semibold text-white"
              >
                {isAr ? "صفحة NO CAL الكاملة" : "Full NO CAL page"}
              </LLink>
            </div>
          </div>
          {nocal?.logo_url && (
            <div className="podium grid aspect-square place-items-center p-8">
              <img src={nocal.logo_url} alt="NO CAL" className="max-h-32 w-auto" />
            </div>
          )}
        </div>

        {nocalProducts.length > 0 && (
          <div className="mt-10">
            <h3 className="font-arabic text-xl font-bold text-foreground">
              {isAr ? "منتجات NO CAL" : "NO CAL products"}
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nocalProducts.map((p) => (
                <LLink
                  key={p.id}
                  to="/$lang/brands/$slug/$productSlug"
                  params={{ slug: "nocal", productSlug: p.slug }}
                  className="prem-card group flex gap-3 p-3 transition-transform hover:-translate-y-0.5"
                >
                  {p.cover_url && (
                    <img src={p.cover_url} alt={p.name_ar} loading="lazy" className="size-20 shrink-0 rounded-xl bg-muted object-contain p-1" />
                  )}
                  <div className="min-w-0">
                    <div className="font-arabic text-sm font-bold text-foreground">{isAr ? p.name_ar : p.name_en}</div>
                    {p.short_description_ar && (
                      <p className="mt-1 line-clamp-2 text-xs text-ink-600">{p.short_description_ar}</p>
                    )}
                  </div>
                </LLink>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* YEMEN INTENT */}
      <section id="yemen" className="border-y border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-14 md:px-8 md:py-20">
          <SectionHeading
            eyebrow={isAr ? "السوق اليمني" : "Yemen market"}
            title={isAr ? "بدائل السكر في اليمن: لماذا تختار ركن التوفير؟" : "Sugar alternatives in Yemen: why choose Rukn Al-Tawfir?"}
          />
          <div className="prose prose-neutral mt-6 max-w-none text-base leading-loose text-ink-700">
            <p>
              {isAr
                ? "ركن التوفير كوزمتك للتجارة هو الوكيل الحصري في الجمهورية اليمنية لعلامتي Steviola و NO CAL، إضافة إلى منظومة من العلامات الصحية والاستهلاكية العالمية. يضمن هذا التمثيل الحصري وصول منتجات أصلية بمواصفات مطابقة، عبر قنوات توزيع موثوقة في المحافظات الرئيسية."
                : "Rukn Al-Tawfir Cosmetic for Trade is the exclusive agent in Yemen for both Steviola and NO CAL, alongside a portfolio of international health and consumer brands. This exclusive representation ensures authentic, spec-compliant products are delivered through trusted distribution channels across major governorates."}
            </p>
            <ul>
              <li>{isAr ? "وكيل حصري مرخّص في الجمهورية اليمنية." : "Licensed exclusive agent in the Republic of Yemen."}</li>
              <li>{isAr ? "منتجات أصلية بضمان العلامة." : "Authentic products with brand-backed guarantee."}</li>
              <li>{isAr ? "قنوات توزيع للجملة والتجزئة." : "Wholesale and retail distribution channels."}</li>
              <li>{isAr ? "خدمة استفسار وطلب مباشرة عبر واتساب الأعمال." : "Direct inquiry & order service via WhatsApp Business."}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* RELATED ARTICLES */}
      <section id="articles" className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20">
        <SectionHeading
          eyebrow={isAr ? "اقرأ المزيد" : "Read more"}
          title={isAr ? "مقالات ذات صلة" : "Related articles"}
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {relatedArticles.map((n) => (
            <LLink
              key={n.slug}
              to="/$lang/news/$slug"
              params={{ slug: n.slug }}
              className="prem-card group overflow-hidden"
            >
              {n.cover && (
                <img src={n.cover} alt={n.title[isAr ? "ar" : "en"]} loading="lazy" className="block aspect-[16/9] w-full object-cover" />
              )}
              <div className="p-5">
                <div className="text-[11px] font-bold tracking-[0.18em] text-trust-700">
                  {n.eyebrow[isAr ? "ar" : "en"]}
                </div>
                <h3 className="mt-2 font-arabic text-lg font-bold text-foreground group-hover:text-trust-700">
                  {n.title[isAr ? "ar" : "en"]}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{n.excerpt[isAr ? "ar" : "en"]}</p>
              </div>
            </LLink>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-y border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-14 md:px-8 md:py-20">
          <SectionHeading
            eyebrow={isAr ? "الأسئلة الشائعة" : "FAQ"}
            title={isAr ? "أسئلة يطرحها العملاء حول بدائل السكر" : "Common customer questions about sugar alternatives"}
          />
          <div className="mt-8 space-y-3">
            {FAQS.map((f, i) => (
              <details key={i} className="prem-card group p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-start justify-between gap-4">
                  <h3 className="font-arabic text-base font-bold text-foreground group-open:text-trust-700">
                    {f.q[isAr ? "ar" : "en"]}
                  </h3>
                  <span aria-hidden className="mt-1 text-trust-700 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-sm leading-loose text-ink-700">{f.a[isAr ? "ar" : "en"]}</p>
              </details>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-background p-6 md:p-8">
            <h3 className="font-arabic text-lg font-bold text-foreground">
              {isAr ? "روابط مفيدة" : "Useful links"}
            </h3>
            <ul className="mt-3 grid gap-2 text-sm text-trust-700 md:grid-cols-2">
              <li>
                <LLink to="/$lang/brands/$slug" params={{ slug: "steviola" }} className="hover:underline">
                  ← {isAr ? "صفحة علامة Steviola" : "Steviola brand page"}
                </LLink>
              </li>
              <li>
                <LLink to="/$lang/brands/$slug" params={{ slug: "nocal" }} className="hover:underline">
                  ← {isAr ? "صفحة علامة NO CAL" : "NO CAL brand page"}
                </LLink>
              </li>
              <li>
                <LLink to="/$lang/brands" className="hover:underline">
                  ← {isAr ? "كل العلامات التجارية" : "All brands"}
                </LLink>
              </li>
              <li>
                <LLink to="/$lang/catalogs" className="hover:underline">
                  ← {isAr ? "الكتالوجات الرسمية" : "Official catalogs"}
                </LLink>
              </li>
              <li>
                <LLink to="/$lang/about" className="hover:underline">
                  ← {isAr ? "من نحن" : "About Rukn Al-Tawfir"}
                </LLink>
              </li>
              <li>
                <LLink to="/$lang/contact" className="hover:underline">
                  ← {isAr ? "تواصل معنا" : "Contact us"}
                </LLink>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center md:px-8">
        <h2 className="font-arabic text-3xl font-bold text-foreground md:text-4xl">
          {isAr ? "جاهز للتحوّل إلى بديل صحي للسكر؟" : "Ready to switch to a healthy sugar alternative?"}
        </h2>
        <p className="mt-4 text-ink-600">
          {isAr
            ? "تواصل مع فريق ركن التوفير عبر واتساب الأعمال للاستفسار عن المنتجات والأسعار والتوفّر."
            : "Talk to the Rukn Al-Tawfir team on WhatsApp Business for products, pricing and availability."}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <WhatsAppCTA number={id.whatsapp_number}>
            {isAr ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
          </WhatsAppCTA>
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
