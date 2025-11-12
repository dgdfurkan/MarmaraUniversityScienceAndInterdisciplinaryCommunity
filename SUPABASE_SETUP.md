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

## 9. E-posta Doğrulama Sistemi - 6 Haneli Kod

Sistemimiz **6 haneli kod** ile e-posta doğrulama kullanır. Kullanıcılar kayıt olduktan sonra e-postalarına gönderilen 6 haneli kodu web sitesine girerek hesabını doğrular.

### 9.1. Veritabanı Tablosunu Oluşturma

Önce e-posta doğrulama kodları için tabloyu oluşturun:

1. **Supabase Dashboard** > **SQL Editor**'a gidin
2. `database-migrations/email-verification-setup.sql` dosyasındaki SQL komutlarını çalıştırın:

```sql
-- Email verification codes tablosu
CREATE TABLE IF NOT EXISTS email_verification_codes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_email_code ON email_verification_codes(email, code, used);
CREATE INDEX IF NOT EXISTS idx_verification_expires ON email_verification_codes(expires_at);

-- RLS Policies
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to insert their own verification codes" 
ON email_verification_codes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to read their own verification codes" 
ON email_verification_codes FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own verification codes" 
ON email_verification_codes FOR UPDATE USING (true);
```

### 9.2. Resend API Kurulumu (Önerilen - Ücretsiz)

**Resend** günlük 3,000 e-posta gönderme limiti ile **tamamen ücretsiz**! Günlük 100 e-posta için mükemmel.

#### Adım 1: Resend Hesabı Oluşturma

