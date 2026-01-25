-- Ensure Row Level Security is explicitly enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Ensure Row Level Security is explicitly enabled on share_tokens table
ALTER TABLE public.share_tokens ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners as well (extra security)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.share_tokens FORCE ROW LEVEL SECURITY;