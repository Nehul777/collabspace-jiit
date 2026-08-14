import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { EditPitchForm } from '@/components/projects/edit-pitch-form';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const projectId = resolvedParams?.id;
  if (!projectId) return notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  const isAdmin = profile?.is_admin === true;

  const [
    { data: project },
    { data: skills },
    { data: roles },
    { data: projectSkills },
    { data: projectRoles }
  ] = await Promise.all([
    supabase.from('projects').select('*').eq('id', projectId).single(),
    supabase.from('skills').select('*').order('name'),
    supabase.from('roles').select('*').order('name'),
    supabase.from('project_required_skills').select('skill_id').eq('project_id', projectId),
    supabase.from('project_open_roles').select('role_id').eq('project_id', projectId)
  ]);

  if (!project) {
    notFound();
  }

  // Check permissions
  const isOwner = project.created_by === user.id || isAdmin;
  if (!isOwner) {
    redirect(`/projects/${projectId}`); // Unauthorized
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Edit Project</h1>
        <p className="text-white/50 text-sm">Update your project details or change its status.</p>
      </div>

      <EditPitchForm 
        project={project} 
        allSkills={skills || []}
        allRoles={roles || []}
        selectedSkills={projectSkills?.map(s => s.skill_id) || []}
        selectedRoles={projectRoles?.map(r => r.role_id) || []}
      />
    </div>
  );
}
