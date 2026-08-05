import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { getCorporateIdentity, getSitePage, listBranches } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";
import { useLocale } from "@/i18n/LocaleProvider";
import { useLocalizedIdentity } from "@/i18n/identity";
import { RichText, StyledHeading } from "@/components/site/RichText";
import { BRANCHES_FALLBACK, pickHeading, pickRich, pickText } from "@/lib/page-content";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const branchesQO = queryOptions({ queryKey: ["branches"], queryFn: () => listBranches() });
const pageQO = queryOptions({ queryKey: ["site-page", "branches"], queryFn: () => getSitePage({ data: "branches" }) });


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
      context.queryClient.ensureQueryData(pageQO),
    ]);
  },
  component: BranchesPage,
});

function BranchesPage() {
  const { lang } = useLocale();
  const isAr = lang === "ar";
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: branches } = useSuspenseQuery(branchesQO);
  const { data: page } = useSuspenseQuery(pageQO);
  const ident = useLocalizedIdentity(id);

  const content = (page?.content ?? null) as any;
  const T = (k: string, fb: string) => pickText(content, k, lang as "ar" | "en", fb);
  const R = (k: string, fb: string) => pickRich(content, k, lang as "ar" | "en", fb);
  const H = (k: string) => pickHeading(content, k, lang as "ar" | "en");
  const B = BRANCHES_FALLBACK;

  const waLabel = T("list.waLabel", isAr ? B.waLabel_ar : B.waLabel_en);
  const mapLabel = T("list.mapLabel", isAr ? B.mapLabel_ar : B.mapLabel_en);

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
          <div className="hq-eyebrow">{T("hero.eyebrow", isAr ? B.eyebrow_ar : B.eyebrow_en)}</div>
          <StyledHeading
            heading={H("hero.title")}
            level={1}
            className="mt-3 font-arabic text-4xl font-bold leading-[1.05] text-foreground md:text-6xl"
          >
            {isAr ? B.title_ar : B.title_en}
          </StyledHeading>
          <div className="mt-6 h-px w-28 prem-divider" />
          <RichText
            as="p"
            className="mt-6 max-w-3xl text-base leading-loose text-ink-600 md:text-lg"
            value={R("hero.intro", isAr ? B.intro_ar : B.intro_en)}
          />
        </div>
      </section>

      <section className="bg-card py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          {branches.length === 0 ? (
            <p className="text-center text-ink-600">
              {T("list.empty", isAr ? B.empty_ar : B.empty_en)}
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
                    <RichText as="p" className="mt-4 flex-1 text-sm leading-loose text-ink-600" value={address} />
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <WhatsAppCTA number={local} message={message} variant="pill">
                        {waLabel}
                      </WhatsAppCTA>
                      {b.map_url ? (
                        <a
                          href={b.map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-trust-700 transition-colors hover:bg-secondary"
                        >
                          {mapLabel}
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