1. [Resend.com](https://resend.com) adresine gidin
2. **"Sign Up"** butonuna tıklayın
3. E-posta adresinizle ücretsiz hesap oluşturun
4. E-postanızı doğrulayın

#### Adım 2: API Key Alma

1. Resend Dashboard'a giriş yapın
2. Sol menüden **"API Keys"** sekmesine gidin
3. **"Create API Key"** butonuna tıklayın
4. Key adı: `MUSIC Website`
5. **"Sending access"** seçeneğini işaretleyin
6. **"Create"** butonuna tıklayın
7. **API Key'i kopyalayın** (sadece bir kez gösterilir!)

#### Adım 3: Domain Doğrulama (Opsiyonel ama Önerilen)

**Test için:** Resend'in test domain'i (`onboarding.resend.dev`) ile hemen başlayabilirsiniz.

**Üretim için:** Kendi domain'inizi ekleyin:

1. Resend Dashboard > **"Domains"** sekmesine gidin
2. **"Add Domain"** butonuna tıklayın
3. Domain'inizi girin (örn: `musictoplulugu.com`)
4. DNS kayıtlarını domain sağlayıcınızda ekleyin:
   - **TXT Record**: `resend._domainkey` → Resend'in verdiği değer
   - **MX Record**: `mx.resend.com` → Priority: 10
   - **SPF Record**: `v=spf1 include:_spf.resend.com ~all`
5. Doğrulama tamamlanana kadar bekleyin (genellikle 5-10 dakika)

#### Adım 4: API Key'i Projeye Ekleme

1. Projenizde `js/email-service.js` dosyasını açın
2. `RESEND_API_KEY` değişkenini bulun
3. Resend'den aldığınız API Key'i yapıştırın:

```javascript
const RESEND_API_KEY = 're_xxxxxxxxxxxxxxxxxxxxx'; // Resend API Key'iniz
```

4. E-posta gönderen adresini güncelleyin:

```javascript
from: 'MUSIC Topluluğu <noreply@yourdomain.com>', // Kendi domain'iniz
// veya test için:
from: 'MUSIC Topluluğu <onboarding@resend.dev>', // Resend test domain
```

### 9.3. Alternatif: Gmail SMTP (Günlük 500 E-posta)

Eğer Resend kullanmak istemiyorsanız, Gmail SMTP kullanabilirsiniz:

1. Gmail hesabınızda **2 Adımlı Doğrulama** açın
2. **Google Account** > **Security** > **2-Step Verification** > **App Passwords**
3. **"Select app"**: Mail
4. **"Select device"**: Other (Custom name) → `MUSIC Website`
5. **"Generate"** butonuna tıklayın
6. 16 haneli şifreyi kopyalayın
7. `js/email-service.js` dosyasını düzenleyin ve Gmail SMTP kullanacak şekilde güncelleyin

### 9.4. Sistem Nasıl Çalışır?

1. **Kullanıcı Kayıt Olur:**
   - Kullanıcı formu doldurur ve "Üye Ol" butonuna tıklar
   - Sistem 6 haneli rastgele kod üretir (örn: `482936`)
   - Kod veritabanına kaydedilir (10 dakika geçerli)
   - E-posta gönderilir (Resend API ile)

2. **Kullanıcı Kodu Girer:**
   - E-postasına gelen 6 haneli kodu görür
   - Web sitesindeki doğrulama formuna girer
   - Her rakam için ayrı input kutusu vardır
   - "Doğrula" butonuna tıklar

3. **Kod Doğrulanır:**
   - Sistem kodu kontrol eder
   - Kod geçerli ve süresi dolmamışsa → ✅ Başarılı
   - Kod geçersiz veya süresi dolmuşsa → ❌ Hata mesajı

4. **Hesap Aktifleşir:**
   - Kod doğrulandıktan sonra kullanıcı giriş yapabilir
   - Kod tek kullanımlıktır (kullanıldıktan sonra silinir)

### 9.5. E-posta Şablonu Özelleştirme

E-posta şablonu `js/email-service.js` dosyasındaki `getVerificationEmailTemplate()` fonksiyonunda tanımlıdır.

**Logo eklemek için:**
1. Logonuzu `images/` klasörüne yükleyin
2. `email-service.js` dosyasında `logoUrl` değişkenini güncelleyin:

```javascript
const logoUrl = 'https://yourdomain.com/images/music_logo_cropped.png';
```

**Renkleri değiştirmek için:**
- Gradient renkleri: `#667eea` ve `#764ba2` (mor tonları)
- Bu renkleri kendi marka renklerinizle değiştirebilirsiniz

### 9.6. Test Modu

API Key ayarlanmadan önce sistem **test modunda** çalışır:
- E-posta gönderilmez
- Kod console'a yazdırılır (tarayıcı Developer Tools'da görülebilir)
- Bu sayede test edebilirsiniz

**Test için:**
1. Tarayıcıda Developer Tools'u açın (F12)
2. Console sekmesine gidin
3. Kayıt olun
4. Console'da doğrulama kodunu görün
5. Kodu web sitesine girin

### 9.7. Üretim Kontrol Listesi

- [ ] Resend API Key eklendi
- [ ] Domain doğrulandı (veya test domain kullanılıyor)
- [ ] Logo URL güncellendi
- [ ] E-posta gönderen adres doğrulandı
- [ ] Test e-postası gönderildi ve kontrol edildi
- [ ] Spam klasörü kontrol edildi
- [ ] Mobil cihazlarda e-posta görünümü test edildi

## Sorun Giderme

- **CORS Hatası**: Supabase Dashboard'da Authentication > Settings'de site URL'inizi ekleyin
- **RLS Hatası**: Policy'leri kontrol edin ve gerekirse güncelleyin
- **Storage Hatası**: Bucket permissions'ları kontrol edin
- **E-posta Gönderilmiyor**: 
  - SMTP ayarlarını kontrol edin
  - Spam klasörünü kontrol edin
  - Supabase Dashboard > Logs'da e-posta gönderim loglarını kontrol edin
  - Günlük limiti aşmadığınızdan emin olun (ücretsiz plan: 3 e-posta/gün)

## Destek

Herhangi bir sorun yaşarsanız:
1. Supabase dokümantasyonunu kontrol edin
2. GitHub Issues'da sorun bildirin
3. Topluluk forumlarında yardım isteyin
