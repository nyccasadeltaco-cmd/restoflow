-- Enable RLS policy for social_posts table to allow inserts
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/hkepastqekfrckyppbnp/editor

-- 0. Ensure id has default gen_random_uuid() (if not already set)
ALTER TABLE social_posts
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 1. Enable RLS on the table (if not already enabled)
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- 2. Create policy to allow INSERT for all authenticated users
CREATE POLICY "Allow insert for authenticated users"
ON social_posts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Create policy to allow SELECT for authenticated users (to read drafts)
CREATE POLICY "Allow select for authenticated users"
ON social_posts
FOR SELECT
TO authenticated
USING (true);

-- 4. Create policy to allow UPDATE for authenticated users
CREATE POLICY "Allow update for authenticated users"
ON social_posts
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Create policy to allow DELETE for authenticated users
CREATE POLICY "Allow delete for authenticated users"
ON social_posts
FOR DELETE
TO authenticated
USING (true);

-- If you want to allow anonymous access (for testing), uncomment these:
-- CREATE POLICY "Allow insert for anon" ON social_posts FOR INSERT TO anon WITH CHECK (true);
-- CREATE POLICY "Allow select for anon" ON social_posts FOR SELECT TO anon USING (true);
-- CREATE POLICY "Allow update for anon" ON social_posts FOR UPDATE TO anon USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow delete for anon" ON social_posts FOR DELETE TO anon USING (true);
