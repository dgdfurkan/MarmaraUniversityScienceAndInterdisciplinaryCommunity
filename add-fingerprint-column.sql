-- Blog interactions tablosuna user_fingerprint kolonu ekleme
-- Bu komutları Supabase Dashboard > SQL Editor'da çalıştırın

-- Önce mevcut tabloya kolonu ekle
ALTER TABLE blog_interactions 
ADD COLUMN IF NOT EXISTS user_fingerprint VARCHAR(50);

-- Unique constraint ekle (bir IP + fingerprint kombinasyonu sadece bir kez beğeni yapabilir)
CREATE UNIQUE INDEX IF NOT EXISTS unique_like_per_user 
ON blog_interactions (blog_id, user_ip, user_fingerprint, interaction_type) 
WHERE interaction_type = 'like';

-- Mevcut verileri kontrol et
SELECT COUNT(*) as total_interactions FROM blog_interactions;
SELECT COUNT(*) as like_interactions FROM blog_interactions WHERE interaction_type = 'like';
