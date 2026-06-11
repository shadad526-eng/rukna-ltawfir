
-- Fix 1: Restrict storage UPDATE on brand-assets to admins only.
-- Previously any global 'brand_manager' could overwrite any brand's files.
DROP POLICY IF EXISTS "Brand assets staff update" ON storage.objects;
CREATE POLICY "Brand assets admin update"
ON storage.objects
FOR UPDATE
TO authenticated
USING ((bucket_id = 'brand-assets'::text) AND is_admin(auth.uid()))
WITH CHECK ((bucket_id = 'brand-assets'::text) AND is_admin(auth.uid()));

-- Fix 2: Scope catalogs bucket write policies to the brand owning the file.
DROP POLICY IF EXISTS "Catalogs admin manage" ON storage.objects;

CREATE POLICY "Catalogs admin insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'catalogs'::text
  AND is_admin(auth.uid())
);

CREATE POLICY "Catalogs brand-scoped update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'catalogs'::text
  AND (
    is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM catalogs c
      JOIN assets a ON a.id = c.pdf_asset_id
      WHERE a.storage_bucket = 'catalogs'
        AND a.storage_path = storage.objects.name
        AND c.brand_id IS NOT NULL
        AND has_brand_role(auth.uid(), c.brand_id, 'brand_manager'::app_role)
    )
  )
)
WITH CHECK (
  bucket_id = 'catalogs'::text
  AND (
    is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM catalogs c
      JOIN assets a ON a.id = c.pdf_asset_id
      WHERE a.storage_bucket = 'catalogs'
        AND a.storage_path = storage.objects.name
        AND c.brand_id IS NOT NULL
        AND has_brand_role(auth.uid(), c.brand_id, 'brand_manager'::app_role)
    )
  )
);

CREATE POLICY "Catalogs brand-scoped delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'catalogs'::text
  AND (
    is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM catalogs c
      JOIN assets a ON a.id = c.pdf_asset_id
      WHERE a.storage_bucket = 'catalogs'
        AND a.storage_path = storage.objects.name
        AND c.brand_id IS NOT NULL
        AND has_brand_role(auth.uid(), c.brand_id, 'brand_manager'::app_role)
    )
  )
);

-- Fix 3: Tighten catalogs SELECT policy. Restricted and b2b_only catalogs
-- should not be readable by every authenticated user — require staff role.
DROP POLICY IF EXISTS "Catalogs public read public" ON public.catalogs;
CREATE POLICY "Catalogs public read public"
ON public.catalogs
FOR SELECT
USING (
  (is_published AND visibility = 'public'::catalog_visibility)
  OR is_admin(auth.uid())
  OR has_role(auth.uid(), 'viewer'::app_role)
  OR (brand_id IS NOT NULL AND (
    has_brand_role(auth.uid(), brand_id, 'brand_manager'::app_role)
    OR has_brand_role(auth.uid(), brand_id, 'editor'::app_role)
  ))
);

-- Align the storage policy so 'restricted' and 'b2b_only' PDFs are not
-- downloadable by any authenticated user either.
DROP POLICY IF EXISTS "Catalog files authenticated read" ON storage.objects;
CREATE POLICY "Catalog files staff read"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'catalogs'::text
  AND EXISTS (
    SELECT 1
    FROM catalogs c
    JOIN assets a ON a.id = c.pdf_asset_id
    WHERE a.storage_bucket = 'catalogs'
      AND a.storage_path = storage.objects.name
      AND c.is_published
      AND c.visibility IN ('restricted'::catalog_visibility, 'b2b_only'::catalog_visibility)
      AND (
        is_admin(auth.uid())
        OR has_role(auth.uid(), 'viewer'::app_role)
        OR (c.brand_id IS NOT NULL AND (
          has_brand_role(auth.uid(), c.brand_id, 'brand_manager'::app_role)
          OR has_brand_role(auth.uid(), c.brand_id, 'editor'::app_role)
        ))
      )
  )
);
