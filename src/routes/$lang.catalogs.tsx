import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getCorporateIdentity, listCatalogs, submitCatalogRequest, type CatalogSummary } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";
import { useLocale } from "@/i18n/LocaleProvider";
import { useLocalizedIdentity } from "@/i18n/identity";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const catalogsQO = queryOptions({ queryKey: ["catalogs"], queryFn: () => listCatalogs() });

export const Route = createFileRoute("/$lang/catalogs")({
  head: ({ params }) => {
    const url = `https://ruknaltawfer.com/${params.lang}/catalogs`;
    const isAr = params.lang === "ar";
    const title = isAr ? "الكتالوجات الرسمية — ركن التوفير كوزمتك للتجارة" : "Official Catalogs — Rukn Al-Tawfir Cosmetic for Trade";
    const desc = isAr
      ? "تصفّح الكتالوجات الرسمية للعلامات الصحية الممثلة من ركن التوفير. الكتالوجات المقيدة تتطلب طلب وصول."
      : "Browse official catalogs for the health brands represented by Rukn Al-Tawfir. Restricted catalogs require an access request.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: isAr ? "الكتالوجات — ركن التوفير" : "Catalogs — Rukn Al-Tawfir" },
        { property: "og:description", content: isAr ? "كتالوجات رسمية ومحدّثة لجميع علامات المنظومة." : "Official, up-to-date catalogs for every brand in the ecosystem." },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(catalogsQO),
    ]);
  },
  component: CatalogsHub,
  errorComponent: ({ error }) => <CatalogsErrorState message={error.message} />,
});

