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

