# Supabase Kurulum Rehberi

Bu rehber MUSIC web sitesi için Supabase veritabanı kurulumunu açıklar.

## 1. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) sitesine gidin
2. "Start your project" butonuna tıklayın
3. GitHub hesabınızla giriş yapın
4. "New Project" butonuna tıklayın
5. Proje adını `music-website` olarak ayarlayın
6. Güçlü bir veritabanı şifresi oluşturun
7. Bölgeyi `Europe West (London)` olarak seçin
8. "Create new project" butonuna tıklayın

## 2. Veritabanı Tablolarını Oluşturma

Supabase Dashboard'da SQL Editor'a gidin ve aşağıdaki SQL komutlarını çalıştırın:

### Announcements Tablosu
```sql
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Blog Posts Tablosu
```sql
CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'published',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Events Tablosu
```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price INTEGER DEFAULT 0,
    capacity INTEGER NOT NULL,
    registration_required BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Registrations Tablosu
```sql
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    university VARCHAR(255),
    department VARCHAR(255),
    student_id VARCHAR(50),
    grade VARCHAR(20),
    experience VARCHAR(50),
    motivation TEXT,
    dietary TEXT,
    accessibility TEXT,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    newsletter BOOLEAN DEFAULT false,
    privacy_policy BOOLEAN NOT NULL,
    terms_conditions BOOLEAN NOT NULL,
    photo_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Media Tablosu
```sql
CREATE TABLE media (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. Row Level Security (RLS) Ayarları

Güvenlik için RLS'yi etkinleştirin:

```sql
-- Announcements için RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for announcements" ON announcements FOR SELECT USING (status = 'active');

-- Blog posts için RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for blog posts" ON blog_posts FOR SELECT USING (status = 'published');

-- Events için RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for events" ON events FOR SELECT USING (status = 'active');

-- Registrations için RLS
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert access for registrations" ON registrations FOR INSERT WITH CHECK (true);
```

## 4. Storage Bucket Oluşturma

1. Supabase Dashboard'da "Storage" sekmesine gidin
2. "Create bucket" butonuna tıklayın
3. Bucket adını `media` olarak ayarlayın
4. "Public bucket" seçeneğini işaretleyin
5. "Create bucket" butonuna tıklayın

## 5. API Anahtarlarını Alma

1. Supabase Dashboard'da "Settings" > "API" sekmesine gidin
2. "Project URL" ve "anon public" anahtarını kopyalayın
3. `js/database.js` dosyasında bu değerleri güncelleyin:

```javascript
const SUPABASE_URL = 'YOUR_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

## 6. Test Verilerini Ekleme

Aşağıdaki SQL komutlarını çalıştırarak test verilerini ekleyin:

```sql
-- Test announcements
INSERT INTO announcements (title, content, category, status) VALUES
('Bilim Şenliği 2024 Başlıyor!', 'Bu yılki bilim şenliğimizde birbirinden ilginç deneyler ve gösteriler sizi bekliyor.', 'genel', 'active'),
('Biyoteknoloji Atölyesi', 'Kozmetik ürünleri üretimi konusunda uygulamalı bir atölye çalışması düzenliyoruz.', 'atolye', 'active');

-- Test blog posts
INSERT INTO blog_posts (title, content, excerpt, category, status) VALUES
('Bilim Şenliği 2024 Başlıyor!', 'Bu yılki bilim şenliğimizde birbirinden ilginç deneyler ve gösteriler sizi bekliyor. Detaylı içerik burada...', 'Bu yılki bilim şenliğimizde birbirinden ilginç deneyler ve gösteriler sizi bekliyor.', 'etkinlik', 'published'),
('Biyoteknoloji Atölyesi', 'Kozmetik ürünleri üretimi konusunda uygulamalı bir atölye çalışması düzenliyoruz. Detaylı içerik burada...', 'Kozmetik ürünleri üretimi konusunda uygulamalı bir atölye çalışması düzenliyoruz.', 'bilim', 'published');

-- Test events
INSERT INTO events (title, type, date, location, description, price, capacity, registration_required) VALUES
('Bilim Şenliği 2024', 'bilim-senligi', '2024-02-15 10:00:00+00', 'Marmara Üniversitesi Göztepe Kampüsü', 'Ortaokul ve lise öğrencilerine yönelik eğlenceli bilim deneyleri ve gösteriler.', 0, 100, true),
('Biyoteknoloji Atölyesi', 'atolye', '2024-02-20 14:00:00+00', 'Marmara Üniversitesi Laboratuvar', 'Kozmetik ürünleri üretimi konusunda uygulamalı atölye çalışması.', 50, 30, true);
```

## 7. GitHub Pages Deployment

1. GitHub repository'nizi oluşturun
2. Dosyaları repository'ye yükleyin
3. Repository Settings > Pages sekmesine gidin
4. Source'u "Deploy from a branch" olarak ayarlayın
5. Branch'ı "main" olarak seçin
6. "Save" butonuna tıklayın

## 8. Custom Domain (Opsiyonel)

1. Domain sağlayıcınızdan DNS ayarlarını yapın
2. GitHub Pages Settings'de custom domain ekleyin
3. SSL sertifikasını etkinleştirin

## Sorun Giderme

- **CORS Hatası**: Supabase Dashboard'da Authentication > Settings'de site URL'inizi ekleyin
- **RLS Hatası**: Policy'leri kontrol edin ve gerekirse güncelleyin
- **Storage Hatası**: Bucket permissions'ları kontrol edin

## Destek

Herhangi bir sorun yaşarsanız:
1. Supabase dokümantasyonunu kontrol edin
2. GitHub Issues'da sorun bildirin
3. Topluluk forumlarında yardım isteyin
