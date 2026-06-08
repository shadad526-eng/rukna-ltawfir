
-- 1) Replace permissive document-channel asset SELECT policy
DROP POLICY IF EXISTS "Assets public read non-doc" ON public.assets;

CREATE POLICY "Assets public read non-doc"
  ON public.assets
  FOR SELECT
  TO public
  USING (
    channel <> 'document'::asset_channel
  );

CREATE POLICY "Assets document read via catalog visibility"
  ON public.assets
  FOR SELECT
  TO authenticated
  USING (
    channel = 'document'::asset_channel
    AND (
      is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.catalogs c
        WHERE c.pdf_asset_id = assets.id
          AND (
            (c.is_published AND c.visibility = 'public'::catalog_visibility)
            OR (c.is_published AND c.visibility = 'restricted'::catalog_visibility)
            OR (c.is_published AND c.visibility = 'b2b_only'::catalog_visibility)
            OR (c.brand_id IS NOT NULL AND has_brand_role(auth.uid(), c.brand_id, 'brand_manager'::app_role))
          )
      )
    )
  );

-- 2) Tighten catalogs SELECT: require is_published for b2b_only branch
DROP POLICY IF EXISTS "Catalogs public read public" ON public.catalogs;

CREATE POLICY "Catalogs public read public"
  ON public.catalogs
  FOR SELECT
  TO public
  USING (
    (is_published AND visibility = 'public'::catalog_visibility)
    OR (is_published AND visibility = 'restricted'::catalog_visibility AND auth.uid() IS NOT NULL)
    OR (is_published AND visibility = 'b2b_only'::catalog_visibility AND auth.uid() IS NOT NULL)
    OR is_admin(auth.uid())
    OR (brand_id IS NOT NULL AND has_brand_role(auth.uid(), brand_id, 'brand_manager'::app_role))
  );

-- 3) Product assets: when tied to a variant, require that variant be published
DROP POLICY IF EXISTS "Product assets public read" ON public.product_assets;

CREATE POLICY "Product assets public read"
  ON public.product_assets
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_assets.product_id
        AND p.is_published
    )
    AND (
      product_assets.variant_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.product_variants v
        WHERE v.id = product_assets.variant_id
          AND v.is_published
      )
    )
  );
