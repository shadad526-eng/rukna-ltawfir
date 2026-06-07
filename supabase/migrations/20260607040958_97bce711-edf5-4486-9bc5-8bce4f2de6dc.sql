
CREATE TABLE public.catalog_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id uuid NOT NULL,
  full_name text NOT NULL,
  company text,
  email text NOT NULL,
  phone text,
  country text,
  purpose text,
  status public.inquiry_status NOT NULL DEFAULT 'new',
  handled_by uuid,
  staff_notes text,
  ip_hash text,
  user_agent text,
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_requests TO authenticated;
GRANT INSERT ON public.catalog_requests TO anon;
GRANT ALL ON public.catalog_requests TO service_role;

ALTER TABLE public.catalog_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Catalog requests public insert"
  ON public.catalog_requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Catalog requests staff read"
  ON public.catalog_requests FOR SELECT TO authenticated
  USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'brand_manager'::app_role) OR has_role(auth.uid(), 'viewer'::app_role));

CREATE POLICY "Catalog requests admin update"
  ON public.catalog_requests FOR UPDATE TO authenticated
  USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'brand_manager'::app_role));

CREATE POLICY "Catalog requests admin delete"
  ON public.catalog_requests FOR DELETE TO authenticated
  USING (is_admin(auth.uid()));

CREATE TRIGGER update_catalog_requests_updated_at
  BEFORE UPDATE ON public.catalog_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_catalog_requests_catalog ON public.catalog_requests(catalog_id);
CREATE INDEX idx_catalog_requests_status ON public.catalog_requests(status);
