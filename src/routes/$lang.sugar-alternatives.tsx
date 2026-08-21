import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  getBrandBySlug,
  getCorporateIdentity,
  getSitePage,
  listBrandProducts,
  listInsightsBySlugs,
} from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";
import { StickyWhatsApp } from "@/components/site/StickyWhatsApp";
import { RichText, StyledHeading } from "@/components/site/RichText";
import { LLink } from "@/i18n/LLink";
import { useLocale } from "@/i18n/LocaleProvider";
import { useLocalizedIdentity } from "@/i18n/identity";
import {
  itemRich,
  itemText,
  pickFlag,
  pickHeading,
  pickList,
  pickRich,
  pickText,
  withDefaults,
  type HeadingValue,
  type PageContent,
} from "@/lib/page-content";

const SLUG = "sugar-alternatives" as const;

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const pageQO = queryOptions({ queryKey: ["site-page", SLUG], queryFn: () => getSitePage({ data: SLUG }) });
const nocalQO = queryOptions({ queryKey: ["brand", "nocal"], queryFn: () => getBrandBySlug({ data: { slug: "nocal" } }) });
const steviolaQO = queryOptions({ queryKey: ["brand", "steviola"], queryFn: () => getBrandBySlug({ data: { slug: "steviola" } }) });
const nocalProductsQO = queryOptions({ queryKey: ["brand-products", "nocal"], queryFn: () => listBrandProducts({ data: { brandSlug: "nocal" } }) });
const steviolaProductsQO = queryOptions({ queryKey: ["brand-products", "steviola"], queryFn: () => listBrandProducts({ data: { brandSlug: "steviola" } }) });
const relatedArticlesQO = queryOptions({
  queryKey: ["insights-by-slugs", "natural-sweeteners-daily-health"],
  queryFn: () => listInsightsBySlugs({ data: { slugs: ["natural-sweeteners-daily-health"] } }),
});

const BASE = "https://ruknaltawfer.com";

export const Route = createFileRoute("/$lang/sugar-alternatives")({
  head: ({ params, loaderData }) => {
    const isAr = params.lang === "ar";
    const lang = isAr ? "ar" : "en";
    const c: PageContent = (loaderData as any)?.content ?? withDefaults(SLUG, null);
    const url = `${BASE}/${params.lang}/sugar-alternatives`;
    const title = pickText(c, "seo.title", lang, "");
    const desc = pickText(c, "seo.desc", lang, "");
    const keywords = pickText(c, "seo.keywords", lang, "");

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: isAr ? "الرئيسية" : "Home", item: `${BASE}/${params.lang}` },
        { "@type": "ListItem", position: 2, name: pickText(c, "crumb.label", lang, ""), item: url },
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

    const faqItems = pickList<any>(c, "faq.items", []);
    const faq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((f) => ({
        "@type": "Question",
        name: itemText(f, "q", lang),
        acceptedAnswer: { "@type": "Answer", text: itemText(f, "a", lang) },
      })),
    };

    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: keywords },
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
        ...(faqItems.length ? [{ type: "application/ld+json", children: JSON.stringify(faq) }] : []),
      ],
    };
  },
  loader: async ({ context }) => {
    const [, page] = await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(pageQO),
      context.queryClient.ensureQueryData(nocalQO),
      context.queryClient.ensureQueryData(steviolaQO),
      context.queryClient.ensureQueryData(nocalProductsQO),
      context.queryClient.ensureQueryData(steviolaProductsQO),
      context.queryClient.ensureQueryData(relatedArticlesQO),
    ]);
    return { content: withDefaults(SLUG, page?.content) };
  },
  component: SugarAlternativesHub,
});

function SectionHeading({ eyebrow, heading, html }: { eyebrow: string; heading: HeadingValue; html: string }) {
  return (
    <div>
      <div className="hq-eyebrow">{eyebrow}</div>
      <StyledHeading heading={heading} level={2} className="mt-3 font-arabic text-3xl font-bold leading-tight text-foreground md:text-4xl">
        <RichText value={html} />
      </StyledHeading>
      <div className="mt-4 h-px w-16 prem-divider" />
    </div>
  );
}

