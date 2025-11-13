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
    )
);

-- Indexes for event_interactions
CREATE INDEX IF NOT EXISTS idx_event_interactions_user_id ON event_interactions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_interactions_user_ip ON event_interactions(user_ip) WHERE user_ip IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_interactions_event ON event_interactions(event_id);

-- Unique index for event_interactions (one interaction per user/event combination)
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_interaction 
ON event_interactions (COALESCE(user_id::text, ''), COALESCE(user_ip, ''), event_id)
WHERE (user_id IS NOT NULL OR user_ip IS NOT NULL);

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

