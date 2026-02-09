
-- Explicitly deny anonymous SELECT access to profiles
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles FOR SELECT TO anon USING (false);

-- Explicitly deny anonymous SELECT access to person_profiles
CREATE POLICY "Deny anonymous access to person_profiles"
ON public.person_profiles FOR SELECT TO anon USING (false);

-- Also deny anon on other sensitive tables for consistency
CREATE POLICY "Deny anonymous access to vorsorge_data"
ON public.vorsorge_data FOR SELECT TO anon USING (false);

CREATE POLICY "Deny anonymous access to share_tokens"
ON public.share_tokens FOR SELECT TO anon USING (false);

CREATE POLICY "Deny anonymous access to user_roles"
ON public.user_roles FOR SELECT TO anon USING (false);
