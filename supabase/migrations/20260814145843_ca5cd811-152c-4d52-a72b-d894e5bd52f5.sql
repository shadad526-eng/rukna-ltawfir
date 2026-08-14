CREATE OR REPLACE FUNCTION public.prevent_last_super_admin_removal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.role = 'super_admin' THEN
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin') THEN
      RAISE EXCEPTION 'لا يمكن إزالة آخر مدير عام (Super Admin) في النظام';
    END IF;
  END IF;
  RETURN OLD;
END;
$function$;

REVOKE ALL ON FUNCTION public.prevent_last_super_admin_removal() FROM PUBLIC, anon, authenticated;