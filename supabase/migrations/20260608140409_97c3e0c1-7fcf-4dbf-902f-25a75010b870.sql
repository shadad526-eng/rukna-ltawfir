
CREATE OR REPLACE FUNCTION public.has_brand_role(_user_id uuid, _brand_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND brand_id = _brand_id
  );
$function$;

DROP POLICY IF EXISTS "Audit staff insert" ON public.audit_log;
CREATE POLICY "Audit admin insert"
  ON public.audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin(auth.uid())
    AND actor_user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Catalog files public read" ON storage.objects;
CREATE POLICY "Catalog files public read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (
    bucket_id = 'catalogs'
    AND EXISTS (
      SELECT 1
      FROM public.catalogs c
      JOIN public.assets a ON a.id = c.pdf_asset_id
      WHERE a.storage_bucket = 'catalogs'
        AND a.storage_path = storage.objects.name
        AND c.is_published
        AND c.visibility = 'public'::catalog_visibility
    )
  );

DROP POLICY IF EXISTS "Catalog files authenticated read" ON storage.objects;
CREATE POLICY "Catalog files authenticated read"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'catalogs'
    AND EXISTS (
      SELECT 1
      FROM public.catalogs c
      JOIN public.assets a ON a.id = c.pdf_asset_id
      WHERE a.storage_bucket = 'catalogs'
        AND a.storage_path = storage.objects.name
        AND (
          (c.is_published AND c.visibility IN ('public'::catalog_visibility, 'restricted'::catalog_visibility))
          OR c.visibility = 'b2b_only'::catalog_visibility
        )
    )
  );

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_brand_role(uuid, uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bootstrap_super_admin() FROM PUBLIC, anon, authenticated;
