ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Also refresh the Supabase schema cache just in case!
NOTIFY pgrst, 'reload schema';
