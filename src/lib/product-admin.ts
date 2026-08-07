// Product workspace data layer.
// All reads/writes go straight to Supabase through the authenticated browser
// client; RLS restricts writes to super admins / brand staff.

import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

export type VariantDraft = {
  id?: string;
  slug: string;
  name_ar: string;
  name_en: string;
  variant_type?: string | null;
  pack_size: string | null;
  unit_count: number | null;
  weight_grams: number | null;
  barcode: string | null;
  internal_sku: string | null;
  cover_asset_id: string | null;
  is_published: boolean;
};

export type GalleryDraft = {
  id?: string;
  asset_id: string;
  caption_ar: string | null;
  caption_en: string | null;
};

export type IngredientDraft = {
  id?: string;
  name_ar: string;
  name_en: string;
  percentage: number | null;
  origin_ar: string | null;
  origin_en: string | null;
  notes_ar: string | null;
  notes_en: string | null;
};

export type NutritionDraft = {
  id?: string;
  label_ar: string;
  label_en: string;
  value: string;
  unit: string | null;
};

export type FaqDraft = {
  id?: string;
  question_ar: string;
  answer_ar: string;
  question_en: string | null;
  answer_en: string | null;
};

export type ProductDraft = {
  id?: string;
  brand_id: string | null;
  category_id: string | null;
  slug: string;
  name_ar: string;
  name_en: string;
  short_description_ar: string | null;
  short_description_en: string | null;
  long_description_ar: string | null;
  long_description_en: string | null;
  usage_instructions_ar: string | null;
  usage_instructions_en: string | null;
  key_benefits_ar: string[];
  key_benefits_en: string[];
  cover_asset_id: string | null;
  /** id of the product_assets row that carries the cover caption (if any) */
  cover_row_id?: string | null;
  cover_caption_ar: string | null;
  cover_caption_en: string | null;
  is_published: boolean;
  sort_order: number;
  seo_title_ar: string | null;
  seo_title_en: string | null;
  seo_description_ar: string | null;
  seo_description_en: string | null;
  variants: VariantDraft[];
  gallery: GalleryDraft[];
  ingredients: IngredientDraft[];
  nutrition: NutritionDraft[];
  faqs: FaqDraft[];
};


export function emptyProduct(): ProductDraft {
  return {
    brand_id: null,
    category_id: null,
    slug: "",
    name_ar: "",
    name_en: "",
    short_description_ar: "",
    short_description_en: "",
    long_description_ar: "",
    long_description_en: "",
    usage_instructions_ar: "",
    usage_instructions_en: "",
    key_benefits_ar: [],
    key_benefits_en: [],
    cover_asset_id: null,
    cover_row_id: null,
    cover_caption_ar: "",
    cover_caption_en: "",

    is_published: false,
    sort_order: 0,
    seo_title_ar: "",
    seo_title_en: "",
    seo_description_ar: "",
    seo_description_en: "",
    variants: [],
    gallery: [],
    ingredients: [],
    nutrition: [],
    faqs: [],
  };
}