function CatalogsErrorState({ message }: { message: string }) {
  const { t } = useLocale();
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">{t("errors.catalogsLoadFailed")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function CatalogsHub() {
  const { t } = useLocale();
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: catalogs } = useSuspenseQuery(catalogsQO);
  const ident = useLocalizedIdentity(id);
  const [requestFor, setRequestFor] = useState<CatalogSummary | null>(null);

  const visibilityMap: Record<CatalogSummary["visibility"], { label: string; tone: string }> = {
    public: { label: t("catalogs.visibility.public"), tone: "bg-leaf-50 text-leaf-700" },
    restricted: { label: t("catalogs.visibility.restricted"), tone: "bg-secondary text-primary" },
    b2b_only: { label: t("catalogs.visibility.b2b_only"), tone: "bg-trust-50 text-trust-700" },
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        legalName={ident.legalName}
        parentGroup={ident.parentGroup}
        whatsappNumber={id.whatsapp_number}
        logoUrl={id.logo_url}
      />

      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
          <div className="text-xs font-semibold uppercase tracking-wide text-primary">{t("catalogs.eyebrow")}</div>
          <h1 className="mt-2 text-3xl font-bold text-foreground md:text-5xl">{t("catalogs.title")}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("catalogs.subtitle")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        {catalogs.length === 0 ? (
          <div className="prem-card p-10 text-center">
            <h3 className="font-arabic text-xl font-bold text-foreground">{t("catalogs.empty")}</h3>
            <p className="mt-3 text-sm leading-loose text-ink-600">{t("catalogs.emptyDesc")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {catalogs.map((c) => {
              const vis = visibilityMap[c.visibility];
              return (
                <article key={c.id} className="prem-card group flex h-full flex-col overflow-hidden">
                  <div className="podium relative flex aspect-[3/4] items-center justify-center border-b border-border/70 p-6">
                    {c.cover_url ? (
                      <img src={c.cover_url} alt={c.title_ar} className="size-full object-contain transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" />
                    ) : (
                      <span className="text-xs text-muted-foreground">{t("catalogs.coverFallback")}</span>
                    )}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 prem-shimmer opacity-0 group-hover:opacity-100" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${vis.tone}`}>
                      {vis.label}
                    </span>
                    <h3 className="mt-3 font-arabic text-lg font-bold text-foreground">{c.title_ar}</h3>
                    {c.brand_name_ar ? (
                      <div className="mt-1 text-xs text-muted-foreground">{c.brand_name_ar}{c.year ? ` · ${c.year}` : ""}</div>
                    ) : c.year ? (
                      <div className="mt-1 text-xs text-muted-foreground">{c.year}</div>
                    ) : null}
                    {c.description_ar ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-loose text-ink-600">{c.description_ar}</p>
                    ) : null}

                    <div className="mt-auto pt-5">
                      {c.visibility === "public" && c.pdf_url ? (
                        <a
                          href={c.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          {t("catalogs.downloadPdf")}
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRequestFor(c)}
                          className="inline-flex w-full items-center justify-center rounded-xl border border-primary/40 bg-background px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
                        >
                          {t("catalogs.requestAccess")}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="prem-card p-6 text-sm leading-loose text-ink-600 md:p-7">
          <span className="font-semibold text-foreground">{t("catalogs.governanceTitle")}</span> {t("catalogs.governanceBody")}
        </div>
      </section>

      {requestFor ? <CatalogRequestDialog catalog={requestFor} onClose={() => setRequestFor(null)} whatsapp={id.whatsapp_number} /> : null}

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

function CatalogRequestDialog({ catalog, onClose, whatsapp }: { catalog: CatalogSummary; onClose: () => void; whatsapp: string }) {
  const { t } = useLocale();
  const submit = useServerFn(submitCatalogRequest);
  const mutation = useMutation({
    mutationFn: (vars: Parameters<typeof submitCatalogRequest>[0]["data"]) => submit({ data: vars }),
  });
  const [form, setForm] = useState({ full_name: "", email: "", company: "", phone: "", country: "", purpose: "" });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <div className="flex items-start justify-between gap-4 border-b border-border bg-secondary/40 p-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-primary">{t("catalogs.request.eyebrow")}</div>
            <h2 className="mt-1 text-lg font-bold text-foreground">{catalog.title_ar}</h2>
            {catalog.brand_name_ar ? <div className="text-xs text-muted-foreground">{catalog.brand_name_ar}</div> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"
            aria-label={t("common.close")}
          >
            ✕
          </button>
        </div>

        {mutation.isSuccess ? (
          <div className="p-6 text-center">
            <div className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-leaf-50 text-leaf-700">✓</div>
            <h3 className="mt-3 text-base font-bold text-foreground">{t("catalogs.request.successTitle")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("catalogs.request.successBody")}</p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <WhatsAppCTA number={whatsapp} message={t("catalogs.request.followWaMsg", { title: catalog.title_ar })}>
                {t("catalogs.request.followWa")}
              </WhatsAppCTA>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:border-primary"
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        ) : (
          <form
            className="space-y-4 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate({ catalog_id: catalog.id, ...form });
            }}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label={t("catalogs.request.fullName")} value={form.full_name} onChange={(v) => set("full_name", v)} required />
              <Field label={t("catalogs.request.email")} type="email" value={form.email} onChange={(v) => set("email", v)} required />
              <Field label={t("catalogs.request.company")} value={form.company} onChange={(v) => set("company", v)} />
              <Field label={t("catalogs.request.phone")} value={form.phone} onChange={(v) => set("phone", v)} />
              <Field label={t("catalogs.request.country")} value={form.country} onChange={(v) => set("country", v)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">{t("catalogs.request.purpose")}</label>
              <textarea
                value={form.purpose}
                onChange={(e) => set("purpose", e.target.value)}
                rows={3}
                maxLength={1000}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-3 focus:ring-secondary"
              />
            </div>
            {mutation.isError ? (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {t("catalogs.request.error")}
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <p className="text-[11px] text-muted-foreground">{t("catalogs.request.privacy")}</p>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {mutation.isPending ? t("catalogs.request.submitting") : t("catalogs.request.submit")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", required,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-3 focus:ring-secondary"
      />
    </label>
  );
}
