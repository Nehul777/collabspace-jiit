'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface EditPitchFormProps {
  project: {
    id: string;
    title: string;
    description: string;
    max_members: number;
    status: string;
  };
}

export function EditPitchForm({ project }: EditPitchFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState(project.title || '');
  const [description, setDescription] = useState(project.description || '');
  const [maxMembers, setMaxMembers] = useState(project.max_members || 5);
  const [status, setStatus] = useState(project.status || 'recruiting');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('projects').update({
        title,
        description,
        max_members: maxMembers,
        status: status
      }).eq('id', project.id);

      if (error) throw error;
      
      router.push(`/projects/${project.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating pitch:', error);
      alert('Failed to update project.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('projects').delete().eq('id', project.id);
      if (error) throw error;
      
      router.push(`/projects`);
      router.refresh();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-surface/50 border border-white/10 rounded-xl p-8 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Project Title</label>
          <input
            type="text"
            required
            maxLength={100}
            className="w-full bg-elevated border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Pitch Description</label>
          <textarea
            required
            rows={6}
            className="w-full bg-elevated border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors resize-none"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Members</label>
            <input
              type="number"
              min={1}
              max={20}
              className="w-full bg-elevated border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors"
              value={maxMembers}
              onChange={e => setMaxMembers(parseInt(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              className="w-full bg-elevated border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="recruiting">Recruiting</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors font-medium text-sm disabled:opacity-50"
          >
            Delete Project
          </button>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="px-6 py-2 border border-white/10 hover:bg-white/5 rounded-xl transition-colors font-medium text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-accent to-tertiary hover:opacity-90 text-white rounded-xl transition-all shadow-[0_0_15px_var(--color-accent-glow)] font-medium text-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
