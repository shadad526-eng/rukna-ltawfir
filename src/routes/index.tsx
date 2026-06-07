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
          "المقرّ الرقمي الرسمي لمنظومة العلامات الصحية في اليمن: NO CAL، Steviola، Monivo، Baby Tawfir، Bambo، Y-Kelin، iSiS، SEKEM.",
      },
      { property: "og:title", content: "ركن التوفير كوزمتك للتجارة" },
      { property: "og:description", content: "منظومة علامات صحية عالمية برعاية ركن التوفير." },
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

      {/* ───────── CINEMATIC HERO ───────── */}
      <section className="relative overflow-hidden cinema-hero">
        {/* hairline grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(var(--trust-700) 1px, transparent 1px), linear-gradient(90deg, var(--trust-700) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
          aria-hidden
        />
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-20 md:grid-cols-[1.3fr_1fr] md:items-center md:gap-16 md:px-8 md:py-32">
          <div className="relative prem-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-[11px] font-semibold tracking-wider text-trust-700">
              <span className="size-1.5 rounded-full bg-leaf-500" />
              المقرّ الرقمي الرسمي • منظومة العلامات الصحية
            </div>
            <h1 className="mt-7 font-arabic text-[2.6rem] font-bold leading-[1.05] text-foreground md:text-[3.75rem] lg:text-[4.75rem]">
              {id.hero_headline_ar}
            </h1>
            <div className="mt-6 h-px w-28 prem-divider" />
            <p className="mt-7 max-w-2xl text-base leading-loose text-ink-600 md:text-lg">
              {id.hero_sub_ar}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <WhatsAppCTA number={id.whatsapp_number}>تواصل تجاري عبر واتساب</WhatsAppCTA>
              <Link
                to="/brands"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-trust-700 hover:text-trust-700 hover:shadow-md"
              >
                استعرض المنظومة
                <span className="mr-2" aria-hidden>←</span>
              </Link>
            </div>
            <dl className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-border pt-6">
              {[
                { k: "٨", v: "علامات تجارية" },
                { k: "١٠٠٪", v: "أصول رسمية" },
                { k: "B2B", v: "قنوات تجارية" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-arabic text-3xl font-bold text-trust-700 md:text-4xl">{s.k}</dt>
                  <dd className="mt-1 text-[11px] font-medium tracking-wider text-ink-600">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Hero podium — corporate logo with brand constellation */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-gradient-to-br from-trust-700/25 via-transparent to-leaf-500/25 blur-3xl" />
            <div className="podium premium-shadow aspect-square w-full">
              <div className="relative grid size-full place-items-center p-12">
                <div className="halo-blue prem-float relative grid size-full place-items-center">
                  {id.logo_url ? (
                    <img
                      src={id.logo_url}
                      alt={`شعار ${id.legal_name_ar}`}
                      className="relative max-h-[70%] w-auto object-contain"
                    />
                  ) : null}
                </div>
                {/* orbiting brand dots */}
                <div className="pointer-events-none absolute inset-6">
                  {brands.slice(0, 8).map((b, i) => {
                    const angle = (i / Math.max(brands.length, 1)) * Math.PI * 2 - Math.PI / 2;
                    const r = 46; // percent
                    const x = 50 + r * Math.cos(angle);
                    const y = 50 + r * Math.sin(angle);
                    return (
                      <div
                        key={b.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${x}%`, top: `${y}%` }}
                      >
                        <div className="grid size-12 place-items-center overflow-hidden rounded-full border border-border bg-card shadow-md">
                          {b.logo_url ? (
                            <img src={b.logo_url} alt={b.name_ar} className="max-h-8 w-auto object-contain" loading="lazy" />
                          ) : (
                            <span className="text-[9px] font-bold text-muted-foreground">{b.name_en.slice(0, 4)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 right-1/2 translate-x-1/2 rounded-full glass px-4 py-1.5 text-[11px] font-semibold text-trust-700 premium-shadow">
              الوكيل الوحيد في اليمن
            </div>
          </div>
        </div>

        {/* scroll cue */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center" aria-hidden>
          <div className="grid h-9 w-6 place-items-start rounded-full border border-trust-700/30 p-1.5">
            <span className="block size-1.5 rounded-full bg-trust-700 prem-scroll-cue" />
          </div>
        </div>
      </section>

      {/* ───────── UNIFIED PREMIUM ECOSYSTEM (all brands equal) ───────── */}
      <section id="ecosystem" className="relative border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <div className="mb-12 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="hq-eyebrow">منظومة موحّدة</div>
              <h2 className="mt-3 font-arabic text-3xl font-bold leading-tight text-foreground md:text-5xl">
                عائلة واحدة من العلامات الصحية الرسمية
              </h2>
              <p className="mt-4 text-base leading-loose text-ink-600">
                ثمانٍ علامات عالمية تحت مظلة ركن التوفير، تُعرض جميعها بنفس المستوى من الاهتمام
                والاحترام التحريري. لا تصنيفات أولى أو ثانية.
              </p>
            </div>
            <Link
              to="/brands"
              className="inline-flex items-center gap-1.5 rounded-full border border-trust-700/20 bg-secondary px-4 py-2 text-sm font-semibold text-trust-700 transition-colors hover:bg-trust-700 hover:text-sand-50"
            >
              دليل المنظومة الكامل <span aria-hidden>←</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {brands.map((b, idx) => (
              <Link
                key={b.id}
                to="/brands/$slug"
                params={{ slug: b.slug }}
                className="prem-card group flex flex-col"
              >
                <div className="absolute right-4 top-4 z-10 rounded-full glass px-2 py-0.5 text-[10px] font-bold tracking-widest text-trust-700">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="podium relative grid h-44 place-items-center p-6">
                  {b.logo_url ? (
                    <img
                      src={b.logo_url}
                      alt={`شعار ${b.name_ar}`}
                      className="relative max-h-24 w-auto object-contain transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">{b.name_en}</span>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 prem-shimmer opacity-0 group-hover:opacity-100" />
                </div>
                <div className="flex-1 p-5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-arabic text-lg font-bold text-foreground">{b.name_ar}</h3>
                    {b.is_partner ? (
                      <span className="rounded-full bg-leaf-50 px-2 py-0.5 text-[10px] font-semibold text-leaf-700">رسمي</span>
                    ) : null}
                  </div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-600">{b.name_en}</div>
                  {b.tagline_ar ? (
                    <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-ink-600">{b.tagline_ar}</p>
                  ) : null}
                </div>
                <div className="flex items-center justify-between border-t border-border bg-secondary/40 px-5 py-3 text-xs font-semibold text-trust-700">
                  <span>دخول بوابة العلامة</span>
                  <span aria-hidden className="transition-transform group-hover:-translate-x-1">←</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── WHY US — premium value bar ───────── */}
      <section className="relative overflow-hidden">
        <div className="aurora-mesh text-sand-50">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
            <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16 md:items-center">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-leaf-300">لماذا ركن التوفير</div>
                <h2 className="mt-3 font-arabic text-3xl font-bold leading-tight md:text-5xl">
                  حوكمة مؤسسية تحمي العلامة والعميل والشريك التجاري
                </h2>
                <p className="mt-5 max-w-xl text-[15px] leading-loose opacity-85">
                  نلتزم بمعايير الشفافية والأصول الرسمية والحوكمة، ونضع التحويل التجاري عبر قناة
                  واتساب الرسمية بدلًا من العرض السعري العام.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { i: "◆", t: "أصول رسمية محمية", d: "الشعارات وعبوات المنتجات الأصلية مصدر بصري حصري لا يُستبدل." },
                  { i: "✦", t: "محتوى تقني فقط", d: "وصف المنتج والمكونات والاستخدام دون أي بيانات تجارية أو أسعار." },
                  { i: "✺", t: "قناة تواصل واحدة", d: "الاستفسارات والطلبات التجارية حصرًا عبر واتساب الرسمي." },
                  { i: "✪", t: "تغطية يمنية شاملة", d: "حضور تجاري في جميع المحافظات عبر شركاء التوزيع المعتمدين." },
                ].map((c) => (
                  <div key={c.t} className="glass-dark rounded-2xl p-5">
                    <div className="grid size-10 place-items-center rounded-xl bg-leaf-500/20 text-leaf-300">{c.i}</div>
                    <div className="mt-4 font-arabic text-lg font-bold">{c.t}</div>
                    <div className="mt-2 text-sm leading-relaxed opacity-80">{c.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── PARTNERSHIP + CATALOGS CTA ───────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 premium-shadow md:p-10">
            <div className="absolute -right-16 -top-16 size-56 rounded-full bg-trust-700/10 blur-3xl" aria-hidden />
            <div className="hq-eyebrow">الكتالوجات الرسمية</div>
            <h3 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
              تصفّح مكتبة الكتالوجات
            </h3>
            <p className="mt-3 max-w-md text-sm leading-loose text-ink-600">
              كتالوجات رسمية لكل علامة، مع ملفات قابلة للتنزيل وفق سياسة الوصول المعتمدة.
            </p>
            <Link
              to="/catalogs"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-trust-700 px-5 py-2.5 text-sm font-semibold text-sand-50 transition-transform hover:-translate-y-0.5"
            >
              دخول مكتبة الكتالوجات <span aria-hidden>←</span>
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 premium-shadow md:p-10">
            <div className="absolute -left-16 -top-16 size-56 rounded-full bg-leaf-500/15 blur-3xl" aria-hidden />
            <div className="hq-eyebrow" style={{ color: "var(--leaf-700)" }}>شراكات الأعمال</div>
            <h3 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
              ابدأ شراكتك التجارية معنا
            </h3>
            <p className="mt-3 max-w-md text-sm leading-loose text-ink-600">
              للموزعين والمشترين بالجملة: تواصل مباشر عبر قناة واتساب الرسمية للحصول على شروط الشراكة.
            </p>
            <div className="mt-6">
              <WhatsAppCTA
                number={id.whatsapp_number}
                message="السلام عليكم، أرغب في فتح حساب شراكة تجارية مع ركن التوفير."
              >
                فتح محادثة شراكة
              </WhatsAppCTA>
            </div>
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
