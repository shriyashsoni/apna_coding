-- APNA CODING - FULL DATABASE SCHEMA SETUP
-- Run this in your Supabase SQL Editor to create all necessary tables and policies.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT,
    username TEXT,
    name TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user', -- 'user' or 'admin'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- JOBS TABLE
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT,
    location TEXT,
    type TEXT DEFAULT 'full-time',
    salary TEXT,
    link TEXT,
    wallet_address TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENT GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.event_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_name TEXT NOT NULL,
    location TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMPTZ,
    location TEXT,
    type TEXT,
    registration_link TEXT,
    website_url TEXT, -- Used in some components
    image_url TEXT,
    wallet_address TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    group_id UUID REFERENCES public.event_groups(id),
    on_chain_id TEXT, -- For staking
    staking_tx_hash TEXT, -- For staking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HACKATHONS TABLE
CREATE TABLE IF NOT EXISTS public.hackathons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT, -- Some code uses name, some uses title
    title TEXT,
    description TEXT,
    prizes TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    location TEXT,
    organizer TEXT,
    registration_link TEXT,
    image TEXT, -- used in PublicSubmissionDialog
    wallet_address TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'ended'
    slug TEXT UNIQUE,
    on_chain_id TEXT, -- For staking
    staking_tx_hash TEXT, -- For staking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMMUNITIES TABLE
CREATE TABLE IF NOT EXISTS public.communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    tagline TEXT,
    description TEXT,
    logo TEXT,
    cover_image TEXT,
    website TEXT,
    twitter TEXT,
    discord TEXT,
    telegram TEXT,
    github TEXT,
    category TEXT,
    tags TEXT[],
    member_count INTEGER DEFAULT 0,
    founded TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    partnership_type TEXT DEFAULT 'community',
    partner_category TEXT DEFAULT 'community',
    wallet_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NEWS TABLE
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    content TEXT,
    excerpt TEXT,
    category TEXT DEFAULT 'announcement',
    tags TEXT[],
    cover_image TEXT, -- some code uses image_url
    image_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    wallet_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    category TEXT,
    price TEXT,
    website_url TEXT,
    github_url TEXT,
    image_url TEXT,
    tags TEXT[],
    status TEXT DEFAULT 'pending', -- 'pending', 'approved'
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    wallet_address TEXT,
    on_chain_id TEXT, -- For staking
    staking_tx_hash TEXT, -- For staking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LEADERBOARD TABLE
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    rank INTEGER,
    achievements TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HACKATHON TEAMS / REGISTRATIONS
CREATE TABLE IF NOT EXISTS public.hackathon_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hackathon_id UUID REFERENCES public.hackathons(id),
    team_name TEXT,
    wallet_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS POLICIES (Simplified for Admin + Public Read)

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_teams ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid duplicates)
-- Note: This part might need to be specific to your current policies.

-- USERS POLICIES
CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid()::text = wallet_address);
CREATE POLICY "Admins can do anything on users" ON public.users ALL USING (EXISTS (SELECT 1 FROM public.users WHERE wallet_address = auth.uid()::text AND role = 'admin'));

-- JOBS POLICIES
CREATE POLICY "Approved jobs are viewable by everyone" ON public.jobs FOR SELECT USING (is_approved = true);
CREATE POLICY "Anyone can submit a job" ON public.jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage all jobs" ON public.jobs ALL USING (EXISTS (SELECT 1 FROM public.users WHERE wallet_address = auth.uid()::text AND role = 'admin'));

-- EVENTS POLICIES
CREATE POLICY "Approved events are viewable by everyone" ON public.events FOR SELECT USING (is_approved = true);
CREATE POLICY "Anyone can submit an event" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage all events" ON public.events ALL USING (EXISTS (SELECT 1 FROM public.users WHERE wallet_address = auth.uid()::text AND role = 'admin'));

-- HACKATHONS POLICIES
CREATE POLICY "Approved hackathons are viewable by everyone" ON public.hackathons FOR SELECT USING (is_approved = true);
CREATE POLICY "Anyone can submit a hackathon" ON public.hackathons FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage all hackathons" ON public.hackathons ALL USING (EXISTS (SELECT 1 FROM public.users WHERE wallet_address = auth.uid()::text AND role = 'admin'));

-- COMMUNITIES POLICIES
CREATE POLICY "Published communities are viewable by everyone" ON public.communities FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage all communities" ON public.communities ALL USING (EXISTS (SELECT 1 FROM public.users WHERE wallet_address = auth.uid()::text AND role = 'admin'));

-- NEWS POLICIES
CREATE POLICY "Published news are viewable by everyone" ON public.news FOR SELECT USING (is_published = true OR is_approved = true);
CREATE POLICY "Admins can manage all news" ON public.news ALL USING (EXISTS (SELECT 1 FROM public.users WHERE wallet_address = auth.uid()::text AND role = 'admin'));

-- PRODUCTS POLICIES
CREATE POLICY "Approved products are viewable by everyone" ON public.products FOR SELECT USING (status = 'approved');
CREATE POLICY "Anyone can submit a product" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage all products" ON public.products ALL USING (EXISTS (SELECT 1 FROM public.users WHERE wallet_address = auth.uid()::text AND role = 'admin'));

-- 4. HELPER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_hackathons_updated_at BEFORE UPDATE ON public.hackathons FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON public.communities FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
