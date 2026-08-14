-- 1) Published slides snapshot on homepage_settings
ALTER TABLE public.homepage_settings ADD COLUMN IF NOT EXISTS published_slides jsonb;

UPDATE public.homepage_settings hs
SET published_slides = jsonb_build_object(
  'main', COALESCE((SELECT jsonb_agg(to_jsonb(s) ORDER BY s.sort_order)
                    FROM public.homepage_slides s
                    WHERE s.slider_group = 'main' AND s.is_published AND s.is_visible), '[]'::jsonb),
  'hero', COALESCE((SELECT jsonb_agg(to_jsonb(s) ORDER BY s.sort_order)
                    FROM public.homepage_slides s
                    WHERE s.slider_group = 'hero' AND s.is_published AND s.is_visible), '[]'::jsonb)
)
WHERE hs.published_slides IS NULL;

-- 2) Retire obsolete bootstrap super-admin trigger logic (keep triggers/function objects
--    intact so auth schema is untouched; the body is now a safe no-op).
CREATE OR REPLACE FUNCTION public.bootstrap_super_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Retired: privileged roles are now granted only through explicit,
  -- audited administrative role management (public.admin_set_user_roles).
  RETURN NEW;
END;
$function$;

-- 3) Atomic, guarded role management
CREATE OR REPLACE FUNCTION public.admin_set_user_roles(_user_id uuid, _roles app_role[])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_caller uuid := auth.uid();
  v_before jsonb;
  v_after jsonb;
  v_remaining int;
BEGIN
  IF v_caller IS NULL OR NOT public.has_role(v_caller, 'super_admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT COALESCE(jsonb_agg(role ORDER BY role), '[]'::jsonb) INTO v_before
  FROM public.user_roles WHERE user_id = _user_id;

  -- Would this remove the last remaining super admin?
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin')
     AND NOT ('super_admin' = ANY(COALESCE(_roles, '{}'::app_role[]))) THEN
    SELECT count(DISTINCT user_id) INTO v_remaining
    FROM public.user_roles WHERE role = 'super_admin' AND user_id <> _user_id;
    IF v_remaining = 0 THEN
      RAISE EXCEPTION 'لا يمكن إزالة آخر مدير عام (Super Admin) في النظام';
    END IF;
  END IF;

  DELETE FROM public.user_roles WHERE user_id = _user_id;
  IF _roles IS NOT NULL AND array_length(_roles, 1) > 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT _user_id, r FROM unnest(_roles) AS r
    ON CONFLICT DO NOTHING;
  END IF;

  SELECT COALESCE(jsonb_agg(role ORDER BY role), '[]'::jsonb) INTO v_after
  FROM public.user_roles WHERE user_id = _user_id;

  INSERT INTO public.audit_log (actor_user_id, action, entity_type, entity_id, before, after)
  VALUES (v_caller, 'roles.update', 'user_roles', _user_id, v_before, v_after);

  RETURN jsonb_build_object('ok', true, 'before', v_before, 'after', v_after);
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_set_user_roles(uuid, app_role[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_user_roles(uuid, app_role[]) TO authenticated;

-- 4) Guard: a user row deletion must not wipe the last super admin
CREATE OR REPLACE FUNCTION public.prevent_last_super_admin_removal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.role = 'super_admin' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE role = 'super_admin' AND user_id <> OLD.user_id
    ) AND EXISTS (SELECT 1 FROM auth.users WHERE id = OLD.user_id) THEN
      RAISE EXCEPTION 'لا يمكن إزالة آخر مدير عام (Super Admin) في النظام';
    END IF;
  END IF;
  RETURN OLD;
END;
$function$;

DROP TRIGGER IF EXISTS trg_prevent_last_super_admin ON public.user_roles;
CREATE CONSTRAINT TRIGGER trg_prevent_last_super_admin
AFTER DELETE ON public.user_roles
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION public.prevent_last_super_admin_removal();