-- Members tablosuna avatar_url kolonu ekleme
-- Bu komutları Supabase Dashboard > SQL Editor'da çalıştırın

-- Members tablosuna avatar_url kolonu ekle
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Kolonun eklendiğini kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'members' 
AND column_name = 'avatar_url';

