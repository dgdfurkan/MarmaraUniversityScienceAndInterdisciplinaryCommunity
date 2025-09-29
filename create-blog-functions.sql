-- Blog için gerekli fonksiyonları oluştur
-- Bu komutları Supabase Dashboard > SQL Editor'da çalıştırın

-- Blog görüntüleme sayısını güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_blog_view_count(
    blog_id INTEGER,
    increment BOOLEAN
)
RETURNS VOID AS $$
BEGIN
    IF increment THEN
        UPDATE blog_posts 
        SET view_count = COALESCE(view_count, 0) + 1 
        WHERE id = blog_id;
    ELSE
        UPDATE blog_posts 
        SET view_count = GREATEST(0, COALESCE(view_count, 0) - 1) 
        WHERE id = blog_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Blog reaksiyon sayısını güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_blog_reaction_count(
    blog_id INTEGER,
    reaction_type VARCHAR(20),
    increment BOOLEAN
)
RETURNS VOID AS $$
DECLARE
    field_name TEXT;
    current_value INTEGER;
BEGIN
    -- Reaksiyon tipine göre alan adını belirle
    CASE reaction_type
        WHEN 'like' THEN field_name := 'like_count';
        WHEN 'useful' THEN field_name := 'useful_count';
        WHEN 'informative' THEN field_name := 'informative_count';
        WHEN 'inspiring' THEN field_name := 'inspiring_count';
        ELSE field_name := 'like_count';
    END CASE;
    
    -- Mevcut değeri al
    EXECUTE format('SELECT COALESCE(%I, 0) FROM blog_posts WHERE id = %s', field_name, blog_id) INTO current_value;
    
    -- Değeri güncelle
    IF increment THEN
        current_value := current_value + 1;
    ELSE
        current_value := GREATEST(0, current_value - 1);
    END IF;
    
    -- Güncelle
    EXECUTE format('UPDATE blog_posts SET %I = %s WHERE id = %s', field_name, current_value, blog_id);
END;
$$ LANGUAGE plpgsql;

-- Başarı mesajı
SELECT 'Blog fonksiyonları başarıyla oluşturuldu!' as message;
