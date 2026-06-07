import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCorporateIdentity, listBrands } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";

const identityQO = queryOptions({
  queryKey: ["corporate-identity"],
  queryFn: () => getCorporateIdentity(),
});
const brandsQO = queryOptions({
  queryKey: ["brands"],
  queryFn: () => listBrands(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ركن التوفير كوزمتك للتجارة — بوابة العلامات الصحية في اليمن" },
      {
        name: "description",
        content:
          "نبني حياة أكثر صحة... ونصنع مستقبلًا أقوى. الموزع الرسمي لعلامات iSiS وSEKEM وSteviola وNO CAL وMonivo وBaby Tawfir وBambo Fresh في اليمن.",
      },
      { property: "og:title", content: "ركن التوفير كوزمتك للتجارة" },
      { property: "og:description", content: "البوابة الأولى للعلامات التجارية الصحية في اليمن." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(brandsQO),
    ]);
  },
  component: Home,
});

function Home() {
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

      {/* Hero — restrained, corporate */}
      <section className="relative border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.4fr_1fr] md:items-center md:px-6 md:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              <span className="size-1.5 rounded-full bg-accent" />
              مجموعة العلامات الصحية في اليمن
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-[1.15] text-foreground md:text-5xl lg:text-6xl">
              {id.hero_headline_ar}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {id.hero_sub_ar}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <WhatsAppCTA number={id.whatsapp_number}>تواصل تجاري عبر واتساب</WhatsAppCTA>
              <Link
                to="/brands"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                استعرض العلامات التجارية
              </Link>
            </div>
            {id.parent_group_ar ? (
              <div className="mt-8 text-xs text-muted-foreground">
                جزء من <span className="font-semibold text-foreground">{id.parent_group_ar}</span>
              </div>
            ) : null}
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border bg-background p-10 shadow-md">
              {id.logo_url ? (
                <img src={id.logo_url} alt={`شعار ${id.legal_name_ar}`} className="size-full object-contain" />
              ) : null}
            </div>
            <div className="absolute -bottom-3 right-6 rounded-full border border-border bg-card px-4 py-1.5 text-[11px] font-semibold text-primary shadow">
              الهوية المؤسسية الرسمية
            </div>
          </div>
        </div>
      </section>

      {/* Brand grid */}
      <section id="brands" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-primary">منظومة العلامات</div>
            <h2 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">العلامات التجارية الممثَّلة</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              شراكات حصرية ورسمية مع علامات صحية عالمية ضمن منظومة ركن التوفير.
            </p>
          </div>
          <Link to="/brands" className="hidden text-sm font-semibold text-primary hover:underline md:inline">
            عرض الكل ←
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <Link
              key={b.id}
              to="/brands/$slug"
              params={{ slug: b.slug }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start gap-4 p-5">
                <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-background p-2">
                  {b.logo_url ? (
                    <img src={b.logo_url} alt={`شعار ${b.name_ar}`} className="size-full object-contain" loading="lazy" />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">{b.name_en}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-lg font-bold text-foreground">{b.name_ar}</h3>
                    {b.is_partner ? (
                      <span className="rounded-full bg-leaf-50 px-2 py-0.5 text-[10px] font-semibold text-leaf-700">
                        شريك رسمي
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{b.name_en}</div>
                  {b.tagline_ar ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{b.tagline_ar}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border bg-secondary/40 px-5 py-2.5 text-xs font-semibold text-primary">
                <span>استعراض العلامة</span>
                <span aria-hidden>←</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Governance strip */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {[
            { t: "أصول رسمية محمية", d: "الشعارات وعبوات المنتجات الأصلية مصدر بصري حصري لا يُستبدل." },
            { t: "محتوى تقني فقط", d: "وصف المنتج والمكونات والاستخدام دون أي بيانات تجارية أو أسعار." },
            { t: "تحويل عبر واتساب", d: "الاستفسارات والطلبات التجارية تتم عبر واتساب الرسمي." },
          ].map((c) => (
            <div key={c.t} className="bg-card p-6">
              <div className="text-sm font-bold text-foreground">{c.t}</div>
              <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.d}</div>
            </div>
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
