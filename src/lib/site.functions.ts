import { createServerFn } from "@tanstack/react-start";

// ---------- Types ----------
export type CorporateIdentity = {
  legal_name_ar: string;
  legal_name_en: string;
  parent_group_ar: string | null;
  hero_headline_ar: string;
  hero_sub_ar: string;
  whatsapp_number: string;
  email: string | null;
  address_ar: string | null;
  logo_url: string | null;
};

export type BrandSummary = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  tagline_ar: string | null;
  description_ar: string | null;
  is_partner: boolean;
  sort_order: number;
  brand_tokens: Record<string, string>;
  logo_url: string | null;
};

export type BrandDetail = BrandSummary & {
  hero_url: string | null;
};

export type ProductSummary = {
  id: string;
  slug: string;
  brand_slug: string;
  name_ar: string;
  name_en: string;
  short_description_ar: string | null;
  cover_url: string | null;
};

export type ProductDetail = ProductSummary & {
  long_description_ar: string | null;
  usage_instructions_ar: string | null;
  key_benefits_ar: string[];
  gallery: { url: string; caption_ar: string | null }[];
  variants: { id: string; slug: string; name_ar: string; pack_size: string | null; cover_url: string | null }[];
  ingredients: { name_ar: string; percentage: number | null; notes_ar: string | null }[];
  nutrition: { label_ar: string; value: string; unit: string | null }[];
  faqs: { question_ar: string; answer_ar: string }[];
  brand: { slug: string; name_ar: string; tagline_ar: string | null; brand_tokens: Record<string, string>; logo_url: string | null };
};

export type CatalogSummary = {
  id: string;
  slug: string;
  title_ar: string;
  description_ar: string | null;
  year: number | null;
  visibility: "public" | "restricted" | "b2b_only";
  brand_slug: string | null;
  brand_name_ar: string | null;
  cover_url: string | null;
  pdf_url: string | null; // signed URL only for public visibility
};

// ---------- Helpers (server-only) ----------
async function signedUrl(bucket: string, path: string | null | undefined, ttl = 3600) {
  if (!path) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, ttl);
  return data?.signedUrl ?? null;
}

async function assetUrl(assetId: string | null | undefined) {
  if (!assetId) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("assets")
    .select("storage_bucket, storage_path")
    .eq("id", assetId)
    .maybeSingle();
  if (!data) return null;
  return signedUrl(data.storage_bucket, data.storage_path);
}

// ---------- Public server functions ----------

export const getCorporateIdentity = createServerFn({ method: "GET" }).handler(
  async (): Promise<CorporateIdentity> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("corporate_identity")
      .select(
        "legal_name_ar, legal_name_en, parent_group_ar, hero_headline_ar, hero_sub_ar, whatsapp_number, email, address_ar, logo_asset_id",
      )
      .eq("id", 1)
      .single();
    if (error) throw error;
    const logo_url = await assetUrl((data as { logo_asset_id: string | null }).logo_asset_id);
    return {
      legal_name_ar: data.legal_name_ar,
      legal_name_en: data.legal_name_en,
      parent_group_ar: data.parent_group_ar,
      hero_headline_ar: data.hero_headline_ar,
      hero_sub_ar: data.hero_sub_ar,
      whatsapp_number: data.whatsapp_number,
      email: data.email,
      address_ar: data.address_ar,
      logo_url,
    };
  },
);

export const listBrands = createServerFn({ method: "GET" }).handler(
  async (): Promise<BrandSummary[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("brands")
      .select(
        "id, slug, name_ar, name_en, tagline_ar, description_ar, is_partner, sort_order, brand_tokens, logo_asset_id, assets:logo_asset_id ( storage_bucket, storage_path )",
      )
      .eq("status", "active")
      .order("sort_order", { ascending: true });
    if (error) throw error;

    const result: BrandSummary[] = [];
    for (const row of (data ?? []) as Array<Record<string, unknown>>) {
      const asset = row.assets as { storage_bucket: string; storage_path: string } | null;
      const logo_url = asset ? await signedUrl(asset.storage_bucket, asset.storage_path) : null;
      result.push({
        id: row.id as string,
        slug: row.slug as string,
        name_ar: row.name_ar as string,
        name_en: row.name_en as string,
        tagline_ar: (row.tagline_ar as string | null) ?? null,
        description_ar: (row.description_ar as string | null) ?? null,
        is_partner: row.is_partner as boolean,
        sort_order: row.sort_order as number,
        brand_tokens: (row.brand_tokens as Record<string, string>) ?? {},
        logo_url,
      });
    }
    return result;
  },
);

