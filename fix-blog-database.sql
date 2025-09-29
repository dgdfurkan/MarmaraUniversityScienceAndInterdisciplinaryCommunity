-- Blog veritabanı şemasını düzeltme
-- Bu komutları Supabase Dashboard > SQL Editor'da çalıştırın

-- Blog interactions tablosuna reaction_emoji kolonu ekle
ALTER TABLE blog_interactions 
ADD COLUMN IF NOT EXISTS reaction_emoji VARCHAR(10);

-- Blog posts tablosuna yeni reaksiyon kolonlarını ekle
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS useful_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS informative_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS inspiring_count INTEGER DEFAULT 0;

-- Mevcut verileri güncelle
UPDATE blog_interactions 
SET reaction_emoji = CASE 
    WHEN interaction_type = 'like' THEN '❤️'
    WHEN interaction_type = 'useful' THEN '👍'
    WHEN interaction_type = 'informative' THEN '💡'
    WHEN interaction_type = 'inspiring' THEN '✨'
    ELSE '👍'
END
WHERE reaction_emoji IS NULL;

-- Başarı mesajı
SELECT 'Blog veritabanı şeması başarıyla güncellendi!' as message;
