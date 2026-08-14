-- Migration 009: P1 Security Audit Fixes (P1-1, P1-4)
BEGIN;

-- ============================================================================
-- Fix P1-1: Atomic Profile Updates via RPC
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_user_skills(
  p_user_id UUID, p_skill_ids UUID[]
) RETURNS VOID AS $$
BEGIN
  DELETE FROM public.user_skills WHERE user_id = p_user_id;
  INSERT INTO public.user_skills (user_id, skill_id)
  SELECT p_user_id, unnest(p_skill_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_user_roles(
  p_user_id UUID, p_role_ids UUID[]
) RETURNS VOID AS $$
BEGIN
  DELETE FROM public.user_roles WHERE user_id = p_user_id;
  INSERT INTO public.user_roles (user_id, role_id)
  SELECT p_user_id, unnest(p_role_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Fix P1-4: Rate Limiting
-- ============================================================================
-- Limit each user to max 10 active projects
CREATE OR REPLACE FUNCTION public.limit_user_projects()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT count(*) FROM public.projects WHERE created_by = NEW.created_by) >= 10 THEN
    RAISE EXCEPTION 'Maximum project limit reached (10 projects maximum).';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_limit_projects ON public.projects;
CREATE TRIGGER tr_limit_projects
BEFORE INSERT ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.limit_user_projects();

-- Limit join requests to prevent spam
CREATE OR REPLACE FUNCTION public.limit_user_join_requests()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT count(*) FROM public.join_requests WHERE user_id = NEW.user_id AND status = 'pending') >= 20 THEN
    RAISE EXCEPTION 'You have too many pending join requests. Please wait for them to be accepted or rejected.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_limit_join_requests ON public.join_requests;
CREATE TRIGGER tr_limit_join_requests
BEFORE INSERT ON public.join_requests
FOR EACH ROW EXECUTE FUNCTION public.limit_user_join_requests();

COMMIT;