export const getBrandBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<BrandDetail | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("brands")
      .select(
        "id, slug, name_ar, name_en, tagline_ar, description_ar, is_partner, sort_order, brand_tokens, logo_asset_id, hero_asset_id",
      )
      .eq("slug", data.slug)
      .eq("status", "active")
      .maybeSingle();
    if (error) throw error;
    if (!row) return null;
    const [logo_url, hero_url] = await Promise.all([
      assetUrl(row.logo_asset_id),
      assetUrl(row.hero_asset_id),
    ]);
    return {
      id: row.id,
      slug: row.slug,
      name_ar: row.name_ar,
      name_en: row.name_en,
      tagline_ar: row.tagline_ar,
      description_ar: row.description_ar,
      is_partner: row.is_partner,
      sort_order: row.sort_order,
      brand_tokens: (row.brand_tokens as Record<string, string>) ?? {},
      logo_url,
      hero_url,
    };
  });

export const listBrandProducts = createServerFn({ method: "GET" })
  .inputValidator((data: { brandSlug: string }) => data)
  .handler(async ({ data }): Promise<ProductSummary[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: brand } = await supabaseAdmin
      .from("brands")
      .select("id, slug")
      .eq("slug", data.brandSlug)
      .maybeSingle();
    if (!brand) return [];
    const { data: rows, error } = await supabaseAdmin
      .from("products")
      .select("id, slug, name_ar, name_en, short_description_ar, cover_asset_id")
      .eq("brand_id", brand.id)
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    const out: ProductSummary[] = [];
    for (const p of rows ?? []) {
      out.push({
        id: p.id,
        slug: p.slug,
        brand_slug: brand.slug,
        name_ar: p.name_ar,
        name_en: p.name_en,
        short_description_ar: p.short_description_ar,
        cover_url: await assetUrl(p.cover_asset_id),
      });
    }
    return out;
  });

export const listFeaturedProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProductSummary[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        "id, slug, name_ar, name_en, short_description_ar, cover_asset_id, sort_order, brand:brand_id ( slug, sort_order )",
      )
      .eq("is_published", true)
      .not("cover_asset_id", "is", null)
      .limit(60);
    if (error) throw error;
    type Row = {
      id: string; slug: string; name_ar: string; name_en: string;
      short_description_ar: string | null; cover_asset_id: string | null; sort_order: number;
      brand: { slug: string; sort_order: number } | null;
    };
    const rows = ((data ?? []) as unknown as Row[])
      .filter((r) => r.brand)
      .sort((a, b) => (a.brand!.sort_order - b.brand!.sort_order) || (a.sort_order - b.sort_order));
    // Pick at most 2 per brand for variety, then limit to 8 cards
    const perBrand = new Map<string, number>();
    const picked: Row[] = [];
    for (const r of rows) {
      const c = perBrand.get(r.brand!.slug) ?? 0;
      if (c >= 2) continue;
      perBrand.set(r.brand!.slug, c + 1);
      picked.push(r);
      if (picked.length >= 8) break;
    }
    const out: ProductSummary[] = [];
    for (const r of picked) {
      out.push({
        id: r.id,
        slug: r.slug,
        brand_slug: r.brand!.slug,
        name_ar: r.name_ar,
        name_en: r.name_en,
        short_description_ar: r.short_description_ar,
        cover_url: await assetUrl(r.cover_asset_id),
      });
    }
    return out;
  },
);

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { brandSlug: string; productSlug: string }) => data)
  .handler(async ({ data }): Promise<ProductDetail | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: brand } = await supabaseAdmin
      .from("brands")
      .select("id, slug, name_ar, tagline_ar, brand_tokens, logo_asset_id")
      .eq("slug", data.brandSlug)
      .maybeSingle();
    if (!brand) return null;
    const { data: p, error } = await supabaseAdmin
      .from("products")
      .select(
        "id, slug, name_ar, name_en, short_description_ar, long_description_ar, usage_instructions_ar, key_benefits_ar, cover_asset_id",
      )
      .eq("brand_id", brand.id)
      .eq("slug", data.productSlug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw error;
    if (!p) return null;

    const [cover_url, brandLogo, variants, gallery, ingredients, nutrition, faqs] = await Promise.all([
      assetUrl(p.cover_asset_id),
      assetUrl(brand.logo_asset_id),
      supabaseAdmin
        .from("product_variants")
        .select("id, slug, name_ar, pack_size, cover_asset_id")
        .eq("product_id", p.id)
        .eq("is_published", true)
        .order("sort_order", { ascending: true }),
      supabaseAdmin
        .from("product_assets")
        .select("caption_ar, sort_order, assets:asset_id ( storage_bucket, storage_path )")
        .eq("product_id", p.id)
        .order("sort_order", { ascending: true }),
      supabaseAdmin
        .from("product_ingredients")
        .select("name_ar, percentage, notes_ar, sort_order")
        .eq("product_id", p.id)
        .order("sort_order", { ascending: true }),
      supabaseAdmin
        .from("product_nutrition")
        .select("label_ar, value, unit, sort_order")
        .eq("product_id", p.id)
        .order("sort_order", { ascending: true }),
      supabaseAdmin
        .from("product_faqs")
        .select("question_ar, answer_ar, sort_order")
        .eq("product_id", p.id)
        .order("sort_order", { ascending: true }),
    ]);

    const variantsOut = await Promise.all(
      (variants.data ?? []).map(async (v) => ({
        id: v.id,
        slug: v.slug,
        name_ar: v.name_ar,
        pack_size: v.pack_size,
        cover_url: await assetUrl(v.cover_asset_id),
      })),
    );
    const galleryOut = await Promise.all(
      ((gallery.data ?? []) as Array<{ caption_ar: string | null; assets: { storage_bucket: string; storage_path: string } | null }>).map(
        async (g) => ({
          caption_ar: g.caption_ar,
          url: g.assets ? (await signedUrl(g.assets.storage_bucket, g.assets.storage_path)) ?? "" : "",
        }),
      ),
    );

    return {
      id: p.id,
      slug: p.slug,
      brand_slug: brand.slug,
      name_ar: p.name_ar,
      name_en: p.name_en,
      short_description_ar: p.short_description_ar,
      long_description_ar: p.long_description_ar,
      usage_instructions_ar: p.usage_instructions_ar,
      key_benefits_ar: (p.key_benefits_ar as string[] | null) ?? [],
      cover_url,
      gallery: galleryOut.filter((g) => g.url),
      variants: variantsOut,
      ingredients: (ingredients.data ?? []).map((i) => ({
        name_ar: i.name_ar,
        percentage: i.percentage as number | null,
        notes_ar: i.notes_ar,
      })),
      nutrition: (nutrition.data ?? []).map((n) => ({ label_ar: n.label_ar, value: n.value, unit: n.unit })),
      faqs: (faqs.data ?? []).map((f) => ({ question_ar: f.question_ar, answer_ar: f.answer_ar })),
      brand: {
        slug: brand.slug,
        name_ar: brand.name_ar,
        tagline_ar: brand.tagline_ar,
        brand_tokens: (brand.brand_tokens as Record<string, string>) ?? {},
        logo_url: brandLogo,
      },
    };
  });

