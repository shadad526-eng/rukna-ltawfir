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
      { title: "ركن التوفير كوزمتك للتجارة — المقر الرقمي لمنظومة العلامات الصحية" },
      {
        name: "description",
        content:
          "نبني حياة أكثر صحة... ونصنع مستقبلًا أقوى. الموزّع الرسمي لـ NO CAL، Steviola، Monivo، Baby Tawfir، Bambo Fresh، iSiS و SEKEM في اليمن.",
      },
      { property: "og:title", content: "ركن التوفير كوزمتك للتجارة" },
      { property: "og:description", content: "المقر الرقمي لمنظومة العلامات الصحية في اليمن." },
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

  const featured = brands.slice(0, 2); // NO CAL + Steviola (per merchandising order)
  const rest = brands.slice(2);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        legalNameAr={id.legal_name_ar}
        parentGroupAr={id.parent_group_ar}
        whatsappNumber={id.whatsapp_number}
        logoUrl={id.logo_url}
      />

      {/* HERO — corporate digital HQ */}
      <section className="relative overflow-hidden border-b border-border hq-canvas">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-[1.35fr_1fr] md:items-center md:gap-16 md:px-8 md:py-28">
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-trust-700/20 bg-card px-3.5 py-1.5 text-[11px] font-semibold tracking-wider text-trust-700 shadow-sm">
              <span className="size-1.5 rounded-full bg-leaf-500" />
              المقرّ الرقمي • منظومة العلامات الصحية
            </div>
            <h1 className="mt-6 font-arabic text-[2.4rem] font-bold leading-[1.1] text-foreground md:text-[3.5rem] lg:text-[4.25rem]">
              {id.hero_headline_ar}
            </h1>
            <div className="mt-5 h-px w-24 hq-rule" />
            <p className="mt-6 max-w-2xl text-base leading-loose text-ink-600 md:text-lg">
              {id.hero_sub_ar}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <WhatsAppCTA number={id.whatsapp_number}>تواصل تجاري عبر واتساب</WhatsAppCTA>
              <Link
                to="/brands"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-md"
              >
                استعرض العلامات التجارية
                <span className="mr-2" aria-hidden>←</span>
              </Link>
            </div>
            <dl className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-border pt-6">
              {[
                { k: "٧", v: "علامات تجارية" },
                { k: "١٠٠٪", v: "أصول رسمية" },
                { k: "B2B", v: "قنوات تجارية" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-arabic text-2xl font-bold text-trust-700 md:text-3xl">{s.k}</dt>
                  <dd className="mt-1 text-[11px] font-medium tracking-wider text-ink-600">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Logo card */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-trust-700/15 via-transparent to-leaf-500/15 blur-2xl" />
            <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-border bg-card p-12 shadow-lg">
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(var(--trust-700) 1px, transparent 1px), linear-gradient(90deg, var(--trust-700) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
              {id.logo_url ? (
                <img src={id.logo_url} alt={`شعار ${id.legal_name_ar}`} className="relative size-full object-contain" />
              ) : null}
            </div>
            <div className="absolute -bottom-4 right-8 rounded-full border border-border bg-card px-4 py-1.5 text-[11px] font-semibold text-trust-700 shadow">
              الهوية المؤسسية الرسمية
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED BRANDS — NO CAL & Steviola */}
      {featured.length > 0 ? (
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <div className="hq-eyebrow">الواجهة الاستراتيجية</div>
                <h2 className="mt-2 font-arabic text-2xl font-bold text-foreground md:text-4xl">
                  العلامتان الرياديتان في المنظومة
                </h2>
              </div>
              <div className="hidden h-px flex-1 bg-border md:block" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {featured.map((b, idx) => (
                <Link
                  key={b.id}
                  to="/brands/$slug"
                  params={{ slug: b.slug }}
                  className="group relative overflow-hidden rounded-[1.75rem] border border-border bg-background transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="absolute right-5 top-5 z-10 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-bold tracking-widest text-trust-700">
                    0{idx + 1}
                  </div>
                  <div className="relative grid h-56 place-items-center overflow-hidden border-b border-border bg-gradient-to-br from-sand-50 to-card p-10">
                    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(var(--trust-700) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
                    {b.logo_url ? (
                      <img src={b.logo_url} alt={`شعار ${b.name_ar}`} className="relative max-h-32 w-auto object-contain transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    ) : (
                      <span className="relative text-2xl font-bold text-muted-foreground">{b.name_en}</span>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2">
                      <h3 className="font-arabic text-xl font-bold text-foreground md:text-2xl">{b.name_ar}</h3>
                      {b.is_partner ? (
                        <span className="rounded-full bg-leaf-50 px-2 py-0.5 text-[10px] font-semibold text-leaf-700">
                          شريك رسمي
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-ink-600">{b.name_en}</div>
                    {b.tagline_ar ? (
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-600">{b.tagline_ar}</p>
                    ) : null}
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-trust-700">
                      <span>دخول بوابة العلامة</span>
                      <span aria-hidden className="transition-transform group-hover:-translate-x-1">←</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* FULL BRAND DIRECTORY */}
      <section id="brands" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="hq-eyebrow">منظومة العلامات</div>
            <h2 className="mt-2 font-arabic text-2xl font-bold text-foreground md:text-4xl">
              دليل العلامات التجارية
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-600 md:text-base">
              شراكات حصرية ورسمية مع علامات صحية عالمية ضمن منظومة ركن التوفير.
            </p>
          </div>
          <Link to="/brands" className="inline-flex items-center gap-1 text-sm font-semibold text-trust-700 hover:underline">
            الدليل الكامل <span aria-hidden>←</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((b) => (
            <Link
              key={b.id}
              to="/brands/$slug"
              params={{ slug: b.slug }}
              className="hq-card group relative overflow-hidden"
            >
              <div className="flex items-start gap-4 p-5">
                <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-background p-2.5">
                  {b.logo_url ? (
                    <img src={b.logo_url} alt={`شعار ${b.name_ar}`} className="size-full object-contain" loading="lazy" />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">{b.name_en}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-arabic text-lg font-bold text-foreground">{b.name_ar}</h3>
                    {b.is_partner ? (
                      <span className="rounded-full bg-leaf-50 px-2 py-0.5 text-[10px] font-semibold text-leaf-700">
                        شريك
                      </span>
                    ) : null}
                  </div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-600">{b.name_en}</div>
                  {b.tagline_ar ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-600">{b.tagline_ar}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border bg-secondary/40 px-5 py-3 text-xs font-semibold text-trust-700">
                <span>استعراض العلامة</span>
                <span aria-hidden className="transition-transform group-hover:-translate-x-1">←</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* GOVERNANCE / PRINCIPLES */}
      <section className="border-y border-border bg-trust-900 text-sand-50">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <div className="mb-10 max-w-2xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-leaf-300">
              مبادئ المنظومة
            </div>
            <h2 className="mt-2 font-arabic text-2xl font-bold md:text-4xl">
              حوكمة مؤسسية تحمي العلامة والعميل
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl bg-white/10 md:grid-cols-3">
            {[
              { t: "أصول رسمية محمية", d: "الشعارات وعبوات المنتجات الأصلية مصدر بصري حصري لا يُستبدل." },
              { t: "محتوى تقني فقط", d: "وصف المنتج والمكونات والاستخدام دون أي بيانات تجارية أو أسعار عامة." },
              { t: "تحويل عبر واتساب", d: "الاستفسارات والطلبات التجارية تتم حصرًا عبر القناة الرسمية." },
            ].map((c) => (
              <div key={c.t} className="bg-trust-900 p-7">
                <div className="font-arabic text-lg font-bold">{c.t}</div>
                <div className="mt-2 text-sm leading-relaxed opacity-80">{c.d}</div>
              </div>
            ))}
          </div>
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
