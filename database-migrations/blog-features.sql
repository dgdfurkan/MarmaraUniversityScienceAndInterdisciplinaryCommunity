-- Blog tablosuna yeni özellikler ekleme
-- Bu komutları Supabase Dashboard > SQL Editor'da çalıştırın

-- Blog posts tablosuna yeni kolonlar ekle
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS author_name VARCHAR(100) DEFAULT 'MUSIC Ekibi',
ADD COLUMN IF NOT EXISTS author_avatar TEXT,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Blog interactions tablosu oluştur
CREATE TABLE IF NOT EXISTS blog_interactions (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_ip VARCHAR(45), -- IP adresi için
    user_fingerprint VARCHAR(50), -- Browser fingerprint için
    interaction_type VARCHAR(20) NOT NULL, -- 'view', 'like', 'share'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint ekle (bir IP + fingerprint kombinasyonu sadece bir kez beğeni yapabilir)
CREATE UNIQUE INDEX IF NOT EXISTS unique_like_per_user 
ON blog_interactions (blog_id, user_ip, user_fingerprint, interaction_type) 
WHERE interaction_type = 'like';

-- Blog comments tablosu oluştur
CREATE TABLE IF NOT EXISTS blog_comments (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS politikaları
ALTER TABLE blog_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- RLS politikaları (eğer yoksa)
DO $$ 
BEGIN
    -- Blog interactions policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous read access' AND tablename = 'blog_interactions') THEN
        CREATE POLICY "Allow anonymous read access" ON blog_interactions FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous insert' AND tablename = 'blog_interactions') THEN
        CREATE POLICY "Allow anonymous insert" ON blog_interactions FOR INSERT WITH CHECK (true);
    END IF;
    
    -- Blog comments policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous read access' AND tablename = 'blog_comments') THEN
        CREATE POLICY "Allow anonymous read access" ON blog_comments FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous insert' AND tablename = 'blog_comments') THEN
        CREATE POLICY "Allow anonymous insert" ON blog_comments FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous update' AND tablename = 'blog_comments') THEN
        CREATE POLICY "Allow anonymous update" ON blog_comments FOR UPDATE USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous delete' AND tablename = 'blog_comments') THEN
        CREATE POLICY "Allow anonymous delete" ON blog_comments FOR DELETE USING (true);
    END IF;
END $$;