export const listCatalogs = createServerFn({ method: "GET" }).handler(async (): Promise<CatalogSummary[]> => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("catalogs")
    .select(
      "id, slug, title_ar, description_ar, year, visibility, cover_asset_id, pdf_asset_id, sort_order, brand:brand_id ( slug, name_ar )",
    )
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  const out: CatalogSummary[] = [];
  for (const c of (data ?? []) as Array<Record<string, unknown>>) {
    const brand = c.brand as { slug: string; name_ar: string } | null;
    const cover_url = await assetUrl(c.cover_asset_id as string | null);
    // Only generate downloadable signed PDF URLs for fully public catalogs.
    // Restricted / b2b_only catalogs go through the request pipeline.
    let pdf_url: string | null = null;
    if ((c.visibility as string) === "public" && c.pdf_asset_id) {
      pdf_url = await assetUrl(c.pdf_asset_id as string);
    }
    out.push({
      id: c.id as string,
      slug: c.slug as string,
      title_ar: c.title_ar as string,
      description_ar: (c.description_ar as string | null) ?? null,
      year: (c.year as number | null) ?? null,
      visibility: c.visibility as CatalogSummary["visibility"],
      brand_slug: brand?.slug ?? null,
      brand_name_ar: brand?.name_ar ?? null,
      cover_url,
      pdf_url,
    });
  }
  return out;
});

export const submitCatalogRequest = createServerFn({ method: "POST" })
  .inputValidator((data: {
    catalog_id: string;
    full_name: string;
    email: string;
    company?: string;
    phone?: string;
    country?: string;
    purpose?: string;
  }) => {
    const errors: string[] = [];
    if (!data.catalog_id) errors.push("catalog_id");
    if (!data.full_name || data.full_name.length < 2 || data.full_name.length > 120) errors.push("full_name");
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > 200) errors.push("email");
    if (data.company && data.company.length > 200) errors.push("company");
    if (data.phone && data.phone.length > 40) errors.push("phone");
    if (data.country && data.country.length > 80) errors.push("country");
    if (data.purpose && data.purpose.length > 1000) errors.push("purpose");
    if (errors.length) throw new Error(`Invalid fields: ${errors.join(",")}`);
    return data;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("catalog_requests").insert({
      catalog_id: data.catalog_id,
      full_name: data.full_name.trim(),
      email: data.email.trim().toLowerCase(),
      company: data.company?.trim() || null,
      phone: data.phone?.trim() || null,
      country: data.country?.trim() || null,
      purpose: data.purpose?.trim() || null,
    });
    if (error) throw error;
    return { ok: true };
  });
