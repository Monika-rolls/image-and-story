ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS tagline text,
ADD COLUMN IF NOT EXISTS details jsonb NOT NULL DEFAULT '{}'::jsonb;