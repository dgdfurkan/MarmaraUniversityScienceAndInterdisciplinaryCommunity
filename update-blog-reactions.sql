-- Blog reaksiyon sistemi için güncellemeler
-- Bu komutları Supabase Dashboard > SQL Editor'da çalıştırın

-- Blog interactions tablosuna yeni reaksiyon tipleri ekle
-- Mevcut 'like' tipini koruyarak yeni tipler ekliyoruz

-- Önce mevcut unique constraint'i kaldır
DROP INDEX IF EXISTS unique_like_per_user;

-- Yeni unique constraint ekle (tüm reaksiyon tipleri için)
CREATE UNIQUE INDEX IF NOT EXISTS unique_reaction_per_user 
ON blog_interactions (blog_id, user_ip, user_fingerprint, interaction_type);

-- Blog interactions tablosuna yeni kolonlar ekle (eğer yoksa)
ALTER TABLE blog_interactions 
ADD COLUMN IF NOT EXISTS reaction_emoji VARCHAR(10),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Mevcut verileri güncelle
UPDATE blog_interactions 
SET reaction_emoji = CASE 
    WHEN interaction_type = 'like' THEN '❤️'
    WHEN interaction_type = 'love' THEN '😍'
    WHEN interaction_type = 'laugh' THEN '😂'
    WHEN interaction_type = 'wow' THEN '😮'
    WHEN interaction_type = 'sad' THEN '😢'
    WHEN interaction_type = 'angry' THEN '😠'
    ELSE '👍'
END
WHERE reaction_emoji IS NULL;

-- Blog posts tablosuna reaksiyon sayıları için kolonlar ekle
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS love_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS laugh_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wow_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sad_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS angry_count INTEGER DEFAULT 0;

-- RLS politikalarını güncelle
DO $$ 
BEGIN
    -- Eğer yoksa ekle
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous update' AND tablename = 'blog_interactions') THEN
        CREATE POLICY "Allow anonymous update" ON blog_interactions FOR UPDATE USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous delete' AND tablename = 'blog_interactions') THEN
        CREATE POLICY "Allow anonymous delete" ON blog_interactions FOR DELETE USING (true);
    END IF;
END $$;

-- Test verisi ekle (isteğe bağlı)
-- INSERT INTO blog_interactions (blog_id, interaction_type, user_ip, user_fingerprint, reaction_emoji) 
-- VALUES (1, 'love', '127.0.0.1', 'test_fingerprint', '😍');

-- Başarı mesajı
SELECT 'Blog reaksiyon sistemi başarıyla güncellendi!' as message;
