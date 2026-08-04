import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCorporateIdentity, getSitePage, listBranches } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";
import { useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { useLocalizedIdentity } from "@/i18n/identity";
import { itemText, pickHeading, pickList, pickRich, pickText } from "@/lib/page-content";
import { RichText, StyledHeading } from "@/components/site/RichText";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const pageQO = queryOptions({ queryKey: ["site-page", "contact"], queryFn: () => getSitePage({ data: "contact" }) });
const branchesQO = queryOptions({ queryKey: ["branches"], queryFn: () => listBranches() });

export const Route = createFileRoute("/$lang/contact")({
  head: ({ params }) => {
    const url = `https://ruknaltawfer.com/${params.lang}/contact`;
    const isAr = params.lang === "ar";
    const title = isAr ? "تواصل معنا — ركن التوفير كوزمتك للتجارة" : "Contact — Rukn Al-Tawfir Cosmetic for Trade";
    const desc = isAr
      ? "تواصل مباشر مع ركن التوفير عبر واتساب الأعمال، الهاتف، والبريد الإلكتروني. قناة موحّدة لجميع الاستفسارات التجارية."
      : "Reach Rukn Al-Tawfir directly via WhatsApp Business, phone, and email. A unified channel for all business inquiries.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: isAr ? "تواصل معنا — ركن التوفير" : "Contact — Rukn Al-Tawfir" },
        { property: "og:description", content: isAr ? "قنوات التواصل الرسمية مع المقرّ الرقمي لركن التوفير." : "Official contact channels for the Rukn Al-Tawfir digital HQ." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: isAr ? "ركن التوفير كوزمتك للتجارة" : "Rukn Al-Tawfir Cosmetic for Trade",
            url,
            image: "https://ruknaltawfer.com/rukn-logo.webp",
            address: { "@type": "PostalAddress", addressCountry: "YE" },
            areaServed: "YE",
          }),
        },
      ],
    };
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(pageQO),
      context.queryClient.ensureQueryData(branchesQO),
    ]);
  },
  component: ContactPage,
});

