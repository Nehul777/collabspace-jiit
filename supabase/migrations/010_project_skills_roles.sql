-- Migration 010: Project Skills and Roles atomic updates
BEGIN;

-- Atomic update for project_required_skills
CREATE OR REPLACE FUNCTION public.update_project_skills(
  p_project_id UUID, p_skill_ids UUID[]
) RETURNS VOID AS $$
BEGIN
  -- Verify the caller is the project owner
  IF auth.uid() != (SELECT created_by FROM public.projects WHERE id = p_project_id) THEN
    RAISE EXCEPTION 'Not authorized to update project skills';
  END IF;

  DELETE FROM public.project_required_skills WHERE project_id = p_project_id;
  INSERT INTO public.project_required_skills (project_id, skill_id)
  SELECT p_project_id, unnest(p_skill_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic update for project_open_roles
CREATE OR REPLACE FUNCTION public.update_project_roles(
  p_project_id UUID, p_role_ids UUID[]
) RETURNS VOID AS $$
BEGIN
  -- Verify the caller is the project owner
  IF auth.uid() != (SELECT created_by FROM public.projects WHERE id = p_project_id) THEN
    RAISE EXCEPTION 'Not authorized to update project roles';
  END IF;

  DELETE FROM public.project_open_roles WHERE project_id = p_project_id;
  INSERT INTO public.project_open_roles (project_id, role_id, count)
  SELECT p_project_id, unnest(p_role_ids), 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
