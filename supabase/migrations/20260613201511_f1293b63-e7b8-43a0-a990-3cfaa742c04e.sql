
-- 1) Tighten inquiries staff read: remove blanket 'viewer' cross-brand access
DROP POLICY IF EXISTS "Inquiries staff read" ON public.inquiries;
CREATE POLICY "Inquiries staff read" ON public.inquiries
FOR SELECT
USING (
  public.is_admin(auth.uid())
  OR (
    brand_id IS NOT NULL AND (
      public.has_brand_role(auth.uid(), brand_id, 'brand_manager'::app_role)
      OR public.has_brand_role(auth.uid(), brand_id, 'editor'::app_role)
    )
  )
);

-- 2) Lock down SECURITY DEFINER functions

-- Trigger-only functions: revoke from everyone exposed via the API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.bootstrap_super_admin() FROM PUBLIC, anon, authenticated;

-- Role-check helpers: used inside RLS policies. Revoke from PUBLIC and anon,
-- grant EXECUTE only to authenticated (and service_role for server work).
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_brand_role(uuid, uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_brand_role(uuid, uuid, app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.user_manages_brand_path(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_manages_brand_path(uuid, text) TO authenticated, service_role;
