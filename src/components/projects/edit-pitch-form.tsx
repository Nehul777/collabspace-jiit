'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SkillSelector } from '@/components/profile/skill-selector';
import { RoleSelector } from '@/components/profile/role-selector';
import { projectSchema } from '@/lib/validations/project';

interface EditPitchFormProps {
  project: {
    id: string;
    title: string;
    description: string;
    max_members: number;
    status: string;
  };
  allSkills: any[];
  allRoles: any[];
  selectedSkills: string[];
  selectedRoles: string[];
}

export function EditPitchForm({ project, allSkills, allRoles, selectedSkills: initialSkills, selectedRoles: initialRoles }: EditPitchFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState(project.title || '');
  const [description, setDescription] = useState(project.description || '');
  const [maxMembers, setMaxMembers] = useState(project.max_members || 5);
  const [status, setStatus] = useState(project.status || 'recruiting');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialSkills || []);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialRoles || []);
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
      alert(result.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('projects').update({
        title: result.data.title,
        description: result.data.description,
        max_members: result.data.max_members,
        status: status
      }).eq('id', project.id);

      if (error) throw error;
      
      // Update skills (Atomic)
      const { error: skillsErr } = await supabase.rpc('update_project_skills', {
        p_project_id: project.id,
        p_skill_ids: result.data.skills
      });
      if (skillsErr) throw skillsErr;

      // Update roles (Atomic)
      const { error: rolesErr } = await supabase.rpc('update_project_roles', {
        p_project_id: project.id,
        p_role_ids: result.data.roles
      });
      if (rolesErr) throw rolesErr;

      router.push(`/projects/${project.id}`);
      router.refresh();
    } catch (error: any) {
      console.error('Error updating pitch:', error);
      alert(error.message || 'Failed to update project.');
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
              onChange={e => setMaxMembers(parseInt(e.target.value) || 5)}
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
