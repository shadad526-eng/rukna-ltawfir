DO $$
DECLARE
  pid uuid;
  n int;
BEGIN
  pid := public.save_product(jsonb_build_object(
    'slug','zz-integrity-test','name_ar','اختبار','name_en','Integrity Test',
    'is_published', false,
    'key_benefits_ar', jsonb_build_array('أ','ب'),
    'variants', jsonb_build_array(jsonb_build_object('slug','v1','name_ar','ع1','name_en','V1','is_published',true)),
    'ingredients', jsonb_build_array(jsonb_build_object('name_ar','مكوّن','name_en','Ing','percentage','10')),
    'nutrition', jsonb_build_array(jsonb_build_object('label_ar','طاقة','label_en','Energy','value','100','unit','kcal')),
    'faqs', jsonb_build_array(jsonb_build_object('question_ar','س','answer_ar','ج'))
  ));

  SELECT count(*) INTO n FROM public.product_variants WHERE product_id = pid;
  IF n <> 1 THEN RAISE EXCEPTION 'variant sync failed: %', n; END IF;
  SELECT count(*) INTO n FROM public.product_ingredients WHERE product_id = pid;
  IF n <> 1 THEN RAISE EXCEPTION 'ingredient sync failed'; END IF;
  SELECT count(*) INTO n FROM public.product_nutrition WHERE product_id = pid;
  IF n <> 1 THEN RAISE EXCEPTION 'nutrition sync failed'; END IF;
  SELECT count(*) INTO n FROM public.product_faqs WHERE product_id = pid;
  IF n <> 1 THEN RAISE EXCEPTION 'faq sync failed'; END IF;

  -- update: replace children, keep product id
  PERFORM public.save_product(jsonb_build_object(
    'id', pid::text, 'slug','zz-integrity-test','name_ar','اختبار 2','name_en','Integrity Test 2',
    'is_published', false,
    'variants', '[]'::jsonb, 'ingredients', '[]'::jsonb,
    'nutrition', jsonb_build_array(jsonb_build_object('label_ar','بروتين','label_en','Protein','value','5','unit','g')),
    'faqs', '[]'::jsonb
  ));
  SELECT count(*) INTO n FROM public.product_variants WHERE product_id = pid;
  IF n <> 0 THEN RAISE EXCEPTION 'variant cleanup failed'; END IF;
  SELECT count(*) INTO n FROM public.product_nutrition WHERE product_id = pid;
  IF n <> 1 THEN RAISE EXCEPTION 'nutrition update failed'; END IF;
  IF (SELECT name_ar FROM public.products WHERE id = pid) <> 'اختبار 2' THEN
    RAISE EXCEPTION 'product update failed';
  END IF;

  -- atomicity: a bad child must abort the whole save, leaving prior state intact
  BEGIN
    PERFORM public.save_product(jsonb_build_object(
      'id', pid::text, 'slug','zz-integrity-test','name_ar','يجب ألا يُحفظ','name_en','Should Not Persist',
      'assets', jsonb_build_array(jsonb_build_object('asset_id','00000000-0000-0000-0000-000000000000'))
    ));
    RAISE EXCEPTION 'expected failure did not happen';
  EXCEPTION WHEN foreign_key_violation THEN
    NULL;
  END;
  IF (SELECT name_ar FROM public.products WHERE id = pid) <> 'اختبار 2' THEN
    RAISE EXCEPTION 'ROLLBACK FAILED: partial save persisted';
  END IF;

  DELETE FROM public.product_nutrition WHERE product_id = pid;
  DELETE FROM public.products WHERE id = pid;
  RAISE NOTICE 'save_product integrity test passed';
END $$;