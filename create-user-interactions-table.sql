-- Kullanıcı etkileşimlerini takip etmek için tablo
CREATE TABLE IF NOT EXISTS user_interactions (
    id SERIAL PRIMARY KEY,
    user_ip VARCHAR(45) NOT NULL, -- IPv4 ve IPv6 desteği
    announcement_id INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20), -- onay, katiliyorum, katilamiyorum, sorum_var, destek
    has_viewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Bir IP'nin aynı duyuru için sadece bir reaksiyonu olabilir
    UNIQUE(user_ip, announcement_id)
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_user_interactions_ip ON user_interactions(user_ip);
CREATE INDEX IF NOT EXISTS idx_user_interactions_announcement ON user_interactions(announcement_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_reaction ON user_interactions(reaction_type);

-- RLS (Row Level Security) politikaları
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (istatistikler için)
CREATE POLICY "Anyone can read user interactions" ON user_interactions
    FOR SELECT USING (true);

-- Herkes ekleyebilir/güncelleyebilir (kendi IP'si için)
CREATE POLICY "Anyone can insert/update their own interactions" ON user_interactions
    FOR ALL USING (true);

-- Updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_interactions_updated_at 
    BEFORE UPDATE ON user_interactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
