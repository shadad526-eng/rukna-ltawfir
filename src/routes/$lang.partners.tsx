import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCorporateIdentity, getSitePage } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";
import { useLocale } from "@/i18n/LocaleProvider";
import { useLocalizedIdentity } from "@/i18n/identity";
import { itemRich, itemText, pickHeading, pickList, pickRich, pickText } from "@/lib/page-content";
import { RichText, StyledHeading } from "@/components/site/RichText";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const pageQO = queryOptions({ queryKey: ["site-page", "partners"], queryFn: () => getSitePage({ data: "partners" }) });

export const Route = createFileRoute("/$lang/partners")({
  head: ({ params }) => {
    const url = `https://ruknaltawfer.com/${params.lang}/partners`;
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
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(pageQO),
    ]);
  },
  component: PartnersPage,
});

function PartnersPage() {
  const { lang, t } = useLocale();
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: page } = useSuspenseQuery(pageQO);
  const ident = useLocalizedIdentity(id);

  const c = page?.content ?? {};
  const T = (key: string, fallback: string) => pickText(c, key, lang, fallback);

  const tiers = pickList(c, "tiers.items", [
    { title_ar: t("partners.tiers.wholesaleT"), desc_ar: t("partners.tiers.wholesaleD") },
    { title_ar: t("partners.tiers.pharmaT"), desc_ar: t("partners.tiers.pharmaD") },
    { title_ar: t("partners.tiers.retailT"), desc_ar: t("partners.tiers.retailD") },
    { title_ar: t("partners.tiers.digitalT"), desc_ar: t("partners.tiers.digitalD") },
  ]);

  const rawAdvantages = t("partners.advantages") as unknown;
  const fallbackAdvantages = (Array.isArray(rawAdvantages) ? (rawAdvantages as string[]) : []).map((a) => ({ text_ar: a }));
  const advantagesArr = pickList(c, "why.items", fallbackAdvantages);

  const waMsg = T("hero.waMsg", t("partners.waMsg"));

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
          <div className="hq-eyebrow">{T("hero.eyebrow", t("partners.eyebrow"))}</div>
          <h1 className="mt-3 font-arabic text-4xl font-bold leading-[1.05] text-foreground md:text-6xl">
            {T("hero.title", t("partners.title"))}
          </h1>
          <div className="mt-6 h-px w-28 prem-divider" />
          <p className="mt-6 max-w-3xl text-base leading-loose text-ink-600 md:text-lg">
            {T("hero.subtitle", t("partners.subtitle"))}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppCTA number={id.whatsapp_number} message={waMsg}>
              {T("hero.openChat", t("partners.openChat"))}
            </WhatsAppCTA>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="hq-eyebrow">{T("tiers.eyebrow", t("partners.channelsEyebrow"))}</div>
        <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
          {T("tiers.title", t("partners.channelsTitle"))}
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier: any, i: number) => (
            <article key={`${itemText(tier, "title", lang)}-${i}`} className="prem-card relative p-6">
              <div className="text-[10px] font-bold tracking-[0.24em] text-trust-700">0{i + 1}</div>
              <h3 className="mt-3 font-arabic text-lg font-bold text-foreground">{itemText(tier, "title", lang)}</h3>
              <p className="mt-3 text-[13px] leading-loose text-ink-600">{itemText(tier, "desc", lang)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-2 md:px-8">
          <div>
            <div className="hq-eyebrow">{T("why.eyebrow", t("partners.whyEyebrow"))}</div>
            <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
              {T("why.title", t("partners.whyTitle"))}
            </h2>
            <ul className="mt-7 space-y-4">
              {advantagesArr.map((a: any, i: number) => (
                <li key={`${itemText(a, "text", lang)}-${i}`} className="flex items-start gap-3 text-[15px] leading-loose text-foreground">
                  <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-leaf-50 text-leaf-700">✓</span>
                  <span>{itemText(a, "text", lang)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-3xl p-8 md:p-10">
            <div className="hq-eyebrow">{T("channel.eyebrow", t("partners.channelEyebrow"))}</div>
            <h3 className="mt-3 font-arabic text-2xl font-bold text-foreground">{T("channel.title", t("partners.channelTitle"))}</h3>
            <p className="mt-3 text-sm leading-loose text-ink-600">{T("channel.desc", t("partners.channelDesc"))}</p>
            <div className="mt-6 rounded-2xl border border-border bg-card p-5">
              <div className="text-xs font-semibold text-ink-600">{T("channel.numberLabel", t("partners.waNumberLabel"))}</div>
              <div className="mt-1 font-arabic text-xl font-bold text-trust-700">+967 {id.whatsapp_number}</div>
            </div>
            <div className="mt-6">
              <WhatsAppCTA number={id.whatsapp_number} message={waMsg} className="w-full">
                {T("channel.sendNow", t("partners.sendNow"))}
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
