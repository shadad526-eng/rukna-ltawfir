INSERT INTO public.pages (slug, identity_scope, title_ar, title_en, is_published, published_at, extra)
SELECT 'branches', 'corporate', 'فروعنا وعناويننا', 'Our Branches', true, now(), '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pages WHERE slug = 'branches');