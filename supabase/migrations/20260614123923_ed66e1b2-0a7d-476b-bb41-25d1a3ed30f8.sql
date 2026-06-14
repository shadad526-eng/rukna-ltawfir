
-- 1) Fix: Assets document read via catalog visibility — restrict catalog PDF asset metadata
--    for restricted/b2b_only catalogs to admins and brand managers/editors only.
DROP POLICY IF EXISTS "Assets document read via catalog visibility" ON public.assets;

CREATE POLICY "Assets document read via catalog visibility"
ON public.assets
FOR SELECT
TO authenticated
USING (
  channel = 'document'::asset_channel
  AND (
    is_admin(auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.catalogs c
      WHERE c.pdf_asset_id = assets.id
        AND c.is_published
        AND (
          c.visibility = 'public'::catalog_visibility
          OR (
            c.visibility = ANY (ARRAY['restricted'::catalog_visibility, 'b2b_only'::catalog_visibility])
            AND c.brand_id IS NOT NULL
            AND (
              has_brand_role(auth.uid(), c.brand_id, 'brand_manager'::app_role)
              OR has_brand_role(auth.uid(), c.brand_id, 'editor'::app_role)
            )
          )
        )
    )
  )
);

-- 2) Fix: Brand assets public read — only expose assets that are linked to a
--    published/active entity (brand logo or hero on active brand, product
--    cover/gallery on published product/variant, page cover on published page,
--    insight cover on published insight, catalog cover on published catalog,
--    certification logo). Document-channel assets are excluded from public reads.
DROP POLICY IF EXISTS "Brand assets public read" ON storage.objects;

CREATE POLICY "Brand assets public read"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'brand-assets'::text
  AND EXISTS (
    SELECT 1
    FROM public.assets a
    WHERE a.storage_bucket = 'brand-assets'::text
      AND a.storage_path = storage.objects.name
      AND a.channel <> 'document'::asset_channel
      AND (
        EXISTS (SELECT 1 FROM public.brands b WHERE (b.logo_asset_id = a.id OR b.hero_asset_id = a.id) AND b.status = 'active'::brand_status)
        OR EXISTS (SELECT 1 FROM public.products p WHERE p.cover_asset_id = a.id AND p.is_published)
        OR EXISTS (
          SELECT 1 FROM public.product_assets pa
          JOIN public.products p ON p.id = pa.product_id
          WHERE pa.asset_id = a.id AND p.is_published
            AND (pa.variant_id IS NULL OR EXISTS (
              SELECT 1 FROM public.product_variants v WHERE v.id = pa.variant_id AND v.is_published
            ))
        )
        OR EXISTS (SELECT 1 FROM public.product_variants v WHERE v.cover_asset_id = a.id AND v.is_published)
        OR EXISTS (SELECT 1 FROM public.product_categories pc WHERE pc.icon_asset_id = a.id)
        OR EXISTS (SELECT 1 FROM public.pages pg WHERE pg.cover_asset_id = a.id AND pg.is_published)
        OR EXISTS (SELECT 1 FROM public.insights i WHERE i.cover_asset_id = a.id AND i.is_published)
        OR EXISTS (SELECT 1 FROM public.catalogs c WHERE c.cover_asset_id = a.id AND c.is_published)
        OR EXISTS (SELECT 1 FROM public.certifications ce WHERE ce.logo_asset_id = a.id)
        OR EXISTS (SELECT 1 FROM public.corporate_identity ci WHERE ci.logo_asset_id = a.id)
      )
  )
);

-- 3) Fix: Catalog files staff read — drop viewer role from access to
--    restricted/b2b_only catalog PDFs (mirrors the catalogs table policy).
DROP POLICY IF EXISTS "Catalog files staff read" ON storage.objects;

CREATE POLICY "Catalog files staff read"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'catalogs'::text
  AND EXISTS (
    SELECT 1
    FROM public.catalogs c
    JOIN public.assets a ON a.id = c.pdf_asset_id
    WHERE a.storage_bucket = 'catalogs'::text
      AND a.storage_path = storage.objects.name
      AND c.is_published
      AND c.visibility = ANY (ARRAY['restricted'::catalog_visibility, 'b2b_only'::catalog_visibility])
      AND (
        is_admin(auth.uid())
        OR (
          c.brand_id IS NOT NULL
          AND (
            has_brand_role(auth.uid(), c.brand_id, 'brand_manager'::app_role)
            OR has_brand_role(auth.uid(), c.brand_id, 'editor'::app_role)
          )
        )
      )
  )
);
