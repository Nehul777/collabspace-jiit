'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getOrCreateDirectChat } from '@/lib/utils/direct-chat';
import Link from 'next/link';

interface StudentCardProps {
  student: any;
}

export function StudentCard({ student }: StudentCardProps) {
  const [loadingChat, setLoadingChat] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const skills = student.user_skills?.map((s: any) => s.skills) || [];
  const roles = student.user_roles?.map((r: any) => r.roles) || [];

  const handleMessage = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoadingChat(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      if (user.id === student.id) {
        alert("You cannot message yourself.");
        setLoadingChat(false);
        return;
      }

      const roomId = await getOrCreateDirectChat(supabase, user.id, student.id);
      if (roomId) {
        router.push(`/chat?room=${roomId}`);
      } else {
        alert("Unable to open chat room. Please try again.");
      }
    } catch (err) {
      console.error("Failed to open DM:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="glass-card neon-glow-hover p-5 flex flex-col gap-4 transition-all duration-300 group h-full relative overflow-hidden">
      <div className="flex items-start gap-4 z-10">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-tertiary shadow-[0_0_15px_var(--color-accent-glow)] flex items-center justify-center text-lg font-bold text-white shrink-0">
          {student.display_name?.charAt(0) || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate text-base group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent group-hover:to-tertiary transition-all">{student.display_name}</h3>
          <p className="text-xs text-white/50 truncate">Batch {student.batch} • {student.enrollment_no}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {roles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {roles.map((role: any) => (
              <span key={role.id} className="px-2 py-0.5 rounded text-[10px] font-medium bg-elevated text-white/70 border border-white/5 flex items-center gap-1">
                <span>{'🧑‍💻'}</span> {role.name}
              </span>
            ))}
          </div>
        )}
        
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {skills.slice(0, 5).map((skill: any) => (
              <span key={skill.id} className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-accent/10 text-accent border border-accent/20">
                {skill.name}
              </span>
            ))}
            {skills.length > 5 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-surface text-white/40 border border-white/5">
                +{skills.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="pt-4 mt-auto border-t border-white/5 flex items-center justify-between gap-2">
        <button 
          onClick={handleMessage}
          disabled={loadingChat}
          className="flex-1 bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/20 hover:border-accent rounded-lg py-2 text-xs font-medium transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <span>💬</span>
          <span>{loadingChat ? 'Opening...' : 'Message'}</span>
        </button>
        <button className="px-3 py-2 rounded-lg bg-elevated hover:bg-white/10 border border-white/5 text-xs text-white/70 transition-colors">
          Invite
        </button>
      </div>
    </div>
  );
}

