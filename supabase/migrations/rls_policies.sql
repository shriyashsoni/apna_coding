-- Row Level Security (RLS) Policies for Apna Coding

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- 1. USERS Table
-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- 2. COMMUNITIES, NEWS, HACKATHONS, EVENTS, JOBS
-- Allow everyone to read approved content
CREATE POLICY "Anyone can read approved content" ON communities FOR SELECT USING (status = 'approved');
CREATE POLICY "Anyone can read approved news" ON news FOR SELECT USING (status = 'approved');
CREATE POLICY "Anyone can read approved hackathons" ON hackathons FOR SELECT USING (status = 'approved');
CREATE POLICY "Anyone can read approved events" ON events FOR SELECT USING (status = 'approved');
CREATE POLICY "Anyone can read approved jobs" ON jobs FOR SELECT USING (status = 'approved');

-- Allow creators to see their own pending content
CREATE POLICY "Creators can view their own content" ON communities FOR SELECT USING (wallet_address = (SELECT wallet_address FROM users WHERE id = auth.uid()));
-- (Repeat for others...)

-- Allow admins full access
CREATE POLICY "Admins have full access to communities" ON communities FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- 3. NEWS_COMMENTS
-- Anyone can read comments
CREATE POLICY "Anyone can read comments" ON news_comments FOR SELECT USING (true);

-- Authenticated users can post comments
CREATE POLICY "Authenticated users can post comments" ON news_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Owners can delete their own comments
CREATE POLICY "Users can delete their own comments" ON news_comments
  FOR DELETE USING (user_id = auth.uid());

-- 4. CERTIFICATES
-- Anyone can read verified certificates
CREATE POLICY "Anyone can read verified certificates" ON certificates FOR SELECT USING (verified = true);

-- Users can read their own unverified certificates
CREATE POLICY "Users can read their own certificates" ON certificates FOR SELECT USING (user_id = auth.uid());

-- Admins can manage certificates
CREATE POLICY "Admins can manage certificates" ON certificates FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- 5. AI_AGENT_JOBS
-- Only admins can see and manage AI jobs
CREATE POLICY "Admins can manage AI jobs" ON ai_agent_jobs FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
