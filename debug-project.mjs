import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zmvrnkfqldoijnlryhwo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptdnJua2ZxbGRvaWpubHJ5aHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NTU3NDMsImV4cCI6MjEwMjEzMTc0M30.u_dAPYYyvv8h8BEQm5uFLmXgbhEg3iqScx0LzTq6uAs'
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
