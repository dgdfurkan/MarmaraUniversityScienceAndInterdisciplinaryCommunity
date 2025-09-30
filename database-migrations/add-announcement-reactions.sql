-- Announcements tablosuna reaction ve view count alanları ekleme
-- Bu komutları Supabase Dashboard > SQL Editor'da çalıştırın

-- Reaction count alanlarını ekle
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS reaction_onay INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reaction_katiliyorum INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reaction_katilamiyorum INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reaction_sorum_var INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reaction_destek INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Mevcut kayıtlara varsayılan değerleri ata
UPDATE announcements 
SET 
    reaction_onay = COALESCE(reaction_onay, 0),
    reaction_katiliyorum = COALESCE(reaction_katiliyorum, 0),
    reaction_katilamiyorum = COALESCE(reaction_katilamiyorum, 0),
    reaction_sorum_var = COALESCE(reaction_sorum_var, 0),
    reaction_destek = COALESCE(reaction_destek, 0),
    view_count = COALESCE(view_count, 0);
