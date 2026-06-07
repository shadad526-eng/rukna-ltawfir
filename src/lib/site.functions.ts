import { createServerFn } from "@tanstack/react-start";

export type CorporateIdentity = {
  legal_name_ar: string;
  legal_name_en: string;
  parent_group_ar: string | null;
  hero_headline_ar: string;
  hero_sub_ar: string;
  whatsapp_number: string;
  email: string | null;
  address_ar: string | null;
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

export const getCorporateIdentity = createServerFn({ method: "GET" }).handler(
  async (): Promise<CorporateIdentity> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("corporate_identity")
      .select(
        "legal_name_ar, legal_name_en, parent_group_ar, hero_headline_ar, hero_sub_ar, whatsapp_number, email, address_ar",
      )
      .eq("id", 1)
      .single();
    if (error) throw error;
    return data as CorporateIdentity;
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
      let logo_url: string | null = null;
      const asset = row.assets as
        | { storage_bucket: string; storage_path: string }
        | null;
      if (asset) {
        const { data: signed } = await supabaseAdmin.storage
          .from(asset.storage_bucket)
          .createSignedUrl(asset.storage_path, 60 * 60);
        logo_url = signed?.signedUrl ?? null;
      }
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
