'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { createClient } from '@/lib/supabase/client';

export function PitchCard({ project, isMember }: any) {
  const { id, title, description, status, created_at, profiles } = project;
  const router = useRouter();

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowJoinModal(true);
  };

  const handleQuickJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSubmitting(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const { error } = await supabase.from('join_requests').insert({
        project_id: id,
        user_id: user.id,
        message: joinMessage,
        status: 'pending',
      });

      if (error) throw error;

      if (project.created_by) {
        await supabase.from('notifications').insert({
          user_id: project.created_by,
          type: 'JOIN_REQUEST',
          data: {
            message: `Someone requested to join your project "${title}"`,
            link: `/projects/${id}`,
          },
        });
      }

      setShowJoinModal(false);
      alert('Application submitted successfully!');
    } catch (err: any) {
      console.error('Quick join error:', err);
      alert(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link href={`/projects/${id}`}>
          <Card className="h-full flex flex-col p-5 glass-card neon-glow-hover cursor-pointer relative overflow-hidden group transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors line-clamp-1">{title}</h3>
              <Badge variant={status === 'recruiting' || status === 'Recruiting' ? 'status-open' : 'default'} className="ml-2 whitespace-nowrap">
                {status}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-grow">
              {description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {project.project_skills?.slice(0, 3).map((skill: any) => (
                <span key={skill.skill_id || skill.id} className="px-2 py-0.5 bg-accent/10 border border-accent/20 rounded-full text-xs font-mono text-accent shadow-[0_0_8px_var(--color-accent-glow)]">
                  {skill.skills?.name || skill.name || 'Skill'}
                </span>
              ))}
              {(project.project_skills?.length || 0) > 3 && (
                <span className="px-2 py-0.5 bg-surface border border-white/10 rounded-full text-xs text-white/50">
                  +{project.project_skills!.length - 3}
                </span>
              )}
            </div>
            
            <div className="mt-auto pt-4 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {project.project_members?.slice(0, 3).map((member: any) => (
                    <Avatar 
                      key={member.user_id} 
                      src={member.profiles?.avatar_url}
                      name={member.profiles?.display_name || 'U'}
                      size="sm"
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  <span className="text-gray-300">{profiles?.display_name || 'Student'}</span>
                  <span className="mx-1">•</span>
                  {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
                </div>
              </div>
              
              {!isMember && (
                <button
                  onClick={handleJoinClick}
                  className="w-full sm:w-auto px-3 py-2 sm:py-1 bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/20 rounded-lg text-xs font-medium transition-all"
                >
                  Request to Join →
                </button>
              )}
            </div>
          </Card>
        </Link>
      </motion.div>

      {/* Quick Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white truncate">Apply to {title}</h3>
              <button onClick={() => setShowJoinModal(false)} className="text-white/40 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleQuickJoinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-white/70 mb-2">
                  Message to project lead:
                </label>
                <textarea
                  required
                  rows={3}
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                  placeholder="Tell the lead what role or skills you're bringing..."
                  className="w-full bg-elevated border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="w-full sm:w-auto px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs text-white/60 hover:text-white bg-white/5 sm:bg-transparent rounded-xl sm:rounded-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-1.5 bg-accent hover:bg-accent/90 text-white font-medium rounded-xl text-sm sm:text-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

