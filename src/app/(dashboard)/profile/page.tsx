import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function ProfilePage() {
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
  `).eq('id', user.id).single();

  const isAdmin = profile?.is_admin === true;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Profile</h1>
            {isAdmin && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <span>🛡️</span> Admin
              </span>
            )}
          </div>
          <p className="text-white/60 mt-1">Manage your skills, roles, and hardware.</p>
        </div>
        <a href="/profile/edit" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2 border border-white/10">
          <span>✏️</span> Edit Profile
        </a>
      </div>

      <div className="bg-surface border border-white/5 rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-xl font-medium text-white mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/50 mb-1">Full Name</label>
              <div className="bg-elevated border border-white/10 rounded px-3 py-2 text-white">{profile?.display_name || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1">Batch</label>
              <div className="bg-elevated border border-white/10 rounded px-3 py-2 text-white">{profile?.batch || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1">Enrollment Number</label>
              <div className="bg-elevated border border-white/10 rounded px-3 py-2 text-white">{profile?.enrollment_no || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium text-white mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile?.user_skills?.map((s: any) => (
              <span key={s.skills.id} className="px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-xs font-mono">
                {s.skills.name}
              </span>
            )) || <p className="text-sm text-white/50">No skills added.</p>}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium text-white mb-4">Roles</h2>
          <div className="flex flex-wrap gap-2">
            {profile?.user_roles?.map((r: any) => (
              <span key={r.roles.id} className="px-3 py-1 bg-elevated text-white/90 border border-white/10 rounded-full text-sm flex items-center gap-2">
                {'🧑‍💻'} {r.roles.name}
              </span>
            )) || <p className="text-sm text-white/50">No roles added.</p>}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium text-white mb-4">Hardware</h2>
          <div className="space-y-2">
            {profile?.user_hardware?.map((h: any) => (
              <div key={h.id} className="flex items-center gap-4 bg-elevated border border-white/10 rounded-lg p-3">
                <span className="text-white font-medium">{h.label}</span>
                <span className="text-white/60 text-sm">{h.description}</span>
              </div>
            )) || <p className="text-sm text-white/50">No hardware added.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
