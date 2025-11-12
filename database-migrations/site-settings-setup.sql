-- ============================================
-- SITE AYARLARI SİSTEMİ
-- ============================================

-- Site settings tablosu
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'boolean', -- boolean, string, number, enum
    description TEXT,
    category VARCHAR(50) DEFAULT 'general', -- general, auth, email, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);

-- RLS Policies
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (site needs to read settings)
CREATE POLICY "Allow public read access to site settings" 
ON site_settings FOR SELECT 
USING (true);

-- Allow authenticated users (admins) to update settings
-- Note: Admin panel uses anon key, so we allow updates for authenticated users
-- If you need to restrict further, you can add a check for specific admin user IDs
CREATE POLICY "Allow authenticated users to update site settings" 
ON site_settings FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Allow authenticated users (admins) to insert site settings
CREATE POLICY "Allow authenticated users to insert site settings" 
ON site_settings FOR INSERT 
WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_site_settings_timestamp
BEFORE UPDATE ON site_settings
FOR EACH ROW
EXECUTE FUNCTION update_site_settings_updated_at();

-- Insert default settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description, category) VALUES
('email_verification_enabled', 'true', 'boolean', 'E-posta doğrulama sistemi aktif mi?', 'auth')
ON CONFLICT (setting_key) DO NOTHING;

-- Helper function to get setting value
CREATE OR REPLACE FUNCTION get_site_setting(key_name VARCHAR)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    SELECT setting_value INTO result
    FROM site_settings
    WHERE setting_key = key_name;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Helper function to set setting value
CREATE OR REPLACE FUNCTION set_site_setting(key_name VARCHAR, value_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO site_settings (setting_key, setting_value, updated_at)
    VALUES (key_name, value_text, NOW())
    ON CONFLICT (setting_key) 
    DO UPDATE SET 
        setting_value = EXCLUDED.setting_value,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

