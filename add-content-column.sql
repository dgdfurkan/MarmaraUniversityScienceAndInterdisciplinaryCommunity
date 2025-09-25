-- Add content column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS content TEXT;

-- Add content column to announcements table if not exists
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS content TEXT;
