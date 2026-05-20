-- =============================================================================
-- Kohinoor Decorations — Supabase Storage (Option A — run in SQL Editor)
-- Dashboard → SQL Editor → New query → paste all → Run
--
-- Prerequisite: create at least one user under Authentication → Users
-- =============================================================================

-- Sidebar sections + Wedding
-- (Dashboard "/" is not a storage folder)
--   haldi, mehendi, reception, stage, entrance, table-decor, wedding

-- Upload path used by the app:
--   decorations / {section} / {user_id} / {filename}

-- =============================================================================
-- 1) Bucket
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'decorations',
  'decorations',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================================================
-- 2) Allowed section folder names (used in policies)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.decorations_allowed_sections()
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT ARRAY[
    'haldi',
    'mehendi',
    'reception',
    'stage',
    'entrance',
    'table-decor',
    'wedding'
  ]::text[];
$$;

-- =============================================================================
-- 3) Create section folders in Storage UI (placeholder objects)
--    Supabase has no real folders — these make each section visible in the UI.
-- =============================================================================
DO $$
DECLARE
  section text;
  placeholder_name text;
  owner_id uuid;
  sections text[] := public.decorations_allowed_sections();
BEGIN
  SELECT id INTO owner_id
  FROM auth.users
  ORDER BY created_at ASC
  LIMIT 1;

  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'No auth users found. Create one user under Authentication → Users, then run this script again.';
  END IF;

  FOREACH section IN ARRAY sections
  LOOP
    placeholder_name := section || '/.emptyFolderPlaceholder';

    IF NOT EXISTS (
      SELECT 1
      FROM storage.objects
      WHERE bucket_id = 'decorations'
        AND name = placeholder_name
    ) THEN
      INSERT INTO storage.objects (bucket_id, name, owner, metadata)
      VALUES (
        'decorations',
        placeholder_name,
        owner_id,
        jsonb_build_object('purpose', 'section-folder', 'section', section)
      );
    END IF;
  END LOOP;
END $$;

-- =============================================================================
-- 4) RLS policies (re-run safe: drop then create)
-- =============================================================================
DROP POLICY IF EXISTS "decorations_select_own" ON storage.objects;
DROP POLICY IF EXISTS "decorations_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "decorations_delete_own" ON storage.objects;
DROP POLICY IF EXISTS "decorations_update_own" ON storage.objects;

-- List + download own files under decorations/{section}/{user_id}/...
CREATE POLICY "decorations_select_own"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'decorations'
  AND (storage.foldername(name))[1] = ANY (public.decorations_allowed_sections())
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Upload images into own folder
CREATE POLICY "decorations_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'decorations'
  AND (storage.foldername(name))[1] = ANY (public.decorations_allowed_sections())
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Delete own files (not section placeholders at root)
CREATE POLICY "decorations_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'decorations'
  AND (storage.foldername(name))[1] = ANY (public.decorations_allowed_sections())
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Update own files
CREATE POLICY "decorations_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'decorations'
  AND (storage.foldername(name))[1] = ANY (public.decorations_allowed_sections())
  AND (storage.foldername(name))[2] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'decorations'
  AND (storage.foldername(name))[1] = ANY (public.decorations_allowed_sections())
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- =============================================================================
-- 5) Verify (optional — check results in query output)
-- =============================================================================
SELECT name, created_at
FROM storage.objects
WHERE bucket_id = 'decorations'
  AND name LIKE '%.emptyFolderPlaceholder'
ORDER BY name;
