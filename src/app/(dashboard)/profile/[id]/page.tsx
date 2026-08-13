import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select(`
    *,
    user_skills(skills(*)),
    user_roles(roles(*)),
    user_hardware(*)
  `).eq('id', resolvedParams.id).single();

  if (!profile) {
    notFound();
  }

  const isOwnProfile = user.id === resolvedParams.id;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{isOwnProfile ? "Your Profile" : `${profile.display_name}'s Profile`}</h1>
          <p className="text-white/60">{isOwnProfile ? "Manage your skills, roles, and hardware." : "View student details and skills."}</p>
        </div>
        {!isOwnProfile && (
          <Link href={`/chat?user=${profile.id}`} className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2">
            <span>💬</span> Message
          </Link>
        )}
      </div>

      <div className="bg-surface border border-white/5 rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-xl font-medium text-white mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/50 mb-1">Full Name</label>
              <div className="bg-elevated border border-white/10 rounded px-3 py-2 text-white">{profile.display_name || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1">Batch</label>
              <div className="bg-elevated border border-white/10 rounded px-3 py-2 text-white">{profile.batch || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1">Enrollment Number</label>
              <div className="bg-elevated border border-white/10 rounded px-3 py-2 text-white">{profile.enrollment_no || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium text-white mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile.user_skills?.length > 0 ? (
              profile.user_skills.map((s: any) => (
                <span key={s.skills.id} className="px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-xs font-mono">
                  {s.skills.name}
                </span>
              ))
            ) : (
              <p className="text-sm text-white/50">No skills added.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium text-white mb-4">Roles</h2>
          <div className="flex flex-wrap gap-2">
            {profile.user_roles?.length > 0 ? (
              profile.user_roles.map((r: any) => (
                <span key={r.roles.id} className="px-3 py-1 bg-elevated text-white/90 border border-white/10 rounded-full text-sm flex items-center gap-2">
                  {'🧑‍💻'} {r.roles.name}
                </span>
              ))
            ) : (
              <p className="text-sm text-white/50">No roles added.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium text-white mb-4">Hardware</h2>
          <div className="space-y-2">
            {profile.user_hardware?.length > 0 ? (
              profile.user_hardware.map((h: any) => (
                <div key={h.id} className="flex items-center gap-4 bg-elevated border border-white/10 rounded-lg p-3">
                  <span className="text-white font-medium">{h.label}</span>
                  <span className="text-white/60 text-sm">{h.description}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/50">No hardware added.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