/** URL-safe slug; keeps Arabic letters, collapses everything else to `-`. */
export function slugify(input: string): string {
  return (input ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function str(v: any): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}
function nullable(v: any): string | null {
  const s = str(v).trim();
  return s ? s : null;
}
function num(v: any): number | null {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function loadProduct(id: string): Promise<ProductDraft> {
  const [{ data: p, error }, variants, gallery, ingredients, nutrition, faqs] = await Promise.all([
    db.from("products").select("*").eq("id", id).maybeSingle(),
    db.from("product_variants").select("*").eq("product_id", id).order("sort_order", { ascending: true }),
    db.from("product_assets").select("*").eq("product_id", id).order("sort_order", { ascending: true }),
    db.from("product_ingredients").select("*").eq("product_id", id).order("sort_order", { ascending: true }),
    db.from("product_nutrition").select("*").eq("product_id", id).order("sort_order", { ascending: true }),
    db.from("product_faqs").select("*").eq("product_id", id).order("sort_order", { ascending: true }),
  ]);
  if (error) throw error;
  if (!p) throw new Error("المنتج غير موجود");

  // The product_assets row that points at the cover asset carries the cover
  // caption; everything else is the gallery.
  const assetRows: any[] = gallery.data ?? [];
  const coverRow = p.cover_asset_id ? assetRows.find((g) => g.asset_id === p.cover_asset_id) ?? null : null;

  return {

    id: p.id,
    brand_id: p.brand_id ?? null,
    category_id: p.category_id ?? null,
    slug: p.slug ?? "",
    name_ar: p.name_ar ?? "",
    name_en: p.name_en ?? "",
    short_description_ar: p.short_description_ar ?? "",
    short_description_en: p.short_description_en ?? "",
    long_description_ar: p.long_description_ar ?? "",
    long_description_en: p.long_description_en ?? "",
    usage_instructions_ar: p.usage_instructions_ar ?? "",
    usage_instructions_en: p.usage_instructions_en ?? "",
    key_benefits_ar: Array.isArray(p.key_benefits_ar) ? p.key_benefits_ar : [],
    key_benefits_en: Array.isArray(p.key_benefits_en) ? p.key_benefits_en : [],
    cover_asset_id: p.cover_asset_id ?? null,
    cover_row_id: coverRow?.id ?? null,
    cover_caption_ar: coverRow?.caption_ar ?? "",
    cover_caption_en: coverRow?.caption_en ?? "",

    is_published: !!p.is_published,
    sort_order: p.sort_order ?? 0,
    seo_title_ar: p.seo_title_ar ?? "",
    seo_title_en: p.seo_title_en ?? "",
    seo_description_ar: p.seo_description_ar ?? "",
    seo_description_en: p.seo_description_en ?? "",
    variants: (variants.data ?? []).map((v: any) => ({
      id: v.id,
      slug: v.slug ?? "",
      name_ar: v.name_ar ?? "",
      name_en: v.name_en ?? "",
      variant_type: v.variant_type ?? "size",
      pack_size: v.pack_size ?? "",
      unit_count: v.unit_count ?? null,
      weight_grams: v.weight_grams ?? null,
      barcode: v.barcode ?? "",
      internal_sku: v.internal_sku ?? "",
      cover_asset_id: v.cover_asset_id ?? null,
      is_published: !!v.is_published,
    })),
    gallery: assetRows.filter((g: any) => !coverRow || g.id !== coverRow.id).map((g: any) => ({
      id: g.id,
      asset_id: g.asset_id,

      caption_ar: g.caption_ar ?? "",
      caption_en: g.caption_en ?? "",
    })),
    ingredients: (ingredients.data ?? []).map((i: any) => ({
      id: i.id,
      name_ar: i.name_ar ?? "",
      name_en: i.name_en ?? "",
      percentage: i.percentage ?? null,
      origin_ar: i.origin_ar ?? "",
      origin_en: i.origin_en ?? "",
      notes_ar: i.notes_ar ?? "",
      notes_en: i.notes_en ?? "",
    })),
    nutrition: (nutrition.data ?? []).map((n: any) => ({
      id: n.id,
      label_ar: n.label_ar ?? "",
      label_en: n.label_en ?? "",
      value: n.value ?? "",
      unit: n.unit ?? "",
    })),
    faqs: (faqs.data ?? []).map((f: any) => ({
      id: f.id,
      question_ar: f.question_ar ?? "",
      answer_ar: f.answer_ar ?? "",
      question_en: f.question_en ?? "",
      answer_en: f.answer_en ?? "",
    })),
  };
}

export function validateProduct(d: ProductDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!str(d.name_ar).trim()) errors.name_ar = "الاسم بالعربية مطلوب";
  if (!str(d.name_en).trim()) errors.name_en = "الاسم بالإنجليزية مطلوب";
  if (!str(d.slug).trim()) errors.slug = "المعرّف (Slug) مطلوب";
  d.variants.forEach((v, i) => {
    if (!str(v.name_ar).trim()) errors[`variant_${i}`] = `النوع رقم ${i + 1}: الاسم مطلوب`;
  });
  d.nutrition.forEach((n, i) => {
    if (!str(n.label_ar).trim() || !str(n.value).trim()) errors[`nutrition_${i}`] = `القيمة الغذائية رقم ${i + 1}: العنوان والقيمة مطلوبان`;
  });
  d.faqs.forEach((f, i) => {
    if (!str(f.question_ar).trim() || !str(f.answer_ar).trim()) errors[`faq_${i}`] = `السؤال رقم ${i + 1}: السؤال والإجابة مطلوبان`;
  });
  return errors;
}

/** Replaces the child rows of a product without creating duplicates. */
async function syncChildren(
  table: string,
  productId: string,
  rows: Array<Record<string, any> & { id?: string }>,
) {
  const keepIds = rows.map((r) => r.id).filter(Boolean) as string[];
  let del = db.from(table).delete().eq("product_id", productId);
  if (keepIds.length) del = del.not("id", "in", `(${keepIds.map((i) => `"${i}"`).join(",")})`);
  const { error: delErr } = await del;
  if (delErr) throw delErr;

  if (!rows.length) return;
  const payload = rows.map((r, index) => ({ ...r, product_id: productId, sort_order: index }));
  const withId = payload.filter((r) => r.id);
  const withoutId = payload.map((r) => { const { id, ...rest } = r; return r.id ? null : rest; }).filter(Boolean) as any[];

  if (withId.length) {
    const { error } = await db.from(table).upsert(withId, { onConflict: "id" });
    if (error) throw error;
  }
  if (withoutId.length) {
    const { error } = await db.from(table).insert(withoutId);
    if (error) throw error;
  }
}

/** Creates or updates the product plus every related section. Returns the id. */
export async function saveProduct(d: ProductDraft): Promise<string> {
  const base = {
    brand_id: d.brand_id || null,
    category_id: d.category_id || null,
    slug: slugify(d.slug) || slugify(d.name_en) || slugify(d.name_ar),
    name_ar: str(d.name_ar).trim(),
    name_en: str(d.name_en).trim(),
    short_description_ar: nullable(d.short_description_ar),
    short_description_en: nullable(d.short_description_en),
    long_description_ar: nullable(d.long_description_ar),
    long_description_en: nullable(d.long_description_en),
    usage_instructions_ar: nullable(d.usage_instructions_ar),
    usage_instructions_en: nullable(d.usage_instructions_en),
    key_benefits_ar: d.key_benefits_ar.filter(Boolean),
    key_benefits_en: d.key_benefits_en.filter(Boolean),
    cover_asset_id: d.cover_asset_id || null,
    is_published: !!d.is_published,
    sort_order: num(d.sort_order) ?? 0,
    seo_title_ar: nullable(d.seo_title_ar),
    seo_title_en: nullable(d.seo_title_en),
    seo_description_ar: nullable(d.seo_description_ar),
    seo_description_en: nullable(d.seo_description_en),
  };

  let productId = d.id;
  if (productId) {
    const { error } = await db.from("products").update(base).eq("id", productId);
    if (error) throw error;
  } else {
    const { data, error } = await db.from("products").insert(base).select("id").single();
    if (error) throw error;
    productId = data.id as string;
  }

  await syncChildren(
    "product_variants",
    productId!,
    d.variants.map((v, i) => ({
      ...(v.id ? { id: v.id } : {}),
      slug: slugify(v.slug) || `${base.slug}-${i + 1}`,
      name_ar: str(v.name_ar).trim(),
      name_en: str(v.name_en).trim() || str(v.name_ar).trim(),
      variant_type: nullable(v.variant_type) ?? "size",
      pack_size: nullable(v.pack_size),
      unit_count: num(v.unit_count),
      weight_grams: num(v.weight_grams),
      barcode: nullable(v.barcode),
      internal_sku: nullable(v.internal_sku),
      cover_asset_id: v.cover_asset_id || null,
      is_published: !!v.is_published,
    })),
  );

  await syncChildren(
    "product_assets",
    productId!,
    d.gallery
      .filter((g) => g.asset_id)
      .map((g) => ({
        ...(g.id ? { id: g.id } : {}),
        asset_id: g.asset_id,
        caption_ar: nullable(g.caption_ar),
        caption_en: nullable(g.caption_en),
      })),
  );

  await syncChildren(
    "product_ingredients",
    productId!,
    d.ingredients
      .filter((i) => str(i.name_ar).trim())
      .map((i) => ({
        ...(i.id ? { id: i.id } : {}),
        name_ar: str(i.name_ar).trim(),
        name_en: str(i.name_en).trim() || str(i.name_ar).trim(),
        percentage: num(i.percentage),
        origin_ar: nullable(i.origin_ar),
        origin_en: nullable(i.origin_en),
        notes_ar: nullable(i.notes_ar),
        notes_en: nullable(i.notes_en),
      })),
  );

  await syncChildren(
    "product_nutrition",
    productId!,
    d.nutrition
      .filter((n) => str(n.label_ar).trim())
      .map((n) => ({
        ...(n.id ? { id: n.id } : {}),
        label_ar: str(n.label_ar).trim(),
        label_en: str(n.label_en).trim() || str(n.label_ar).trim(),
        value: str(n.value).trim(),
        unit: nullable(n.unit),
      })),
  );

  await syncChildren(
    "product_faqs",
    productId!,
    d.faqs
      .filter((f) => str(f.question_ar).trim())
      .map((f) => ({
        ...(f.id ? { id: f.id } : {}),
        question_ar: str(f.question_ar).trim(),
        answer_ar: str(f.answer_ar).trim(),
        question_en: nullable(f.question_en),
        answer_en: nullable(f.answer_en),
      })),
  );

  return productId!;
}
