-- Create activity_logs table for tracking all admin actions
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'draft'
    table_name VARCHAR(50) NOT NULL, -- 'announcements', 'blog_posts', 'events'
    record_id TEXT NOT NULL,
    record_title VARCHAR(255) NOT NULL,
    old_data JSONB, -- Previous data for updates/deletes
    new_data JSONB, -- New data for creates/updates
    admin_user VARCHAR(100) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create version_history table for storing previous versions
CREATE TABLE IF NOT EXISTS version_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    data JSONB NOT NULL,
    change_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drafts table for saving drafts
CREATE TABLE IF NOT EXISTS drafts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id TEXT, -- NULL for new drafts
    title VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    admin_user VARCHAR(100) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE version_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access for activity logs
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activity_logs' 
        AND policyname = 'Allow anonymous read access'
    ) THEN
        CREATE POLICY "Allow anonymous read access" ON activity_logs
            FOR SELECT USING (true);
    END IF;
END $$;

-- Allow anonymous read access for version history
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'version_history' 
        AND policyname = 'Allow anonymous read access'
    ) THEN
        CREATE POLICY "Allow anonymous read access" ON version_history
            FOR SELECT USING (true);
    END IF;
END $$;

-- Allow anonymous read access for drafts
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'drafts' 
        AND policyname = 'Allow anonymous read access'
    ) THEN
        CREATE POLICY "Allow anonymous read access" ON drafts
            FOR SELECT USING (true);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_table_record ON activity_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_version_history_table_record ON version_history(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_drafts_table_record ON drafts(table_name, record_id);
