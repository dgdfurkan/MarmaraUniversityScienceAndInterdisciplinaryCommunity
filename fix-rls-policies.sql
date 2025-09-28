-- RLS politikalarını düzelt
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları sil
DROP POLICY IF EXISTS "Anyone can read user interactions" ON user_interactions;
DROP POLICY IF EXISTS "Anyone can insert/update their own interactions" ON user_interactions;

-- Yeni politikalar oluştur
CREATE POLICY "Enable read access for all users" ON user_interactions
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON user_interactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON user_interactions
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON user_interactions
    FOR DELETE USING (true);