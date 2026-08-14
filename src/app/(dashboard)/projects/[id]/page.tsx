import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProjectDetailView } from '@/components/projects/project-detail-view';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const projectId = resolvedParams?.id;
  if (!projectId) return notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      *,
      profiles:created_by (
        id, display_name, avatar_url
      ),
      project_members (
        user_id, role,
        profiles (id, display_name, avatar_url)
      ),
      project_required_skills (
        skill_id,
        skills (id, name)
      ),
      project_open_roles (
        id, count,
        roles (id, name)
      )
    `)
    .eq('id', projectId)
    .single();

  if (projectError) {
    console.error('Error fetching project:', projectError);
  }

  if (!project) {
    notFound();
  }

  const currentUserId = user?.id || null;
  
  let isAdmin = false;
  if (currentUserId) {
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', currentUserId).single();
    isAdmin = profile?.is_admin === true;
  }

  const isOwner = currentUserId ? (project.created_by === currentUserId || isAdmin) : false;
  const isMember = currentUserId
    ? project.project_members?.some((m: any) => m.user_id === currentUserId)
    : false;

  let existingRequest = null;
  if (currentUserId && !isOwner && !isMember) {
    const { data: req } = await supabase
      .from('join_requests')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('user_id', currentUserId)
      .maybeSingle();

    existingRequest = req;
  }

  return (
    <ProjectDetailView
      project={project}
      currentUserId={currentUserId}
      isOwner={isOwner}
      isMember={isMember}
      existingRequest={existingRequest}
    />
  );
}
