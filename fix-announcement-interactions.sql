-- announcement_interactions tablosunu oluştur
-- Bu script tüm sorunları çözer

-- Önce eski tabloyu sil (eğer varsa)
DROP TABLE IF EXISTS user_interactions CASCADE;
DROP TABLE IF EXISTS announcement_interactions CASCADE;

-- Yeni tabloyu oluştur
CREATE TABLE announcement_interactions (
    id SERIAL PRIMARY KEY,
    user_ip VARCHAR(45) NOT NULL,
    announcement_id INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NULL,
    has_viewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_ip, announcement_id)
);

-- İndeksleri oluştur
CREATE INDEX idx_announcement_interactions_ip ON announcement_interactions(user_ip);
CREATE INDEX idx_announcement_interactions_announcement ON announcement_interactions(announcement_id);
CREATE INDEX idx_announcement_interactions_reaction ON announcement_interactions(reaction_type);

-- RLS'yi etkinleştir
ALTER TABLE announcement_interactions ENABLE ROW LEVEL SECURITY;

-- Tüm politikaları sil (eğer varsa)
DROP POLICY IF EXISTS "Anyone can read user interactions" ON announcement_interactions;
DROP POLICY IF EXISTS "Anyone can insert/update their own interactions" ON announcement_interactions;
DROP POLICY IF EXISTS "Enable read access for all users" ON announcement_interactions;
DROP POLICY IF EXISTS "Enable insert for all users" ON announcement_interactions;
DROP POLICY IF EXISTS "Enable update for all users" ON announcement_interactions;
DROP POLICY IF EXISTS "Enable delete for all users" ON announcement_interactions;

-- Yeni politikalar oluştur
CREATE POLICY "Enable read access for all users" ON announcement_interactions
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON announcement_interactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON announcement_interactions
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON announcement_interactions
    FOR DELETE USING (true);

-- Trigger fonksiyonu oluştur
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ı oluştur
DROP TRIGGER IF EXISTS update_announcement_interactions_updated_at ON announcement_interactions;
CREATE TRIGGER update_announcement_interactions_updated_at 
    BEFORE UPDATE ON announcement_interactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RPC fonksiyonu oluştur
CREATE OR REPLACE FUNCTION update_announcement_reaction(
    p_announcement_id INTEGER,
    p_user_ip VARCHAR(45),
    p_reaction_type VARCHAR(20),
    p_increment BOOLEAN
)
RETURNS VOID AS $$
DECLARE
    existing_interaction RECORD;
    old_field_name TEXT;
    new_field_name TEXT;
    old_value INTEGER;
    new_value INTEGER;
BEGIN
    -- Mevcut etkileşimi kontrol et
    SELECT * INTO existing_interaction 
    FROM announcement_interactions 
    WHERE user_ip = p_user_ip AND announcement_id = p_announcement_id;
    
    IF p_increment THEN
        -- Yeni reaksiyon ekleme
        IF existing_interaction IS NOT NULL AND existing_interaction.reaction_type IS NOT NULL THEN
            -- Eski reaksiyonu kaldır
            old_field_name := 'reaction_' || existing_interaction.reaction_type;
            EXECUTE format('SELECT %I FROM announcements WHERE id = %s', old_field_name, p_announcement_id) INTO old_value;
            
            old_value := COALESCE(old_value, 0);
            old_value := GREATEST(0, old_value - 1);
            
            EXECUTE format('UPDATE announcements SET %I = %s WHERE id = %s', old_field_name, old_value, p_announcement_id);
        END IF;
        
        -- Yeni reaksiyonu ekle
        new_field_name := 'reaction_' || p_reaction_type;
        EXECUTE format('SELECT %I FROM announcements WHERE id = %s', new_field_name, p_announcement_id) INTO new_value;
        
        new_value := COALESCE(new_value, 0) + 1;
        EXECUTE format('UPDATE announcements SET %I = %s WHERE id = %s', new_field_name, new_value, p_announcement_id);
        
        -- User interaction'ı güncelle
        IF existing_interaction IS NOT NULL THEN
            UPDATE announcement_interactions 
            SET reaction_type = p_reaction_type, updated_at = NOW()
            WHERE user_ip = p_user_ip AND announcement_id = p_announcement_id;
        ELSE
            INSERT INTO announcement_interactions (user_ip, announcement_id, reaction_type, has_viewed)
            VALUES (p_user_ip, p_announcement_id, p_reaction_type, true);
        END IF;
    ELSE
        -- Reaksiyonu kaldırma
        IF existing_interaction IS NOT NULL AND existing_interaction.reaction_type = p_reaction_type THEN
            new_field_name := 'reaction_' || p_reaction_type;
            EXECUTE format('SELECT %I FROM announcements WHERE id = %s', new_field_name, p_announcement_id) INTO new_value;
            
            new_value := COALESCE(new_value, 0);
            new_value := GREATEST(0, new_value - 1);
            
            EXECUTE format('UPDATE announcements SET %I = %s WHERE id = %s', new_field_name, new_value, p_announcement_id);
            
            -- User interaction'dan reaksiyonu kaldır
            UPDATE announcement_interactions 
            SET reaction_type = NULL, updated_at = NOW()
            WHERE user_ip = p_user_ip AND announcement_id = p_announcement_id;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;
