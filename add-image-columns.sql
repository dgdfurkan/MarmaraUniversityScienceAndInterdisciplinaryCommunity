-- Supabase Tablolarına Kolon Ekleme
-- Bu komutları Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Announcements tablosuna kolonlar ekle
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_file TEXT;

-- 2. Blog Posts tablosuna kolonlar ekle
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_file TEXT;

-- 3. Events tablosuna kolonlar ekle
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_file TEXT;

-- 4. Tabloları kontrol et
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('announcements', 'blog_posts', 'events')
ORDER BY table_name, ordinal_position;
