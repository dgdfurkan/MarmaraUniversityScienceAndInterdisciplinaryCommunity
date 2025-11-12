-- ============================================
-- SITE SETTINGS RLS POLİTİKALARINI DÜZELT
-- ============================================

-- Mevcut politikaları sil
DROP POLICY IF EXISTS "Allow authenticated users to update site settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert site settings" ON site_settings;

-- Yeni politikaları oluştur (anon key ile çalışacak şekilde)
-- Admin panel anon key kullanıyor, bu yüzden tüm kullanıcılara izin veriyoruz
-- İleride daha güvenli hale getirmek için admin kullanıcı kontrolü eklenebilir

-- UPDATE politikası
CREATE POLICY "Allow authenticated users to update site settings" 
ON site_settings FOR UPDATE 
USING (true)
WITH CHECK (true);

-- INSERT politikası
CREATE POLICY "Allow authenticated users to insert site settings" 
ON site_settings FOR INSERT 
WITH CHECK (true);

