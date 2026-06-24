import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCorporateIdentity } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";
import { StickyWhatsApp } from "@/components/site/StickyWhatsApp";
import { LLink } from "@/i18n/LLink";
import { useLocale } from "@/i18n/LocaleProvider";
import { useLocalizedIdentity } from "@/i18n/identity";
import { getNewsBySlug, NEWS } from "@/data/news";

const identityQO = queryOptions({
  queryKey: ["corporate-identity"],
  queryFn: () => getCorporateIdentity(),
});

type RelatedMap = {
  brands: { slug: string; ar: string; en: string }[];
  topics: { href: "/$lang/sugar-alternatives"; ar: string; en: string }[];
  articles: string[];
};

const ARTICLE_RELATIONS: Record<string, RelatedMap> = {
  "natural-sweeteners-daily-health": {
    brands: [
      { slug: "steviola", ar: "ستيفيولا", en: "Steviola" },
      { slug: "nocal", ar: "نو كال", en: "NO CAL" },
    ],
    topics: [{ href: "/$lang/sugar-alternatives", ar: "دليل بدائل السكر", en: "Sugar alternatives hub" }],
    articles: ["vitamin-c-immunity-energy", "daily-dental-care-routine"],
  },
  "vitamin-c-immunity-energy": {
    brands: [
      { slug: "monivo", ar: "مونيفو", en: "Monivo" },
      { slug: "isis", ar: "ايزيس", en: "iSiS" },
      { slug: "sekem", ar: "سيكم", en: "SEKEM" },
    ],
    topics: [],
    articles: ["natural-sweeteners-daily-health", "daily-dental-care-routine"],
  },
  "daily-dental-care-routine": {
    brands: [{ slug: "y-kelin", ar: "واي كيلين", en: "Y-Kelin" }],
    topics: [],
    articles: ["vitamin-c-immunity-energy", "natural-sweeteners-daily-health"],
  },
};

const ARTICLE_TOPIC_KEYWORDS: Record<string, string[]> = {
  "natural-sweeteners-daily-health": ["بدائل السكر", "المحليات الطبيعية", "ستيفيا", "منتجات مرضى السكري", "Sugar alternatives", "Natural sweeteners", "Stevia"],
  "vitamin-c-immunity-energy": ["فيتامين C", "دعم المناعة", "الحياة الصحية", "مكملات غذائية", "Vitamin C", "Immunity support", "Healthy lifestyle"],
  "daily-dental-care-routine": ["العناية بالفم والأسنان", "صحة الأسنان", "Oral care", "Dental care"],
};

