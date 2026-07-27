ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS public_url text;

DROP POLICY IF EXISTS "Brand assets public read" ON storage.objects;

CREATE POLICY "Brand assets public read"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'brand-assets'
  AND EXISTS (
    SELECT 1 FROM public.assets a
    WHERE a.storage_bucket = 'brand-assets'
      AND a.storage_path = objects.name
      AND a.channel <> 'document'::asset_channel
      AND (
        EXISTS (SELECT 1 FROM public.brands b WHERE (b.logo_asset_id = a.id OR b.hero_asset_id = a.id) AND b.status = 'active'::brand_status)
        OR EXISTS (SELECT 1 FROM public.products p WHERE p.cover_asset_id = a.id AND p.is_published)
        OR EXISTS (
          SELECT 1 FROM public.product_assets pa JOIN public.products p ON p.id = pa.product_id
          WHERE pa.asset_id = a.id AND p.is_published
            AND (pa.variant_id IS NULL OR EXISTS (SELECT 1 FROM public.product_variants v WHERE v.id = pa.variant_id AND v.is_published))
        )
        OR EXISTS (SELECT 1 FROM public.product_variants v WHERE v.cover_asset_id = a.id AND v.is_published)
        OR EXISTS (SELECT 1 FROM public.product_categories pc WHERE pc.icon_asset_id = a.id)
        OR EXISTS (SELECT 1 FROM public.pages pg WHERE pg.cover_asset_id = a.id AND pg.is_published)
        OR EXISTS (SELECT 1 FROM public.insights i WHERE i.cover_asset_id = a.id AND i.is_published)
        OR EXISTS (SELECT 1 FROM public.catalogs c WHERE c.cover_asset_id = a.id AND c.is_published)
        OR EXISTS (SELECT 1 FROM public.certifications ce WHERE ce.logo_asset_id = a.id)
        OR EXISTS (SELECT 1 FROM public.corporate_identity ci WHERE ci.logo_asset_id = a.id)
        OR EXISTS (
          SELECT 1 FROM public.homepage_slides hs
          WHERE (hs.desktop_asset_id = a.id OR hs.mobile_asset_id = a.id)
            AND hs.is_published AND hs.is_visible
        )
        OR EXISTS (
          SELECT 1 FROM public.homepage_settings hset
          WHERE a.id::text IN (
            hset.hero_image_config->>'desktop_asset_id',
            hset.hero_image_config->>'mobile_asset_id',
            hset.hero_custom_config->>'bg_image_asset_id',
            hset.hero_custom_config->>'main_image_asset_id',
            hset.hero_custom_config->>'logo_asset_id'
          )
        )
      )
  )
);