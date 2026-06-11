import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCorporateIdentity } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";
import { useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { useLocalizedIdentity } from "@/i18n/identity";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });

export const Route = createFileRoute("/$lang/contact")({
  head: ({ params }) => {
    const url = `https://rukna-ltawfir.lovable.app/${params.lang}/contact`;
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
            image: "https://rukna-ltawfir.lovable.app/rukn-logo.webp",
            address: { "@type": "PostalAddress", addressCountry: "YE" },
            areaServed: "YE",
          }),
        },
      ],
    };
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(identityQO);
  },
  component: ContactPage,
});

function ContactPage() {
  const { t } = useLocale();
  const { data: id } = useSuspenseQuery(identityQO);
  const ident = useLocalizedIdentity(id);

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
          <div className="hq-eyebrow">{t("contact.eyebrow")}</div>
          <h1 className="mt-3 font-arabic text-4xl font-bold leading-[1.05] text-foreground md:text-6xl">
            {t("contact.title")}
          </h1>
          <div className="mt-6 h-px w-28 prem-divider" />
          <p className="mt-6 max-w-3xl text-base leading-loose text-ink-600 md:text-lg">
            {t("contact.subtitle")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { t: t("contact.cards.waT"), v: `+967 ${id.whatsapp_number}`, hint: t("contact.cards.waHint") },
            { t: t("contact.cards.emailT"), v: id.email ?? "—", hint: t("contact.cards.emailHint") },
            { t: t("contact.cards.addressT"), v: ident.address ?? t("contact.cards.fallbackAddress"), hint: t("contact.cards.addressHint") },
          ].map((c) => (
            <div key={c.t} className="prem-card p-6">
              <div className="hq-eyebrow">{c.hint}</div>
              <div className="mt-2 font-arabic text-lg font-bold text-foreground">{c.t}</div>
              <div className="mt-2 text-sm leading-relaxed text-ink-600 break-words">{c.v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1fr_1.2fr] md:px-8 md:py-20">
          <div>
            <div className="hq-eyebrow">{t("contact.formEyebrow")}</div>
            <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
              {t("contact.formTitle")}
            </h2>
            <p className="mt-4 text-sm leading-loose text-ink-600">{t("contact.formDesc")}</p>
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
              {t("contact.openChat")}
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
      />
    </div>
  );
}
