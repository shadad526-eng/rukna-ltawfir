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
import { productAlt, brandLogoAlt } from "@/lib/seo-alt";
import {
  itemRich,
  itemText,
  pickFlag,
  pickHeading,
  pickList,
  pickRich,
  pickText,
  withDefaults,
  type PageContent,
} from "@/lib/page-content";

const SLUG = "oral-care" as const;

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const pageQO = queryOptions({ queryKey: ["site-page", SLUG], queryFn: () => getSitePage({ data: SLUG }) });
const ykelinQO = queryOptions({ queryKey: ["brand", "y-kelin"], queryFn: () => getBrandBySlug({ data: { slug: "y-kelin" } }) });
const ykelinProductsQO = queryOptions({ queryKey: ["brand-products", "y-kelin"], queryFn: () => listBrandProducts({ data: { brandSlug: "y-kelin" } }) });
const relatedArticlesQO = queryOptions({ queryKey: ["insights-by-slugs", "daily-dental-care-routine"], queryFn: () => listInsightsBySlugs({ data: { slugs: ["daily-dental-care-routine"] } }) });

const BASE = "https://ruknaltawfer.com";

export const Route = createFileRoute("/$lang/oral-care")({
  head: ({ params, loaderData }) => {
    const isAr = params.lang === "ar";
    const lang = isAr ? "ar" : "en";
    const c: PageContent = (loaderData as any)?.content ?? withDefaults(SLUG, null);
    const url = `${BASE}/${params.lang}/oral-care`;
    const title = pickText(c, "seo.title", lang, "");
    const desc = pickText(c, "seo.desc", lang, "");
    const keywords = pickText(c, "seo.keywords", lang, "");
    const ogImage = `${BASE}/rukn-logo.webp`;

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: isAr ? "الرئيسية" : "Home", item: `${BASE}/${params.lang}` },
        { "@type": "ListItem", position: 2, name: pickText(c, "crumb.label", lang, ""), item: url },
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
        ...(faqItems.length ? [{ type: "application/ld+json", children: JSON.stringify(faq) }] : []),
      ],
    };
  },
  loader: async ({ context }) => {
    const [, page] = await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(pageQO),
      context.queryClient.ensureQueryData(ykelinQO),
      context.queryClient.ensureQueryData(ykelinProductsQO),
      context.queryClient.ensureQueryData(relatedArticlesQO),
    ]);
    return { content: withDefaults(SLUG, page?.content) };
  },
  component: OralCareHub,
});

function OralCareHub() {
  const { lang } = useLocale();
  const isAr = lang === "ar";
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: page } = useSuspenseQuery(pageQO);
  const { data: brand } = useSuspenseQuery(ykelinQO);
  const { data: products } = useSuspenseQuery(ykelinProductsQO);
  const { data: articles } = useSuspenseQuery(relatedArticlesQO);
  const ident = useLocalizedIdentity(id);
  const bname = brand ? (isAr ? brand.name_ar : brand.name_en) : "Y-Kelin";

  const c = withDefaults(SLUG, page?.content);
  const T = (key: string) => pickText(c, key, lang, "");
  const R = (key: string) => pickRich(c, key, lang, "");
  const H = (key: string) => pickHeading(c, key, lang);
  const on = (key: string) => pickFlag(c, key);

  const faqs = pickList<any>(c, "faq.items", []);
  const hubLinks = pickList<any>(c, "hubs.links", []);

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
            <LLink to="/$lang/brands/$slug" params={{ slug: "y-kelin" }} className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-trust-700 hover:text-trust-700">
              {T("hero.link1Label")}
            </LLink>
          </div>
        </div>
      </section>

      {on("overview.enabled") ? (
        <section className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
          <div className="hq-eyebrow">{T("overview.eyebrow")}</div>
          <StyledHeading heading={H("overview.title")} level={2} className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
            <RichText value={R("overview.title")} />
          </StyledHeading>
          <RichText
            className="prose prose-neutral mt-6 max-w-none text-base leading-loose text-ink-700"
            value={R("overview.body")}
          />
        </section>
      ) : null}

      {on("products.enabled") && products.length > 0 ? (
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
            <div className="hq-eyebrow">{T("products.eyebrow")}</div>
            <StyledHeading heading={H("products.title")} level={2} className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
              <RichText value={R("products.title")} />
            </StyledHeading>
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
                    <figcaption className="px-4 pt-3 text-[11px] leading-relaxed text-ink-600">{pname} — {T("products.caption")}</figcaption>
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

      {on("faq.enabled") && faqs.length > 0 ? (
        <section className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
          <div className="hq-eyebrow">{T("faq.eyebrow")}</div>
          <StyledHeading heading={H("faq.title")} level={2} className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
            <RichText value={R("faq.title")} />
          </StyledHeading>
          <div className="mt-6 divide-y divide-border/70">
            {faqs.map((f, i) => (
              <details key={i} className="group py-4">
                <summary className="cursor-pointer list-none text-sm font-bold text-foreground">{itemText(f, "q", lang)}</summary>
                <RichText className="mt-2 text-sm leading-loose text-ink-700" value={itemRich(f, "a", lang)} />
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {on("related.enabled") && articles.length > 0 ? (
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
            <div className="hq-eyebrow">{T("related.eyebrow")}</div>
            <StyledHeading heading={H("related.title")} level={2} className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
              <RichText value={R("related.title")} />
            </StyledHeading>
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

      {on("hubs.enabled") ? (
        <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <div className="rounded-2xl border border-trust-700/30 bg-trust-700/5 p-6 md:p-8">
            <div className="text-[11px] font-bold tracking-[0.18em] text-trust-700">{T("hubs.eyebrow")}</div>
            <StyledHeading heading={H("hubs.title")} level={2} className="mt-2 font-arabic text-lg font-bold text-foreground md:text-xl">
              <RichText value={R("hubs.title")} />
            </StyledHeading>
            <RichText as="p" className="mt-2 max-w-2xl text-sm leading-loose text-ink-700" value={R("hubs.desc")} />
            <div className="mt-4 flex flex-wrap gap-3">
              {hubLinks.map((l, i) => (
                <LLink key={i} to={`/$lang${l?.url ?? ""}`} className="inline-flex items-center justify-center rounded-full border border-trust-700/40 px-5 py-2.5 text-xs font-semibold text-trust-700">
                  {itemText(l, "label", lang)}
                </LLink>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {on("note.enabled") && brand?.logo_url ? (
        <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <div className="flex items-center gap-4">
            <img src={brand.logo_url} alt={brandLogoAlt("y-kelin", bname, isAr ? "ar" : "en")} className="max-h-20 w-auto" />
            <p className="text-sm text-ink-600">{T("note.text")}</p>
          </div>
        </section>
      ) : null}

      <StickyWhatsApp number={id.whatsapp_number} />
      <SiteFooter legalName={ident.legalName} parentGroup={ident.parentGroup} whatsappNumber={id.whatsapp_number} email={id.email} address={ident.address} />
    </div>
  );
}
