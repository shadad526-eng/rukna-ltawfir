import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getCorporateIdentity, getProductBySlug } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const productQO = (brandSlug: string, productSlug: string) =>
  queryOptions({
    queryKey: ["product", brandSlug, productSlug],
    queryFn: () => getProductBySlug({ data: { brandSlug, productSlug } }),
  });

export const Route = createFileRoute("/brands/$slug/$productSlug")({
  loader: async ({ context, params }) => {
    const p = await context.queryClient.ensureQueryData(productQO(params.slug, params.productSlug));
    if (!p) throw notFound();
    await context.queryClient.ensureQueryData(identityQO);
  },
  head: ({ params }) => ({
    meta: [
      { title: `${params.productSlug} — ${params.slug} | ركن التوفير` },
      { name: "description", content: `صفحة المنتج ${params.productSlug} من علامة ${params.slug}.` },
    ],
  }),
  component: ProductDetailPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">المنتج غير موجود</h1>
      <Link to="/brands" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
        ← العودة إلى العلامات
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">تعذّر تحميل المنتج</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function ProductDetailPage() {
  const params = Route.useParams();
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: p } = useSuspenseQuery(productQO(params.slug, params.productSlug));
  const [activeImage, setActiveImage] = useState<string | null>(null);
  if (!p) return null;

  const accent = p.brand.brand_tokens.accent ?? "var(--leaf-500)";
  const hero = activeImage ?? p.cover_url;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        legalNameAr={id.legal_name_ar}
        parentGroupAr={id.parent_group_ar}
        whatsappNumber={id.whatsapp_number}
        logoUrl={id.logo_url}
      />

      <section className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <span className="mx-2">/</span>
          <Link to="/brands" className="hover:text-primary">العلامات</Link>
          <span className="mx-2">/</span>
          <Link to="/brands/$slug" params={{ slug: p.brand.slug }} className="hover:text-primary">{p.brand.name_ar}</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{p.name_ar}</span>
        </nav>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-8 md:grid-cols-2 md:px-6 md:py-12">
        {/* Gallery */}
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border bg-card p-8">
            {hero ? (
              <img src={hero} alt={p.name_ar} className="size-full object-contain" />
            ) : (
              <div className="grid size-full place-items-center text-sm text-muted-foreground">صورة العبوة الرسمية</div>
            )}
          </div>
          {p.gallery.length > 0 ? (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[p.cover_url, ...p.gallery.map((g) => g.url)].filter(Boolean).map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(url)}
                  className={`aspect-square overflow-hidden rounded-lg border bg-card p-1 transition-colors ${
                    hero === url ? "border-primary" : "border-border hover:border-primary/40"
                  }`}
                >
                  <img src={url ?? ""} alt="" className="size-full object-contain" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center overflow-hidden rounded-lg border border-border bg-background p-1">
              {p.brand.logo_url ? (
                <img src={p.brand.logo_url} alt={p.brand.name_ar} className="size-full object-contain" />
              ) : null}
            </div>
            <Link
              to="/brands/$slug"
              params={{ slug: p.brand.slug }}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {p.brand.name_ar}
            </Link>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-foreground md:text-4xl">{p.name_ar}</h1>
          <div className="mt-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">{p.name_en}</div>
          {p.short_description_ar ? (
            <p className="mt-4 text-base leading-relaxed text-foreground/80">{p.short_description_ar}</p>
          ) : null}

          {p.key_benefits_ar.length > 0 ? (
            <ul className="mt-5 space-y-2">
              {p.key_benefits_ar.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-foreground/85">
                  <span className="mt-1.5 inline-block size-1.5 rounded-full" style={{ background: accent }} />
                  {b}
                </li>
              ))}
            </ul>
          ) : null}

          {p.variants.length > 0 ? (
            <div className="mt-6">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">الأحجام المتاحة</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.variants.map((v) => (
                  <span key={v.id} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground">
                    {v.name_ar}{v.pack_size ? ` · ${v.pack_size}` : ""}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap gap-3">
            <WhatsAppCTA
              number={id.whatsapp_number}
              message={`السلام عليكم، أرغب بالاستفسار عن: ${p.name_ar} (${p.brand.name_ar}).`}
            >
              استفسار عن هذا المنتج
            </WhatsAppCTA>
            <Link
              to="/catalogs"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              عرض الكتالوج الرسمي
            </Link>
          </div>

          <p className="mt-5 text-[11px] text-muted-foreground">
            الأسعار التجارية وبيانات الجملة لا تُعرض على الموقع العام. للاستفسار التجاري يرجى التواصل عبر واتساب الرسمي.
          </p>
        </div>
      </section>

      {/* Long description + technical sections */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {p.long_description_ar ? (
            <article className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground">نبذة عن المنتج</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/85">{p.long_description_ar}</p>
            </article>
          ) : null}

          {p.usage_instructions_ar ? (
            <article className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground">طريقة الاستخدام</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/85">{p.usage_instructions_ar}</p>
            </article>
          ) : null}

          {p.ingredients.length > 0 ? (
            <article className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
              <h2 className="text-lg font-bold text-foreground">المكونات</h2>
              <ul className="mt-3 divide-y divide-border">
                {p.ingredients.map((i) => (
                  <li key={i.name_ar} className="flex items-baseline justify-between gap-4 py-2 text-sm">
                    <span className="text-foreground/90">{i.name_ar}</span>
                    {i.percentage != null ? <span className="text-muted-foreground">{i.percentage}%</span> : null}
                  </li>
                ))}
              </ul>
            </article>
          ) : null}

          {p.nutrition.length > 0 ? (
            <article className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground">القيمة الغذائية</h2>
              <ul className="mt-3 divide-y divide-border">
                {p.nutrition.map((n) => (
                  <li key={n.label_ar} className="flex items-baseline justify-between gap-4 py-2 text-sm">
                    <span className="text-foreground/90">{n.label_ar}</span>
                    <span className="text-muted-foreground">{n.value}{n.unit ? ` ${n.unit}` : ""}</span>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}

          {p.faqs.length > 0 ? (
            <article className="rounded-2xl border border-border bg-card p-6 lg:col-span-3">
              <h2 className="text-lg font-bold text-foreground">أسئلة شائعة</h2>
              <div className="mt-3 divide-y divide-border">
                {p.faqs.map((f) => (
                  <details key={f.question_ar} className="group py-3">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
                      {f.question_ar}
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.answer_ar}</p>
                  </details>
                ))}
              </div>
            </article>
          ) : null}
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
