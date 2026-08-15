DO $$
DECLARE a1 uuid; a2 uuid; b uuid; blocked boolean := false;
BEGIN
  INSERT INTO public.assets(storage_bucket,storage_path,channel,face_present,is_official)
  VALUES ('brand-assets','__selftest/ref.png','marketing_generated',false,false) RETURNING id INTO a1;
  INSERT INTO public.assets(storage_bucket,storage_path,channel,face_present,is_official)
  VALUES ('brand-assets','__selftest/free.png','marketing_generated',false,false) RETURNING id INTO a2;
  INSERT INTO public.brands(slug,name_ar,name_en,logo_asset_id)
  VALUES ('__selftest-brand','اختبار','test',a1) RETURNING id INTO b;

  BEGIN
    DELETE FROM public.assets WHERE id = a1;
  EXCEPTION WHEN others THEN
    blocked := true;
    RAISE NOTICE 'referenced delete blocked as expected: %', SQLERRM;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'SELFTEST FAILED: referenced asset was deletable'; END IF;

  DELETE FROM public.assets WHERE id = a2;
  IF EXISTS (SELECT 1 FROM public.assets WHERE id = a2) THEN
    RAISE EXCEPTION 'SELFTEST FAILED: unreferenced asset not deletable';
  END IF;

  DELETE FROM public.brands WHERE id = b;
  DELETE FROM public.assets WHERE id = a1;
  IF EXISTS (SELECT 1 FROM public.assets WHERE id = a1) THEN
    RAISE EXCEPTION 'SELFTEST FAILED: asset not deletable after unlink';
  END IF;

  RAISE NOTICE 'SELFTEST PASSED';
END $$;

-- Last-super-admin protection: re-saving the same roles must succeed,
-- removing the role must fail. Runs only if exactly one super admin exists.
DO $$
DECLARE su uuid; cnt int;
BEGIN
  SELECT count(DISTINCT user_id) INTO cnt FROM public.user_roles WHERE role='super_admin';
  IF cnt <> 1 THEN RAISE NOTICE 'skipped role test (super admins: %)', cnt; RETURN; END IF;
  SELECT user_id INTO su FROM public.user_roles WHERE role='super_admin' LIMIT 1;

  BEGIN
    DELETE FROM public.user_roles WHERE user_id = su;
    INSERT INTO public.user_roles(user_id, role) VALUES (su,'super_admin');
    SET CONSTRAINTS ALL IMMEDIATE;
  EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'SELFTEST FAILED: re-saving super admin roles broke: %', SQLERRM;
  END;

  BEGIN
    DELETE FROM public.user_roles WHERE user_id = su AND role='super_admin';
    SET CONSTRAINTS ALL IMMEDIATE;
    RAISE EXCEPTION 'SELFTEST FAILED: last super admin was removable';
  EXCEPTION WHEN others THEN
    IF SQLERRM LIKE 'SELFTEST FAILED%' THEN RAISE; END IF;
    RAISE NOTICE 'last super admin removal blocked as expected: %', SQLERRM;
  END;
  -- restore state (the failed sub-transaction rolled the delete back)
  RAISE NOTICE 'ROLE SELFTEST PASSED';
END $$;