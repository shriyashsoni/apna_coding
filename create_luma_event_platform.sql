-- 1. Create Calendars Table
CREATE TABLE IF NOT EXISTS calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_wallet TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  theme_color TEXT DEFAULT '#000000',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create Calendar Follows Table
CREATE TABLE IF NOT EXISTS calendar_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID REFERENCES calendars(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(calendar_id, wallet_address)
);

-- 3. Add new columns to events table if they don't exist
ALTER TABLE events ADD COLUMN IF NOT EXISTS conducting_type TEXT DEFAULT 'external';
ALTER TABLE events ADD COLUMN IF NOT EXISTS calendar_id UUID REFERENCES calendars(id) ON DELETE SET NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS location_type TEXT DEFAULT 'physical';
ALTER TABLE events ADD COLUMN IF NOT EXISTS virtual_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS capacity INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS require_approval BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- 4. Add new columns to hackathons table if they don't exist
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS conducting_type TEXT DEFAULT 'external';
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS calendar_id UUID REFERENCES calendars(id) ON DELETE SET NULL;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS location_type TEXT DEFAULT 'physical';
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS virtual_url TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS capacity INTEGER;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS require_approval BOOLEAN DEFAULT false;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN DEFAULT false;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- 5. Create Registration Fields Table (Custom RSVP Questions)
CREATE TABLE IF NOT EXISTS registration_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text', -- 'text' | 'select' | 'checkbox'
  options TEXT[], -- options for select lists
  required BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0
);

-- 6. Create Registrations Table (Unified RSVPs for Events & Hackathons)
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'registered', -- 'registered' | 'pending' | 'approved' | 'declined' | 'waitlist' | 'checked_in' | 'cancelled'
  answers JSONB DEFAULT '{}'::jsonb,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  checked_in_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(event_id, wallet_address),
  UNIQUE(hackathon_id, wallet_address)
);

-- 7. Set up RLS Policies for Public Read access & Authenticated user modifications
ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read calendars" ON calendars;
DROP POLICY IF EXISTS "Allow owner insert calendars" ON calendars;
DROP POLICY IF EXISTS "Allow owner update calendars" ON calendars;
DROP POLICY IF EXISTS "Allow owner delete calendars" ON calendars;

CREATE POLICY "Allow public read calendars" ON calendars FOR SELECT USING (true);
CREATE POLICY "Allow owner insert calendars" ON calendars FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow owner update calendars" ON calendars FOR UPDATE USING (true);
CREATE POLICY "Allow owner delete calendars" ON calendars FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read calendar_follows" ON calendar_follows;
DROP POLICY IF EXISTS "Allow auth insert calendar_follows" ON calendar_follows;
DROP POLICY IF EXISTS "Allow owner delete calendar_follows" ON calendar_follows;

CREATE POLICY "Allow public read calendar_follows" ON calendar_follows FOR SELECT USING (true);
CREATE POLICY "Allow auth insert calendar_follows" ON calendar_follows FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow owner delete calendar_follows" ON calendar_follows FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read registration_fields" ON registration_fields;
DROP POLICY IF EXISTS "Allow host manage registration_fields" ON registration_fields;

CREATE POLICY "Allow public read registration_fields" ON registration_fields FOR SELECT USING (true);
CREATE POLICY "Allow host manage registration_fields" ON registration_fields FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read registrations" ON registrations;
DROP POLICY IF EXISTS "Allow public insert registrations" ON registrations;
DROP POLICY IF EXISTS "Allow host manage registrations" ON registrations;

CREATE POLICY "Allow public read registrations" ON registrations FOR SELECT USING (true);
CREATE POLICY "Allow public insert registrations" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow host manage registrations" ON registrations FOR ALL USING (true);
