import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EditProfileForm } from '@/components/profile/edit-profile-form';

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ targetId?: string }> | { targetId?: string };
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const targetIdParam = resolvedSearchParams?.targetId;

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Check if current user is admin
  const { data: currentUserProfile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  const isAdmin = currentUserProfile?.is_admin === true;

  // Determine target user ID to edit
  let targetUserId = user.id;
  if (targetIdParam && (isAdmin || targetIdParam === user.id)) {
    targetUserId = targetIdParam;
  }

  const { data: profile } = await supabase.from('profiles').select(`
    *,
    user_skills(skill_id),
    user_roles(role_id),
    user_hardware(id, label, description)
  `).eq('id', targetUserId).single();

  const { data: allSkills } = await supabase.from('skills').select('*').order('name');
  const { data: allRoles } = await supabase.from('roles').select('*').order('name');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {targetUserId !== user.id && (
        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-200 text-sm font-medium flex items-center justify-between">
          <span>🛡️ Admin Mode: You are editing <strong>{profile?.display_name}'s</strong> profile.</span>
        </div>
      )}
      <EditProfileForm 
        profile={profile} 
        allSkills={allSkills || []} 
        allRoles={allRoles || []} 
        targetUserId={targetUserId}
        isAdmin={isAdmin}
      />
    </div>
  );
}
