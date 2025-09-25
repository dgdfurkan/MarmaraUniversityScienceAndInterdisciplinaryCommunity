-- Supabase Tabloları Oluşturma SQL Komutları
-- Bu komutları Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Announcements Tablosu
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'genel',
    image_url TEXT, -- Fotoğraf linki için
    image_file TEXT, -- Yüklenen dosya için
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Blog Posts Tablosu
CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'genel',
    image_url TEXT, -- Fotoğraf linki için
    image_file TEXT, -- Yüklenen dosya için
    status VARCHAR(20) DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Events Tablosu
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    capacity INTEGER DEFAULT 0,
    registered INTEGER DEFAULT 0,
    registration_required BOOLEAN DEFAULT true,
    image_url TEXT, -- Fotoğraf linki için
    image_file TEXT, -- Yüklenen dosya için
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Registrations Tablosu
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    university VARCHAR(255),
    department VARCHAR(255),
    student_id VARCHAR(50),
    grade VARCHAR(10),
    experience VARCHAR(20),
    motivation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Media Tablosu (Dosya bilgileri için)
CREATE TABLE IF NOT EXISTS media (
    id SERIAL PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) Ayarları
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Anonymous kullanıcılar için SELECT izni
CREATE POLICY "Allow anonymous read access" ON announcements FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON events FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON registrations FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON media FOR SELECT USING (true);

-- Anonymous kullanıcılar için INSERT izni
CREATE POLICY "Allow anonymous insert" ON announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON media FOR INSERT WITH CHECK (true);

-- Anonymous kullanıcılar için UPDATE izni
CREATE POLICY "Allow anonymous update" ON announcements FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous update" ON blog_posts FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous update" ON events FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous update" ON registrations FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous update" ON media FOR UPDATE USING (true);

-- Anonymous kullanıcılar için DELETE izni
CREATE POLICY "Allow anonymous delete" ON announcements FOR DELETE USING (true);
CREATE POLICY "Allow anonymous delete" ON blog_posts FOR DELETE USING (true);
CREATE POLICY "Allow anonymous delete" ON events FOR DELETE USING (true);
CREATE POLICY "Allow anonymous delete" ON registrations FOR DELETE USING (true);
CREATE POLICY "Allow anonymous delete" ON media FOR DELETE USING (true);

-- Storage Bucket Oluşturma
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Storage Policies
CREATE POLICY "Allow anonymous uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
CREATE POLICY "Allow anonymous downloads" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Allow anonymous deletes" ON storage.objects FOR DELETE USING (bucket_id = 'media');
