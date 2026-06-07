import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  getCorporateIdentity,
  listBrands,
  listFeaturedProducts,
} from "@/lib/site.functions";
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
const featuredQO = queryOptions({
  queryKey: ["featured-products"],
  queryFn: () => listFeaturedProducts(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ركن التوفير كوزمتك للتجارة — المقرّ الرقمي الرسمي" },
      {
        name: "description",
        content:
          "الوكيل الحصري لمنظومة من العلامات الصحية العالمية في اليمن: NO CAL، Steviola، Monivo، Baby Tawfir، Bambo، Y-Kelin، iSiS، SEKEM.",
      },
      { property: "og:title", content: "ركن التوفير كوزمتك للتجارة" },
      { property: "og:description", content: "منظومة علامات صحية عالمية برعاية ركن التوفير في اليمن." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(brandsQO),
      context.queryClient.ensureQueryData(featuredQO),
    ]);
  },
  component: Home,
});

const WHY_CARDS = [
  { i: "◆", t: "وكالات حصرية", d: "تمثيل رسمي لعلامات دولية مختارة داخل السوق اليمنية." },
  { i: "✦", t: "منتجات أصلية", d: "أصول رسمية وعبوات معتمدة، دون أي إعادة تصميم أو استبدال." },
  { i: "✺", t: "جودة عالمية", d: "معايير تصنيع وتعبئة موثّقة من الشركات الأم." },
  { i: "✪", t: "توزيع وطني", d: "شبكة شركاء معتمدين تغطّي جميع المحافظات اليمنية." },
  { i: "❖", t: "شراكات قوية", d: "اتفاقيات طويلة الأمد مع موزعين وصيدليات ومحلات كبرى." },
  { i: "✧", t: "دعم احترافي", d: "إسناد تقني وتجاري متواصل عبر قناة واتساب الأعمال الرسمية." },
];