export const Route = createFileRoute("/$lang/news/$slug")({
  head: ({ params }) => {
    const item = getNewsBySlug(params.slug);
    const isAr = params.lang === "ar";
    if (!item) {
      return {
        meta: [{ title: isAr ? "خبر غير موجود" : "News not found" }],
      };
    }
    const title = item.title[isAr ? "ar" : "en"];
    const desc = item.excerpt[isAr ? "ar" : "en"];
    const url = `https://ruknaltawfer.com/${params.lang}/news/${item.slug}`;
    const rel = ARTICLE_RELATIONS[item.slug];
    const aboutEntities = [
      ...(rel?.brands.map((b) => ({
        "@type": "Brand",
        "@id": `https://ruknaltawfer.com/${params.lang}/brands/${b.slug}#brand`,
        name: isAr ? b.ar : b.en,
        url: `https://ruknaltawfer.com/${params.lang}/brands/${b.slug}`,
      })) ?? []),
      ...((ARTICLE_TOPIC_KEYWORDS[item.slug] ?? []).map((name) => ({
        "@type": "Thing",
        name,
      }))),
    ];
    return {
      meta: [
        { title: `${title} — ${isAr ? "ركن التوفير" : "Rukn Al-Tawfir"}` },
        { name: "description", content: desc },
        { name: "keywords", content: (ARTICLE_TOPIC_KEYWORDS[item.slug] ?? []).join(", ") },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:image", content: item.cover },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "article:published_time", content: item.date },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: item.cover },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: isAr ? "الرئيسية" : "Home", item: `https://ruknaltawfer.com/${params.lang}` },
                  { "@type": "ListItem", position: 2, name: isAr ? "المعرفة" : "News", item: `https://ruknaltawfer.com/${params.lang}` },
                  { "@type": "ListItem", position: 3, name: title, item: url },
                ],
              },
              {
                "@type": "Article",
                "@id": `${url}#article`,
                headline: title,
                description: desc,
                image: item.cover,
                datePublished: item.date,
                dateModified: item.date,
                inLanguage: isAr ? "ar" : "en",
                mainEntityOfPage: url,
                author: { "@id": "https://ruknaltawfer.com/#organization" },
                publisher: { "@id": "https://ruknaltawfer.com/#organization" },
                isPartOf: { "@id": "https://ruknaltawfer.com/#website" },
                about: aboutEntities,
                keywords: ARTICLE_TOPIC_KEYWORDS[item.slug] ?? [],
              },
            ],
          }),
        },
      ],
    };
  },
  loader: async ({ context, params }) => {
    if (!getNewsBySlug(params.slug)) throw notFound();
    await context.queryClient.ensureQueryData(identityQO);
  },
  component: NewsArticle,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-arabic text-3xl font-bold">404</h1>
    </div>
  ),
  errorComponent: ({ error }) => {
    if (typeof console !== "undefined") console.error("[news] load failed", error);
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="text-sm text-ink-600">تعذّر تحميل المحتوى. يرجى المحاولة لاحقًا.</p>
      </div>
    );
  },
});

