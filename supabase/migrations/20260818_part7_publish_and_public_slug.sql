-- ==============================================================================
-- Giftly - Part 7 Migration: Public Slugs & Publishing Support
-- ==============================================================================

-- 1. Add public_slug column to gifts table
ALTER TABLE public.gifts 
ADD COLUMN IF NOT EXISTS public_slug text UNIQUE;

-- 2. Create index for fast public slug lookup
CREATE INDEX IF NOT EXISTS idx_gifts_public_slug ON public.gifts(public_slug);

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
