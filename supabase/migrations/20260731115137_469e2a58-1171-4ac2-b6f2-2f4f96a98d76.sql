-- 1. site_settings: restrict public reads to an allow-list of public_* keys
DROP POLICY IF EXISTS "Public read site settings" ON public.site_settings;

CREATE POLICY "Public read public site settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (key LIKE 'public\_%');

CREATE POLICY "Super admin read site settings"
ON public.site_settings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- 2. homepage_settings: hide draft/snapshot columns from non-admins
DROP POLICY IF EXISTS "homepage_settings public read" ON public.homepage_settings;

CREATE POLICY "homepage_settings anon read published"
ON public.homepage_settings
FOR SELECT
TO anon
USING (true);

CREATE POLICY "homepage_settings super admin read"
ON public.homepage_settings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

REVOKE SELECT ON public.homepage_settings FROM anon;
GRANT SELECT (
  id,
  main_slider_enabled,
  main_slider_position,
  main_slider_config,
  hero_enabled,
  hero_type,
  hero_image_config,
  hero_slider_config,
  hero_custom_config,
  created_at,
  updated_at,
  last_published_at
) ON public.homepage_settings TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.homepage_settings TO authenticated;
GRANT ALL ON public.homepage_settings TO service_role;

-- 3. Do not let signed-out visitors execute SECURITY DEFINER role helpers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_brand_role(uuid, uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.user_manages_brand_path(uuid, text) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_brand_role(uuid, uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_manages_brand_path(uuid, text) TO authenticated, service_role;