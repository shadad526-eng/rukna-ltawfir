
-- 1) Storage: require is_published for ALL visibility levels (including b2b_only)
DROP POLICY IF EXISTS "Catalog files authenticated read" ON storage.objects;
CREATE POLICY "Catalog files authenticated read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'catalogs' AND EXISTS (
    SELECT 1 FROM public.catalogs c
    JOIN public.assets a ON a.id = c.pdf_asset_id
    WHERE a.storage_bucket = 'catalogs'
      AND a.storage_path = storage.objects.name
      AND c.is_published
      AND c.visibility IN ('public','restricted','b2b_only')
  )
);

-- 2) Restrict corporate_identity.email to admins via column-level grants
REVOKE SELECT ON public.corporate_identity FROM anon, authenticated;
GRANT SELECT (
  id, legal_name_ar, legal_name_en, parent_group_ar, parent_group_en,
  hero_headline_ar, hero_sub_ar, hero_headline_en, hero_sub_en,
  whatsapp_number, address_ar, address_en, logo_asset_id, updated_at,
  tagline, strategic_positioning
) ON public.corporate_identity TO anon, authenticated;
-- email and updated_by remain readable only via service_role / admins (full SELECT not granted)

-- 3) Pages: scope editor writes to brand_id
DROP POLICY IF EXISTS "Pages staff manage" ON public.pages;
CREATE POLICY "Pages staff manage"
ON public.pages FOR ALL TO authenticated
USING (
  is_admin(auth.uid())
  OR (brand_id IS NOT NULL AND (
    has_brand_role(auth.uid(), brand_id, 'brand_manager'::app_role)
    OR has_brand_role(auth.uid(), brand_id, 'editor'::app_role)
  ))
)
WITH CHECK (
  is_admin(auth.uid())
  OR (brand_id IS NOT NULL AND (
    has_brand_role(auth.uid(), brand_id, 'brand_manager'::app_role)
    OR has_brand_role(auth.uid(), brand_id, 'editor'::app_role)
  ))
);

-- 4) Insights: scope editor writes to brand_id
DROP POLICY IF EXISTS "Insights staff manage" ON public.insights;
CREATE POLICY "Insights staff manage"
ON public.insights FOR ALL TO authenticated
USING (
  is_admin(auth.uid())
  OR (brand_id IS NOT NULL AND (
    has_brand_role(auth.uid(), brand_id, 'brand_manager'::app_role)
    OR has_brand_role(auth.uid(), brand_id, 'editor'::app_role)
  ))
)
WITH CHECK (
  is_admin(auth.uid())
  OR (brand_id IS NOT NULL AND (
    has_brand_role(auth.uid(), brand_id, 'brand_manager'::app_role)
    OR has_brand_role(auth.uid(), brand_id, 'editor'::app_role)
  ))
);

-- 5) Product variants: allow public read for published variants of published products
CREATE POLICY "Variants public read published"
ON public.product_variants FOR SELECT TO anon, authenticated
USING (
  is_published AND EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_variants.product_id AND p.is_published
  )
);
