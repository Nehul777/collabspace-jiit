'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatTimeAgo } from '@/lib/utils/matchmaking';
import { getOrCreateDirectChat } from '@/lib/utils/direct-chat';
import Link from 'next/link';

interface ProjectDetailViewProps {
  project: any;
  currentUserId: string | null;
  isOwner: boolean;
  isMember: boolean;
  existingRequest: any | null;
}

export function ProjectDetailView({
  project,
  currentUserId,
  isOwner,
  isMember,
  existingRequest,
}: ProjectDetailViewProps) {
  const router = useRouter();
  const supabase = createClient();

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(
    existingRequest?.status || null
  );
  const [startingDm, setStartingDm] = useState(false);

  const owner = project.profiles;
  const skills = project.project_required_skills?.map((s: any) => s.skills) || [];
  const openRoles = project.project_open_roles || [];
  const members = project.project_members || [];

  const handleRequestJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      router.push('/login');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create join request
      const { error: reqErr } = await supabase.from('join_requests').insert({
        project_id: project.id,
        user_id: currentUserId,
        message: joinMessage,
        status: 'pending',
      });

      if (reqErr) throw reqErr;

      // 2. Notify project owner
      if (project.created_by) {
        await supabase.from('notifications').insert({
          user_id: project.created_by,
          type: 'JOIN_REQUEST',
          content: `Someone requested to join your project "${project.title}"`,
          link: `/projects/${project.id}`,
        });
      }

      setRequestStatus('pending');
      setShowJoinModal(false);
      alert('Join request submitted successfully!');
    } catch (err: any) {
      console.error('Failed to submit join request:', err);
      alert(err.message || 'Failed to submit join request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDmOwner = async () => {
    if (!currentUserId) {
      router.push('/login');
      return;
    }
    if (isOwner) return;

    setStartingDm(true);
    try {
      const roomId = await getOrCreateDirectChat(supabase, currentUserId, project.created_by);
      if (roomId) {
        router.push(`/chat?room=${roomId}`);
      } else {
        alert('Could not start direct message.');
      }
    } catch (err) {
      console.error('Failed to DM owner:', err);
    } finally {
      setStartingDm(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
        ← Back to Pitch Board
      </Link>

      {/* Main Card */}
      <div className="glass-card p-8 rounded-2xl space-y-8 relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-4 pb-6 border-b border-white/10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-accent/10 border border-accent/30 rounded-full text-xs font-mono text-accent">
                {project.status === 'recruiting' ? '🚀 Recruiting' : project.status}
              </span>
              <span className="text-xs text-white/40">
                Posted {formatTimeAgo(project.created_at)}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{project.title}</h1>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {!isOwner && (
              <button
                onClick={handleDmOwner}
                disabled={startingDm}
                className="px-4 py-2.5 bg-surface hover:bg-elevated text-white border border-white/10 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
              >
                <span>💬</span> Message Owner
              </button>
            )}

            {!isOwner && !isMember && (
              requestStatus === 'pending' ? (
                <div className="px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-xl text-sm font-medium flex items-center gap-2">
                  <span>⏳</span> Request Pending
                </div>
              ) : requestStatus === 'accepted' ? (
                <div className="px-4 py-2.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-sm font-medium flex items-center gap-2">
                  <span>✅</span> Joined Project
                </div>
              ) : (
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-accent to-tertiary hover:opacity-90 text-white font-semibold rounded-xl text-sm transition-all shadow-[0_0_15px_var(--color-accent-glow)] flex items-center gap-2"
                >
                  <span>🙌</span> Request to Join
                </button>
              )
            )}

            {isMember && !isOwner && (
              <div className="px-4 py-2.5 bg-accent/20 border border-accent/30 text-accent rounded-xl text-sm font-medium">
                Team Member
              </div>
            )}

            {isOwner && (
              <div className="flex items-center gap-3">
                <div className="px-4 py-2.5 bg-accent/20 border border-accent/30 text-accent rounded-xl text-sm font-medium">
                  👑 Project Owner
                </div>
                <Link 
                  href={`/projects/${project.id}/edit`}
                  className="px-4 py-2.5 bg-surface hover:bg-elevated text-white border border-white/10 rounded-xl text-sm font-medium transition-all"
                >
                  Edit Project
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Project Owner Info */}
        <div className="flex items-center gap-4 p-4 bg-surface/50 border border-white/5 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-tertiary flex items-center justify-center text-lg font-bold text-white shrink-0">
            {owner?.display_name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="text-xs text-white/50">Project Lead</div>
            <div className="text-base font-semibold text-white">{owner?.display_name || 'Anonymous Student'}</div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Project Pitch</h2>
          <div className="text-white/80 leading-relaxed whitespace-pre-wrap text-sm bg-elevated/40 p-5 rounded-xl border border-white/5">
            {project.description}
          </div>
        </div>

        {/* Required Skills */}
        {skills.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Required Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: any) => (
                <span key={skill.id} className="px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg text-xs font-mono text-accent">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Open Roles */}
        {openRoles.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Looking For</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {openRoles.map((role: any) => (
                <div key={role.id} className="p-4 bg-surface border border-white/5 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-white">{role.roles?.name || 'Developer'}</div>
                    {role.description && <div className="text-xs text-white/50">{role.description}</div>}
                  </div>
                  <span className="px-2.5 py-1 bg-accent/10 text-accent rounded-full text-xs font-mono">
                    {role.count || 1} needed
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Members */}
        {members.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Team Members ({members.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {members.map((member: any) => (
                <div key={member.user_id} className="p-3 bg-surface border border-white/5 rounded-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/30 to-tertiary/30 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {member.profiles?.display_name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-white truncate">{member.profiles?.display_name || 'Member'}</div>
                    <div className="text-[11px] text-white/50 truncate">{member.role || 'Contributor'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Join Request Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Request to Join Project</h3>
              <button onClick={() => setShowJoinModal(false)} className="text-white/40 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleRequestJoin} className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Introduce yourself to {owner?.display_name || 'the project lead'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                  placeholder="Share what skills you bring, what role you'd like to take, and why you're excited about this project..."
                  className="w-full bg-elevated border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-accent hover:bg-accent/90 text-white font-medium rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Sending Request...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
