import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { getCorporateIdentity, listBranches } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";
import { useLocale } from "@/i18n/LocaleProvider";
import { useLocalizedIdentity } from "@/i18n/identity";
import { RichText } from "@/components/site/RichText";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const branchesQO = queryOptions({ queryKey: ["branches"], queryFn: () => listBranches() });

const INTRO_AR =
  "نقترب منكم عبر فروعنا في عدد من المحافظات اليمنية، لنقدّم خدماتنا التجارية والتوزيعية بكفاءة، ونوفّر لعملائنا وشركائنا قنوات تواصل مباشرة وسريعة. اختر الفرع الأقرب إليك وتواصل معنا عبر واتساب.";
const INTRO_EN =
  "We stay close to you through our branches across several Yemeni governorates, delivering our trade and distribution services efficiently and giving customers and partners fast, direct contact channels. Choose the branch nearest to you and reach us on WhatsApp.";

export const Route = createFileRoute("/$lang/branches")({
  head: ({ params }) => {
    const url = `https://ruknaltawfer.com/${params.lang}/branches`;
    const isAr = params.lang === "ar";
    const title = isAr
      ? "فروعنا وعناويننا — ركن التوفير كوزمتك للتجارة"
      : "Our Branches — Rukn Al-Tawfir Cosmetic for Trade";
    const desc = isAr
      ? "عناوين فروع ركن التوفير في عدن وتعز وصنعاء، مع تواصل مباشر عبر واتساب لكل فرع."
      : "Addresses of Rukn Al-Tawfir branches in Aden, Taiz and Sanaa, with direct WhatsApp contact for each branch.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: isAr ? "فروعنا وعناويننا — ركن التوفير" : "Our Branches — Rukn Al-Tawfir" },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(branchesQO),
    ]);
  },
  component: BranchesPage,
});

function BranchesPage() {
  const { lang } = useLocale();
  const isAr = lang === "ar";
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: branches } = useSuspenseQuery(branchesQO);
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
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <div className="hq-eyebrow">{isAr ? "شبكة الفروع" : "Branch network"}</div>
          <h1 className="mt-3 font-arabic text-4xl font-bold leading-[1.05] text-foreground md:text-6xl">
            {isAr ? "فروعنا وعناويننا" : "Our Branches"}
          </h1>
          <div className="mt-6 h-px w-28 prem-divider" />
          <p className="mt-6 max-w-3xl text-base leading-loose text-ink-600 md:text-lg">
            {isAr ? INTRO_AR : INTRO_EN}
          </p>
        </div>
      </section>

      <section className="bg-card py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          {branches.length === 0 ? (
            <p className="text-center text-ink-600">
              {isAr ? "سيتم إضافة الفروع قريبًا." : "Branches will be added soon."}
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {branches.map((b) => {
                const name = (isAr ? b.name_ar : b.name_en || b.name_ar) ?? "";
                const address = (isAr ? b.address_ar : b.address_en || b.address_ar) ?? "";
                const message =
                  (isAr ? b.whatsapp_message_ar : b.whatsapp_message_en || b.whatsapp_message_ar) ?? undefined;
                const local = (b.whatsapp_number || "").replace(/^\+?967/, "");
                return (
                  <article
                    key={b.id}
                    className="flex h-full flex-col rounded-2xl border border-border bg-background p-6 premium-shadow transition-transform hover:-translate-y-0.5"
                  >
                    <h2 className="font-arabic text-xl font-bold text-foreground">{name}</h2>
                    <div className="mt-3 h-px w-12 prem-divider" />
                    <p className="mt-4 flex-1 text-sm leading-loose text-ink-600">{address}</p>
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
          )}
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
