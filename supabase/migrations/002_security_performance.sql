-- 002_security_performance.sql
-- Contains Security patches, Concurrency controls, and Performance Indexes

-- 1. Security: Add missing DELETE policy for projects
CREATE POLICY "Projects deletable by creator" ON public.projects FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- 2. Concurrency: Safe Role Enrollment Function to prevent race conditions
CREATE OR REPLACE FUNCTION accept_join_request(req_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_project_id UUID;
    v_role_id UUID;
    v_user_id UUID;
    v_filled INT;
    v_required INT;
BEGIN
    -- Get request details
    SELECT project_id, role_id, user_id INTO v_project_id, v_role_id, v_user_id 
    FROM public.join_requests 
    WHERE id = req_id AND status = 'Pending';
    
    IF v_project_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Lock the role row for update to prevent race conditions
    SELECT filled_count, required_count INTO v_filled, v_required
    FROM public.project_open_roles
    WHERE id = v_role_id
    FOR UPDATE;
    
    -- Check if there is still room
    IF v_filled >= v_required THEN
        -- Auto-reject since it's full
        UPDATE public.join_requests SET status = 'Rejected' WHERE id = req_id;
        RETURN FALSE;
    END IF;

    -- Update counts and insert member
    UPDATE public.project_open_roles SET filled_count = filled_count + 1 WHERE id = v_role_id;
    
    INSERT INTO public.project_members (project_id, user_id, role_id, status)
    VALUES (v_project_id, v_user_id, v_role_id, 'Active');
    
    -- Mark request as accepted
    UPDATE public.join_requests SET status = 'Accepted' WHERE id = req_id;
    
    RETURN TRUE;
END;
$$;

-- 3. Performance: Indexes for Matchmaking Queries
-- Index on profiles for filtering by batch and enrollment_no
CREATE INDEX IF NOT EXISTS idx_profiles_batch ON public.profiles(batch);
CREATE INDEX IF NOT EXISTS idx_profiles_enrollment ON public.profiles(enrollment_no);

-- Index on user_skills for fast skill lookups
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON public.user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);

-- Index on project_skills for fast project filtering
CREATE INDEX IF NOT EXISTS idx_project_skills_skill_id ON public.project_skills(skill_id);
