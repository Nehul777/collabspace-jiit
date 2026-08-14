import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ApplicationManager } from '@/components/applications/application-manager';

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    isAdmin = profile?.is_admin === true;
  }

  return (
    <div className="p-6 md:p-8 h-[calc(100vh-4rem)] overflow-y-auto">
      <ApplicationManager userId={user.id} isAdmin={isAdmin} />
    </div>
  );
}
