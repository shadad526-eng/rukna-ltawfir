import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  getCorporateIdentity,
  getBrandBySlug,
  listBrandProducts,
  listBrands,
  listCatalogs,
} from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";
import { BrandCard } from "@/components/site/BrandCard";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const brandQO = (slug: string) =>
  queryOptions({ queryKey: ["brand", slug], queryFn: () => getBrandBySlug({ data: { slug } }) });
const productsQO = (brandSlug: string) =>
  queryOptions({ queryKey: ["brand-products", brandSlug], queryFn: () => listBrandProducts({ data: { brandSlug } }) });
const brandsQO = queryOptions({ queryKey: ["brands"], queryFn: () => listBrands() });
const catalogsQO = queryOptions({ queryKey: ["catalogs"], queryFn: () => listCatalogs() });

export const Route = createFileRoute("/$lang/brands/$slug/")({
  loader: async ({ context, params }) => {
    const brand = await context.queryClient.ensureQueryData(brandQO(params.slug));
    if (!brand) throw notFound();
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(productsQO(params.slug)),
      context.queryClient.ensureQueryData(brandsQO),
      context.queryClient.ensureQueryData(catalogsQO),
    ]);
  },
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — العلامات التجارية | ركن التوفير` },
      { name: "description", content: `صفحة العلامة التجارية ${params.slug} ضمن منظومة ركن التوفير كوزمتك للتجارة.` },
    ],
  }),
  component: BrandDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">العلامة غير موجودة</h1>
      <Link to="/brands" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
        ← العودة إلى العلامات
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">تعذّر تحميل العلامة</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function BrandDetail() {
  const { slug } = Route.useParams();
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: brand } = useSuspenseQuery(brandQO(slug));
  const { data: products } = useSuspenseQuery(productsQO(slug));
  const { data: allBrands } = useSuspenseQuery(brandsQO);
  const { data: catalogs } = useSuspenseQuery(catalogsQO);
  if (!brand) return null;

  const accent = brand.brand_tokens.accent ?? "var(--leaf-500)";
  const brandCatalogs = catalogs.filter((c) => c.brand_slug === brand.slug);
  const related = allBrands.filter((b) => b.slug !== brand.slug).slice(0, 4);
  const gallery = products.filter((p) => p.cover_url).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        legalNameAr={id.legal_name_ar}
        parentGroupAr={id.parent_group_ar}
        whatsappNumber={id.whatsapp_number}
        logoUrl={id.logo_url}
      />

      {/* Brand hero */}
      <section className="relative overflow-hidden cinema-hero">
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} aria-hidden />
        <div
          className="pointer-events-none absolute -top-40 -right-40 size-[480px] rounded-full opacity-25 blur-3xl"
          style={{ background: accent }}
          aria-hidden
        />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[auto_1fr] md:items-center md:gap-14 md:px-8 md:py-24">
          <div className="relative">
            <div
              className="absolute -inset-6 -z-10 rounded-[2rem] opacity-30 blur-2xl"
              style={{ background: accent }}
              aria-hidden
            />
            <div className="podium premium-shadow grid size-44 place-items-center p-6 md:size-56 md:p-8">
              {brand.logo_url ? (
                <img src={brand.logo_url} alt={`شعار ${brand.name_ar}`} className="max-h-full max-w-full object-contain prem-float" />
              ) : (
                <span className="text-sm font-bold text-muted-foreground">{brand.name_en}</span>
              )}
            </div>
          </div>
          <div className="prem-fade-up">
            <nav className="text-xs text-ink-600">
              <Link to="/" className="hover:text-trust-700">الرئيسية</Link>
              <span className="mx-2">/</span>
              <Link to="/brands" className="hover:text-trust-700">العلامات</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{brand.name_ar}</span>
            </nav>
            <h1 className="mt-4 font-arabic text-4xl font-bold leading-[1.05] text-foreground md:text-6xl">{brand.name_ar}</h1>
            <div className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-ink-600">{brand.name_en}</div>
            <div className="mt-6 h-px w-24 prem-divider" />
            {brand.tagline_ar ? (
              <p className="mt-5 max-w-2xl text-base leading-loose text-ink-600 md:text-lg">{brand.tagline_ar}</p>
            ) : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <WhatsAppCTA
                number={id.whatsapp_number}
                message={`السلام عليكم، أرغب بالاستفسار عن منتجات ${brand.name_ar}.`}
              >
                استفسار عن منتجات {brand.name_ar}
              </WhatsAppCTA>
              {brandCatalogs.length > 0 ? (
                <a
                  href="#catalogs"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-trust-700 hover:text-trust-700"
                >
                  الكتالوج الرسمي
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Brand story */}
      {brand.description_ar ? (
        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-16 md:px-8 md:py-20">
            <div className="hq-eyebrow">قصة العلامة</div>
            <h2 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
              تعرّف على {brand.name_ar}
            </h2>
            <div className="mt-4 h-px w-16 prem-divider" />
            <p className="mt-6 text-[15px] leading-loose text-foreground/85 md:text-base">
              {brand.description_ar}
            </p>
          </div>
        </section>
      ) : null}

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="hq-eyebrow" style={{ color: accent as string }}>المجموعة الرسمية</div>
            <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">منتجات {brand.name_ar}</h2>
          </div>
          {products.length > 0 ? (
            <span className="text-xs text-muted-foreground">{products.length} منتجات منشورة</span>
          ) : null}
        </div>

        {products.length === 0 ? (
          <div className="prem-card relative grid place-items-center p-12 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-secondary text-2xl text-trust-700">⌛</div>
            <h3 className="mt-4 font-arabic text-xl font-bold text-foreground">قريبًا — منتجات رسمية</h3>
            <p className="mt-2 max-w-md text-sm leading-loose text-ink-600">
              نقوم حاليًا بإعداد بطاقات المنتجات من الأصول الرسمية للعلامة. للاستفسار العاجل، تواصل عبر واتساب.
            </p>
            <div className="mt-6">
              <WhatsAppCTA
                number={id.whatsapp_number}
                message={`السلام عليكم، أرغب بالاستفسار عن منتجات ${brand.name_ar}.`}
              >
                استفسار واتساب
              </WhatsAppCTA>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Link
                key={p.id}
                to="/brands/$slug/$productSlug"
                params={{ slug: brand.slug, productSlug: p.slug }}
                className="prem-card group flex flex-col"
              >
                <div className="podium relative grid aspect-[4/3] place-items-center p-6">
                  {p.cover_url ? (
                    <img
                      src={p.cover_url}
                      alt={p.name_ar}
                      className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">صورة العبوة الرسمية</span>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 prem-shimmer opacity-0 group-hover:opacity-100" />
                </div>
                <div className="flex-1 p-5">
                  <div className="font-arabic text-base font-bold text-foreground">{p.name_ar}</div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-ink-600">{p.name_en}</div>
                  {p.short_description_ar ? (
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-600">{p.short_description_ar}</p>
                  ) : null}
                </div>
                <div className="flex items-center justify-between border-t border-border bg-secondary/40 px-5 py-3 text-xs font-semibold text-trust-700">
                  <span>تفاصيل المنتج</span>
                  <span aria-hidden className="transition-transform group-hover:-translate-x-1">←</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Gallery */}
      {gallery.length > 0 ? (
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
            <div className="hq-eyebrow">معرض رسمي</div>
            <h2 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
              لقطات من عبوات {brand.name_ar}
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {gallery.map((p) => (
                <Link
                  key={p.id}
                  to="/brands/$slug/$productSlug"
                  params={{ slug: brand.slug, productSlug: p.slug }}
                  className="podium grid aspect-square place-items-center p-4 transition-transform hover:-translate-y-1"
                  title={p.name_ar}
                >
                  {p.cover_url ? (
                    <img src={p.cover_url} alt={p.name_ar} className="max-h-full w-auto object-contain" loading="lazy" />
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Catalogs */}
      {brandCatalogs.length > 0 ? (
        <section id="catalogs" className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="hq-eyebrow">الكتالوجات الرسمية</div>
          <h2 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
            تحميل كتالوج {brand.name_ar}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brandCatalogs.map((c) => (
              <article key={c.id} className="prem-card flex items-center gap-4 p-5 md:p-6">
                <div className="grid size-16 shrink-0 place-items-center rounded-[1.35rem] border border-border/70 bg-secondary/75 text-2xl text-trust-700 shadow-[0_18px_32px_-24px_oklch(0.32_0.13_245/0.32)]">📕</div>
                <div className="min-w-0 flex-1">
                  <div className="font-arabic text-sm font-bold text-foreground md:text-base">{c.title_ar}</div>
                  {c.year ? <div className="mt-1 text-[11px] text-ink-600">{c.year}</div> : null}
                  <div className="mt-3">
                    {c.pdf_url ? (
                      <a
                        href={c.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-trust-700 hover:underline"
                      >
                        تنزيل الكتالوج (PDF) ↗
                      </a>
                    ) : (
                      <Link to="/catalogs" className="inline-flex items-center gap-1 text-xs font-bold text-trust-700 hover:underline">
                        طلب الوصول للكتالوج ←
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* Related brands */}
      {related.length > 0 ? (
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
            <div className="hq-eyebrow">علامات ذات صلة</div>
            <h2 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
              تابع استكشاف المنظومة
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {related.map((b) => (
                <BrandCard
                  key={b.id}
                  brand={b}
                  compact
                  ctaLabel="استكشف العلامة"
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

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
