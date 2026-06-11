import { LLink } from "@/i18n/LLink";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCorporateIdentity, listBrands } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";
import { useLocale } from "@/i18n/LocaleProvider";
import { useLocalizedIdentity } from "@/i18n/identity";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const brandsQO = queryOptions({ queryKey: ["brands"], queryFn: () => listBrands() });

export const Route = createFileRoute("/$lang/about")({
  head: ({ params }) => {
    const url = `https://rukna-ltawfir.lovable.app/${params.lang}/about`;
    const isAr = params.lang === "ar";
    const title = isAr ? "من نحن — ركن التوفير كوزمتك للتجارة" : "About — Rukn Al-Tawfir Cosmetic for Trade";
    const desc = isAr
      ? "قصة ركن التوفير: الوكيل الحصري لمنظومة من العلامات الصحية العالمية في اليمن. رؤيتنا، مهمتنا، قيمنا، وموقعنا الاستراتيجي."
      : "The Rukn Al-Tawfir story: exclusive agent for a system of global health brands in Yemen. Our vision, mission, values, and strategic position.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: isAr ? "من نحن — ركن التوفير" : "About — Rukn Al-Tawfir" },
        { property: "og:description", content: isAr ? "وكيل حصري لعلامات صحية عالمية في اليمن، بحوكمة مؤسسية وأصول رسمية." : "Exclusive agent for global health brands in Yemen, with institutional governance and official assets." },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(brandsQO),
    ]);
  },
  component: AboutPage,
});

function AboutPage() {
  const { lang, t } = useLocale();
  const isAr = lang === "ar";
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: brands } = useSuspenseQuery(brandsQO);
  const ident = useLocalizedIdentity(id);

  const pillars = [
    { t: t("about.pillars.storyT"), d: t("about.pillars.storyD") },
    { t: t("about.pillars.missionT"), d: t("about.pillars.missionD") },
    { t: t("about.pillars.visionT"), d: t("about.pillars.visionD") },
    { t: t("about.pillars.valuesT"), d: t("about.pillars.valuesD") },
    { t: t("about.pillars.positionT"), d: t("about.pillars.positionD") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        legalName={ident.legalName}
        parentGroup={ident.parentGroup}
        whatsappNumber={id.whatsapp_number}
        logoUrl={id.logo_url}
      />

      <section className="relative overflow-hidden cinema-hero">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <div className="hq-eyebrow">{t("about.eyebrow")}</div>
          <h1 className="mt-3 font-arabic text-4xl font-bold leading-[1.05] text-foreground md:text-6xl">
            {ident.legalName} {t("about.titleSuffix")}
          </h1>
          <div className="mt-6 h-px w-28 prem-divider" />
          <p className="mt-6 max-w-3xl text-base leading-loose text-ink-600 md:text-lg">
            {t("about.subtitle")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        <div className="grid gap-6 md:grid-cols-2">
          {pillars.map((p, i) => (
            <article key={p.t} className="prem-card relative p-7 md:p-9">
              <div className="text-[10px] font-bold tracking-[0.24em] text-trust-700">0{i + 1}</div>
              <h2 className="mt-3 font-arabic text-2xl font-bold text-foreground">{p.t}</h2>
              <div className="mt-4 h-px w-12 prem-divider" />
              <p className="mt-4 text-[15px] leading-loose text-ink-600">{p.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <div className="hq-eyebrow">{t("about.fullSystemEyebrow")}</div>
          <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
            {t("about.fullSystemTitle")}
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {brands.map((b) => {
              const name = isAr ? b.name_ar : b.name_en;
              return (
                <LLink
                  key={b.id}
                  to="/$lang/brands/$slug"
                  params={{ slug: b.slug }}
                  className="podium grid h-24 place-items-center p-3 transition-transform hover:-translate-y-1"
                  title={name}
                >
                  {b.logo_url ? (
                    <img src={b.logo_url} alt={name} className="max-h-14 w-auto object-contain" loading="lazy" />
                  ) : (
                    <span className="text-[10px] font-bold text-muted-foreground">{b.name_en}</span>
                  )}
                </LLink>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20 text-center md:px-8">
        <h2 className="font-arabic text-3xl font-bold text-foreground md:text-4xl">
          {t("about.ctaTitle")}
        </h2>
        <p className="mt-4 text-ink-600">{t("about.ctaDesc")}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <WhatsAppCTA number={id.whatsapp_number}>{t("about.ctaWhatsapp")}</WhatsAppCTA>
          <LLink
            to="/$lang/partners"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-trust-700 hover:text-trust-700"
          >
            {t("about.ctaPartners")}
          </LLink>
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
