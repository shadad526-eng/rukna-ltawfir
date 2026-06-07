import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCorporateIdentity, listBrands } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const brandsQO = queryOptions({ queryKey: ["brands"], queryFn: () => listBrands() });

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "العلامات التجارية — ركن التوفير كوزمتك للتجارة" },
      { name: "description", content: "العلامات الصحية الرسمية الممثلة عبر منظومة ركن التوفير في اليمن: iSiS, SEKEM, Steviola, NO CAL, Monivo, Baby Tawfir, Bambo Fresh." },
      { property: "og:title", content: "العلامات التجارية — ركن التوفير" },
      { property: "og:description", content: "علامات صحية رسمية ضمن منظومة ركن التوفير." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(brandsQO),
    ]);
  },
  component: BrandsPage,
  errorComponent: ({ error }) => <ErrorState message={error.message} />,
});

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">تعذّر تحميل العلامات</h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function BrandsPage() {
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: brands } = useSuspenseQuery(brandsQO);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        legalNameAr={id.legal_name_ar}
        parentGroupAr={id.parent_group_ar}
        whatsappNumber={id.whatsapp_number}
        logoUrl={id.logo_url}
      />

      <section className="relative overflow-hidden border-b border-border hq-canvas">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="hq-eyebrow">منظومة العلامات</div>
          <h1 className="mt-3 font-arabic text-3xl font-bold leading-tight text-foreground md:text-6xl">
            دليل العلامات التجارية
          </h1>
          <div className="mt-5 h-px w-24 hq-rule" />
          <p className="mt-6 max-w-2xl text-base leading-loose text-ink-600 md:text-lg">
            علامات صحية عالمية يمثّلها رسميًا ركن التوفير كوزمتك للتجارة في السوق اليمني. الهوية والشعارات وصور المنتجات
            تُعرض كما وردت من الجهات الرسمية للعلامة.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b, idx) => (
            <Link
              key={b.id}
              to="/brands/$slug"
              params={{ slug: b.slug }}
              className="hq-card group relative flex flex-col overflow-hidden"
            >
              <div className="absolute right-4 top-4 z-10 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-bold tracking-widest text-trust-700">
                {String(idx + 1).padStart(2, "0")}
              </div>
              <div className="relative grid h-44 place-items-center overflow-hidden border-b border-border bg-gradient-to-br from-sand-50 to-card p-8">
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(var(--trust-700) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
                {b.logo_url ? (
                  <img src={b.logo_url} alt={`شعار ${b.name_ar}`} className="relative max-h-24 w-auto object-contain transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                ) : (
                  <span className="relative text-sm font-bold text-muted-foreground">{b.name_en}</span>
                )}
              </div>
              <div className="flex-1 p-6">
                <div className="flex items-center gap-2">
                  <h2 className="font-arabic text-lg font-bold text-foreground">{b.name_ar}</h2>
                  {b.is_partner ? (
                    <span className="rounded-full bg-leaf-50 px-2 py-0.5 text-[10px] font-semibold text-leaf-700">شريك رسمي</span>
                  ) : null}
                </div>
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-600">{b.name_en}</div>
                {b.tagline_ar ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-600">{b.tagline_ar}</p>
                ) : null}
              </div>
              <div className="flex items-center justify-between border-t border-border bg-secondary/40 px-6 py-3 text-xs font-semibold text-trust-700">
                <span>استعراض المنتجات</span>
                <span aria-hidden className="transition-transform group-hover:-translate-x-1">←</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

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
