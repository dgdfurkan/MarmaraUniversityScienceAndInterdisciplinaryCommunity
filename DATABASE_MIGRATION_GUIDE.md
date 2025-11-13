# Database Migration Rehberi

Bu rehber, yeni bildirim ve üye takip sistemi için gerekli database tablolarını oluşturmanız için adım adım talimatlar içerir.

## Önemli Notlar

⚠️ **BU KOMUTLAR TERMİNAL'DE DEĞİL, SUPABASE DASHBOARD'DA ÇALIŞTIRILMALIDIR!**

⚠️ **SQL Editor'da çalıştırırken, her dosyayı TEK TEK ve SIRAYLA çalıştırın!**

## Adım Adım Kurulum

### 1. Supabase Dashboard'a Giriş

1. Tarayıcınızda [https://supabase.com](https://supabase.com) adresine gidin
2. "Sign In" butonuna tıklayın ve giriş yapın
3. Projenizi seçin (MarmaraUniversityScienceAndInterdisciplinaryCommunity)

### 2. SQL Editor'ı Açın

1. Sol menüden **"SQL Editor"** sekmesine tıklayın
2. Sağ üstte **"New query"** butonuna tıklayın (veya mevcut bir query'i temizleyin)

### 3. İlk Migration: User Content Views Tablosu

**Dosya:** `database-migrations/create-user-content-views.sql`

1. SQL Editor'da yeni bir query açın
2. Aşağıdaki SQL kodunu **TAMAMINI** kopyalayıp yapıştırın:

```sql
-- User Content Views Tracking Table
-- Tracks which content (announcements, events, blog posts) users have viewed
-- Supports both logged-in users (user_id) and anonymous users (user_ip)

CREATE TABLE IF NOT EXISTS user_content_views (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_ip VARCHAR(45),
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('announcement', 'event', 'blog')),
    content_id INTEGER NOT NULL,
    has_viewed BOOLEAN DEFAULT TRUE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure either user_id or user_ip is provided
    CONSTRAINT check_user_identifier CHECK (
        (user_id IS NOT NULL AND user_ip IS NULL) OR 
        (user_id IS NULL AND user_ip IS NOT NULL)
    ),
    
    -- Unique constraint: one view record per user/content combination
    CONSTRAINT unique_user_content_view UNIQUE NULLS NOT DISTINCT (user_id, user_ip, content_type, content_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_content_views_user_id ON user_content_views(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_content_views_user_ip ON user_content_views(user_ip) WHERE user_ip IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_content_views_content ON user_content_views(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_user_content_views_viewed_at ON user_content_views(viewed_at);

-- RLS (Row Level Security) policies
ALTER TABLE user_content_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (for statistics)
CREATE POLICY "Allow read access to user content views" ON user_content_views
    FOR SELECT USING (true);

-- Allow users to insert their own views
CREATE POLICY "Allow insert for own views" ON user_content_views
    FOR INSERT WITH CHECK (true);

-- Allow users to update their own views
CREATE POLICY "Allow update for own views" ON user_content_views
    FOR UPDATE USING (true);

-- Function to automatically update viewed_at timestamp
CREATE OR REPLACE FUNCTION update_user_content_views_viewed_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.viewed_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update viewed_at on insert/update
DROP TRIGGER IF EXISTS trigger_update_user_content_views_viewed_at ON user_content_views;
CREATE TRIGGER trigger_update_user_content_views_viewed_at
    BEFORE INSERT OR UPDATE ON user_content_views
    FOR EACH ROW
    EXECUTE FUNCTION update_user_content_views_viewed_at();
```

3. Sağ alttaki **"Run"** butonuna tıklayın (veya `Ctrl+Enter` / `Cmd+Enter`)
4. Başarılı olduğunu görmek için "Success. No rows returned" mesajını bekleyin

### 4. İkinci Migration: User Reactions Tablosu

**Dosya:** `database-migrations/create-user-reactions.sql`

1. SQL Editor'da **yeni bir query açın** (New query butonuna tıklayın)
2. Aşağıdaki SQL kodunu **TAMAMINI** kopyalayıp yapıştırın:

```sql
-- User Reactions Tracking Table
-- Unified table for tracking all user reactions across different content types
-- Supports both logged-in users (user_id) and anonymous users (user_ip)

CREATE TABLE IF NOT EXISTS user_reactions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_ip VARCHAR(45),
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('announcement', 'event', 'blog')),
    content_id INTEGER NOT NULL,
    reaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure either user_id or user_ip is provided
    CONSTRAINT check_user_identifier CHECK (
        (user_id IS NOT NULL AND user_ip IS NULL) OR 
        (user_id IS NULL AND user_ip IS NOT NULL)
    ),
    
    -- Unique constraint: one reaction per user/content/reaction_type combination
    CONSTRAINT unique_user_reaction UNIQUE NULLS NOT DISTINCT (user_id, user_ip, content_type, content_id, reaction_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_reactions_user_id ON user_reactions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_reactions_user_ip ON user_reactions(user_ip) WHERE user_ip IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_reactions_content ON user_reactions(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_user_reactions_type ON user_reactions(reaction_type);
CREATE INDEX IF NOT EXISTS idx_user_reactions_created_at ON user_reactions(created_at);

-- RLS (Row Level Security) policies
ALTER TABLE user_reactions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (for statistics)
CREATE POLICY "Allow read access to user reactions" ON user_reactions
    FOR SELECT USING (true);

-- Allow users to insert their own reactions
CREATE POLICY "Allow insert for own reactions" ON user_reactions
    FOR INSERT WITH CHECK (true);

-- Allow users to update their own reactions
CREATE POLICY "Allow update for own reactions" ON user_reactions
    FOR UPDATE USING (true);

-- Allow users to delete their own reactions
CREATE POLICY "Allow delete for own reactions" ON user_reactions
    FOR DELETE USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_reactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on update
DROP TRIGGER IF EXISTS trigger_update_user_reactions_updated_at ON user_reactions;
CREATE TRIGGER trigger_update_user_reactions_updated_at
    BEFORE UPDATE ON user_reactions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_reactions_updated_at();
```

3. **"Run"** butonuna tıklayın
4. Başarı mesajını bekleyin

### 5. Üçüncü Migration: Mevcut Tabloları Güncelleme

**Dosya:** `database-migrations/update-interactions-with-user-id.sql`

1. SQL Editor'da **yeni bir query açın**
2. Aşağıdaki SQL kodunu **TAMAMINI** kopyalayıp yapıştırın:

```sql
-- Update existing interaction tables to support user_id
-- This allows backward compatibility with IP-based tracking while adding user_id support

-- 1. Update announcement_interactions table
ALTER TABLE announcement_interactions
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update constraint to allow either user_id or user_ip
ALTER TABLE announcement_interactions
DROP CONSTRAINT IF EXISTS check_user_identifier;

ALTER TABLE announcement_interactions
ADD CONSTRAINT check_user_identifier CHECK (
    (user_id IS NOT NULL AND user_ip IS NULL) OR 
    (user_id IS NULL AND user_ip IS NOT NULL) OR
    (user_id IS NOT NULL AND user_ip IS NOT NULL)
);

-- Update unique constraint to include user_id
ALTER TABLE announcement_interactions
DROP CONSTRAINT IF EXISTS announcement_interactions_user_ip_announcement_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS unique_announcement_interaction 
ON announcement_interactions (COALESCE(user_id::text, ''), COALESCE(user_ip, ''), announcement_id)
WHERE (user_id IS NOT NULL OR user_ip IS NOT NULL);

-- Add index for user_id
CREATE INDEX IF NOT EXISTS idx_announcement_interactions_user_id 
ON announcement_interactions(user_id) WHERE user_id IS NOT NULL;

-- 2. Update blog_interactions table
ALTER TABLE blog_interactions
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update constraint to allow either user_id or user_ip
ALTER TABLE blog_interactions
DROP CONSTRAINT IF EXISTS check_user_identifier;

ALTER TABLE blog_interactions
ADD CONSTRAINT check_user_identifier CHECK (
    (user_id IS NOT NULL AND (user_ip IS NOT NULL OR user_fingerprint IS NOT NULL)) OR 
    (user_id IS NULL AND (user_ip IS NOT NULL OR user_fingerprint IS NOT NULL))
);

-- Update unique index to include user_id
DROP INDEX IF EXISTS unique_like_per_user;

CREATE UNIQUE INDEX IF NOT EXISTS unique_blog_interaction 
ON blog_interactions (blog_id, COALESCE(user_id::text, ''), COALESCE(user_ip, ''), COALESCE(user_fingerprint, ''), interaction_type)
WHERE interaction_type = 'like';

-- Add index for user_id
CREATE INDEX IF NOT EXISTS idx_blog_interactions_user_id 
ON blog_interactions(user_id) WHERE user_id IS NOT NULL;

-- 3. Create event_interactions table (similar to announcement_interactions)
CREATE TABLE IF NOT EXISTS event_interactions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_ip VARCHAR(45),
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20), -- 'view', 'like', 'register', etc.
    has_viewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_user_identifier CHECK (
        (user_id IS NOT NULL AND user_ip IS NULL) OR 
        (user_id IS NULL AND user_ip IS NOT NULL) OR
        (user_id IS NOT NULL AND user_ip IS NOT NULL)
    ),
    
    UNIQUE (COALESCE(user_id::text, ''), COALESCE(user_ip, ''), event_id)
);

-- Indexes for event_interactions
CREATE INDEX IF NOT EXISTS idx_event_interactions_user_id ON event_interactions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_interactions_user_ip ON event_interactions(user_ip) WHERE user_ip IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_interactions_event ON event_interactions(event_id);

-- RLS for event_interactions
ALTER TABLE event_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to event interactions" ON event_interactions
    FOR SELECT USING (true);

CREATE POLICY "Allow insert for own event interactions" ON event_interactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for own event interactions" ON event_interactions
    FOR UPDATE USING (true);

-- Function to update updated_at for event_interactions
CREATE OR REPLACE FUNCTION update_event_interactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_event_interactions_updated_at ON event_interactions;
CREATE TRIGGER trigger_update_event_interactions_updated_at
    BEFORE UPDATE ON event_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_event_interactions_updated_at();
```

3. **"Run"** butonuna tıklayın
4. Başarı mesajını bekleyin

## Doğrulama

Migration'ları çalıştırdıktan sonra, tabloların oluşturulduğunu doğrulamak için:

1. Sol menüden **"Table Editor"** sekmesine tıklayın
2. Aşağıdaki tabloların listede göründüğünü kontrol edin:
   - ✅ `user_content_views`
   - ✅ `user_reactions`
   - ✅ `event_interactions` (yeni)
   - ✅ `announcement_interactions` (güncellenmiş - user_id kolonu var)
   - ✅ `blog_interactions` (güncellenmiş - user_id kolonu var)

## Hata Durumunda

Eğer bir hata alırsanız:

1. **Hata mesajını okuyun** - Genellikle hangi satırda sorun olduğunu söyler
2. **Önceki migration'ları kontrol edin** - Belki bir tablo zaten oluşturulmuş olabilir
3. **"IF NOT EXISTS" kullanıldığı için** - Çoğu durumda tekrar çalıştırmak sorun çıkarmaz
4. **Eğer constraint hatası alırsanız** - Önce `DROP CONSTRAINT IF EXISTS` komutlarını çalıştırın

## Sonraki Adımlar

Migration'ları başarıyla çalıştırdıktan sonra:

1. ✅ Bildirim sistemi artık database'i kullanacak
2. ✅ Giriş yapan kullanıcılar için içerik görüntülemeleri database'de saklanacak
3. ✅ Admin panel'de üye listesi ve detayları görüntülenebilecek
4. ✅ Reaksiyonlar database'de takip edilecek

## Sorun Giderme

**Soru:** "relation already exists" hatası alıyorum
**Cevap:** Tablo zaten var demektir. `CREATE TABLE IF NOT EXISTS` kullanıldığı için sorun olmaz, devam edebilirsiniz.

**Soru:** "constraint already exists" hatası alıyorum
**Cevap:** Constraint zaten var. `DROP CONSTRAINT IF EXISTS` komutları çalıştırıldığı için sorun olmaz, devam edebilirsiniz.

**Soru:** "permission denied" hatası alıyorum
**Cevap:** Supabase Dashboard'da doğru projede olduğunuzdan emin olun. Admin yetkileriniz olmalı.

**Soru:** Migration'ları hangi sırayla çalıştırmalıyım?
**Cevap:** 
1. Önce `create-user-content-views.sql`
2. Sonra `create-user-reactions.sql`
3. En son `update-interactions-with-user-id.sql`

Bu sıra önemlidir çünkü bazı tablolar diğerlerine referans veriyor.

