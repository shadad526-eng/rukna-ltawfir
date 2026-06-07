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

      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
          <div className="text-xs font-semibold uppercase tracking-wide text-primary">منظومة العلامات</div>
          <h1 className="mt-2 text-3xl font-bold text-foreground md:text-5xl">العلامات التجارية الممثَّلة</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            علامات صحية عالمية يمثّلها رسميًا ركن التوفير كوزمتك للتجارة في السوق اليمني. الهوية والشعارات وصور المنتجات
            تُعرض كما وردت من الجهات الرسمية للعلامة.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <Link
              key={b.id}
              to="/brands/$slug"
              params={{ slug: b.slug }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-center border-b border-border bg-background p-8">
                {b.logo_url ? (
                  <img src={b.logo_url} alt={`شعار ${b.name_ar}`} className="h-24 w-auto object-contain" loading="lazy" />
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">{b.name_en}</span>
                )}
              </div>
              <div className="flex-1 p-5">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">{b.name_ar}</h2>
                  {b.is_partner ? (
                    <span className="rounded-full bg-leaf-50 px-2 py-0.5 text-[10px] font-semibold text-leaf-700">شريك رسمي</span>
                  ) : null}
                </div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{b.name_en}</div>
                {b.tagline_ar ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{b.tagline_ar}</p>
                ) : null}
              </div>
              <div className="border-t border-border bg-secondary/40 px-5 py-3 text-xs font-semibold text-primary">
                استعراض المنتجات ←
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
