import { LLink } from "@/i18n/LLink";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getCorporateIdentity, getProductBySlug, listBrandProducts } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";
import { useLocale } from "@/i18n/LocaleProvider";
import { useLocalizedIdentity } from "@/i18n/identity";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const productQO = (brandSlug: string, productSlug: string) =>
  queryOptions({
    queryKey: ["product", brandSlug, productSlug],
    queryFn: () => getProductBySlug({ data: { brandSlug, productSlug } }),
  });
const brandProductsQO = (brandSlug: string) =>
  queryOptions({ queryKey: ["brand-products", brandSlug], queryFn: () => listBrandProducts({ data: { brandSlug } }) });

export const Route = createFileRoute("/$lang/brands/$slug/$productSlug")({
  loader: async ({ context, params }) => {
    const p = await context.queryClient.ensureQueryData(productQO(params.slug, params.productSlug));
    if (!p) throw notFound();
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(brandProductsQO(params.slug)),
    ]);
    return { product: p };
  },
  head: ({ params, loaderData }) => {
    const url = `https://rukna-ltawfir.lovable.app/${params.lang}/brands/${params.slug}/${params.productSlug}`;
    const isAr = params.lang === "ar";
    const p = loaderData?.product;
    const pname = p ? (isAr ? p.name_ar : p.name_en) : params.productSlug;
    const bname = p ? (isAr ? p.brand.name_ar : p.brand.name_en) : params.slug;
    const suffix = isAr ? "ركن التوفير" : "Rukn Al-Tawfir";
    const title = p ? `${pname} — ${bname} | ${suffix}` : `${params.productSlug} — ${params.slug} | ${suffix}`;
    const description = p?.short_description_ar ?? p?.long_description_ar ?? (isAr
      ? `صفحة المنتج ${params.productSlug} من علامة ${params.slug}.`
      : `Product page for ${params.productSlug} from ${params.slug}.`);
    const image = p?.cover_url ?? undefined;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: p
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: pname,
                description,
                ...(image ? { image } : {}),
                brand: { "@type": "Brand", name: bname },
                url,
              }),
            },
          ]
        : [],
    };
  },
  component: ProductDetailPage,
  notFoundComponent: () => <ProductNotFound />,
  errorComponent: ({ error }) => <ProductError message={error.message} />,
});

function ProductNotFound() {
  const { t } = useLocale();
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">{t("errors.productNotFound")}</h1>
      <LLink to="/$lang/brands" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
        {t("errors.backToBrands")}
      </LLink>
    </div>
  );
}

