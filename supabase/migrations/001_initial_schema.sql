BEGIN;

-- Custom Types
CREATE TYPE skill_category AS ENUM (
    'language', 'framework', 'tool', 'concept', 'database', 'cloud', 'other'
);

-- ============================================================================
-- 1. profiles
-- ============================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    batch TEXT,
    enrollment_no TEXT UNIQUE,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. skills
-- ============================================================================
CREATE TABLE public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category skill_category NOT NULL
);

-- Seed Data for skills
INSERT INTO public.skills (name, category) VALUES
    ('C++', 'language'), ('Python', 'language'), ('JavaScript', 'language'),
    ('TypeScript', 'language'), ('Java', 'language'), ('Go', 'language'),
    ('Rust', 'language'), ('React', 'framework'), ('Next.js', 'framework'),
    ('Node.js', 'framework'), ('Express', 'framework'), ('Django', 'framework'),
    ('Flask', 'framework'), ('Spring Boot', 'framework'), ('TensorFlow', 'tool'),
    ('PyTorch', 'tool'), ('Docker', 'tool'), ('Kubernetes', 'tool'),
    ('Git', 'tool'), ('Figma', 'tool'), ('Blender', 'tool'), ('Unity', 'tool'),
    ('AWS', 'cloud'), ('GCP', 'cloud'), ('Azure', 'cloud'),
    ('PostgreSQL', 'database'), ('MongoDB', 'database'), ('Redis', 'database'),
    ('MySQL', 'database'), ('Data Structures', 'concept'),
    ('Algorithms', 'concept'), ('Machine Learning', 'concept'),
    ('Deep Learning', 'concept'), ('Computer Vision', 'concept'),
    ('NLP', 'concept'), ('Cybersecurity', 'concept'),
    ('Blockchain', 'concept'), ('IoT', 'concept'),
    ('Embedded Systems', 'concept'), ('Android', 'framework'),
    ('iOS', 'framework'), ('Flutter', 'framework'), ('React Native', 'framework');

-- ============================================================================
-- 3. roles
-- ============================================================================
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL
);

-- Seed Data for roles
INSERT INTO public.roles (name) VALUES
    ('Frontend Developer'), ('Backend Developer'), ('Full Stack Developer'),
    ('ML Engineer'), ('Data Scientist'), ('UI/UX Designer'),
    ('DevOps Engineer'), ('Mobile Developer'), ('Game Developer'),
    ('Project Manager'), ('Hardware Specialist');

-- ============================================================================
-- 4. user_skills
-- ============================================================================
CREATE TABLE public.user_skills (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, skill_id)
);

-- ============================================================================
-- 5. user_roles
-- ============================================================================
CREATE TABLE public.user_roles (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- ============================================================================
-- 6. user_hardware
-- ============================================================================
CREATE TABLE public.user_hardware (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    description TEXT
);

-- ============================================================================
-- 7. projects
-- ============================================================================
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT CHECK (status IN ('recruiting', 'in_progress', 'completed', 'archived')) DEFAULT 'recruiting',
    max_members INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. project_required_skills
-- ============================================================================
CREATE TABLE public.project_required_skills (
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, skill_id)
);

-- ============================================================================
-- 9. project_open_roles
-- ============================================================================
CREATE TABLE public.project_open_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 1,
    filled BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- 10. project_members
-- ============================================================================
CREATE TABLE public.project_members (
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (project_id, user_id)
);

-- ============================================================================
-- 11. join_requests
-- ============================================================================
CREATE TABLE public.join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- ============================================================================
-- 12. invitations
-- ============================================================================
CREATE TABLE public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    invited_user UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, invited_user)
);

-- ============================================================================
-- 13. chat_rooms
-- ============================================================================
CREATE TABLE public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 14. messages
-- ============================================================================
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    reply_to UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 15. notifications
-- ============================================================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Triggers and Functions
-- ============================================================================

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Restrict email domain to mail.jiit.ac.in
CREATE OR REPLACE FUNCTION public.restrict_email_domain()
RETURNS TRIGGER AS $$
BEGIN
    IF new.email NOT LIKE '%@mail.jiit.ac.in' THEN
        RAISE EXCEPTION 'Only @mail.jiit.ac.in emails are allowed';
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_before_insert
    BEFORE INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.restrict_email_domain();

