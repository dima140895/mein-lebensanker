-- Remove FORCE RLS from remaining tables so SECURITY DEFINER functions work correctly
-- Normal RLS still protects all non-owner roles (anon, authenticated)
ALTER TABLE public.vorsorge_data NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.share_tokens NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.share_token_access_log NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles NO FORCE ROW LEVEL SECURITY;