function Home() {
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: brands } = useSuspenseQuery(brandsQO);
  const { data: featured } = useSuspenseQuery(featuredQO);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        legalNameAr={id.legal_name_ar}
        parentGroupAr={id.parent_group_ar}
        whatsappNumber={id.whatsapp_number}
        logoUrl={id.logo_url}
      />

      {/* ───────── 1. CINEMATIC HERO ───────── */}
      <section className="relative overflow-hidden cinema-hero">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(var(--trust-700) 1px, transparent 1px), linear-gradient(90deg, var(--trust-700) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
          aria-hidden
        />
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-20 md:grid-cols-[1.25fr_1fr] md:items-center md:gap-16 md:px-8 md:py-32">
          <div className="relative prem-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-[11px] font-semibold tracking-wider text-trust-700">
              <span className="size-1.5 rounded-full bg-leaf-500" />
              الوكيل الحصري لمنظومة العلامات الصحية في اليمن
            </div>
            <h1 className="mt-7 font-arabic text-[2.4rem] font-bold leading-[1.05] text-foreground md:text-[3.6rem] lg:text-[4.5rem]">
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
                اكتشف العلامات
                <span className="mr-2" aria-hidden>←</span>
              </Link>
            </div>
            <dl className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-border pt-6">
              {[
                { k: "٨", v: "علامات عالمية" },
                { k: "١٠٠٪", v: "أصول رسمية" },
                { k: "B2B", v: "قناة تجارية موحّدة" },
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
                <div className="pointer-events-none absolute inset-6">
                  {brands.slice(0, 8).map((b, i) => {
                    const angle = (i / Math.max(brands.length, 1)) * Math.PI * 2 - Math.PI / 2;
                    const r = 46;
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

        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center" aria-hidden>
          <div className="grid h-9 w-6 place-items-start rounded-full border border-trust-700/30 p-1.5">
            <span className="block size-1.5 rounded-full bg-trust-700 prem-scroll-cue" />
          </div>
        </div>
      </section>

      {/* ───────── 2. WHY RUKN AL-TAWFIR ───────── */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="hq-eyebrow">لماذا ركن التوفير</div>
            <h2 className="mt-3 font-arabic text-3xl font-bold leading-tight text-foreground md:text-5xl">
              مرجعية مؤسسية تحمي العلامة والعميل والشريك
            </h2>
            <p className="mt-5 text-base leading-loose text-ink-600">
              ستة محاور تشكّل الحوكمة التي نلتزم بها مع كل علامة وكل شريك تجاري.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CARDS.map((c) => (
              <article key={c.t} className="prem-card relative p-6 md:p-7">
                <div className="grid size-12 place-items-center rounded-2xl bg-trust-50 text-2xl text-trust-700">
                  {c.i}
                </div>
                <h3 className="mt-5 font-arabic text-lg font-bold text-foreground">{c.t}</h3>
                <p className="mt-3 text-[14px] leading-loose text-ink-600">{c.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── 3. EXCLUSIVE INTERNATIONAL BRANDS ───────── */}
      <section id="ecosystem" className="relative">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <div className="mb-12 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="hq-eyebrow">العلامات الدولية الحصرية</div>
              <h2 className="mt-3 font-arabic text-3xl font-bold leading-tight text-foreground md:text-5xl">
                منظومة علامات عالمية في مظلّة واحدة
              </h2>
              <p className="mt-4 text-base leading-loose text-ink-600">
                ثمانٍ علامات دولية تُعرض جميعها بنفس المستوى من الاهتمام التحريري والمعاملة البصرية،
                دون تفضيل أو ترتيب أولوية.
              </p>
            </div>
            <Link
              to="/brands"
              className="inline-flex items-center gap-1.5 rounded-full border border-trust-700/20 bg-secondary px-4 py-2 text-sm font-semibold text-trust-700 transition-colors hover:bg-trust-700 hover:text-sand-50"
            >
              دليل العلامات الكامل <span aria-hidden>←</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {brands.map((b, idx) => {
              const accent = (b.brand_tokens?.accent as string) || "var(--trust-700)";
              return (
                <Link
                  key={b.id}
                  to="/brands/$slug"
                  params={{ slug: b.slug }}
                  className="prem-card group relative flex flex-col"
                >
                  <div className="absolute right-4 top-4 z-10 rounded-full glass px-2 py-0.5 text-[10px] font-bold tracking-widest text-trust-700">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div
                    className="absolute inset-x-0 top-0 h-0.5 opacity-70"
                    style={{ background: accent }}
                    aria-hidden
                  />
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
                    <h3 className="font-arabic text-lg font-bold text-foreground">{b.name_ar}</h3>
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
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── 4. FEATURED PRODUCTS ───────── */}
      {featured.length > 0 ? (
        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
            <div className="mb-10 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="hq-eyebrow">منتجات مختارة</div>
                <h2 className="mt-3 font-arabic text-3xl font-bold leading-tight text-foreground md:text-4xl">
                  لمحة من منتجات المنظومة
                </h2>
              </div>
              <Link
                to="/brands"
                className="text-sm font-semibold text-trust-700 hover:underline"
              >
                استعراض جميع العلامات ←
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {featured.map((p) => (
                <Link
                  key={p.id}
                  to="/brands/$slug/$productSlug"
                  params={{ slug: p.brand_slug, productSlug: p.slug }}
                  className="prem-card group flex flex-col"
                >
                  <div className="podium relative grid aspect-square place-items-center p-5">
                    {p.cover_url ? (
                      <img
                        src={p.cover_url}
                        alt={p.name_ar}
                        className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-[11px] text-muted-foreground">صورة رسمية</span>
                    )}
                  </div>
                  <div className="flex-1 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-600">{p.brand_slug}</div>
                    <div className="mt-1 font-arabic text-[13px] font-bold leading-tight text-foreground line-clamp-2">{p.name_ar}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ───────── 5. ABOUT EXCERPT ───────── */}
      <section className="relative overflow-hidden">
        <div className="aurora-mesh text-sand-50">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:grid-cols-[1.1fr_1fr] md:gap-16 md:px-8 md:py-24">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-leaf-300">عن الشركة</div>
              <h2 className="mt-3 font-arabic text-3xl font-bold leading-tight md:text-5xl">
                مقرّ رقمي لمنظومة عالمية متكاملة
              </h2>
              <p className="mt-5 max-w-xl text-[15px] leading-loose opacity-85">
                نمثّل علامات صحية دولية بشكل حصري داخل اليمن، ضمن منظومة تجارية محكمة الحوكمة،
                تحمي العلامة من الاستخدامات غير الرسمية، وتمنح الشريك التجاري قناة موثوقة للوصول
                إلى المنتجات الأصلية.
              </p>
              <Link
                to="/about"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-sand-50 px-5 py-2.5 text-sm font-semibold text-trust-900 transition-transform hover:-translate-y-0.5"
              >
                المزيد عن الشركة <span aria-hidden>←</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { t: "قصتنا", d: "ذراع تجاري متخصص في العلامات الصحية الدولية." },
                { t: "مهمتنا", d: "إيصال المنتج الأصلي إلى المستهلك اليمني بأعلى المعايير." },
                { t: "رؤيتنا", d: "أن نكون البوابة المرجعية للعلامات الصحية العالمية." },
                { t: "قيمنا", d: "أصالة، شفافية، حماية للعلامة، التزام بالحوكمة." },
              ].map((c) => (
                <div key={c.t} className="glass-dark rounded-2xl p-5">
                  <div className="font-arabic text-base font-bold">{c.t}</div>
                  <div className="mt-2 text-[13px] leading-relaxed opacity-85">{c.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── 6. PARTNERSHIP BAND ───────── */}
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
              للموزعين والمشترين بالجملة: قناة موحّدة عبر واتساب الأعمال للحصول على شروط الشراكة.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/partners"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-trust-700 hover:text-trust-700"
              >
                صفحة الشراكات
              </Link>
              <WhatsAppCTA
                number={id.whatsapp_number}
                message="السلام عليكم، أرغب في فتح حساب شراكة تجارية مع ركن التوفير."
                variant="pill"
              >
                فتح محادثة شراكة
              </WhatsAppCTA>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── 7. CONTACT STRIP ───────── */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-[1fr_auto] md:items-center md:px-8">
          <div>
            <div className="hq-eyebrow">تواصل معنا</div>
            <h2 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-4xl">
              قناة تجارية موحّدة وردّ سريع
            </h2>
            <div className="mt-5 grid gap-4 text-sm text-ink-600 sm:grid-cols-3">
              <div>
                <div className="text-xs font-semibold text-foreground">واتساب الأعمال</div>
                <div className="mt-1 font-arabic text-trust-700">+967 {id.whatsapp_number}</div>
              </div>
              {id.email ? (
                <div>
                  <div className="text-xs font-semibold text-foreground">البريد الإلكتروني</div>
                  <div className="mt-1 break-words">{id.email}</div>
                </div>
              ) : null}
              {id.address_ar ? (
                <div>
                  <div className="text-xs font-semibold text-foreground">العنوان</div>
                  <div className="mt-1">{id.address_ar}</div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <WhatsAppCTA number={id.whatsapp_number}>تواصل واتساب</WhatsAppCTA>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-trust-700 hover:text-trust-700"
            >
              صفحة التواصل الكاملة
            </Link>
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
