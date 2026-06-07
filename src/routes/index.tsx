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
          "نبني حياة أكثر صحة... ونصنع مستقبلًا أقوى. الموزع الرسمي لـ iSiS، SEKEM، Steviola، NO CAL، Monivo، Baby Tawfir، Bambo Fresh.",
      },
      { property: "og:title", content: "ركن التوفير كوزمتك للتجارة" },
      {
        property: "og:description",
        content: "البوابة الأولى للعلامات التجارية الصحية في اليمن.",
      },
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
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            background:
              "radial-gradient(60% 60% at 80% 0%, var(--leaf-500), transparent), radial-gradient(50% 50% at 0% 100%, var(--trust-700), transparent)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-accent" />
              بوابة العلامات التجارية الصحية في اليمن
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-[1.15] text-foreground md:text-6xl">
              {id.hero_headline_ar}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {id.hero_sub_ar}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <WhatsAppCTA number={id.whatsapp_number}>تواصل تجاري عبر واتساب</WhatsAppCTA>
              <Link
                to="/brands"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                استعرض العلامات التجارية
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brand grid */}
      <section className="mx-auto max-w-7xl px-4 pb-8 md:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">علاماتنا التجارية</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              شراكات حصرية مع علامات عالمية تلتزم بمعايير الجودة والصحة.
            </p>
          </div>
          <span className="hidden text-xs text-muted-foreground md:inline">
            {brands.length} علامات نشطة
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => {
            const gradient = b.brand_tokens.gradient ?? "linear-gradient(135deg, var(--trust-700), var(--leaf-700))";
            return (
              <article
                key={b.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <div className="h-28 w-full" style={{ background: gradient }} aria-hidden />
                <div className="-mt-12 px-5 pb-5">
                  <div className="mb-4 inline-flex size-20 items-center justify-center overflow-hidden rounded-xl border border-border bg-card p-2 shadow-md">
                    {b.logo_url ? (
                      <img
                        src={b.logo_url}
                        alt={`شعار ${b.name_ar}`}
                        className="size-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">{b.name_en}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">{b.name_ar}</h3>
                    {b.is_partner ? (
                      <span className="rounded-full bg-leaf-300/40 px-2 py-0.5 text-[10px] font-semibold text-leaf-700">
                        شريك معتمد
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {b.name_en}
                  </div>
                  {b.tagline_ar ? (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {b.tagline_ar}
                    </p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Governance strip */}
      <section className="mx-auto mt-16 max-w-7xl px-4 md:px-6">
        <div className="grid gap-4 rounded-2xl border border-border bg-card p-6 md:grid-cols-3">
          {[
            { t: "أصول رسمية محمية", d: "الشعارات والعبوات الأصلية مصدر بصري حصري لا يُستبدل." },
            { t: "محتوى تقني فقط", d: "وصف المنتج والمكونات والاستخدام دون أي بيانات تجارية." },
            { t: "تحويل عبر واتساب", d: "الاستفسارات والطلبات التجارية تتم عبر واتساب الرسمي." },
          ].map((c) => (
            <div key={c.t}>
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
