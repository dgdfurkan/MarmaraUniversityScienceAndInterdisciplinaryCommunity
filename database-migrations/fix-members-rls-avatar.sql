-- Members tablosu için RLS politikalarını düzelt (avatar_url güncellemesi için)
-- Bu komutları Supabase Dashboard > SQL Editor'da çalıştırın

-- Mevcut UPDATE politikasını kontrol et ve güncelle
DROP POLICY IF EXISTS "Allow authenticated users to update their own member profile" ON members;

-- Kullanıcıların kendi profil bilgilerini (avatar_url dahil) güncelleyebilmesi için
CREATE POLICY "Allow authenticated users to update their own member profile" 
ON members FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Eğer INSERT politikası yoksa ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'members' 
        AND policyname = 'Allow authenticated users to insert their own member profile'
    ) THEN
        CREATE POLICY "Allow authenticated users to insert their own member profile" 
        ON members FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

