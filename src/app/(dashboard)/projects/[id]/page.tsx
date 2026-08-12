import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      profiles:creator_id (
        id, display_name, avatar_url
      )
    `)
    .eq('id', params.id)
    .single();

  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-bg-surface/30 border border-white/5 rounded-2xl p-8 backdrop-blur-sm">
        <h1 className="text-4xl font-bold text-white mb-4">{project.title}</h1>
        <div className="flex items-center gap-4 mb-8 text-sm text-gray-400">
          <span className="text-accent">{project.status}</span>
          <span>•</span>
          <span>Created by {project.profiles?.display_name}</span>
        </div>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {project.description}
          </p>
        </div>
      </div>
    </div>
  );
}
