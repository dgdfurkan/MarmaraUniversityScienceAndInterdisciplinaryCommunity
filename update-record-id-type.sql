-- Supabase'de activity_logs tablosunu güncelle
ALTER TABLE activity_logs ALTER COLUMN record_id TYPE TEXT;
ALTER TABLE version_history ALTER COLUMN record_id TYPE TEXT;
ALTER TABLE drafts ALTER COLUMN record_id TYPE TEXT;
