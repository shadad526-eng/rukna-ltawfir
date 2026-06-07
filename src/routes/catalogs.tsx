import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getCorporateIdentity, listCatalogs, submitCatalogRequest, type CatalogSummary } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const catalogsQO = queryOptions({ queryKey: ["catalogs"], queryFn: () => listCatalogs() });

export const Route = createFileRoute("/catalogs")({
  head: () => ({
    meta: [
      { title: "الكتالوجات الرسمية — ركن التوفير كوزمتك للتجارة" },
      { name: "description", content: "تصفّح الكتالوجات الرسمية للعلامات الصحية الممثلة من ركن التوفير. الكتالوجات المقيدة تتطلب طلب وصول." },
      { property: "og:title", content: "الكتالوجات — ركن التوفير" },
      { property: "og:description", content: "كتالوجات رسمية ومحدّثة لجميع علامات المنظومة." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(catalogsQO),
    ]);
  },
  component: CatalogsHub,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">تعذّر تحميل الكتالوجات</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

const VISIBILITY_LABEL: Record<CatalogSummary["visibility"], { label: string; tone: string }> = {
  public: { label: "متاح للجميع", tone: "bg-leaf-50 text-leaf-700" },
  restricted: { label: "وصول مقيّد — يتطلب طلب", tone: "bg-secondary text-primary" },
  b2b_only: { label: "B2B فقط — للشركاء التجاريين", tone: "bg-trust-50 text-trust-700" },
};

function CatalogsHub() {
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: catalogs } = useSuspenseQuery(catalogsQO);
  const [requestFor, setRequestFor] = useState<CatalogSummary | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        legalNameAr={id.legal_name_ar}
        parentGroupAr={id.parent_group_ar}
        whatsappNumber={id.whatsapp_number}
        logoUrl={id.logo_url}
      />

      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
          <div className="text-xs font-semibold uppercase tracking-wide text-primary">مركز الكتالوجات</div>
          <h1 className="mt-2 text-3xl font-bold text-foreground md:text-5xl">الكتالوجات الرسمية</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            مكتبة الكتالوجات الرسمية لجميع العلامات الممثلة من ركن التوفير. بعض الكتالوجات يتطلب الوصول إليها تقديم طلب
            رسمي أو حساب شريك تجاري معتمد. لا تُعرض أسعار أو بيانات تجارية على الموقع العام.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        {catalogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <h3 className="text-lg font-bold text-foreground">لم يتم نشر كتالوجات بعد</h3>
            <p className="mt-2 text-sm text-muted-foreground">سيتم رفع الكتالوجات الرسمية قريبًا من قبل فريق المحتوى.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {catalogs.map((c) => {
              const vis = VISIBILITY_LABEL[c.visibility];
              return (
                <article key={c.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="flex aspect-[3/4] items-center justify-center overflow-hidden border-b border-border bg-background p-6">
                    {c.cover_url ? (
                      <img src={c.cover_url} alt={c.title_ar} className="size-full object-contain" loading="lazy" />
                    ) : (
                      <span className="text-xs text-muted-foreground">غلاف الكتالوج</span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${vis.tone}`}>
                      {vis.label}
                    </span>
                    <h3 className="mt-3 text-base font-bold text-foreground">{c.title_ar}</h3>
                    {c.brand_name_ar ? (
                      <div className="mt-0.5 text-xs text-muted-foreground">{c.brand_name_ar}{c.year ? ` · ${c.year}` : ""}</div>
                    ) : c.year ? (
                      <div className="mt-0.5 text-xs text-muted-foreground">{c.year}</div>
                    ) : null}
                    {c.description_ar ? (
                      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{c.description_ar}</p>
                    ) : null}

                    <div className="mt-auto pt-4">
                      {c.visibility === "public" && c.pdf_url ? (
                        <a
                          href={c.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          تحميل الكتالوج PDF
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRequestFor(c)}
                          className="inline-flex w-full items-center justify-center rounded-lg border border-primary bg-background px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
                        >
                          طلب وصول للكتالوج
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

      {/* Governance note */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="rounded-2xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">حوكمة الكتالوجات:</span> الكتالوجات المقيدة و B2B لا يتم تنزيلها مباشرة.
          بعد تقديم الطلب يقوم فريقنا بمراجعة الجهة الطالبة ثم يتم إرسال رابط آمن للوصول إلى الكتالوج المطلوب.
          لا تتضمن الكتالوجات العامة أي بيانات تجارية أو أسعار جملة.
        </div>
      </section>

      {requestFor ? <CatalogRequestDialog catalog={requestFor} onClose={() => setRequestFor(null)} whatsapp={id.whatsapp_number} /> : null}

      <SiteFooter
        legalNameAr={id.legal_name_ar}
        parentGroupAr={id.parent_group_ar}
        whatsappNumber={id.whatsapp_number}
        email={id.email}
        addressAr={id.address_ar}
      />
    </div>
  );
}

function CatalogRequestDialog({ catalog, onClose, whatsapp }: { catalog: CatalogSummary; onClose: () => void; whatsapp: string }) {
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
            <div className="text-xs font-semibold uppercase tracking-wide text-primary">طلب وصول</div>
            <h2 className="mt-1 text-lg font-bold text-foreground">{catalog.title_ar}</h2>
            {catalog.brand_name_ar ? <div className="text-xs text-muted-foreground">{catalog.brand_name_ar}</div> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        {mutation.isSuccess ? (
          <div className="p-6 text-center">
            <div className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-leaf-50 text-leaf-700">✓</div>
            <h3 className="mt-3 text-base font-bold text-foreground">تم استلام طلبك</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              سيقوم فريق ركن التوفير بمراجعة الطلب والتواصل معك خلال أيام العمل. للاستفسار السريع يمكنك التواصل عبر واتساب.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <WhatsAppCTA number={whatsapp} message={`السلام عليكم، تقدمت بطلب وصول إلى كتالوج: ${catalog.title_ar}.`}>
                متابعة عبر واتساب
              </WhatsAppCTA>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:border-primary"
              >
                إغلاق
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
              <Field label="الاسم الكامل *" value={form.full_name} onChange={(v) => set("full_name", v)} required />
              <Field label="البريد الإلكتروني *" type="email" value={form.email} onChange={(v) => set("email", v)} required />
              <Field label="الشركة / المؤسسة" value={form.company} onChange={(v) => set("company", v)} />
              <Field label="الهاتف / واتساب" value={form.phone} onChange={(v) => set("phone", v)} />
              <Field label="الدولة" value={form.country} onChange={(v) => set("country", v)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">الغرض من الطلب</label>
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
                تعذّر إرسال الطلب. يرجى المحاولة مجددًا أو التواصل عبر واتساب.
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <p className="text-[11px] text-muted-foreground">
                لن نشارك بياناتك مع أي جهة خارجية. الاستخدام داخلي لفريق ركن التوفير فقط.
              </p>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {mutation.isPending ? "جارٍ الإرسال..." : "إرسال الطلب"}
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
