'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function CreatePitchForm() {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase.from('projects').insert({
        title,
        description,
        max_members: maxMembers,
        creator_id: userData.user.id,
        status: 'Recruiting'
      }).select().single();

      if (error) throw error;
      
      // Auto-add creator as first member
      await supabase.from('project_members').insert({
        project_id: data.id,
        user_id: userData.user.id,
        role: 'Creator',
        status: 'Approved'
      });

      router.push(`/projects/${data.id}`);
    } catch (error) {
      console.error('Error creating pitch:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-bg-surface/50 border border-white/10 rounded-xl p-8 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Project Title</label>
          <input
            type="text"
            required
            maxLength={100}
            className="w-full bg-bg-elevated border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="E.g. AI-Powered Study Assistant"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            required
            rows={5}
            className="w-full bg-bg-elevated border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors resize-none"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your project, the problem it solves, and what you're looking for..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Max Team Members</label>
          <input
            type="number"
            min={1}
            max={10}
            className="w-full bg-bg-elevated border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors"
            value={maxMembers}
            onChange={e => setMaxMembers(parseInt(e.target.value) || 5)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-3 rounded-md transition-colors disabled:opacity-50 mt-4"
        >
          {loading ? 'Creating...' : 'Create Pitch'}
        </button>
      </form>
    </div>
  );
}
