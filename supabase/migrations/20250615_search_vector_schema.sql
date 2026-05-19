-- ============================================
-- Fyliolabs DB Schema Migration
-- 1. search_vector column + trigger for files
-- 2. Performance indexes
-- ============================================

-- ---------------
-- 1. search_vector
-- ---------------
-- Add tsvector column to files table (ignored if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE public.files ADD COLUMN search_vector tsvector;
  END IF;
END $$;

-- Add GIN index on search_vector (ignored if already exists)
CREATE INDEX IF NOT EXISTS files_search_vector_idx
  ON public.files USING GIN (search_vector);

-- ---------------
-- 2. Trigger function
-- ---------------
CREATE OR REPLACE FUNCTION tsvector_files_trigger() RETURNS trigger AS $$
BEGIN
  -- Build tsvector from name (weight A), description (weight B), tags (unweighted)
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'B');
  -- Tags use simple unweighted match
  IF NEW.tags IS NOT NULL AND array_length(NEW.tags, 1) > 0 THEN
    NEW.search_vector :=
      NEW.search_vector ||
      to_tsvector('simple', array_to_string(NEW.tags, ' '));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger on INSERT (ignored if already exists)
DROP TRIGGER IF EXISTS tsvector_files_update ON public.files;
CREATE TRIGGER tsvector_files_update
  BEFORE INSERT OR UPDATE OF name, description, tags ON public.files
  FOR EACH ROW
  EXECUTE FUNCTION tsvector_files_trigger();

-- Back-fill search_vector for any pre-existing rows
UPDATE public.files SET search_vector =
  setweight(to_tsvector('simple', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE(description, '')), 'B') ||
  CASE WHEN tags IS NOT NULL AND array_length(tags, 1) > 0
       THEN to_tsvector('simple', array_to_string(tags, ' ')) ELSE '' END
WHERE search_vector IS NULL;

-- ---------------
-- 3. Performance indexes
-- ---------------
CREATE INDEX IF NOT EXISTS files_user_id_idx       ON public.files  (user_id);
CREATE INDEX IF NOT EXISTS files_folder_id_idx     ON public.files  (folder_id);
CREATE INDEX IF NOT EXISTS files_created_at_idx    ON public.files  (created_at DESC);
CREATE INDEX IF NOT EXISTS files_updated_at_idx    ON public.files  (updated_at DESC);
CREATE INDEX IF NOT EXISTS files_converted_from_idx ON public.files (converted_from);
CREATE INDEX IF NOT EXISTS folders_user_id_idx     ON public.folders (user_id);
CREATE INDEX IF NOT EXISTS folders_parent_id_idx   ON public.folders (parent_id);
