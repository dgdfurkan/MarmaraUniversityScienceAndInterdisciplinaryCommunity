-- RLS Policy'leri güncelle - INSERT izni ekle
-- Activity logs için INSERT policy
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activity_logs' 
        AND policyname = 'Allow anonymous insert access'
    ) THEN
        CREATE POLICY "Allow anonymous insert access" ON activity_logs
        FOR INSERT TO anon
        WITH CHECK (true);
    END IF;
END $$;

-- Version history için INSERT policy
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'version_history' 
        AND policyname = 'Allow anonymous insert access'
    ) THEN
        CREATE POLICY "Allow anonymous insert access" ON version_history
        FOR INSERT TO anon
        WITH CHECK (true);
    END IF;
END $$;

-- Drafts için INSERT policy
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'drafts' 
        AND policyname = 'Allow anonymous insert access'
    ) THEN
        CREATE POLICY "Allow anonymous insert access" ON drafts
        FOR INSERT TO anon
        WITH CHECK (true);
    END IF;
END $$;
