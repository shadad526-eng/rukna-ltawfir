import { LLink } from "@/i18n/LLink";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCorporateIdentity, getSitePage, listBrands } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";
import { useLocale } from "@/i18n/LocaleProvider";
import { useLocalizedIdentity } from "@/i18n/identity";
import { itemRich, itemText, pickHeading, pickList, pickRich, pickText, type HeadingValue } from "@/lib/page-content";
import { RichText, StyledHeading } from "@/components/site/RichText";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const brandsQO = queryOptions({ queryKey: ["brands"], queryFn: () => listBrands() });
const pageQO = queryOptions({ queryKey: ["site-page", "about"], queryFn: () => getSitePage({ data: "about" }) });

export const Route = createFileRoute("/$lang/about")({
  head: ({ params }) => {
    const url = `https://ruknaltawfer.com/${params.lang}/about`;
    const isAr = params.lang === "ar";
    const title = isAr ? "من نحن — ركن التوفير كوزمتك للتجارة" : "About — Rukn Al-Tawfir Cosmetic for Trade";
    const desc = isAr
      ? "رؤية ركن التوفير ورسالتها وقيمها وغايتها المؤسسية: شريك استراتيجي للعلامات الصحية والاستهلاكية في اليمن."
      : "Rukn Al-Tawfir's vision, mission, values and corporate purpose: a strategic partner for health and consumer brands in Yemen.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: isAr ? "من نحن — ركن التوفير" : "About — Rukn Al-Tawfir" },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(brandsQO),
      context.queryClient.ensureQueryData(pageQO),
    ]);
  },
  component: AboutPage,
});

function SectionHeading({ eyebrow, title, heading }: { eyebrow: string; title: string; heading?: HeadingValue | null }) {
  return (
    <div>
      <div className="inline-flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full border border-trust-700/30 bg-trust-700/5 font-mono text-xs font-bold text-trust-700">
          {eyebrow}
        </span>
        <div className="h-px w-10 bg-gradient-to-r from-trust-700/60 to-transparent" />
      </div>
      <StyledHeading heading={heading} level={2} className="mt-4 font-arabic text-3xl font-bold leading-tight text-foreground md:text-4xl">
        {title}
      </StyledHeading>
      <div className="mt-4 h-px w-16 prem-divider" />
    </div>
  );
}

