'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import { Database } from '@/lib/types/database';

type Skill = Database['public']['Tables']['skills']['Row'];

interface SkillSelectorProps {
  skills: Skill[];
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
}

export function SkillSelector({ skills, selectedSkills, onChange }: SkillSelectorProps) {
  const [search, setSearch] = useState('');

  const filteredSkills = useMemo(() => {
    if (!search) return skills;
    return skills.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  }, [skills, search]);

  const toggleSkill = (id: string) => {
    if (selectedSkills.includes(id)) {
      onChange(selectedSkills.filter(s => s !== id));
    } else {
      onChange([...selectedSkills, id]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <input 
          type="text"
          placeholder="Search skills..."
          className="w-full bg-surface border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-accent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="ml-4 text-xs text-white/50 whitespace-nowrap">
          {selectedSkills.length} selected
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {filteredSkills.map(skill => {
          const isSelected = selectedSkills.includes(skill.id);
          return (
            <button
              key={skill.id}
              onClick={() => toggleSkill(skill.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 border",
                isSelected 
                  ? "bg-accent/20 text-accent border-accent/50" 
                  : "bg-elevated text-white/70 border-white/5 hover:border-white/20 hover:text-white"
              )}
            >
              {skill.name}
            </button>
          );
        })}
        {filteredSkills.length === 0 && (
          <p className="text-sm text-white/50 py-4 text-center w-full">No skills found.</p>
        )}
      </div>
    </div>
  );
}
