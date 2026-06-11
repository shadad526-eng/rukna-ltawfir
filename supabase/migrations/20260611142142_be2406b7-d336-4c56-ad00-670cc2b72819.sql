
-- Helper: does this user manage the brand whose slug is the first path segment?
CREATE OR REPLACE FUNCTION public.user_manages_brand_path(_user_id uuid, _path text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.brands b
    JOIN public.user_roles ur ON ur.brand_id = b.id
    WHERE ur.user_id = _user_id
      AND ur.role = 'brand_manager'
      AND _path IS NOT NULL
      AND split_part(_path, '/', 1) = b.slug
  );
$$;

-- Storage: brand-assets INSERT must be admin OR brand-scoped by path
DROP POLICY IF EXISTS "Brand assets staff write" ON storage.objects;
CREATE POLICY "Brand assets staff write"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'brand-assets'
  AND (
    is_admin(auth.uid())
    OR public.user_manages_brand_path(auth.uid(), name)
  )
);

-- Assets: INSERT must be admin OR brand-scoped by storage_path (for brand-assets bucket)
DROP POLICY IF EXISTS "Assets staff insert" ON public.assets;
CREATE POLICY "Assets staff insert"
ON public.assets
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid())
  OR (
    storage_bucket = 'brand-assets'
    AND public.user_manages_brand_path(auth.uid(), storage_path)
  )
);

-- Assets: UPDATE must be admin OR brand-scoped by storage_path; not allowed on official assets for non-admins
DROP POLICY IF EXISTS "Assets admin update" ON public.assets;
CREATE POLICY "Assets admin update"
ON public.assets
FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid())
  OR (
    NOT is_official
    AND storage_bucket = 'brand-assets'
    AND public.user_manages_brand_path(auth.uid(), storage_path)
  )
)
WITH CHECK (
  is_admin(auth.uid())
  OR (
    NOT is_official
    AND storage_bucket = 'brand-assets'
    AND public.user_manages_brand_path(auth.uid(), storage_path)
  )
);
