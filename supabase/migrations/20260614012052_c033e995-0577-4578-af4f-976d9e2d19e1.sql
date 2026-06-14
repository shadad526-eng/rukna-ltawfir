
DROP POLICY IF EXISTS "B2B staff read" ON public.b2b_partner_applications;
CREATE POLICY "B2B staff read"
ON public.b2b_partner_applications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Catalog requests staff read" ON public.catalog_requests;
CREATE POLICY "Catalog requests staff read"
ON public.catalog_requests
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.catalogs c
    WHERE c.id = catalog_requests.catalog_id
      AND c.brand_id IS NOT NULL
      AND public.has_brand_role(auth.uid(), c.brand_id, 'brand_manager'::app_role)
  )
);

DROP POLICY IF EXISTS "Inquiries staff read" ON public.inquiries;
CREATE POLICY "Inquiries staff read"
ON public.inquiries
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR (brand_id IS NOT NULL AND public.has_brand_role(auth.uid(), brand_id, 'brand_manager'::app_role))
);
