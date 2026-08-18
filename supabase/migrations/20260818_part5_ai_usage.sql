-- ==============================================================================
-- Giftly - Part 5 Migration: AI Usage Tracking & Rate Limiting
-- ==============================================================================

-- 1. Create ai_usage table
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type  text NOT NULL, -- 'generate_message' | 'improve_message' | 'generate_gift_content'
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 2. Index for quick daily rate limit lookup
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON public.ai_usage(user_id, created_at);

-- 3. Enable Row Level Security
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Users can view their own AI usage
DROP POLICY IF EXISTS "Users can view their own AI usage" ON public.ai_usage;
CREATE POLICY "Users can view their own AI usage"
  ON public.ai_usage FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own AI usage" ON public.ai_usage;
CREATE POLICY "Users can insert their own AI usage"
  ON public.ai_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Reload schema cache
NOTIFY pgrst, 'reload schema';
