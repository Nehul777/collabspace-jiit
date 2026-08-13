import { createClient } from '@/lib/supabase/server';
import { StudentDirectory } from '@/components/students/student-directory';

export default async function StudentsPage() {
  const supabase = await createClient();

  const { data: initialStudents } = await supabase.from('profiles').select(`
    *,
    user_skills(skills(*)),
    user_roles(roles(*)),
    user_hardware(*)
  `).not('enrollment_no', 'is', null).order('created_at', { ascending: false }).limit(20);

  const { data: allSkills } = await supabase.from('skills').select('*').order('name');
  const { data: allRoles } = await supabase.from('roles').select('*').order('name');

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Find Students</h1>
        <p className="text-white/60">Discover the right teammates for your next project.</p>
      </div>

      <StudentDirectory 
        initialStudents={initialStudents || []}
        allSkills={allSkills || []}
        allRoles={allRoles || []}
      />
    </div>
  );
}
