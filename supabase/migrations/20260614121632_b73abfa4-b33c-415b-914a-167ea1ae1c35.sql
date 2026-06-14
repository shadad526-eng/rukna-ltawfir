
-- 1) Restrict brand-assets bucket public read to objects registered in the assets table
DROP POLICY IF EXISTS "Brand assets public read" ON storage.objects;
CREATE POLICY "Brand assets public read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'brand-assets'
  AND EXISTS (
    SELECT 1 FROM public.assets a
    WHERE a.storage_bucket = 'brand-assets'
      AND a.storage_path = storage.objects.name
  )
);

-- 2) Tighten catalogs read policy: viewer role limited to public-visibility catalogs
DROP POLICY IF EXISTS "Catalogs public read public" ON public.catalogs;
CREATE POLICY "Catalogs public read public"
ON public.catalogs FOR SELECT
USING (
  (is_published AND visibility = 'public'::catalog_visibility)
  OR is_admin(auth.uid())
  OR (is_published AND visibility = 'public'::catalog_visibility AND has_role(auth.uid(), 'viewer'::app_role))
  OR (brand_id IS NOT NULL AND (
        has_brand_role(auth.uid(), brand_id, 'brand_manager'::app_role)
        OR has_brand_role(auth.uid(), brand_id, 'editor'::app_role)
      ))
);
