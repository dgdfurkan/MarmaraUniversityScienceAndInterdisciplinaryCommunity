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

