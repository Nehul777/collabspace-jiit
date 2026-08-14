import { CreatePitchForm } from '@/components/projects/create-pitch-form';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Create a New Pitch | JIIT Matchmaker',
};

export default async function NewPitchPage() {
  const supabase = await createClient();

  const [{ data: skills }, { data: roles }] = await Promise.all([
    supabase.from('skills').select('*').order('name'),
    supabase.from('roles').select('*').order('name'),
  ]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create a New Pitch</h1>
        <p className="text-gray-400">Share your project idea and find the right teammates.</p>
      </div>
      <CreatePitchForm allSkills={skills || []} allRoles={roles || []} />
    </div>
  );
}
