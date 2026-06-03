-- =========================================================================
-- FINAL, BULLETPROOF FIX FOR THE USERS TABLE
-- Copy and paste ALL of this into your Supabase SQL Editor and hit RUN.
-- =========================================================================

-- 1. ADD ALL MISSING COLUMNS SAFELY
-- (This ensures you have fields for all profile data without breaking anything)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS twitter_handle TEXT,
ADD COLUMN IF NOT EXISTS github_username TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'unknown';

-- 2. RESET AND FIX ALL RLS POLICIES (Guaranteed no "already exists" errors)
-- First, we drop ANY existing policies so they don't clash.
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.users;
DROP POLICY IF EXISTS "Enable update for all users" ON public.users;
DROP POLICY IF EXISTS "Allow anonymous updates" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.users;

-- Ensure RLS is active
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Re-create the 3 EXACT policies needed for your app to save data properly
CREATE POLICY "Enable read access for all users" 
ON public.users FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON public.users FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON public.users FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- 3. ENSURE UPDATED_AT WORKS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
