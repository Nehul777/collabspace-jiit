'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StudentCard } from './student-card';
import { buildStudentQuery } from '@/lib/utils/matchmaking';

interface StudentDirectoryProps {
  initialStudents: any[];
  allSkills: any[];
  allRoles: any[];
}

export function StudentDirectory({ initialStudents, allSkills, allRoles }: StudentDirectoryProps) {
  const [students, setStudents] = useState(initialStudents);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  
  // Realtime search effect
  useEffect(() => {
    const fetchFiltered = async () => {
      setLoading(true);
      let query = supabase.from('profiles').select(`
        *,
        user_skills(skills(*)),
        user_roles(roles(*)),
        user_hardware(*)
      `).not('enrollment_no', 'is', null);

      query = buildStudentQuery(query, {
        search,
        batch: batchFilter || undefined,
      });

      const { data, error } = await query;
      
      if (!error && data) {
        // Client side filtering for complex relations (intersection)
        let filteredData = data;
        
        if (skillFilter.length > 0) {
          filteredData = filteredData.filter((student: any) => {
            const studentSkillIds = student.user_skills.map((us: any) => us.skills.id);
            // Has ALL selected skills
            return skillFilter.every(id => studentSkillIds.includes(id));
          });
        }
        
        setStudents(filteredData);
      }
      setLoading(false);
    };

    const debounce = setTimeout(fetchFiltered, 300);
    return () => clearTimeout(debounce);
  }, [search, batchFilter, skillFilter, supabase]);

  const toggleSkill = (id: string) => {
    setSkillFilter(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center sticky top-0 z-10 backdrop-blur-md bg-surface/80">
        <div className="flex-1 w-full sm:w-auto">
          <input 
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-elevated border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
          />
        </div>
        <div className="w-full sm:w-40">
          <select 
            value={batchFilter} 
            onChange={e => setBatchFilter(e.target.value)}
            className="w-full bg-elevated border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
          >
            <option value="">All Batches</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
      </div>

      {/* Simple skill quick-filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {allSkills.slice(0, 15).map(skill => (
          <button
            key={skill.id}
            onClick={() => toggleSkill(skill.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-colors border ${
              skillFilter.includes(skill.id) 
                ? 'bg-accent/20 border-accent/50 text-accent' 
                : 'bg-surface border-white/5 text-white/60 hover:text-white hover:bg-elevated'
            }`}
          >
            {skill.name}
          </button>
        ))}
      </div>

      <div className="text-sm text-white/50">
        {loading ? 'Searching...' : `Found ${students.length} students`}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {students.map(student => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>
      
      {!loading && students.length === 0 && (
        <div className="py-20 text-center text-white/50 border border-white/5 border-dashed rounded-2xl bg-surface/50">
          No students found matching your criteria.
        </div>
      )}
    </div>
  );
}
