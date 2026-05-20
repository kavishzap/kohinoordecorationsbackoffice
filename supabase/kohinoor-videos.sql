-- =============================================================================
-- Kohinoor Decorations — Video links table (no Storage; URLs only)
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

-- Table: up to 10 video URLs for the back office Video section
CREATE TABLE IF NOT EXISTS public.kohinoor_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  CONSTRAINT kohinoor_videos_url_not_empty CHECK (char_length(trim(video_url)) > 0),
  CONSTRAINT kohinoor_videos_url_length CHECK (char_length(video_url) <= 2048)
);

CREATE INDEX IF NOT EXISTS kohinoor_videos_sort_order_idx
  ON public.kohinoor_videos (sort_order ASC, created_at ASC);

COMMENT ON TABLE public.kohinoor_videos IS
  'Video links for Kohinoor back office (max 10). YouTube, Vimeo, Drive, etc.';

-- Keep updated_at in sync
CREATE OR REPLACE FUNCTION public.set_kohinoor_videos_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kohinoor_videos_updated_at ON public.kohinoor_videos;

CREATE TRIGGER kohinoor_videos_updated_at
  BEFORE UPDATE ON public.kohinoor_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_kohinoor_videos_updated_at();

-- Enforce max 10 rows
CREATE OR REPLACE FUNCTION public.enforce_kohinoor_videos_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (SELECT count(*)::integer FROM public.kohinoor_videos) >= 10 THEN
    RAISE EXCEPTION 'Maximum of 10 video links allowed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kohinoor_videos_limit ON public.kohinoor_videos;

CREATE TRIGGER kohinoor_videos_limit
  BEFORE INSERT ON public.kohinoor_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_kohinoor_videos_limit();

-- =============================================================================
-- Row Level Security (authenticated back-office users)
-- =============================================================================
ALTER TABLE public.kohinoor_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kohinoor_videos_select" ON public.kohinoor_videos;
DROP POLICY IF EXISTS "kohinoor_videos_insert" ON public.kohinoor_videos;
DROP POLICY IF EXISTS "kohinoor_videos_update" ON public.kohinoor_videos;
DROP POLICY IF EXISTS "kohinoor_videos_delete" ON public.kohinoor_videos;

CREATE POLICY "kohinoor_videos_select"
  ON public.kohinoor_videos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "kohinoor_videos_insert"
  ON public.kohinoor_videos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "kohinoor_videos_update"
  ON public.kohinoor_videos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "kohinoor_videos_delete"
  ON public.kohinoor_videos
  FOR DELETE
  TO authenticated
  USING (true);

-- Optional: verify
-- SELECT * FROM public.kohinoor_videos ORDER BY sort_order, created_at;
