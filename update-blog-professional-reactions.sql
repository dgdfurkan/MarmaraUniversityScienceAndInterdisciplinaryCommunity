-- Blog için profesyonel reaksiyon sistemi güncellemesi
-- Bu komutları Supabase Dashboard > SQL Editor'da çalıştırın

-- Eski reaksiyon tiplerini temizle (isteğe bağlı)
DELETE FROM blog_interactions 
WHERE interaction_type IN ('love', 'laugh', 'wow', 'sad', 'angry');

-- Blog posts tablosundaki eski reaksiyon kolonlarını kaldır
ALTER TABLE blog_posts 
DROP COLUMN IF EXISTS love_count,
DROP COLUMN IF EXISTS laugh_count,
DROP COLUMN IF EXISTS wow_count,
DROP COLUMN IF EXISTS sad_count,
DROP COLUMN IF EXISTS angry_count;

-- Yeni profesyonel reaksiyon kolonlarını ekle
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS useful_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS informative_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS inspiring_count INTEGER DEFAULT 0;

-- Başarı mesajı
SELECT 'Blog profesyonel reaksiyon sistemi başarıyla güncellendi!' as message;
