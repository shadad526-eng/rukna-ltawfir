
-- B2B partner applications: drop global brand_manager access
DROP POLICY IF EXISTS "B2B staff read" ON public.b2b_partner_applications;
CREATE POLICY "B2B staff read"
ON public.b2b_partner_applications
FOR SELECT
USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'viewer'::app_role));

DROP POLICY IF EXISTS "B2B admin update" ON public.b2b_partner_applications;
CREATE POLICY "B2B admin update"
ON public.b2b_partner_applications
FOR UPDATE
USING (is_admin(auth.uid()));

-- Catalog requests: brand-scoped brand_manager via catalogs.brand_id
DROP POLICY IF EXISTS "Catalog requests staff read" ON public.catalog_requests;
CREATE POLICY "Catalog requests staff read"
ON public.catalog_requests
FOR SELECT
USING (
  is_admin(auth.uid())
  OR has_role(auth.uid(), 'viewer'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.catalogs c
    WHERE c.id = catalog_requests.catalog_id
      AND has_brand_role(auth.uid(), c.brand_id, 'brand_manager'::app_role)
  )
);

DROP POLICY IF EXISTS "Catalog requests admin update" ON public.catalog_requests;
CREATE POLICY "Catalog requests admin update"
ON public.catalog_requests
FOR UPDATE
USING (
  is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.catalogs c
    WHERE c.id = catalog_requests.catalog_id
      AND has_brand_role(auth.uid(), c.brand_id, 'brand_manager'::app_role)
  )
);

-- Inquiries: brand-scoped reads/updates for brand_manager and editor
DROP POLICY IF EXISTS "Inquiries staff read" ON public.inquiries;
CREATE POLICY "Inquiries staff read"
ON public.inquiries
FOR SELECT
USING (
  is_admin(auth.uid())
  OR has_role(auth.uid(), 'viewer'::app_role)
  OR (
    brand_id IS NOT NULL AND (
      has_brand_role(auth.uid(), brand_id, 'brand_manager'::app_role)
      OR has_brand_role(auth.uid(), brand_id, 'editor'::app_role)
    )
  )
);

DROP POLICY IF EXISTS "Inquiries admin update" ON public.inquiries;
CREATE POLICY "Inquiries admin update"
ON public.inquiries
FOR UPDATE
USING (
  is_admin(auth.uid())
  OR (
    brand_id IS NOT NULL
    AND has_brand_role(auth.uid(), brand_id, 'brand_manager'::app_role)
  )
);

-- Insights: scope editor SELECT to assigned brand
DROP POLICY IF EXISTS "Insights public read published" ON public.insights;
CREATE POLICY "Insights public read published"
ON public.insights
FOR SELECT
USING (
  is_published
  OR is_admin(auth.uid())
  OR (
    brand_id IS NOT NULL
    AND has_brand_role(auth.uid(), brand_id, 'editor'::app_role)
  )
);

-- Pages: scope editor and brand_manager SELECT to assigned brand
DROP POLICY IF EXISTS "Pages public read published" ON public.pages;
CREATE POLICY "Pages public read published"
ON public.pages
FOR SELECT
USING (
  is_published
  OR is_admin(auth.uid())
  OR (
    brand_id IS NOT NULL AND (
      has_brand_role(auth.uid(), brand_id, 'editor'::app_role)
      OR has_brand_role(auth.uid(), brand_id, 'brand_manager'::app_role)
    )
  )
);
