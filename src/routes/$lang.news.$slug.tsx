import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCorporateIdentity, getInsightBySlug, listRelatedInsights } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";
import { StickyWhatsApp } from "@/components/site/StickyWhatsApp";
import { LLink } from "@/i18n/LLink";
import { useLocale } from "@/i18n/LocaleProvider";
import { useLocalizedIdentity } from "@/i18n/identity";

const identityQO = queryOptions({
  queryKey: ["corporate-identity"],
  queryFn: () => getCorporateIdentity(),
});

const articleQO = (slug: string) =>
  queryOptions({
    queryKey: ["insight", slug],
    queryFn: () => getInsightBySlug({ data: { slug } }),
  });

const relatedQO = (slug: string) =>
  queryOptions({
    queryKey: ["insight-related", slug],
    queryFn: () => listRelatedInsights({ data: { slug, limit: 4 } }),
  });

export const Route = createFileRoute("/$lang/news/$slug")({
  head: ({ params, loaderData }) => {
    const isAr = params.lang === "ar";
    const item = (loaderData as { article: Awaited<ReturnType<typeof getInsightBySlug>> } | undefined)?.article;
    if (!item) {
      return { meta: [{ title: isAr ? "خبر غير موجود" : "News not found" }] };
    }
    const title = (isAr ? item.title_ar : item.title_en || item.title_ar) || "";
    const desc = (isAr ? item.excerpt_ar : item.excerpt_en || item.excerpt_ar) || "";
    const url = `https://ruknaltawfer.com/${params.lang}/news/${item.slug}`;
    return {
      meta: [
        { title: `${title} — ${isAr ? "ركن التوفير" : "Rukn Al-Tawfir"}` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(item.cover_url ? [{ property: "og:image", content: item.cover_url }] : []),
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        ...(item.published_at ? [{ property: "article:published_time", content: item.published_at }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        ...(item.cover_url ? [{ name: "twitter:image", content: item.cover_url }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description: desc,
            image: item.cover_url ?? undefined,
            datePublished: item.published_at ?? undefined,
            inLanguage: isAr ? "ar" : "en",
            mainEntityOfPage: url,
          }),
        },
      ],
    };
  },
  loader: async ({ context, params }) => {
    const article = await context.queryClient.ensureQueryData(articleQO(params.slug));
    if (!article) throw notFound();
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(relatedQO(params.slug)),
    ]);
    return { article };
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
  const { data: article } = useSuspenseQuery(articleQO(slug));
  const { data: related } = useSuspenseQuery(relatedQO(slug));
  const ident = useLocalizedIdentity(id);

  if (!article) return null;

  const title = (isAr ? article.title_ar : article.title_en || article.title_ar) || "";
  const eyebrow = (article.tags && article.tags[0]) || t("home.knowledgeEyebrow");
  const paragraphs = (isAr ? article.body_ar : article.body_en.length ? article.body_en : article.body_ar) || [];
  const dateLabel = article.published_at
    ? new Date(article.published_at).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

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
          to="/$lang/news"
          className="inline-flex items-center gap-2 text-sm font-semibold text-trust-700 hover:underline"
        >
          <span aria-hidden>{isAr ? "→" : "←"}</span>
          {t("home.knowledgeListTitle")}
        </LLink>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-trust-700/10 px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-trust-700">
            {eyebrow}
          </span>
          {dateLabel ? <span className="text-xs text-ink-600">{dateLabel}</span> : null}
        </div>

        <h1 className="mt-4 font-arabic text-3xl font-bold leading-tight text-foreground md:text-4xl">
          {title}
        </h1>

        {article.cover_url ? (
          <div className="relative mt-8 overflow-hidden rounded-3xl border border-border bg-muted shadow-sm">
            <img
              src={article.cover_url}
              alt={title}
              className="block w-full h-auto object-cover"
              loading="eager"
            />
          </div>
        ) : null}

        <div className="mt-10 space-y-5 text-base leading-loose text-ink-700">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

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
      </article>

      {related.length > 0 && (
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
            <h2 className="font-arabic text-2xl font-bold text-foreground md:text-3xl">
              {t("home.knowledgeRelatedTitle")}
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((k) => {
                const ktitle = (isAr ? k.title_ar : k.title_en || k.title_ar) || "";
                const kbody = (isAr ? k.excerpt_ar : k.excerpt_en || k.excerpt_ar) || "";
                const keyebrow = (k.tags && k.tags[0]) || t("home.knowledgeEyebrow");
                return (
                  <LLink
                    key={k.slug}
                    to="/$lang/news/$slug"
                    params={{ slug: k.slug }}
                    className="prem-card group flex h-full flex-col overflow-hidden transition-transform hover:-translate-y-1"
                  >
                    <div className="relative h-40 overflow-hidden rounded-b-[2rem] bg-muted">
                      {k.cover_url ? (
                        <img
                          src={k.cover_url}
                          alt={ktitle}
                          loading="lazy"
                          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : null}
                      <div className="absolute inset-x-4 top-4 flex justify-start">
                        <div className="rounded-full glass-dark px-3 py-1 text-[10px] font-bold tracking-[0.22em] text-sand-50">
                          {keyebrow}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-arabic text-base font-bold leading-snug text-foreground line-clamp-2">
                        {ktitle}
                      </h3>
                      {k.published_at ? (
                        <div className="mt-2 text-[11px] text-ink-600">
                          {new Date(k.published_at).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      ) : null}
                      <p className="mt-2 text-xs leading-relaxed text-ink-600 line-clamp-2">{kbody}</p>
                      <div className="mt-auto pt-4 text-xs font-bold text-trust-700">
                        {t("home.knowledgeReadMore")}
                      </div>
                    </div>
                  </LLink>
                );
              })}
            </div>
          </div>
        </section>
      )}

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
