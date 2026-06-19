import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCorporateIdentity, listBrands, type BrandSummary } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { BrandCard } from "@/components/site/BrandCard";
import { useLocale } from "@/i18n/LocaleProvider";
import { useLocalizedIdentity } from "@/i18n/identity";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const brandsQO = queryOptions({ queryKey: ["brands"], queryFn: () => listBrands() });

export const Route = createFileRoute("/$lang/brands/")({
  head: ({ params, loaderData }) => {
    const url = `https://ruknaltawfer.com/${params.lang}/brands`;
    const isAr = params.lang === "ar";
    const title = isAr ? "العلامات التجارية — ركن التوفير كوزمتك للتجارة" : "Brands — Rukn Al-Tawfir Cosmetic for Trade";
    const desc = isAr
      ? "العلامات الصحية الرسمية الممثلة عبر منظومة ركن التوفير في اليمن: iSiS, SEKEM, Steviola, NO CAL, Monivo, Baby Tawfir, Bambo Fresh, Y-Kelin."
      : "Official health brands represented through the Rukn Al-Tawfir ecosystem in Yemen: iSiS, SEKEM, Steviola, NO CAL, Monivo, Baby Tawfir, Bambo Fresh, Y-Kelin.";
    const brands = loaderData?.brands ?? [];
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: isAr
          ? "العلامات التجارية, ركن التوفير, ايزيس, سيكم, ستيفيولا, نو كال, مونيفو, بيبي توفير, بامبو, واي كيلين, اليمن"
          : "brands, Rukn Al-Tawfir, iSiS, SEKEM, Steviola, NO CAL, Monivo, Baby Tawfir, Bambo, Y-Kelin, Yemen" },
        { property: "og:title", content: isAr ? "العلامات التجارية — ركن التوفير" : "Brands — Rukn Al-Tawfir" },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: url },
        { rel: "alternate", hrefLang: "ar", href: "https://ruknaltawfer.com/ar/brands" },
        { rel: "alternate", hrefLang: "en", href: "https://ruknaltawfer.com/en/brands" },
        { rel: "alternate", hrefLang: "x-default", href: "https://ruknaltawfer.com/ar/brands" },
      ],
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
                  { "@type": "ListItem", position: 2, name: isAr ? "العلامات التجارية" : "Brands", item: url },
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
                mainEntity: {
                  "@type": "ItemList",
                  numberOfItems: brands.length,
                  itemListElement: brands.map((b, i) => ({
                    "@type": "ListItem",
                    position: i + 1,
                    url: `https://ruknaltawfer.com/${params.lang}/brands/${b.slug}`,
                    name: isAr ? b.name_ar : b.name_en,
                  })),
                },
              },
            ],
          }),
        },
      ],
    };
  },
  loader: async ({ context }) => {
    const [, brands] = await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(brandsQO),
    ]);
    return { brands };
  },
  component: BrandsPage,
  errorComponent: ({ error }) => <ErrorState message={error.message} />,
});

function ErrorState({ message }: { message: string }) {
  const { t } = useLocale();
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">{t("errors.brandsLoadFailed")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function BrandsPage() {
  const { t } = useLocale();
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: brands } = useSuspenseQuery(brandsQO);
  const ident = useLocalizedIdentity(id);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        legalName={ident.legalName}
        parentGroup={ident.parentGroup}
        whatsappNumber={id.whatsapp_number}
        logoUrl={id.logo_url}
      />

      <section className="relative overflow-hidden cinema-hero">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(var(--trust-700) 1px, transparent 1px), linear-gradient(90deg, var(--trust-700) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
          aria-hidden
        />
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <div className="hq-eyebrow">{t("brands.eyebrow")}</div>
          <h1 className="mt-3 font-arabic text-4xl font-bold leading-[1.05] text-foreground md:text-6xl">
            {t("brands.title")}
          </h1>
          <div className="mt-6 h-px w-28 prem-divider" />
          <p className="mt-6 max-w-3xl text-base leading-loose text-ink-600 md:text-lg">
            {t("brands.subtitle")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <h2 className="mb-8 font-arabic text-2xl font-bold text-foreground md:text-3xl">
          {t("brands.systemTitle")}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b, idx) => (
            <BrandCard key={b.id} brand={b} index={idx} ctaLabel={t("cta.viewProducts")} />
          ))}
        </div>
      </section>

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