function AboutPage() {
  const { lang, t } = useLocale();
  const isAr = lang === "ar";
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: brands } = useSuspenseQuery(brandsQO);
  const { data: page } = useSuspenseQuery(pageQO);
  const ident = useLocalizedIdentity(id);

  const c = page?.content ?? {};
  const T = (key: string, fallback: string) => pickText(c, key, lang, fallback);
  const R = (key: string, fallback: string) => pickRich(c, key, lang, fallback);
  const H = (key: string) => pickHeading(c, key, lang);

  const valueKeys = ["trust", "quality", "partnership", "innovation", "responsibility", "excellence"] as const;
  const values = pickList(
    c,
    "values.items",
    valueKeys.map((k) => ({ title_ar: t(`about.values.${k}T`), desc_ar: t(`about.values.${k}D`) })),
  );


  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        legalName={ident.legalName}
        parentGroup={ident.parentGroup}
        whatsappNumber={id.whatsapp_number}
        logoUrl={id.logo_url}
      />

      {/* HERO */}
      <section className="relative overflow-hidden cinema-hero">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <div className="hq-eyebrow">{T("hero.eyebrow", t("about.eyebrow"))}</div>
          <StyledHeading heading={H("hero.title")} level={1} className="mt-3 font-arabic text-4xl font-bold leading-[1.05] text-foreground md:text-6xl">
            <>{ident.legalName} <span className="text-trust-700">{T("hero.titleSuffix", t("about.titleSuffix"))}</span></>
          </StyledHeading>
          <div className="mt-6 h-px w-28 prem-divider" />
          <RichText as="p" className="mt-6 max-w-3xl text-base leading-loose text-ink-600 md:text-lg"
            value={R("hero.subtitle", t("about.subtitle"))} />
        </div>
      </section>

      {/* VISION + MISSION */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          <article className="prem-card relative overflow-hidden p-8 md:p-10">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-trust-700 to-leaf-600" />
            <SectionHeading eyebrow={T("vision.eyebrow", t("about.vision.eyebrow"))} heading={H("vision.title")} title={T("vision.title", t("about.vision.title"))} />
            <RichText as="p" className="mt-6 text-[15px] leading-loose text-ink-600 md:text-base"
              value={R("vision.body", t("about.vision.body"))} />
          </article>
          <article className="prem-card relative overflow-hidden p-8 md:p-10">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-leaf-600 to-trust-700" />
            <SectionHeading eyebrow={T("mission.eyebrow", t("about.mission.eyebrow"))} heading={H("mission.title")} title={T("mission.title", t("about.mission.title"))} />
            <RichText as="p" className="mt-6 text-[15px] leading-loose text-ink-600 md:text-base"
              value={R("mission.body", t("about.mission.body"))} />
          </article>
        </div>
      </section>

      {/* VALUES */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <SectionHeading eyebrow={T("values.eyebrow", t("about.values.eyebrow"))} heading={H("values.title")} title={T("values.title", t("about.values.title"))} />
          <RichText as="p" className="mt-4 max-w-2xl text-[15px] leading-loose text-ink-600"
            value={R("values.subtitle", t("about.values.subtitle"))} />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v: any, i: number) => (
              <article
                key={`${itemText(v, "title", lang)}-${i}`}
                className="prem-card group relative p-7 transition-transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-trust-700 font-mono text-xs font-bold text-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-arabic text-xl font-bold text-foreground">
                    {itemText(v, "title", lang)}
                  </h3>
                </div>
                <div className="mt-4 h-px w-10 prem-divider" />
                <p className="mt-4 text-[14.5px] leading-loose text-ink-600">
                  {itemText(v, "desc", lang)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>


      {/* PURPOSE */}
      <section className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-24">
        <article className="prem-card relative overflow-hidden p-8 md:p-12">
          <div className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-trust-700 to-leaf-600" />
          <SectionHeading eyebrow={t("about.purpose.eyebrow")} title={T("purpose.title", t("about.purpose.title"))} />
          <p className="mt-6 text-base leading-loose text-ink-600 md:text-lg">
            {T("purpose.body", t("about.purpose.body"))}
          </p>
        </article>
      </section>

      {/* BRAND PROMISE — highlight */}
      <section className="relative overflow-hidden border-y border-border bg-gradient-to-br from-trust-700 via-trust-700 to-leaf-600">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center md:px-8 md:py-24">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 backdrop-blur">
            <span className="font-mono text-[11px] font-bold tracking-[0.22em] text-white">
              {t("about.promise.eyebrow")}
            </span>
            <span className="h-3 w-px bg-white/40" />
            <span className="text-[11px] font-semibold tracking-[0.18em] text-white/90">
              {T("promise.title", t("about.promise.title"))}
            </span>
          </div>
          <blockquote className="mt-8 font-arabic text-2xl font-bold leading-[1.5] text-white md:text-4xl md:leading-[1.45]">
            <span className="text-white/80">{isAr ? "”" : "“"}</span>
            {T("promise.body", t("about.promise.body"))}
            <span className="text-white/80">{isAr ? "“" : "”"}</span>
          </blockquote>
          <div className="mx-auto mt-8 h-px w-24 bg-white/40" />
        </div>
      </section>

      {/* WHAT WE BELIEVE */}
      <section className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-24">
        <SectionHeading eyebrow={t("about.believe.eyebrow")} title={T("believe.title", t("about.believe.title"))} />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <p className="text-[15px] leading-loose text-ink-600 md:text-base">
            {T("believe.body1", t("about.believe.body1"))}
          </p>
          <p className="text-[15px] leading-loose text-ink-600 md:text-base">
            {T("believe.body2", t("about.believe.body2"))}
          </p>
        </div>
      </section>

      {/* FULL ECOSYSTEM */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <div className="hq-eyebrow">{T("ecosystem.eyebrow", t("about.fullSystemEyebrow"))}</div>
          <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
            {T("ecosystem.title", t("about.fullSystemTitle"))}
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
                    <img src={b.logo_url} alt={isAr ? `شعار العلامة التجارية ${name} — ضمن منظومة ركن التوفير` : `${name} brand emblem — part of the Rukn Al-Tawfir portfolio`} className="max-h-14 w-auto object-contain" loading="lazy" />
                  ) : (
                    <span className="text-[10px] font-bold text-muted-foreground">{b.name_en}</span>
                  )}
                </LLink>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center md:px-8">
        <h2 className="font-arabic text-3xl font-bold text-foreground md:text-4xl">
          {T("cta.title", t("about.ctaTitle"))}
        </h2>
        <p className="mt-4 text-ink-600">{T("cta.desc", t("about.ctaDesc"))}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <WhatsAppCTA number={id.whatsapp_number}>{T("cta.whatsapp", t("about.ctaWhatsapp"))}</WhatsAppCTA>
          <LLink
            to="/$lang/partners"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-trust-700 hover:text-trust-700"
          >
            {T("cta.partners", t("about.ctaPartners"))}
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
