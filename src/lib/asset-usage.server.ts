/** Reference map + usage lookup used to prevent deleting in-use media. */
export const ASSET_REFS: { table: string; column: string; label: string }[] = [
  { table: "brands", column: "logo_asset_id", label: "علامة تجارية (شعار)" },
  { table: "brands", column: "hero_asset_id", label: "علامة تجارية (غلاف)" },
  { table: "products", column: "cover_asset_id", label: "منتج (غلاف)" },
  { table: "product_variants", column: "cover_asset_id", label: "عبوة منتج" },
  { table: "product_assets", column: "asset_id", label: "صورة منتج" },
  { table: "product_categories", column: "icon_asset_id", label: "تصنيف" },
  { table: "insights", column: "cover_asset_id", label: "مقال" },
  { table: "pages", column: "cover_asset_id", label: "صفحة" },
  { table: "catalogs", column: "cover_asset_id", label: "كتالوج (غلاف)" },
  { table: "catalogs", column: "pdf_asset_id", label: "كتالوج (PDF)" },
  { table: "certifications", column: "logo_asset_id", label: "شهادة" },
  { table: "corporate_identity", column: "logo_asset_id", label: "الهوية المؤسسية" },
  { table: "topic_hubs", column: "cover_asset_id", label: "محور معرفي" },
  { table: "homepage_sections", column: "media_asset_id", label: "قسم الصفحة الرئيسية" },
  { table: "homepage_slides", column: "desktop_asset_id", label: "شريحة (سطح المكتب)" },
  { table: "homepage_slides", column: "mobile_asset_id", label: "شريحة (جوال)" },
];

export async function findAssetUsage(admin: any, bucket: string, path: string) {
  const { data: asset } = await admin
    .from("assets")
    .select("id")
    .eq("storage_bucket", bucket)
    .eq("storage_path", path)
    .maybeSingle();
  const assetId = (asset as any)?.id as string | undefined;
  if (!assetId) return { asset_id: null as string | null, used_by: [] as string[] };
  const used: string[] = [];
  for (const ref of ASSET_REFS) {
    const { count } = await admin
      .from(ref.table)
      .select("*", { count: "exact", head: true })
      .eq(ref.column, assetId);
    if ((count ?? 0) > 0) used.push(`${ref.label} (${count})`);
  }
  const { data: hp } = await admin
    .from("homepage_settings")
    .select("published_slides, hero_image_config, hero_custom_config")
    .eq("id", 1)
    .maybeSingle();
  if (hp && JSON.stringify(hp).includes(assetId)) used.push("الصفحة الرئيسية المنشورة");
  return { asset_id: assetId as string | null, used_by: used };
}
