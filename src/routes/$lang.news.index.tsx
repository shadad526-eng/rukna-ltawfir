import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCorporateIdentity, listInsights } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { StickyWhatsApp } from "@/components/site/StickyWhatsApp";
import { LLink } from "@/i18n/LLink";
import { useLocale } from "@/i18n/LocaleProvider";
import { useLocalizedIdentity } from "@/i18n/identity";

const identityQO = queryOptions({
  queryKey: ["corporate-identity"],
  queryFn: () => getCorporateIdentity(),
});
const insightsQO = queryOptions({
  queryKey: ["insights"],
  queryFn: () => listInsights(),
});

export const Route = createFileRoute("/$lang/news/")({
  head: ({ params }) => {
    const isAr = params.lang === "ar";
    const url = `https://ruknaltawfer.com/${params.lang}/news`;
    const title = isAr
      ? "الأخبار والمقالات — ركن التوفير"
      : "News & Articles — Rukn Al-Tawfir";
    const desc = isAr
      ? "أحدث المقالات والأدلة الصحية من فريق ركن التوفير كوزمتك."
      : "The latest health articles and guides from Rukn Al-Tawfir Cosmetic.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(insightsQO),
    ]);
  },
  component: NewsListPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <p className="text-sm text-ink-600">تعذّر تحميل الأخبار. حاول لاحقًا.</p>
      <pre className="mt-4 text-[10px] text-ink-500">{String(error)}</pre>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-arabic text-3xl font-bold">404</h1>
    </div>
  ),
});

function NewsListPage() {
  const { lang, t } = useLocale();
  const isAr = lang === "ar";
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: items } = useSuspenseQuery(insightsQO);
  const ident = useLocalizedIdentity(id);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        legalName={ident.legalName}
        parentGroup={ident.parentGroup}
        whatsappNumber={id.whatsapp_number}
        logoUrl={id.logo_url}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
        <div className="mb-10">
          <div className="hq-eyebrow">{t("home.knowledgeEyebrow")}</div>
          <h1 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
            {t("home.knowledgeListTitle")}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-loose text-ink-600">
            {t("home.knowledgeListSubtitle")}
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-ink-600">—</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((k) => {
              const title = (isAr ? k.title_ar : k.title_en || k.title_ar) || "";
              const body = (isAr ? k.excerpt_ar : k.excerpt_en || k.excerpt_ar) || "";
              const eyebrow = (k.tags && k.tags[0]) || t("home.knowledgeEyebrow");
              return (
                <LLink
                  key={k.slug}
                  to="/$lang/news/$slug"
                  params={{ slug: k.slug }}
                  className="prem-card group flex h-full flex-col overflow-hidden transition-transform hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden rounded-b-[2rem] bg-muted">
                    {k.cover_url ? (
                      <img
                        src={k.cover_url}
                        alt={title}
                        loading="lazy"
                        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : null}
                    <div className="absolute inset-x-6 top-6 flex justify-start">
                      <div className="rounded-full glass-dark px-3 py-1 text-[10px] font-bold tracking-[0.22em] text-sand-50">
                        {eyebrow}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-arabic text-lg font-bold leading-snug text-foreground">{title}</h3>
                    {k.published_at ? (
                      <div className="mt-2 text-[11px] text-ink-600">
                        {new Date(k.published_at).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    ) : null}
                    <p className="mt-3 text-sm leading-loose text-ink-600 line-clamp-3">{body}</p>
                    <div className="mt-auto pt-6 text-xs font-bold text-trust-700 transition-transform group-hover:-translate-x-1">
                      {t("home.knowledgeReadMore")}
                    </div>
                  </div>
                </LLink>
              );
            })}
          </div>
        )}
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
