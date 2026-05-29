import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yjgjfurrvyvhncjxqcre.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZ2pmdXJydnl2aG5janhxY3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODkzNjQsImV4cCI6MjA5NDI2NTM2NH0.6n15TfLnuAfWCRF8oT2P0F5TooeiLHi3P79XpLF3o1I';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Database environment variables are missing; using local offline simulation.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
