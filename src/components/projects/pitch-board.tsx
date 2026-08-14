'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterBar, FilterState } from './filter-bar';
import { PitchCard } from './pitch-card';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export function PitchBoard({ initialProjects = [] }: { initialProjects?: any[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [filteredProjects, setFilteredProjects] = useState(initialProjects);
  const supabase = createClient();

  useEffect(() => {
    // Basic filtering
    // (Complex filtering could involve re-fetching from Supabase, but doing it in-memory here for simplicity)
  }, [projects]);

  const handleFilterChange = (filters: FilterState) => {
    let result = [...projects];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }

    if (filters.status !== 'All') {
      result = result.filter((p) => p.status === filters.status);
    }

    setFilteredProjects(result);
  };

  return (
    <div className="w-full flex flex-col gap-6 relative overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-20 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Pitch Board</h1>
          <p className="text-xs sm:text-sm text-white/50">Explore project ideas or pitch your own project</p>
        </div>
        <Link href="/projects/new" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto bg-gradient-to-r from-accent to-tertiary hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-[0_0_15px_var(--color-accent-glow)] flex items-center justify-center gap-2">
            <span className="text-lg leading-none">+</span> New Pitch
          </button>
        </Link>
      </div>

      <FilterBar onFilterChange={handleFilterChange} />

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
      >
        <AnimatePresence>
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <PitchCard key={project.id} project={project} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-gray-500 flex flex-col items-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <span className="text-2xl opacity-50">✨</span>
              </div>
              <p className="text-lg text-white mb-2">No projects found</p>
              <p className="text-sm">Try adjusting your filters or create a new pitch.</p>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
