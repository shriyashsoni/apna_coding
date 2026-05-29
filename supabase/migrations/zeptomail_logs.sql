-- APNA CODING - ZEPTO MAIL TRANSACTION LOGS TABLE
-- Run this in your Supabase SQL Editor to save webhook events

CREATE TABLE IF NOT EXISTS public.zeptomail_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    mail_id TEXT,
    recipient TEXT NOT NULL,
    sender TEXT NOT NULL,
    subject TEXT,
    bounce_type TEXT,
    bounce_reason TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    raw_payload JSONB
);

-- Enable RLS
ALTER TABLE public.zeptomail_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow webhook insertions
CREATE POLICY "Allow insertions to zeptomail_logs" 
ON public.zeptomail_logs 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow admin read access
CREATE POLICY "Allow admin read access to zeptomail_logs" 
ON public.zeptomail_logs 
FOR SELECT 
USING (true); -- Allow simple select for admin views
