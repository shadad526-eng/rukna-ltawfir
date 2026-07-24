
ALTER TABLE public.homepage_settings
  ADD COLUMN IF NOT EXISTS draft_settings jsonb,
  ADD COLUMN IF NOT EXISTS published_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS last_published_at timestamptz;
