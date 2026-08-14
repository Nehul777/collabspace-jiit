'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SkillSelector } from '@/components/profile/skill-selector';
import { RoleSelector } from '@/components/profile/role-selector';
import { projectSchema } from '@/lib/validations/project';

interface CreatePitchFormProps {
  allSkills: any[];
  allRoles: any[];
}

export function CreatePitchForm({ allSkills, allRoles }: CreatePitchFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(5);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Zod Validation
    const result = projectSchema.safeParse({
      title,
      description,
      max_members: maxMembers,
      skills: selectedSkills,
      roles: selectedRoles,
    });

    if (!result.success) {
      alert(result.error.issues[0].message);
      return;
    }

    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase.from('projects').insert({
        title: result.data.title,
        description: result.data.description,
        max_members: result.data.max_members,
        created_by: userData.user.id,
        status: 'recruiting'
      }).select().single();

      if (error) throw error;
      
      // Auto-add creator as first member
      await supabase.from('project_members').insert({
        project_id: data.id,
        user_id: userData.user.id,
        role: 'Creator',
      });

      // Add required skills
      if (result.data.skills.length > 0) {
        await supabase.from('project_required_skills').insert(
          result.data.skills.map(skill_id => ({ project_id: data.id, skill_id }))
        );
      }

      // Add open roles
      if (result.data.roles.length > 0) {
        await supabase.from('project_open_roles').insert(
          result.data.roles.map(role_id => ({ project_id: data.id, role_id, count: 1 }))
        );
      }

      router.push(`/projects/${data.id}`);
    } catch (error: any) {
      console.error('Error creating pitch:', error);
      alert(error.message || 'Failed to create pitch');
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
            max={20}
            className="w-full bg-bg-elevated border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors"
            value={maxMembers}
            onChange={e => setMaxMembers(parseInt(e.target.value) || 5)}
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-white/10">
          <h3 className="text-lg font-medium text-white">Required Skills</h3>
          <p className="text-sm text-white/50 mb-2">Select the technologies your team needs.</p>
          <SkillSelector 
            skills={allSkills} 
            selectedSkills={selectedSkills} 
            onChange={setSelectedSkills} 
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-white/10">
          <h3 className="text-lg font-medium text-white">Open Roles</h3>
          <p className="text-sm text-white/50 mb-2">What roles are you hiring for?</p>
          <RoleSelector 
            roles={allRoles} 
            selectedRoles={selectedRoles} 
            onChange={setSelectedRoles} 
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
