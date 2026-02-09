-- Force RLS for table owners (postgres/service_role) on all 6 tables
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.vorsorge_data FORCE ROW LEVEL SECURITY;
ALTER TABLE public.person_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.share_tokens FORCE ROW LEVEL SECURITY;
ALTER TABLE public.share_token_access_log FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;