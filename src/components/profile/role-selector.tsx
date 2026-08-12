'use client';

import { cn } from '@/lib/utils/cn';
import { Database } from '@/lib/types/database';

type Role = Database['public']['Tables']['roles']['Row'];

interface RoleSelectorProps {
  roles: Role[];
  selectedRoles: string[];
  onChange: (roles: string[]) => void;
}

export function RoleSelector({ roles, selectedRoles, onChange }: RoleSelectorProps) {
  const toggleRole = (id: string) => {
    if (selectedRoles.includes(id)) {
      onChange(selectedRoles.filter(r => r !== id));
    } else {
      onChange([...selectedRoles, id]);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {roles.map(role => {
        const isSelected = selectedRoles.includes(role.id);
        return (
          <button
            key={role.id}
            onClick={() => toggleRole(role.id)}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 text-center space-y-2",
              isSelected 
                ? "bg-accent/10 border-accent text-accent" 
                : "bg-surface border-white/5 text-white/70 hover:border-white/20 hover:text-white hover:bg-elevated"
            )}
          >
            <span className="text-2xl">{'🧑‍💻'}</span>
            <span className="text-sm font-medium">{role.name}</span>
          </button>
        );
      })}
    </div>
  );
}