function ContactPage() {
  const { lang, t } = useLocale();
  const isAr = lang === "ar";
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: page } = useSuspenseQuery(pageQO);
  const { data: branches } = useSuspenseQuery(branchesQO);
  const ident = useLocalizedIdentity(id);

  const c = page?.content ?? {};
  const T = (key: string, fallback: string) => pickText(c, key, lang, fallback);
  const R = (key: string, fallback: string) => pickRich(c, key, lang, fallback);
  const H = (key: string) => pickHeading(c, key, lang);

  const emails = pickList<any>(c, "emails.items", id.email ? [{ label_ar: t("contact.cards.emailHint"), value: id.email }] : []);
  const headquarters = branches[0];
  const headquartersAddress = headquarters
    ? (isAr ? headquarters.address_ar : headquarters.address_en || headquarters.address_ar)
    : (ident.address ?? t("contact.cards.fallbackAddress"));

  const [subject, setSubject] = useState(t("contact.subjects.general"));
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");

  const composed =
    `${t("contact.msgIntro")}،\n${t("contact.msgName")}: ${name || t("contact.msgEmpty")}\n${t("contact.msgSubject")}: ${subject}\n${t("contact.msgDetails")}: ${details || t("contact.msgEmpty")}`;

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
          <div className="hq-eyebrow">{T("hero.eyebrow", t("contact.eyebrow"))}</div>
          <h1 className="mt-3 font-arabic text-4xl font-bold leading-[1.05] text-foreground md:text-6xl">
            {T("hero.title", t("contact.title"))}
          </h1>
          <div className="mt-6 h-px w-28 prem-divider" />
          <p className="mt-6 max-w-3xl text-base leading-loose text-ink-600 md:text-lg">
            {T("hero.subtitle", t("contact.subtitle"))}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="prem-card p-6">
            <div className="hq-eyebrow">{T("cards.waHint", t("contact.cards.waHint"))}</div>
            <div className="mt-2 font-arabic text-lg font-bold text-foreground">
              {T("cards.waTitle", t("contact.cards.waT"))}
            </div>
            <div className="mt-2 text-sm leading-relaxed text-ink-600 break-words" dir="ltr">
              +967 {id.whatsapp_number}
            </div>
          </div>

          <div className="prem-card p-6">
            <div className="hq-eyebrow">{T("cards.emailHint", t("contact.cards.emailHint"))}</div>
            <div className="mt-2 font-arabic text-lg font-bold text-foreground">
              {T("cards.emailTitle", t("contact.cards.emailT"))}
            </div>
            <ul className="mt-2 space-y-2">
              {emails.length === 0 && <li className="text-sm text-ink-600">—</li>}
              {emails.map((e: any, i: number) => {
                const value = typeof e?.value === "string" ? e.value : "";
                const label = itemText(e, "label", lang);
                return (
                  <li key={`${value}-${i}`} className="text-sm leading-relaxed text-ink-600">
                    {label && <span className="block text-[11px] text-muted-foreground">{label}</span>}
                    {value ? (
                      <a href={`mailto:${value}`} dir="ltr" className="break-all font-medium text-trust-700 hover:underline">
                        {value}
                      </a>
                    ) : "—"}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="prem-card p-6">
            <div className="hq-eyebrow">{T("cards.addressHint", t("contact.cards.addressHint"))}</div>
            <div className="mt-2 font-arabic text-lg font-bold text-foreground">
              {T("cards.addressTitle", t("contact.cards.addressT"))}
            </div>
            <div className="mt-2 text-sm leading-relaxed text-ink-600 break-words">{headquartersAddress}</div>
          </div>
        </div>
      </section>

      {branches.length > 0 && (
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
            <div className="hq-eyebrow">{T("branches.eyebrow", isAr ? "شبكة الفروع" : "Branch network")}</div>
            <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
              {T("branches.title", isAr ? "فروعنا وعناويننا" : "Our branches and addresses")}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-loose text-ink-600">
              {T(
                "branches.subtitle",
                isAr
                  ? "اختر الفرع الأقرب إليك وتواصل معنا مباشرة عبر واتساب."
                  : "Choose the branch nearest to you and reach us directly on WhatsApp.",
              )}
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {branches.map((b) => {
                const bName = (isAr ? b.name_ar : b.name_en || b.name_ar) ?? "";
                const bAddress = (isAr ? b.address_ar : b.address_en || b.address_ar) ?? "";
                const message = (isAr ? b.whatsapp_message_ar : b.whatsapp_message_en || b.whatsapp_message_ar) ?? undefined;
                const local = (b.whatsapp_number || "").replace(/^\+?967/, "");
                return (
                  <article key={b.id} className="flex h-full flex-col rounded-2xl border border-border bg-background p-6 premium-shadow">
                    <h3 className="font-arabic text-lg font-bold text-foreground">{bName}</h3>
                    <div className="mt-3 h-px w-12 prem-divider" />
                    <p className="mt-4 flex-1 text-sm leading-loose text-ink-600">{bAddress}</p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <WhatsAppCTA number={local} message={message} variant="pill">
                        {isAr ? "تواصل عبر واتساب" : "Contact on WhatsApp"}
                      </WhatsAppCTA>
                      {b.map_url ? (
                        <a
                          href={b.map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-trust-700 transition-colors hover:bg-secondary"
                        >
                          {isAr ? "الموقع على الخريطة" : "View on map"}
                        </a>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1fr_1.2fr] md:px-8 md:py-20">
          <div>
            <div className="hq-eyebrow">{T("form.eyebrow", t("contact.formEyebrow"))}</div>
            <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
              {T("form.title", t("contact.formTitle"))}
            </h2>
            <p className="mt-4 text-sm leading-loose text-ink-600">{T("form.desc", t("contact.formDesc"))}</p>
          </div>
          <form
            className="glass rounded-3xl p-6 md:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              const url = `https://wa.me/967${id.whatsapp_number}?text=${encodeURIComponent(composed)}`;
              window.open(url, "_blank", "noopener,noreferrer");
            }}
          >
            <label className="block text-xs font-semibold text-ink-600">{t("contact.fieldName")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:border-trust-700 focus:outline-none"
              placeholder={t("contact.namePlaceholder")}
            />
            <label className="mt-4 block text-xs font-semibold text-ink-600">{t("contact.fieldSubject")}</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:border-trust-700 focus:outline-none"
            >
              <option>{t("contact.subjects.general")}</option>
              <option>{t("contact.subjects.product")}</option>
              <option>{t("contact.subjects.partnership")}</option>
              <option>{t("contact.subjects.catalog")}</option>
              <option>{t("contact.subjects.support")}</option>
            </select>
            <label className="mt-4 block text-xs font-semibold text-ink-600">{t("contact.fieldDetails")}</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:border-trust-700 focus:outline-none"
              placeholder={t("contact.detailsPlaceholder")}
            />
            <button
              type="submit"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 wa-pulse"
            >
              {T("form.submit", t("contact.openChat"))}
            </button>
            <div className="mt-3 text-center text-[11px] text-ink-600">
              {t("contact.orDirect")} <WhatsAppCTA number={id.whatsapp_number} variant="pill" className="!inline !px-3 !py-1 !text-[11px]">{t("contact.directWa")}</WhatsAppCTA>
            </div>
          </form>
        </div>
      </section>

      <SiteFooter
        legalName={ident.legalName}
        parentGroup={ident.parentGroup}
        whatsappNumber={id.whatsapp_number}
        email={id.email}
        address={ident.address}
        logoUrl={id.logo_url}
      />
    </div>
  );
}