function SugarAlternativesHub() {
  const { lang } = useLocale();
  const isAr = lang === "ar";
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: page } = useSuspenseQuery(pageQO);
  const { data: nocal } = useSuspenseQuery(nocalQO);
  const { data: steviola } = useSuspenseQuery(steviolaQO);
  const { data: nocalProducts } = useSuspenseQuery(nocalProductsQO);
  const { data: steviolaProducts } = useSuspenseQuery(steviolaProductsQO);
  const { data: relatedArticles } = useSuspenseQuery(relatedArticlesQO);
  const ident = useLocalizedIdentity(id);

  const c = withDefaults(SLUG, page?.content);
  const T = (key: string) => pickText(c, key, lang, "");
  const R = (key: string) => pickRich(c, key, lang, "");
  const H = (key: string) => pickHeading(c, key, lang);
  const on = (key: string) => pickFlag(c, key);
  const L = (key: string) => pickList<any>(c, key, []);

  const Bullets = ({ items, className }: { items: any[]; className?: string }) => (
    <ul className={className ?? "mt-4 list-disc ps-5"}>
      {items.map((it, i) => (
        <li key={i}>
          <RichText as="span" value={itemRich(it, "text", lang)} />
        </li>
      ))}
    </ul>
  );

  const tocItems = L("toc.items");
  const diffRows = L("diff.rows");
  const convRows = L("conv.rows");
  const faqs = L("faq.items");
  const usefulLinks = L("links.items");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader legalName={ident.legalName} parentGroup={ident.parentGroup} whatsappNumber={id.whatsapp_number} logoUrl={id.logo_url} />

      <nav aria-label={isAr ? "مسار التنقل" : "Breadcrumb"} className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-ink-600">
          <li><LLink to="/$lang" className="hover:text-trust-700">{isAr ? "الرئيسية" : "Home"}</LLink></li>
          <li aria-hidden>›</li>
          <li className="font-semibold text-foreground">{T("crumb.label")}</li>
        </ol>
      </nav>

      {/* HERO */}
      <section className="cinema-hero relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="hq-eyebrow">{T("hero.eyebrow")}</div>
          <StyledHeading heading={H("hero.title")} level={1} className="mt-3 font-arabic text-4xl font-bold leading-[1.1] text-foreground md:text-6xl">
            <RichText value={R("hero.title")} />
          </StyledHeading>
          <div className="mt-6 h-px w-28 prem-divider" />
          <RichText as="p" className="mt-6 max-w-3xl text-base leading-loose text-ink-600 md:text-lg" value={R("hero.subtitle")} />

          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppCTA number={id.whatsapp_number} message={T("hero.waMsg")}>
              {T("hero.waLabel")}
            </WhatsAppCTA>
            <LLink to="/$lang/brands/$slug" params={{ slug: "steviola" }} className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-trust-700 hover:text-trust-700">
              {T("hero.link1Label")}
            </LLink>
            <LLink to="/$lang/brands/$slug" params={{ slug: "nocal" }} className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-trust-700 hover:text-trust-700">
              {T("hero.link2Label")}
            </LLink>
          </div>
        </div>
      </section>

      {/* TABLE OF CONTENTS */}
      {on("toc.enabled") && tocItems.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <div className="prem-card p-6 md:p-8">
            <h2 className="font-arabic text-lg font-bold text-foreground">{T("toc.title")}</h2>
            <ol className="mt-4 grid gap-2 text-sm text-ink-700 md:grid-cols-2">
              {tocItems.map((it, i) => (
                <li key={i}>
                  <a href={`#${it?.anchor ?? ""}`} className="text-trust-700 hover:underline">
                    {itemText(it, "label", lang)}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* WHAT */}
      {on("what.enabled") ? (
        <section id="what" className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
          <SectionHeading eyebrow={T("what.eyebrow")} heading={H("what.title")} html={R("what.title")} />
          <RichText className="prose prose-neutral mt-6 max-w-none text-base leading-loose text-ink-700" value={R("what.body")} />
        </section>
      ) : null}

      {/* DIFFERENCE TABLE */}
      {on("diff.enabled") && diffRows.length > 0 ? (
        <section id="diff" className="border-y border-border bg-card">
          <div className="mx-auto max-w-5xl px-4 py-14 md:px-8 md:py-20">
            <SectionHeading eyebrow={T("diff.eyebrow")} heading={H("diff.title")} html={R("diff.title")} />
            <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-background">
              <table className="w-full min-w-[640px] text-start text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-ink-600">
                  <tr>
                    <th className="px-4 py-3 text-start">{T("diff.col1")}</th>
                    <th className="px-4 py-3 text-start">{T("diff.col2")}</th>
                    <th className="px-4 py-3 text-start">{T("diff.col3")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-ink-700">
                  {diffRows.map((row, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-semibold text-foreground">{itemText(row, "c1", lang)}</td>
                      <td className="px-4 py-3">{itemText(row, "c2", lang)}</td>
                      <td className="px-4 py-3">{itemText(row, "c3", lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      {/* CONVERSION GUIDE */}
      {on("conv.enabled") ? (
        <section id="conversion" className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
          <SectionHeading eyebrow={T("conv.eyebrow")} heading={H("conv.title")} html={R("conv.title")} />
          <RichText as="p" className="mt-4 max-w-3xl text-base leading-loose text-ink-700" value={R("conv.intro")} />
          {convRows.length > 0 ? (
            <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-background">
              <table className="w-full min-w-[720px] text-start text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-ink-600">
                  <tr>
                    <th className="px-4 py-3 text-start">{T("conv.col1")}</th>
                    <th className="px-4 py-3 text-start">{T("conv.col2")}</th>
                    <th className="px-4 py-3 text-start">{T("conv.col3")}</th>
                    <th className="px-4 py-3 text-start">{T("conv.col4")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-ink-700">
                  {convRows.map((row, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-semibold text-foreground">{itemText(row, "c1", lang)}</td>
                      <td className="px-4 py-3">{itemText(row, "c2", lang)}</td>
                      <td className="px-4 py-3">{itemText(row, "c3", lang)}</td>
                      <td className="px-4 py-3">{itemText(row, "c4", lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-arabic text-lg font-bold text-foreground">{T("conv.card1Title")}</h3>
              <Bullets items={L("conv.card1Items")} className="mt-3 list-disc space-y-2 ps-5 text-sm leading-loose text-ink-700" />
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-arabic text-lg font-bold text-foreground">{T("conv.card2Title")}</h3>
              <Bullets items={L("conv.card2Items")} className="mt-3 list-disc space-y-2 ps-5 text-sm leading-loose text-ink-700" />
            </div>
          </div>
          <p className="mt-6 text-xs text-ink-600">{T("conv.note")}</p>
        </section>
      ) : null}

      {/* STEVIA */}
      {on("stevia.enabled") ? (
        <section id="stevia" className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
          <SectionHeading eyebrow={T("stevia.eyebrow")} heading={H("stevia.title")} html={R("stevia.title")} />
          <div className="prose prose-neutral mt-6 max-w-none text-base leading-loose text-ink-700">
            <RichText value={R("stevia.body")} />
            <h3 className="font-arabic text-xl font-bold text-foreground">{T("stevia.usesTitle")}</h3>
            <Bullets items={L("stevia.uses")} className="list-disc ps-5" />
          </div>
        </section>
      ) : null}

      {/* STEVIOLA */}
      {on("steviola.enabled") ? (
        <section id="steviola" className="border-y border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20">
            <SectionHeading eyebrow={T("steviola.eyebrow")} heading={H("steviola.title")} html={R("steviola.title")} />
            <div className="mt-8 grid gap-8 md:grid-cols-[1fr,1.4fr]">
              {steviola?.logo_url && (
                <div className="podium grid aspect-square place-items-center p-8">
                  <img src={steviola.logo_url} alt="Steviola" className="max-h-32 w-auto" />
                </div>
              )}
              <div className="text-base leading-loose text-ink-700">
                <RichText value={R("steviola.body")} />
                <Bullets items={L("steviola.points")} />
                <div className="mt-6 flex flex-wrap gap-3">
                  <LLink to="/$lang/brands/$slug" params={{ slug: "steviola" }} className="inline-flex items-center justify-center rounded-full bg-trust-700 px-5 py-2.5 text-xs font-semibold text-white">
                    {T("steviola.ctaLabel")}
                  </LLink>
                </div>
              </div>
            </div>

            {steviolaProducts.length > 0 && (
              <div className="mt-10">
                <h3 className="font-arabic text-xl font-bold text-foreground">{T("steviola.productsTitle")}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {steviolaProducts.map((p) => (
                    <LLink key={p.id} to="/$lang/brands/$slug/$productSlug" params={{ slug: "steviola", productSlug: p.slug }} className="prem-card group flex gap-3 p-3 transition-transform hover:-translate-y-0.5">
                      {p.cover_url && <img src={p.cover_url} alt={p.name_ar} loading="lazy" className="size-20 shrink-0 rounded-xl bg-muted object-contain p-1" />}
                      <div className="min-w-0">
                        <div className="font-arabic text-sm font-bold text-foreground">{isAr ? p.name_ar : p.name_en}</div>
                        {p.short_description_ar && <p className="mt-1 line-clamp-2 text-xs text-ink-600">{p.short_description_ar}</p>}
                      </div>
                    </LLink>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* NOCAL */}
      {on("nocal.enabled") ? (
        <section id="nocal" className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20">
          <SectionHeading eyebrow={T("nocal.eyebrow")} heading={H("nocal.title")} html={R("nocal.title")} />
          <div className="mt-8 grid gap-8 md:grid-cols-[1.4fr,1fr]">
            <div className="text-base leading-loose text-ink-700">
              <RichText value={R("nocal.body")} />
              <Bullets items={L("nocal.points")} />
              <div className="mt-6 flex flex-wrap gap-3">
                <LLink to="/$lang/brands/$slug" params={{ slug: "nocal" }} className="inline-flex items-center justify-center rounded-full bg-trust-700 px-5 py-2.5 text-xs font-semibold text-white">
                  {T("nocal.ctaLabel")}
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
              <h3 className="font-arabic text-xl font-bold text-foreground">{T("nocal.productsTitle")}</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {nocalProducts.map((p) => (
                  <LLink key={p.id} to="/$lang/brands/$slug/$productSlug" params={{ slug: "nocal", productSlug: p.slug }} className="prem-card group flex gap-3 p-3 transition-transform hover:-translate-y-0.5">
                    {p.cover_url && <img src={p.cover_url} alt={p.name_ar} loading="lazy" className="size-20 shrink-0 rounded-xl bg-muted object-contain p-1" />}
                    <div className="min-w-0">
                      <div className="font-arabic text-sm font-bold text-foreground">{isAr ? p.name_ar : p.name_en}</div>
                      {p.short_description_ar && <p className="mt-1 line-clamp-2 text-xs text-ink-600">{p.short_description_ar}</p>}
                    </div>
                  </LLink>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : null}

      {/* YEMEN */}
      {on("yemen.enabled") ? (
        <section id="yemen" className="border-y border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-14 md:px-8 md:py-20">
            <SectionHeading eyebrow={T("yemen.eyebrow")} heading={H("yemen.title")} html={R("yemen.title")} />
            <div className="prose prose-neutral mt-6 max-w-none text-base leading-loose text-ink-700">
              <RichText value={R("yemen.body")} />
              <Bullets items={L("yemen.points")} className="list-disc ps-5" />
            </div>
          </div>
        </section>
      ) : null}

      {/* RELATED ARTICLES */}
      {on("articles.enabled") && relatedArticles.length > 0 ? (
        <section id="articles" className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20">
          <SectionHeading eyebrow={T("articles.eyebrow")} heading={H("articles.title")} html={R("articles.title")} />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {relatedArticles.map((n) => {
              const title = (isAr ? n.title_ar : n.title_en || n.title_ar) || "";
              const excerpt = (isAr ? n.excerpt_ar : n.excerpt_en || n.excerpt_ar) || "";
              const eyebrow = n.tags[0] || (isAr ? "مقال" : "Article");
              return (
                <LLink key={n.slug} to="/$lang/news/$slug" params={{ slug: n.slug }} className="prem-card group overflow-hidden">
                  {n.cover_url ? <img src={n.cover_url} alt={title} loading="lazy" className="block aspect-[16/9] w-full object-cover" /> : null}
                  <div className="p-5">
                    <div className="text-[11px] font-bold tracking-[0.18em] text-trust-700">{eyebrow}</div>
                    <h3 className="mt-2 font-arabic text-lg font-bold text-foreground group-hover:text-trust-700">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-600">{excerpt}</p>
                  </div>
                </LLink>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* FAQ + LINKS */}
      {on("faq.enabled") || on("links.enabled") ? (
        <section id="faq" className="border-y border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-14 md:px-8 md:py-20">
            {on("faq.enabled") && faqs.length > 0 ? (
              <>
                <SectionHeading eyebrow={T("faq.eyebrow")} heading={H("faq.title")} html={R("faq.title")} />
                <div className="mt-8 space-y-3">
                  {faqs.map((f, i) => (
                    <details key={i} className="prem-card group p-5 [&_summary::-webkit-details-marker]:hidden">
                      <summary className="flex cursor-pointer items-start justify-between gap-4">
                        <h3 className="font-arabic text-base font-bold text-foreground group-open:text-trust-700">{itemText(f, "q", lang)}</h3>
                        <span aria-hidden className="mt-1 text-trust-700 transition-transform group-open:rotate-45">+</span>
                      </summary>
                      <RichText className="mt-4 text-sm leading-loose text-ink-700" value={itemRich(f, "a", lang)} />
                    </details>
                  ))}
                </div>
              </>
            ) : null}

            {on("links.enabled") && usefulLinks.length > 0 ? (
              <div className="mt-10 rounded-2xl border border-border bg-background p-6 md:p-8">
                <h3 className="font-arabic text-lg font-bold text-foreground">{T("links.title")}</h3>
                <ul className="mt-3 grid gap-2 text-sm text-trust-700 md:grid-cols-2">
                  {usefulLinks.map((l, i) => (
                    <li key={i}>
                      <LLink to={`/$lang${l?.url ?? ""}`} className="hover:underline">
                        ← {itemText(l, "label", lang)}
                      </LLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* CTA */}
      {on("cta.enabled") ? (
        <section className="mx-auto max-w-5xl px-4 py-20 text-center md:px-8">
          <StyledHeading heading={H("cta.title")} level={2} className="font-arabic text-3xl font-bold text-foreground md:text-4xl">
            <RichText value={R("cta.title")} />
          </StyledHeading>
          <RichText as="p" className="mt-4 text-ink-600" value={R("cta.desc")} />
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <WhatsAppCTA number={id.whatsapp_number}>{T("cta.waLabel")}</WhatsAppCTA>
          </div>
        </section>
      ) : null}

      <SiteFooter legalName={ident.legalName} parentGroup={ident.parentGroup} whatsappNumber={id.whatsapp_number} email={id.email} address={ident.address} />
      <StickyWhatsApp number={id.whatsapp_number} />
    </div>
  );
}
