GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon;
GRANT EXECUTE ON FUNCTION public.has_brand_role(uuid, uuid, public.app_role) TO anon;
GRANT SELECT ON public.corporate_identity TO anon;