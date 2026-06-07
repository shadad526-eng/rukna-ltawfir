import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  getCorporateIdentity,
  getBrandBySlug,
  listBrandProducts,
} from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const brandQO = (slug: string) =>
  queryOptions({ queryKey: ["brand", slug], queryFn: () => getBrandBySlug({ data: { slug } }) });
const productsQO = (brandSlug: string) =>
  queryOptions({ queryKey: ["brand-products", brandSlug], queryFn: () => listBrandProducts({ data: { brandSlug } }) });

export const Route = createFileRoute("/brands/$slug")({
  loader: async ({ context, params }) => {
    const brand = await context.queryClient.ensureQueryData(brandQO(params.slug));
    if (!brand) throw notFound();
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(productsQO(params.slug)),
    ]);
  },
  head: ({ loaderData: _ld, params }) => ({
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
  if (!brand) return null;

  const accent = brand.brand_tokens.accent ?? "var(--leaf-500)";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        legalNameAr={id.legal_name_ar}
        parentGroupAr={id.parent_group_ar}
        whatsappNumber={id.whatsapp_number}
        logoUrl={id.logo_url}
      />

      {/* Brand hero — cinematic, brand accent halo, corporate frame */}
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
            {brand.description_ar ? (
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/80">{brand.description_ar}</p>
            ) : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <WhatsAppCTA
                number={id.whatsapp_number}
                message={`السلام عليكم، أرغب بالاستفسار عن منتجات ${brand.name_ar}.`}
              >
                استفسار عن منتجات {brand.name_ar}
              </WhatsAppCTA>
              <Link
                to="/catalogs"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-trust-700 hover:text-trust-700"
              >
                الكتالوجات الرسمية
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>المنتجات</div>
            <h2 className="mt-1 text-2xl font-bold text-foreground">منتجات {brand.name_ar}</h2>
          </div>
          <span className="text-xs text-muted-foreground">{products.length} منتجات منشورة</span>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <div className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-secondary text-primary">⚑</div>
            <h3 className="mt-3 text-lg font-bold text-foreground">يتم إعداد محتوى المنتجات</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              نقوم حاليًا بإعداد بطاقات المنتجات من الكتالوجات الرسمية للعلامة. للاستفسار العاجل، تواصل معنا عبر واتساب.
            </p>
            <div className="mt-5 inline-flex">
              <WhatsAppCTA
                number={id.whatsapp_number}
                message={`السلام عليكم، أرغب بالاستفسار عن منتجات ${brand.name_ar}.`}
              >
                استفسار واتساب
              </WhatsAppCTA>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Link
                key={p.id}
                to="/brands/$slug/$productSlug"
                params={{ slug: brand.slug, productSlug: p.slug }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-border bg-background p-6">
                  {p.cover_url ? (
                    <img src={p.cover_url} alt={p.name_ar} className="size-full object-contain" loading="lazy" />
                  ) : (
                    <span className="text-xs text-muted-foreground">صورة العبوة الرسمية</span>
                  )}
                </div>
                <div className="flex-1 p-4">
                  <div className="text-sm font-bold text-foreground">{p.name_ar}</div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{p.name_en}</div>
                  {p.short_description_ar ? (
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{p.short_description_ar}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
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
