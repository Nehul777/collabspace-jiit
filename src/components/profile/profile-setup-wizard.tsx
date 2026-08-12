'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SkillSelector } from './skill-selector';
import { RoleSelector } from './role-selector';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/types/database';

type Skill = Database['public']['Tables']['skills']['Row'];
type Role = Database['public']['Tables']['roles']['Row'];

export function ProfileSetupWizard({ skills, roles }: { skills: Skill[], roles: Role[] }) {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const supabase = createClient();
  
  const [name, setName] = useState('');
  const [batch, setBatch] = useState('2024');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [hardware, setHardware] = useState<{name: string, specs: string}[]>([]);
  
  const handleNext = () => setStep(s => Math.min(s + 1, 4));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));
  
  const handleComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('profiles').update({
      display_name: name,
      batch: batch,
      enrollment_no: enrollmentNumber,
    }).eq('id', user.id);

    if (selectedSkills.length > 0) {
      await supabase.from('user_skills').insert(
        selectedSkills.map(id => ({ user_id: user.id, skill_id: id }))
      );
    }
    
    if (selectedRoles.length > 0) {
      await supabase.from('user_roles').insert(
        selectedRoles.map(id => ({ user_id: user.id, role_id: id }))
      );
    }
    
    if (hardware.length > 0) {
      await supabase.from('user_hardware').insert(
        hardware.map(h => ({ user_id: user.id, type: h.name, specs: h.specs }))
      );
    }

    router.push('/');
  };

  const addHardware = () => {
    setHardware([...hardware, { name: '', specs: '' }]);
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Complete your profile</h1>
        <div className="text-sm text-white/50">Step {step} of 4</div>
      </div>
      
      <div className="w-full bg-surface h-1.5 rounded-full mb-8 overflow-hidden">
        <motion.div 
          className="h-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="bg-elevated border border-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-medium mb-4">Basic Information</h2>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Display Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-surface border border-white/10 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Batch</label>
                  <select value={batch} onChange={e => setBatch(e.target.value)} className="w-full bg-surface border border-white/10 rounded px-3 py-2 text-white">
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Enrollment Number</label>
                  <input type="text" value={enrollmentNumber} onChange={e => setEnrollmentNumber(e.target.value)} className="w-full bg-surface border border-white/10 rounded px-3 py-2 text-white" />
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-4 h-full flex flex-col">
                <h2 className="text-xl font-medium mb-2">Select Skills</h2>
                <p className="text-sm text-white/50 mb-4">What technologies do you know?</p>
                <div className="flex-1">
                  <SkillSelector skills={skills} selectedSkills={selectedSkills} onChange={setSelectedSkills} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-medium mb-2">Select Roles</h2>
                <p className="text-sm text-white/50 mb-4">What roles are you interested in taking on?</p>
                <RoleSelector roles={roles} selectedRoles={selectedRoles} onChange={setSelectedRoles} />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-medium mb-2">Hardware Setup</h2>
                <p className="text-sm text-white/50 mb-4">Add any specialized hardware you have access to (e.g., GPU, Raspberry Pi).</p>
                
                {hardware.map((h, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" placeholder="Type (e.g., GPU)" value={h.name} onChange={e => {
                      const newH = [...hardware]; newH[i].name = e.target.value; setHardware(newH);
                    }} className="w-1/3 bg-surface border border-white/10 rounded px-3 py-2 text-white text-sm" />
                    <input type="text" placeholder="Specs (e.g., RTX 3060)" value={h.specs} onChange={e => {
                      const newH = [...hardware]; newH[i].specs = e.target.value; setHardware(newH);
                    }} className="flex-1 bg-surface border border-white/10 rounded px-3 py-2 text-white text-sm" />
                    <button onClick={() => setHardware(hardware.filter((_, idx) => idx !== i))} className="px-3 text-red-400 hover:text-red-300">&times;</button>
                  </div>
                ))}
                
                <button onClick={addHardware} className="text-sm text-accent hover:text-accent/80 font-medium">+ Add Hardware</button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex justify-between">
        {step > 1 ? (
          <button onClick={handleBack} className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">
            Back
          </button>
        ) : <div></div>}
        
        {step < 4 ? (
          <button onClick={handleNext} className="px-6 py-2 bg-accent hover:bg-accent/90 text-white rounded-md text-sm font-medium transition-colors">
            Next
          </button>
        ) : (
          <button onClick={handleComplete} className="px-6 py-2 bg-accent hover:bg-accent/90 text-white rounded-md text-sm font-medium transition-colors">
            Complete Setup
          </button>
        )}
      </div>
    </div>
  );
}
