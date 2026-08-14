-- Migration 006: Admin Full Access to Projects and Applications
BEGIN;

-- public.projects
DROP POLICY IF EXISTS "Projects deletable by creator" ON public.projects;
DROP POLICY IF EXISTS "Projects deletable by creator or admin" ON public.projects;
CREATE POLICY "Projects deletable by creator or admin" ON public.projects 
FOR DELETE TO authenticated 
USING (auth.uid() = created_by OR public.is_admin());

-- public.join_requests
DROP POLICY IF EXISTS "Join requests viewable by requester or owner" ON public.join_requests;
DROP POLICY IF EXISTS "Join requests viewable by requester or owner or admin" ON public.join_requests;
CREATE POLICY "Join requests viewable by requester or owner or admin" ON public.join_requests 
FOR SELECT TO authenticated 
USING (
    auth.uid() = user_id OR 
    auth.uid() = (SELECT created_by FROM public.projects WHERE id = project_id) OR 
    public.is_admin()
);

DROP POLICY IF EXISTS "Join requests updatable by project owner" ON public.join_requests;
DROP POLICY IF EXISTS "Join requests updatable by project owner or admin" ON public.join_requests;
CREATE POLICY "Join requests updatable by project owner or admin" ON public.join_requests 
FOR UPDATE TO authenticated 
USING (
    auth.uid() = (SELECT created_by FROM public.projects WHERE id = project_id) OR 
    public.is_admin()
);

DROP POLICY IF EXISTS "Join requests deletable by project owner or admin" ON public.join_requests;
CREATE POLICY "Join requests deletable by project owner or admin" ON public.join_requests 
FOR DELETE TO authenticated 
USING (
    auth.uid() = (SELECT created_by FROM public.projects WHERE id = project_id) OR 
    public.is_admin()
);

-- public.project_required_skills
DROP POLICY IF EXISTS "Project required skills editable by creator" ON public.project_required_skills;
DROP POLICY IF EXISTS "Project required skills editable by creator or admin" ON public.project_required_skills;
CREATE POLICY "Project required skills editable by creator or admin" ON public.project_required_skills 
FOR ALL TO authenticated 
USING (
    auth.uid() = (SELECT created_by FROM public.projects WHERE id = project_id) OR 
    public.is_admin()
);

-- public.project_open_roles
DROP POLICY IF EXISTS "Project open roles editable by creator" ON public.project_open_roles;
DROP POLICY IF EXISTS "Project open roles editable by creator or admin" ON public.project_open_roles;
CREATE POLICY "Project open roles editable by creator or admin" ON public.project_open_roles 
FOR ALL TO authenticated 
USING (
    auth.uid() = (SELECT created_by FROM public.projects WHERE id = project_id) OR 
    public.is_admin()
);

-- public.project_members
DROP POLICY IF EXISTS "Project members insertable by project owner" ON public.project_members;
DROP POLICY IF EXISTS "Project members insertable by project owner or admin" ON public.project_members;
CREATE POLICY "Project members insertable by project owner or admin" ON public.project_members 
FOR INSERT TO authenticated 
WITH CHECK (
    auth.uid() = (SELECT created_by FROM public.projects WHERE id = project_id) OR 
    public.is_admin()
);

DROP POLICY IF EXISTS "Project members deletable by owner or self" ON public.project_members;
DROP POLICY IF EXISTS "Project members deletable by owner, self, or admin" ON public.project_members;
CREATE POLICY "Project members deletable by owner, self, or admin" ON public.project_members 
FOR DELETE TO authenticated 
USING (
    auth.uid() = (SELECT created_by FROM public.projects WHERE id = project_id) OR 
    auth.uid() = user_id OR
    public.is_admin()
);

COMMIT;
