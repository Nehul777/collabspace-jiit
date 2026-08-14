'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SkillSelector } from './skill-selector';
import { RoleSelector } from './role-selector';

export function EditProfileForm({ 
  profile, 
  allSkills, 
  allRoles,
  targetUserId,
  isAdmin
}: { 
  profile: any, 
  allSkills: any[], 
  allRoles: any[],
  targetUserId?: string,
  isAdmin?: boolean
}) {
  const router = useRouter();
  const supabase = createClient();
  
  const [name, setName] = useState(profile?.display_name || '');
  const [batch, setBatch] = useState(profile?.batch || '2024');
  const [enrollmentNumber, setEnrollmentNumber] = useState(profile?.enrollment_no || '');
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    profile?.user_skills?.map((s: any) => s.skill_id) || []
  );
  
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    profile?.user_roles?.map((r: any) => r.role_id) || []
  );
  
  const [hardware, setHardware] = useState<{id?: string, name: string, specs: string}[]>(
    profile?.user_hardware?.map((h: any) => ({ id: h.id, name: h.label, specs: h.description })) || []
  );

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const editId = targetUserId || profile?.id || user.id;

    try {
      // 1. Update basic info
      const { error: profileError } = await supabase.from('profiles').update({
        display_name: name,
        batch: batch,
        enrollment_no: enrollmentNumber,
      }).eq('id', editId);
      if (profileError) throw profileError;

      // 2. Update skills (Atomic)
      const { error: skillsErr } = await supabase.rpc('update_user_skills', {
        p_user_id: editId,
        p_skill_ids: selectedSkills
      });
      if (skillsErr) throw skillsErr;

      // 3. Update roles (Atomic)
      const { error: rolesErr } = await supabase.rpc('update_user_roles', {
        p_user_id: editId,
        p_role_ids: selectedRoles
      });
      if (rolesErr) throw rolesErr;

      // 4. Update hardware (delete old, insert new)
      const { error: delHardwareErr } = await supabase.from('user_hardware').delete().eq('user_id', editId);
      if (delHardwareErr) throw delHardwareErr;
      const validHardware = hardware.filter(h => h.name.trim() && h.specs.trim());
      if (validHardware.length > 0) {
        const { error: insHardwareErr } = await supabase.from('user_hardware').insert(
          validHardware.map(h => ({
            user_id: editId,
            label: h.name,
            description: h.specs
          }))
        );
        if (insHardwareErr) throw insHardwareErr;
      }

      window.location.href = editId === user.id ? '/profile' : `/profile/${editId}`;
    } catch (err: any) {
      console.error('Profile save failed:', err);
      alert(err.message || 'Failed to save profile. Please try again.');
      setSaving(false);
    }
  };

  const addHardware = () => {
    setHardware([...hardware, { name: '', specs: '' }]);
  };

  const removeHardware = (index: number) => {
    const updated = [...hardware];
    updated.splice(index, 1);
    setHardware(updated);
  };

  const updateHardware = (index: number, field: 'name' | 'specs', value: string) => {
    const updated = [...hardware];
    updated[index][field] = value;
    setHardware(updated);
  };

  return (
    <div className="glass-card neon-glow-hover p-6 rounded-2xl space-y-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
        <button 
          onClick={() => router.push('/profile')}
          className="text-white/50 hover:text-white"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Basic Information</h3>
        <div>
          <label className="block text-sm text-white/70 mb-1">Display Name</label>
          {!isAdmin ? (
            <div className="w-full bg-surface/50 border border-white/5 rounded-lg px-4 py-3 text-white/70 font-medium">
              {name}
              <p className="text-xs text-white/40 mt-1 font-normal">Your real name is permanently linked to your college email.</p>
            </div>
          ) : (
            <>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent outline-none transition-colors" 
              />
              <p className="text-xs text-accent mt-1">Admin Mode: You can override this name.</p>
            </>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Batch</label>
            <select value={batch} onChange={e => setBatch(e.target.value)} className="w-full bg-surface border border-white/10 focus:border-accent rounded-lg px-4 py-2 text-white outline-none transition-colors">
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Enrollment Number</label>
            <input type="text" value={enrollmentNumber} readOnly disabled className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-white/50 outline-none cursor-not-allowed" />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/10">
        <h3 className="text-lg font-medium text-white">Skills</h3>
        <p className="text-sm text-white/50 mb-2">Select the technologies you are proficient in.</p>
        <SkillSelector 
          skills={allSkills} 
          selectedSkills={selectedSkills} 
          onChange={setSelectedSkills} 
        />
      </div>

      <div className="space-y-4 pt-4 border-t border-white/10">
        <h3 className="text-lg font-medium text-white">Roles</h3>
        <p className="text-sm text-white/50 mb-2">What roles can you take on in a project?</p>
        <RoleSelector 
          roles={allRoles} 
          selectedRoles={selectedRoles} 
          onChange={setSelectedRoles} 
        />
      </div>

      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-white">Hardware (Optional)</h3>
            <p className="text-sm text-white/50">List your laptop, GPU, or other hardware.</p>
          </div>
          <button onClick={addHardware} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors">
            + Add
          </button>
        </div>
        
        {hardware.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              placeholder="E.g., Laptop, GPU"
              value={item.name}
              onChange={(e) => updateHardware(index, 'name', e.target.value)}
              className="w-1/3 bg-surface border border-white/10 focus:border-accent rounded-lg px-3 py-2 text-white text-sm outline-none"
            />
            <input
              type="text"
              placeholder="E.g., M1 Mac 16GB, RTX 4090"
              value={item.specs}
              onChange={(e) => updateHardware(index, 'specs', e.target.value)}
              className="flex-1 bg-surface border border-white/10 focus:border-accent rounded-lg px-3 py-2 text-white text-sm outline-none"
            />
            <button 
              onClick={() => removeHardware(index)}
              className="px-3 text-white/50 hover:text-red-400 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-white/10">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-gradient-to-r from-accent to-tertiary hover:opacity-90 rounded-xl font-semibold text-white shadow-[0_0_15px_var(--color-accent-glow)] transition-all flex items-center justify-center gap-2"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
