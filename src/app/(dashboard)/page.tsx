import { PitchBoard } from '@/components/projects/pitch-board';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Fetch initial projects with simple join for profiles
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      profiles:creator_id (
        id, display_name, avatar_url
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <PitchBoard initialProjects={projects || []} />
    </div>
  );
}
