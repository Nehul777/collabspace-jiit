-- Migration 004: Admin Role & Authorization
-- Enables 992501030003@mail.jiit.ac.in as an Admin with permission to edit any student profile.

-- 1. Add is_admin column to public.profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Mark specified email as Admin in public.profiles
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE email = '992501030003@mail.jiit.ac.in';

-- 3. Trigger function to auto-assign is_admin = TRUE if email matches
CREATE OR REPLACE FUNCTION public.handle_admin_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = '992501030003@mail.jiit.ac.in' THEN
    NEW.is_admin := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_admin_assignment ON public.profiles;
CREATE TRIGGER tr_admin_assignment
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_admin_assignment();

-- 4. Helper function to check if requesting user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS Policies: Allow Admins write/edit permissions across all profiles & user tables

-- public.profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users or Admins can update profile" ON public.profiles;
CREATE POLICY "Users or Admins can update profile" ON public.profiles 
FOR UPDATE TO authenticated 
USING (auth.uid() = id OR public.is_admin());

-- public.user_skills
DROP POLICY IF EXISTS "User skills editable by owner" ON public.user_skills;
DROP POLICY IF EXISTS "User skills editable by owner or admin" ON public.user_skills;
CREATE POLICY "User skills editable by owner or admin" ON public.user_skills 
FOR ALL TO authenticated 
USING (auth.uid() = user_id OR public.is_admin());

-- public.user_roles
DROP POLICY IF EXISTS "User roles editable by owner" ON public.user_roles;
DROP POLICY IF EXISTS "User roles editable by owner or admin" ON public.user_roles;
CREATE POLICY "User roles editable by owner or admin" ON public.user_roles 
FOR ALL TO authenticated 
USING (auth.uid() = user_id OR public.is_admin());

-- public.user_hardware
DROP POLICY IF EXISTS "User hardware editable by owner" ON public.user_hardware;
DROP POLICY IF EXISTS "User hardware editable by owner or admin" ON public.user_hardware;
CREATE POLICY "User hardware editable by owner or admin" ON public.user_hardware 
FOR ALL TO authenticated 
USING (auth.uid() = user_id OR public.is_admin());

-- public.projects
DROP POLICY IF EXISTS "Projects editable by creator" ON public.projects;
DROP POLICY IF EXISTS "Projects editable by creator or admin" ON public.projects;
CREATE POLICY "Projects editable by creator or admin" ON public.projects 
FOR UPDATE TO authenticated 
USING (auth.uid() = created_by OR public.is_admin());