function ProductError({ message }: { message: string }) {
  const { t } = useLocale();
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">{t("errors.productLoadFailed")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function ProductDetailPage() {
  const { lang, t } = useLocale();
  const isAr = lang === "ar";
  const params = Route.useParams();
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: p } = useSuspenseQuery(productQO(params.slug, params.productSlug));
  const { data: brandProducts } = useSuspenseQuery(brandProductsQO(params.slug));
  const ident = useLocalizedIdentity(id);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  if (!p) return null;
  const related = brandProducts.filter((x) => x.slug !== p.slug).slice(0, 4);

  const accent = p.brand.brand_tokens.accent ?? "var(--leaf-500)";
  const hero = activeImage ?? p.cover_url;
  const pname = isAr ? p.name_ar : p.name_en;
  const bname = isAr ? p.brand.name_ar : p.brand.name_en;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        legalName={ident.legalName}
        parentGroup={ident.parentGroup}
        whatsappNumber={id.whatsapp_number}
        logoUrl={id.logo_url}
      />

      <section className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
        <nav className="text-xs text-muted-foreground">
          <LLink to="/$lang/" className="hover:text-primary">{t("brand.breadcrumbHome")}</LLink>
          <span className="mx-2">/</span>
          <LLink to="/$lang/brands" className="hover:text-primary">{t("brand.breadcrumbBrands")}</LLink>
          <span className="mx-2">/</span>
          <LLink to="/$lang/brands/$slug" params={{ slug: p.brand.slug }} className="hover:text-primary">{bname}</LLink>
          <span className="mx-2">/</span>
          <span className="text-foreground">{pname}</span>
        </nav>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-8 md:grid-cols-2 md:px-6 md:py-12">
        <div>
          <div className="prem-card p-8 md:p-10">
            <div className="podium aspect-square w-full overflow-hidden rounded-[1.8rem] p-8">
              {hero ? (
                <img src={hero} alt={pname} className="size-full object-contain" />
              ) : (
                <div className="grid size-full place-items-center text-sm text-muted-foreground">{t("common.officialPackageImage")}</div>
              )}
            </div>
            {p.gallery.length > 0 ? (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[p.cover_url, ...p.gallery.map((g) => g.url)].filter(Boolean).map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setActiveImage(url)}
                    className={`podium aspect-square overflow-hidden rounded-xl p-1 transition-all ${
                      hero === url ? "border-primary shadow-[0_18px_34px_-22px_oklch(0.32_0.13_245/0.4)]" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <img src={url ?? ""} alt="" className="size-full object-contain" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="prem-card p-7 md:p-9">
          <div className="flex items-center gap-3">
            <div className="podium grid size-12 place-items-center overflow-hidden rounded-xl p-1">
              {p.brand.logo_url ? (
                <img src={p.brand.logo_url} alt={bname} className="size-full object-contain" />
              ) : null}
            </div>
            <LLink
              to="/$lang/brands/$slug"
              params={{ slug: p.brand.slug }}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {bname}
            </LLink>
          </div>
          <h1 className="mt-4 font-arabic text-3xl font-bold text-foreground md:text-4xl">{pname}</h1>
          <div className="mt-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">{isAr ? p.name_en : p.name_ar}</div>
          {p.short_description_ar ? (
            <p className="mt-4 text-base leading-loose text-foreground/80">{p.short_description_ar}</p>
          ) : null}

          {p.key_benefits_ar.length > 0 ? (
            <ul className="mt-5 space-y-2.5">
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
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("product.availableSizes")}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.variants.map((v) => (
                  <span key={v.id} className="rounded-full border border-border/80 bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-[0_14px_24px_-20px_oklch(0.32_0.13_245/0.32)]">
                    {v.name_ar}{v.pack_size ? ` · ${v.pack_size}` : ""}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap gap-3">
            <WhatsAppCTA
              number={id.whatsapp_number}
              message={t("product.askWaMsg", { product: pname, brand: bname })}
            >
              {t("product.askAbout")}
            </WhatsAppCTA>
            <LLink
              to="/$lang/catalogs"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {t("product.viewCatalog")}
            </LLink>
          </div>

          <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
            {t("product.pricingNotice")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {p.long_description_ar ? (
            <article className="prem-card lg:col-span-2 p-6 md:p-7">
              <h2 className="font-arabic text-lg font-bold text-foreground">{t("product.about")}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-loose text-foreground/85">{p.long_description_ar}</p>
            </article>
          ) : null}

          {p.usage_instructions_ar ? (
            <article className="prem-card p-6 md:p-7">
              <h2 className="font-arabic text-lg font-bold text-foreground">{t("product.usage")}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-loose text-foreground/85">{p.usage_instructions_ar}</p>
            </article>
          ) : null}

          {p.ingredients.length > 0 ? (
            <article className="prem-card p-6 md:p-7 lg:col-span-2">
              <h2 className="font-arabic text-lg font-bold text-foreground">{t("product.ingredients")}</h2>
              <ul className="mt-3 divide-y divide-border/70">
                {p.ingredients.map((i) => (
                  <li key={i.name_ar} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                    <span className="text-foreground/90">{i.name_ar}</span>
                    {i.percentage != null ? <span className="text-muted-foreground">{i.percentage}%</span> : null}
                  </li>
                ))}
              </ul>
            </article>
          ) : null}

          {p.nutrition.length > 0 ? (
            <article className="prem-card p-6 md:p-7">
              <h2 className="font-arabic text-lg font-bold text-foreground">{t("product.nutrition")}</h2>
              <ul className="mt-3 divide-y divide-border/70">
                {p.nutrition.map((n) => (
                  <li key={n.label_ar} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                    <span className="text-foreground/90">{n.label_ar}</span>
                    <span className="text-muted-foreground">{n.value}{n.unit ? ` ${n.unit}` : ""}</span>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}

          {p.faqs.length > 0 ? (
            <article className="prem-card p-6 md:p-7 lg:col-span-3">
              <h2 className="font-arabic text-lg font-bold text-foreground">{t("product.faqs")}</h2>
              <div className="mt-3 divide-y divide-border/70">
                {p.faqs.map((f) => (
                  <details key={f.question_ar} className="group py-3.5">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
                      {f.question_ar}
                    </summary>
                    <p className="mt-2 text-sm leading-loose text-muted-foreground">{f.answer_ar}</p>
                  </details>
                ))}
              </div>
            </article>
          ) : null}
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
            <div className="hq-eyebrow" style={{ color: accent as string }}>{t("product.relatedEyebrow")}</div>
            <h2 className="mt-3 font-arabic text-2xl font-bold text-foreground md:text-3xl">
              {t("product.moreFrom", { name: bname })}
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((r) => {
                const rname = isAr ? r.name_ar : r.name_en;
                return (
                  <LLink
                    key={r.id}
                    to="/$lang/brands/$slug/$productSlug"
                    params={{ slug: p.brand.slug, productSlug: r.slug }}
                    className="prem-card group flex flex-col"
                  >
                    <div className="podium grid aspect-square place-items-center p-5">
                      {r.cover_url ? (
                        <img src={r.cover_url} alt={rname} className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <span className="text-xs text-muted-foreground">{t("common.officialPackage")}</span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="font-arabic text-sm font-bold text-foreground line-clamp-2">{rname}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink-600">{isAr ? r.name_en : r.name_ar}</div>
                    </div>
                  </LLink>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <SiteFooter
        legalName={ident.legalName}
        parentGroup={ident.parentGroup}
        whatsappNumber={id.whatsapp_number}
        email={id.email}
        address={ident.address}
      />
    </div>
  );
}
