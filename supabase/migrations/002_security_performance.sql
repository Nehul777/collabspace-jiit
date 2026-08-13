-- 002_security_performance.sql
-- Contains Security patches, Concurrency controls, and Performance Indexes

-- 1. Security: Add missing DELETE policy for projects
CREATE POLICY "Projects deletable by creator" ON public.projects FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- 2. Security: Ensure is_project_member helper function includes project creator
CREATE OR REPLACE FUNCTION public.is_project_member(project_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.project_members pm
        WHERE pm.project_id = is_project_member.project_id
        AND pm.user_id = is_project_member.user_id
    ) OR EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = is_project_member.project_id
        AND p.created_by = is_project_member.user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Concurrency: Safe Join Request Acceptance Function
CREATE OR REPLACE FUNCTION accept_join_request(req_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_project_id UUID;
    v_user_id UUID;
BEGIN
    -- Get request details
    SELECT project_id, user_id INTO v_project_id, v_user_id 
    FROM public.join_requests 
    WHERE id = req_id AND status = 'pending';
    
    IF v_project_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Insert member into project
    INSERT INTO public.project_members (project_id, user_id, role)
    VALUES (v_project_id, v_user_id, 'Member')
    ON CONFLICT (project_id, user_id) DO NOTHING;
    
    -- Mark request as accepted
    UPDATE public.join_requests SET status = 'accepted' WHERE id = req_id;
    
    RETURN TRUE;
END;
$$;

-- 4. Performance: Indexes for Matchmaking Queries
-- Index on profiles for filtering by batch and enrollment_no
CREATE INDEX IF NOT EXISTS idx_profiles_batch ON public.profiles(batch);
CREATE INDEX IF NOT EXISTS idx_profiles_enrollment ON public.profiles(enrollment_no);

-- Index on user_skills for fast skill lookups
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON public.user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);

-- Index on project_required_skills for fast project filtering
CREATE INDEX IF NOT EXISTS idx_project_required_skills_skill_id ON public.project_required_skills(skill_id);

