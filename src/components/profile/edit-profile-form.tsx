'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SkillSelector } from './skill-selector';
import { RoleSelector } from './role-selector';

export function EditProfileForm({ profile, allSkills, allRoles }: { profile: any, allSkills: any[], allRoles: any[] }) {
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
    profile?.user_hardware?.map((h: any) => ({ id: h.id, name: h.type, specs: h.specs })) || []
  );

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Update basic info
    await supabase.from('profiles').update({
      display_name: name,
      batch: batch,
      enrollment_no: enrollmentNumber,
    }).eq('id', user.id);

    // 2. Update skills (delete old, insert new)
    await supabase.from('user_skills').delete().eq('user_id', user.id);
    if (selectedSkills.length > 0) {
      await supabase.from('user_skills').insert(
        selectedSkills.map(id => ({ user_id: user.id, skill_id: id }))
      );
    }

    // 3. Update roles
    await supabase.from('user_roles').delete().eq('user_id', user.id);
    if (selectedRoles.length > 0) {
      await supabase.from('user_roles').insert(
        selectedRoles.map(id => ({ user_id: user.id, role_id: id }))
      );
    }

    // 4. Update hardware (delete all, insert current)
    await supabase.from('user_hardware').delete().eq('user_id', user.id);
    if (hardware.length > 0) {
      await supabase.from('user_hardware').insert(
        hardware.map(h => ({ user_id: user.id, type: h.name, specs: h.specs }))
      );
    }

    setSaving(false);
    window.location.href = '/profile';
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
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-surface border border-white/10 focus:border-accent rounded-lg px-4 py-2 text-white outline-none transition-colors" />
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
            <input type="text" value={enrollmentNumber} onChange={e => setEnrollmentNumber(e.target.value)} className="w-full bg-surface border border-white/10 focus:border-accent rounded-lg px-4 py-2 text-white outline-none transition-colors" />
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
