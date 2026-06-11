import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCorporateIdentity } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";
import { useLocale } from "@/i18n/LocaleProvider";
import { useLocalizedIdentity } from "@/i18n/identity";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });

export const Route = createFileRoute("/$lang/partners")({
  head: ({ params }) => {
    const url = `https://rukna-ltawfir.lovable.app/${params.lang}/partners`;
    const isAr = params.lang === "ar";
    const title = isAr ? "الشراكات التجارية — ركن التوفير كوزمتك للتجارة" : "Business Partnerships — Rukn Al-Tawfir Cosmetic for Trade";
    const desc = isAr
      ? "فرص الشراكة للموزعين والصيدليات والمحلات الكبرى ضمن منظومة ركن التوفير. تواصل عبر واتساب الأعمال الرسمي."
      : "Partnership opportunities for distributors, pharmacies, and major retailers within the Rukn Al-Tawfir ecosystem.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: isAr ? "الشراكات التجارية — ركن التوفير" : "Business Partnerships — Rukn Al-Tawfir" },
        { property: "og:description", content: isAr ? "فرص الجملة والتوزيع لعلامات صحية عالمية في اليمن." : "Wholesale and distribution opportunities for global health brands in Yemen." },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(identityQO);
  },
  component: PartnersPage,
});

function PartnersPage() {
  const { t } = useLocale();
  const { data: id } = useSuspenseQuery(identityQO);
  const ident = useLocalizedIdentity(id);

  const tiers = [
    { t: t("partners.tiers.wholesaleT"), d: t("partners.tiers.wholesaleD") },
    { t: t("partners.tiers.pharmaT"), d: t("partners.tiers.pharmaD") },
    { t: t("partners.tiers.retailT"), d: t("partners.tiers.retailD") },
    { t: t("partners.tiers.digitalT"), d: t("partners.tiers.digitalD") },
  ];

  const advantages = (t("partners.advantages") as unknown as string[]) ?? [];
  const advantagesArr = Array.isArray(advantages)
    ? advantages
    : [
        t("partners.advantages.0" as never),
        t("partners.advantages.1" as never),
        t("partners.advantages.2" as never),
        t("partners.advantages.3" as never),
      ];

  const waMsg = t("partners.waMsg");

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
          <div className="hq-eyebrow">{t("partners.eyebrow")}</div>
          <h1 className="mt-3 font-arabic text-4xl font-bold leading-[1.05] text-foreground md:text-6xl">
            {t("partners.title")}
          </h1>
          <div className="mt-6 h-px w-28 prem-divider" />
          <p className="mt-6 max-w-3xl text-base leading-loose text-ink-600 md:text-lg">
            {t("partners.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppCTA number={id.whatsapp_number} message={waMsg}>
              {t("partners.openChat")}
            </WhatsAppCTA>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="hq-eyebrow">{t("partners.channelsEyebrow")}</div>
        <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
          {t("partners.channelsTitle")}
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier, i) => (
            <article key={tier.t} className="prem-card relative p-6">
              <div className="text-[10px] font-bold tracking-[0.24em] text-trust-700">0{i + 1}</div>
              <h3 className="mt-3 font-arabic text-lg font-bold text-foreground">{tier.t}</h3>
              <p className="mt-3 text-[13px] leading-loose text-ink-600">{tier.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-2 md:px-8">
          <div>
            <div className="hq-eyebrow">{t("partners.whyEyebrow")}</div>
            <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
              {t("partners.whyTitle")}
            </h2>
            <ul className="mt-7 space-y-4">
              {advantagesArr.map((a) => (
                <li key={a} className="flex items-start gap-3 text-[15px] leading-loose text-foreground">
                  <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-leaf-50 text-leaf-700">✓</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-3xl p-8 md:p-10">
            <div className="hq-eyebrow">{t("partners.channelEyebrow")}</div>
            <h3 className="mt-3 font-arabic text-2xl font-bold text-foreground">{t("partners.channelTitle")}</h3>
            <p className="mt-3 text-sm leading-loose text-ink-600">{t("partners.channelDesc")}</p>
            <div className="mt-6 rounded-2xl border border-border bg-card p-5">
              <div className="text-xs font-semibold text-ink-600">{t("partners.waNumberLabel")}</div>
              <div className="mt-1 font-arabic text-xl font-bold text-trust-700">+967 {id.whatsapp_number}</div>
            </div>
            <div className="mt-6">
              <WhatsAppCTA number={id.whatsapp_number} message={waMsg} className="w-full">
                {t("partners.sendNow")}
              </WhatsAppCTA>
            </div>
          </div>
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
