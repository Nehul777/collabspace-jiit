import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import type { Database } from '@/lib/types/database';

export type UserProfile = Database['public']['Tables']['profiles']['Row'] & {
  user_skills: (Database['public']['Tables']['user_skills']['Row'] & {
    skills: Database['public']['Tables']['skills']['Row'];
  })[];
  user_roles: (Database['public']['Tables']['user_roles']['Row'] & {
    roles: Database['public']['Tables']['roles']['Row'];
  })[];
  user_hardware: Database['public']['Tables']['user_hardware']['Row'][];
};

export function useUser() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        setUser(user);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            *,
            user_skills(
              skill_id,
              skills(*)
            ),
            user_roles(
              role_id,
              roles(*)
            ),
            user_hardware(*)
          `)
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profile as unknown as UserProfile);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, profile, loading, error };
}
