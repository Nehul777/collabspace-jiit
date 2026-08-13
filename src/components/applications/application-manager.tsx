'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatTimeAgo } from '@/lib/utils/matchmaking';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface ApplicationManagerProps {
  userId: string;
}

export function ApplicationManager({ userId }: ApplicationManagerProps) {
  const [activeTab, setActiveTab] = useState<'my-applications' | 'incoming-requests'>('my-applications');
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchData = async () => {
    setLoading(true);

    // 1. Fetch my submitted applications
    const { data: myApps } = await supabase
      .from('join_requests')
      .select(`
        id,
        project_id,
        message,
        status,
        created_at,
        projects (
          id,
          title,
          description,
          status,
          created_by,
          profiles:created_by (
            id, display_name, avatar_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (myApps) {
      setMyApplications(myApps);
    }

    // 2. Fetch projects created by me
    const { data: myProjects } = await supabase
      .from('projects')
      .select('id, title')
      .eq('created_by', userId);

    if (myProjects && myProjects.length > 0) {
      const projectIds = myProjects.map(p => p.id);

      const { data: incoming } = await supabase
        .from('join_requests')
        .select(`
          id,
          project_id,
          user_id,
          message,
          status,
          created_at,
          projects (
            id,
            title
          ),
          profiles:user_id (
            id,
            display_name,
            batch,
            enrollment_no,
            avatar_url,
            user_skills(skills(*)),
            user_roles(roles(*))
          )
        `)
        .in('project_id', projectIds)
        .order('created_at', { ascending: false });

      if (incoming) {
        setIncomingRequests(incoming);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [userId, supabase]);

  // Handle Approve / Accept applicant
  const handleApprove = async (request: any) => {
    setProcessingId(request.id);
    try {
      // 1. Update join request status
      const { error: updateErr } = await supabase
        .from('join_requests')
        .update({ status: 'accepted' })
        .eq('id', request.id);

      if (updateErr) throw updateErr;

      // 2. Add student to project_members
      const { error: memberErr } = await supabase
        .from('project_members')
        .insert({
          project_id: request.project_id,
          user_id: request.user_id,
          role: 'Member',
        });

      if (memberErr && !memberErr.message.includes('duplicate')) {
        console.warn('Member insert warning:', memberErr);
      }

      // 3. Send notification to student
      const projectTitle = Array.isArray(request.projects) ? request.projects[0]?.title : request.projects?.title;
      await supabase.from('notifications').insert({
        user_id: request.user_id,
        type: 'PROJECT_UPDATE',
        content: `Your request to join "${projectTitle || 'the project'}" was accepted! 🎉`,
        link: `/projects/${request.project_id}`,
      });

      // Update state locally
      setIncomingRequests(prev =>
        prev.map(r => (r.id === request.id ? { ...r, status: 'accepted' } : r))
      );
      alert('Student request approved successfully!');
    } catch (err: any) {
      console.error('Approve failed:', err);
      alert(err.message || 'Failed to approve applicant');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Disapprove / Decline applicant
  const handleDisapprove = async (request: any) => {
    setProcessingId(request.id);
    try {
      const { error: updateErr } = await supabase
        .from('join_requests')
        .update({ status: 'declined' })
        .eq('id', request.id);

      if (updateErr) throw updateErr;

      const projectTitle = Array.isArray(request.projects) ? request.projects[0]?.title : request.projects?.title;
      await supabase.from('notifications').insert({
        user_id: request.user_id,
        type: 'PROJECT_UPDATE',
        content: `Your request to join "${projectTitle || 'the project'}" was declined.`,
        link: `/projects/${request.project_id}`,
      });

      setIncomingRequests(prev =>
        prev.map(r => (r.id === request.id ? { ...r, status: 'declined' } : r))
      );
    } catch (err: any) {
      console.error('Decline failed:', err);
      alert(err.message || 'Failed to disapprove applicant');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Cancel / Withdraw application
  const handleCancelApplication = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this application?')) return;

    setProcessingId(requestId);
    try {
      await supabase.from('join_requests').delete().eq('id', requestId);
      setMyApplications(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Cancel failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingIncomingCount = incomingRequests.filter(r => r.status === 'pending').length;

  if (loading) {
    return <div className="p-8 text-white/50 text-center">Loading applications...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Project Applications</h1>
          <p className="text-white/60 text-sm">Track your submitted applications and manage incoming student requests.</p>
        </div>

        <Link href="/" className="px-4 py-2 bg-surface hover:bg-elevated text-white/80 border border-white/10 rounded-xl text-xs font-medium transition-colors">
          ← Back to Board
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-surface/50 p-1 rounded-xl gap-2">
        <button
          onClick={() => setActiveTab('my-applications')}
          className={cn(
            "flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all text-center flex items-center justify-center gap-2",
            activeTab === 'my-applications'
              ? "bg-elevated text-white shadow border border-white/10"
              : "text-white/60 hover:text-white"
          )}
        >
          <span>📋 My Applied Projects</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-accent/20 text-accent font-mono">
            {myApplications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('incoming-requests')}
          className={cn(
            "flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all text-center flex items-center justify-center gap-2",
            activeTab === 'incoming-requests'
              ? "bg-elevated text-white shadow border border-white/10"
              : "text-white/60 hover:text-white"
          )}
        >
          <span>🙋 Applicants for My Projects</span>
          {pendingIncomingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400 font-mono">
              {pendingIncomingCount} pending
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: My Applied Projects */}
      {activeTab === 'my-applications' && (
        <div className="space-y-4">
          {myApplications.length === 0 ? (
            <div className="glass-card p-12 text-center text-white/50 space-y-3">
              <span className="text-4xl">🚀</span>
              <p className="text-base">You haven't applied to any projects yet.</p>
              <Link href="/" className="inline-block text-xs text-accent hover:underline">
                Browse Pitch Board & Apply →
              </Link>
            </div>
          ) : (
            myApplications.map((app) => {
              const project = Array.isArray(app.projects) ? app.projects[0] : app.projects;
              const owner = project?.profiles;

              return (
                <div key={app.id} className="glass-card p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link href={`/projects/${project?.id}`} className="text-lg font-semibold text-white hover:text-accent transition-colors">
                        {project?.title || 'Project'}
                      </Link>

                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-mono border",
                        app.status === 'pending' && "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
                        app.status === 'accepted' && "bg-green-500/10 text-green-400 border-green-500/30",
                        app.status === 'declined' && "bg-red-500/10 text-red-400 border-red-500/30"
                      )}>
                        {app.status === 'pending' && '⏳ Pending Review'}
                        {app.status === 'accepted' && '✅ Accepted'}
                        {app.status === 'declined' && '❌ Declined'}
                      </span>
                    </div>

                    <div className="text-xs text-white/50 flex items-center gap-2">
                      <span>Lead: {owner?.display_name || 'Project Owner'}</span>
                      <span>•</span>
                      <span>Applied {formatTimeAgo(app.created_at)}</span>
                    </div>

                    {app.message && (
                      <div className="text-xs text-white/70 bg-elevated/40 p-3 rounded-lg border border-white/5 italic">
                        "{app.message}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      href={`/projects/${project?.id}`}
                      className="px-4 py-2 bg-surface hover:bg-elevated border border-white/10 rounded-xl text-xs font-medium text-white transition-colors"
                    >
                      View Project
                    </Link>

                    {app.status === 'pending' && (
                      <button
                        onClick={() => handleCancelApplication(app.id)}
                        disabled={processingId === app.id}
                        className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: Applicant Approvals (Manage applicants for my projects) */}
      {activeTab === 'incoming-requests' && (
        <div className="space-y-4">
          {incomingRequests.length === 0 ? (
            <div className="glass-card p-12 text-center text-white/50 space-y-3">
              <span className="text-4xl">🧑‍💻</span>
              <p className="text-base">No students have applied to your projects yet.</p>
              <p className="text-xs text-white/40">Post a new project pitch to recruit teammates!</p>
            </div>
          ) : (
            incomingRequests.map((req) => {
              const student = Array.isArray(req.profiles) ? req.profiles[0] : req.profiles;
              const project = Array.isArray(req.projects) ? req.projects[0] : req.projects;
              const skills = student?.user_skills?.map((s: any) => s.skills) || [];

              return (
                <div key={req.id} className="glass-card p-6 rounded-2xl space-y-4">
                  {/* Header row */}
                  <div className="flex flex-wrap justify-between items-start gap-3 pb-3 border-b border-white/5">
                    <div>
                      <div className="text-xs text-white/50 mb-0.5">Applied for project:</div>
                      <Link href={`/projects/${project?.id}`} className="font-bold text-white text-base hover:text-accent transition-colors">
                        {project?.title || 'Project'}
                      </Link>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/40">{formatTimeAgo(req.created_at)}</span>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-mono border",
                        req.status === 'pending' && "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
                        req.status === 'accepted' && "bg-green-500/10 text-green-400 border-green-500/30",
                        req.status === 'declined' && "bg-red-500/10 text-red-400 border-red-500/30"
                      )}>
                        {req.status === 'pending' ? 'Pending' : req.status}
                      </span>
                    </div>
                  </div>

                  {/* Student info */}
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent to-tertiary flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {student?.display_name?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-white text-sm">{student?.display_name}</div>
                          <div className="text-xs text-white/50">Batch {student?.batch} • {student?.enrollment_no}</div>
                        </div>

                        <Link href={`/profile/${student?.id}`} className="text-xs text-accent hover:underline">
                          View Profile →
                        </Link>
                      </div>

                      {/* Application message */}
                      {req.message && (
                        <div className="text-xs text-white/80 bg-elevated/60 p-3 rounded-xl border border-white/5">
                          <span className="text-white/40 block mb-1 font-medium">Message from applicant:</span>
                          "{req.message}"
                        </div>
                      )}

                      {/* Student skills */}
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {skills.map((skill: any) => (
                            <span key={skill.id} className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-accent/10 text-accent border border-accent/20">
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  {req.status === 'pending' && (
                    <div className="pt-3 border-t border-white/5 flex justify-end gap-3">
                      <button
                        onClick={() => handleDisapprove(req)}
                        disabled={processingId === req.id}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <span>❌</span> Disapprove
                      </button>

                      <button
                        onClick={() => handleApprove(req)}
                        disabled={processingId === req.id}
                        className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl text-xs transition-colors shadow-[0_0_12px_rgba(34,197,94,0.3)] disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <span>✅</span> Approve Student
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
