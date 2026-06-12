-- 1. ADD MISSING PERMISSION COLUMNS TO USERS TABLE
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS can_post_hackathons BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS can_post_events BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS can_post_jobs BOOLEAN DEFAULT FALSE;

-- 2. CREATE THE STORAGE BUCKET FOR EVENT FOOTAGES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'event-footages',
    'event-footages',
    true,
    52428800, -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/quicktime', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- 3. STORAGE ROW LEVEL SECURITY POLICIES FOR EVENT FOOTAGES BUCKET

-- Drop existing policies if they exist to prevent duplication
DROP POLICY IF EXISTS "Public Read Access on event-footages" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Access on event-footages" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access on event-footages" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access on event-footages" ON storage.objects;

-- Enable public read access to anyone for the event-footages bucket
CREATE POLICY "Public Read Access on event-footages"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-footages');

-- Enable public insert access so client-side scrapers (which use anon key) can upload images
CREATE POLICY "Public Insert Access on event-footages"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event-footages');

-- Enable public update access
CREATE POLICY "Public Update Access on event-footages"
ON storage.objects FOR UPDATE
USING (bucket_id = 'event-footages')
WITH CHECK (bucket_id = 'event-footages');

-- Enable public delete access
CREATE POLICY "Public Delete Access on event-footages"
ON storage.objects FOR DELETE
USING (bucket_id = 'event-footages');
