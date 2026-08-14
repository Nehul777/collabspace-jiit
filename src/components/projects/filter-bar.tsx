'use client';

import React, { useState } from 'react';
import { Search, X, Filter, Cpu } from 'lucide-react';

export interface FilterState {
  search: string;
  skills: string[];
  roles: string[];
  status: string;
  needsHardware: boolean;
}

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    skills: [],
    roles: [],
    status: 'All',
    needsHardware: false,
  });

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const hasActiveFilters = filters.search || filters.skills.length > 0 || filters.roles.length > 0 || filters.status !== 'All' || filters.needsHardware;

  const clearAll = () => {
    const reset = {
      search: '',
      skills: [],
      roles: [],
      status: 'All',
      needsHardware: false,
    };
    setFilters(reset);
    onFilterChange(reset);
  };

  return (
    <div className="sticky top-0 z-10 bg-bg-surface/80 backdrop-blur-md border-b border-white/5 py-4 w-full">
      <div className="flex flex-col gap-4">
        {/* Top row controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <div className="relative w-full sm:w-[250px] flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-9 pr-4 py-2 bg-bg-elevated border border-white/10 rounded-md text-sm focus:outline-none focus:border-accent text-white"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
            <div className="flex items-center gap-1 flex-shrink-0 bg-bg-elevated p-1 rounded-md border border-white/5">
              {['All', 'Recruiting', 'In Progress'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateFilter('status', status)}
                  className={`px-3 py-1.5 sm:py-1 text-sm rounded-sm transition-colors whitespace-nowrap ${
                    filters.status === status ? 'bg-bg-hover text-white' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <button
              onClick={() => updateFilter('needsHardware', !filters.needsHardware)}
              className={`flex items-center gap-2 px-3 py-1.5 sm:py-2 text-sm rounded-md border transition-colors flex-shrink-0 whitespace-nowrap ${
                filters.needsHardware ? 'bg-accent/10 border-accent text-accent' : 'border-white/10 bg-bg-elevated text-gray-400 hover:text-gray-200'
              }`}
            >
              <Cpu className="w-4 h-4" />
              Needs Hardware
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-white px-2 flex-shrink-0 whitespace-nowrap"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
