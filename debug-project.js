import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// We need the service role key to bypass RLS, or we can just query as anon
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkProject() {
  const projectId = '44a04ee1-bdd6-4d6f-90a7-33f1141c4497';
  console.log(`Checking project: ${projectId}`);
  
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      profiles:created_by (
        id, display_name, avatar_url
      ),
      project_members (
        user_id, role,
        profiles (id, display_name, avatar_url)
      ),
      project_required_skills (
        skill_id,
        skills (id, name)
      ),
      project_open_roles (
        id, count, description,
        roles (id, name)
      )
    `)
    .eq('id', projectId);
    
  console.log('Result:', JSON.stringify({ data, error }, null, 2));
}

checkProject();