function NewsArticle() {
  const { slug } = Route.useParams();
  const { lang, t } = useLocale();
  const isAr = lang === "ar";
  const { data: id } = useSuspenseQuery(identityQO);
  const ident = useLocalizedIdentity(id);
  const item = getNewsBySlug(slug)!;

  const title = item.title[isAr ? "ar" : "en"];
  const eyebrow = item.eyebrow[isAr ? "ar" : "en"];
  const paragraphs = item.body[isAr ? "ar" : "en"];
  const dateLabel = new Date(item.date).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        legalName={ident.legalName}
        parentGroup={ident.parentGroup}
        whatsappNumber={id.whatsapp_number}
        logoUrl={id.logo_url}
      />

      <article className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
        <LLink
          to="/$lang"
          className="inline-flex items-center gap-2 text-sm font-semibold text-trust-700 hover:underline"
        >
          <span aria-hidden>{isAr ? "→" : "←"}</span>
          {t("home.knowledgeBack")}
        </LLink>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-trust-700/10 px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-trust-700">
            {eyebrow}
          </span>
          <span className="text-xs text-ink-600">{dateLabel}</span>
        </div>

        <h1 className="mt-4 font-arabic text-3xl font-bold leading-tight text-foreground md:text-4xl">
          {title}
        </h1>

        <div className="relative mt-8 overflow-hidden rounded-3xl border border-border bg-muted shadow-sm">
          <img
            src={item.cover}
            alt={title}
            className="block w-full h-auto object-cover"
            loading="eager"
          />
        </div>

        <div className="mt-10 space-y-5 text-base leading-loose text-ink-700">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {slug === "natural-sweeteners-daily-health" && (
          <div className="mt-10 rounded-2xl border border-trust-700/30 bg-trust-700/5 p-6">
            <div className="text-[11px] font-bold tracking-[0.18em] text-trust-700">
              {isAr ? "الدليل الشامل" : "Complete guide"}
            </div>
            <h2 className="mt-2 font-arabic text-lg font-bold text-foreground">
              {isAr
                ? "تعمّق أكثر في دليل بدائل السكر في اليمن"
                : "Dive deeper into the sugar alternatives guide for Yemen"}
            </h2>
            <p className="mt-2 text-sm leading-loose text-ink-700">
              {isAr
                ? "اطّلع على المرجع الكامل لـ Steviola و NO CAL، المقارنات، والأسئلة الشائعة لمرضى السكري ومتّبعي الحميات."
                : "See the full reference for Steviola and NO CAL, comparisons, and FAQs for diabetics and dieters."}
            </p>
            <div className="mt-4">
              <LLink
                to="/$lang/sugar-alternatives"
                className="inline-flex items-center justify-center rounded-full bg-trust-700 px-5 py-2.5 text-xs font-semibold text-white"
              >
                {isAr ? "افتح دليل بدائل السكر" : "Open the sugar alternatives hub"}
              </LLink>
            </div>
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-arabic text-lg font-bold text-foreground">
            {isAr ? "هل لديك سؤال حول هذا المحتوى؟" : "Have a question about this article?"}
          </h2>
          <p className="mt-2 text-sm leading-loose text-ink-600">
            {isAr
              ? "تواصل مباشرة مع فريقنا عبر واتساب الأعمال للحصول على تفاصيل المنتجات أو شروط الشراكة."
              : "Reach our team directly on WhatsApp Business for product details or partnership terms."}
          </p>
          <div className="mt-5">
            <WhatsAppCTA
              number={id.whatsapp_number}
              message={
                isAr
                  ? `السلام عليكم، أرغب بمعرفة المزيد حول: ${title}`
                  : `Hello, I'd like to know more about: ${title}`
              }
            >
              {t("home.knowledgeWhatsAppCta")}
            </WhatsAppCTA>
          </div>
        </div>

        {(() => {
          const rel = ARTICLE_RELATIONS[slug];
          if (!rel) return null;
          const relArticles = rel.articles
            .map((s) => NEWS.find((n) => n.slug === s))
            .filter((n): n is NonNullable<typeof n> => Boolean(n));
          const hasAny = rel.brands.length || rel.topics.length || relArticles.length;
          if (!hasAny) return null;
          return (
            <aside className="mt-12 grid gap-6 md:grid-cols-2">
              {rel.brands.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="font-arabic text-base font-bold text-foreground">
                    {isAr ? "علامات تجارية ذات صلة" : "Related brands"}
                  </h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {rel.brands.map((b) => (
                      <li key={b.slug}>
                        <LLink
                          to="/$lang/brands/$slug"
                          params={{ slug: b.slug }}
                          className="inline-flex items-center rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs font-semibold text-trust-700 hover:border-trust-700"
                        >
                          {isAr ? b.ar : b.en}
                        </LLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(rel.topics.length > 0 || relArticles.length > 0) && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  {rel.topics.length > 0 && (
                    <>
                      <h2 className="font-arabic text-base font-bold text-foreground">
                        {isAr ? "موضوعات ذات صلة" : "Related topics"}
                      </h2>
                      <ul className="mt-3 space-y-2 text-sm">
                        {rel.topics.map((tp) => (
                          <li key={tp.href}>
                            <LLink to={tp.href} className="text-trust-700 hover:underline">
                              ← {isAr ? tp.ar : tp.en}
                            </LLink>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {relArticles.length > 0 && (
                    <>
                      <h2 className={`font-arabic text-base font-bold text-foreground ${rel.topics.length ? "mt-5" : ""}`}>
                        {isAr ? "مقالات ذات صلة" : "Related articles"}
                      </h2>
                      <ul className="mt-3 space-y-2 text-sm">
                        {relArticles.map((a) => (
                          <li key={a.slug}>
                            <LLink
                              to="/$lang/news/$slug"
                              params={{ slug: a.slug }}
                              className="text-trust-700 hover:underline"
                            >
                              ← {a.title[isAr ? "ar" : "en"]}
                            </LLink>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </aside>
          );
        })()}
      </article>


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
