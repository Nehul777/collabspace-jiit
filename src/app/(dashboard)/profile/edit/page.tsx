import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { EditProfileForm } from '@/components/profile/edit-profile-form';

export default async function EditProfilePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select(`
    *,
    user_skills(skill_id),
    user_roles(role_id),
    user_hardware(id, type, specs)
  `).eq('id', user.id).single();

  const { data: allSkills } = await supabase.from('skills').select('*').order('name');
  const { data: allRoles } = await supabase.from('roles').select('*').order('name');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <EditProfileForm 
        profile={profile} 
        allSkills={allSkills || []} 
        allRoles={allRoles || []} 
      />
    </div>
  );
}