-- Auto create chat room on project creation
CREATE OR REPLACE FUNCTION public.handle_new_project()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.chat_rooms (project_id)
    VALUES (new.id);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_created
    AFTER INSERT ON public.projects
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_project();


-- Function to check if a user is a member of a project (SECURITY DEFINER for RLS policies)
CREATE OR REPLACE FUNCTION public.is_project_member(project_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.project_members pm
        WHERE pm.project_id = is_project_member.project_id
        AND pm.user_id = is_project_member.user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is a member of a chat room's project (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_room_member(room_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    associated_project_id UUID;
BEGIN
    SELECT project_id INTO associated_project_id
    FROM public.chat_rooms cr
    WHERE cr.id = is_room_member.room_id;

    RETURN public.is_project_member(associated_project_id, is_room_member.user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- RLS Policies
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_hardware ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_required_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_open_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- skills/roles
CREATE POLICY "Skills viewable by all authenticated" ON public.skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Roles viewable by all authenticated" ON public.roles FOR SELECT TO authenticated USING (true);

-- user_skills / user_roles / user_hardware
CREATE POLICY "User skills viewable by all" ON public.user_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "User skills editable by owner" ON public.user_skills FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "User roles viewable by all" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "User roles editable by owner" ON public.user_roles FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "User hardware viewable by all" ON public.user_hardware FOR SELECT TO authenticated USING (true);
CREATE POLICY "User hardware editable by owner" ON public.user_hardware FOR ALL TO authenticated USING (auth.uid() = user_id);

-- projects / project_required_skills / project_open_roles
CREATE POLICY "Projects viewable by all authenticated" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Projects creatable by authenticated" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Projects editable by creator" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Project required skills viewable by all" ON public.project_required_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Project required skills editable by creator" ON public.project_required_skills FOR ALL TO authenticated USING (auth.uid() = (SELECT created_by FROM public.projects WHERE id = project_id));

CREATE POLICY "Project open roles viewable by all" ON public.project_open_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Project open roles editable by creator" ON public.project_open_roles FOR ALL TO authenticated USING (auth.uid() = (SELECT created_by FROM public.projects WHERE id = project_id));

-- project_members
CREATE POLICY "Project members viewable by all" ON public.project_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Project members insertable by project owner" ON public.project_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = (SELECT created_by FROM public.projects WHERE id = project_id));
CREATE POLICY "Project members deletable by owner or self" ON public.project_members FOR DELETE TO authenticated USING (auth.uid() = (SELECT created_by FROM public.projects WHERE id = project_id) OR auth.uid() = user_id);

-- join_requests
CREATE POLICY "Join requests viewable by requester or owner" ON public.join_requests FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = (SELECT created_by FROM public.projects WHERE id = project_id));
CREATE POLICY "Join requests creatable by authenticated" ON public.join_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Join requests updatable by project owner" ON public.join_requests FOR UPDATE TO authenticated USING (auth.uid() = (SELECT created_by FROM public.projects WHERE id = project_id));

-- invitations
CREATE POLICY "Invitations viewable by inviter or invitee" ON public.invitations FOR SELECT TO authenticated USING (auth.uid() = invited_by OR auth.uid() = invited_user);
CREATE POLICY "Invitations creatable by project members" ON public.invitations FOR INSERT TO authenticated WITH CHECK (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "Invitations updatable by invitee" ON public.invitations FOR UPDATE TO authenticated USING (auth.uid() = invited_user);

-- chat_rooms
CREATE POLICY "Chat rooms viewable by project members" ON public.chat_rooms FOR SELECT TO authenticated USING (public.is_project_member(project_id, auth.uid()));

-- messages
CREATE POLICY "Messages viewable by room members" ON public.messages FOR SELECT TO authenticated USING (public.is_room_member(room_id, auth.uid()));
CREATE POLICY "Messages insertable by room members" ON public.messages FOR INSERT TO authenticated WITH CHECK (public.is_room_member(room_id, auth.uid()) AND auth.uid() = user_id);

-- notifications
CREATE POLICY "Notifications viewable by recipient" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Notifications updatable by recipient" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_created_by ON public.projects(created_by);
CREATE INDEX idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX idx_project_members_user_id ON public.project_members(user_id);
CREATE INDEX idx_messages_room_id ON public.messages(room_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- ============================================================================
-- Realtime Publication
-- ============================================================================
-- Add tables to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

COMMIT;
