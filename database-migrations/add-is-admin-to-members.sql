-- Add is_admin column to members table
ALTER TABLE members
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_members_is_admin ON members(is_admin) WHERE is_admin = TRUE;

-- Update RLS policy to allow admins to view all members
-- (Assuming existing policies allow users to view their own data)
-- Admins can view all members, regular users can only view their own

-- Note: You may need to update your existing RLS policies to include admin checks
-- Example policy update (adjust based on your existing policies):
-- DROP POLICY IF EXISTS "Users can view own member data" ON members;
-- CREATE POLICY "Users can view own member data or admins can view all"
--   ON members FOR SELECT
--   USING (
--     auth.uid() = user_id 
--     OR EXISTS (
--       SELECT 1 FROM members 
--       WHERE user_id = auth.uid() 
--       AND is_admin = TRUE
--     )
--   );

