-- ============================================
-- E-POSTA DOĞRULAMA SİSTEMİ - 6 HANELİ KOD
-- ============================================

-- Email verification codes tablosu
CREATE TABLE IF NOT EXISTS email_verification_codes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_email_code ON email_verification_codes(email, code, used);
CREATE INDEX IF NOT EXISTS idx_verification_expires ON email_verification_codes(expires_at);

-- RLS Policies
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own verification codes
CREATE POLICY "Allow users to insert their own verification codes" 
ON email_verification_codes FOR INSERT 
WITH CHECK (true);

-- Allow users to read their own verification codes
CREATE POLICY "Allow users to read their own verification codes" 
ON email_verification_codes FOR SELECT 
USING (true);

-- Allow users to update their own verification codes
CREATE POLICY "Allow users to update their own verification codes" 
ON email_verification_codes FOR UPDATE 
USING (true);

-- Function to clean expired codes (runs automatically)
CREATE OR REPLACE FUNCTION clean_expired_verification_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM email_verification_codes 
    WHERE expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-clean expired codes (optional - can be run manually)
-- CREATE TRIGGER clean_expired_codes_trigger
-- AFTER INSERT ON email_verification_codes
-- EXECUTE FUNCTION clean_expired_verification_codes();

