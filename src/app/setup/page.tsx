import { redirect } from 'next/navigation';
import { ProfileSetupWizard } from '@/components/profile/profile-setup-wizard';
import { createClient } from '@/lib/supabase/server';

export default async function SetupPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('enrollment_no').eq('id', user.id).single();
  if (profile?.enrollment_no) {
    redirect('/dashboard');
  }

  const { data: skills } = await supabase.from('skills').select('*').order('name');
  const { data: roles } = await supabase.from('roles').select('*').order('name');

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <ProfileSetupWizard skills={skills || []} roles={roles || []} />
    </div>
  );
}
