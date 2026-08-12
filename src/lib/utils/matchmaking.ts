export function formatTimeAgo(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months}mo ago`;
  }
}

export function computeCompatibilityScore(student: any, project: any): number {
  if (!student || !project) return 0;
  
  // Weights: Skills 60%, Roles 30%, Hardware 10%
  let score = 0;

  const projectSkills = project.project_skills?.map((ps: any) => ps.skill_id) || [];
  const studentSkills = student.user_skills?.map((us: any) => us.skill_id) || [];
  
  if (projectSkills.length > 0) {
    const matchedSkills = projectSkills.filter((id: string) => studentSkills.includes(id));
    score += (matchedSkills.length / projectSkills.length) * 60;
  } else {
    score += 60; // If project has no skills, give full points
  }

  const projectRoles = project.project_roles?.map((pr: any) => pr.role_id) || [];
  const studentRoles = student.user_roles?.map((ur: any) => ur.role_id) || [];
  
  if (projectRoles.length > 0) {
    const matchedRoles = projectRoles.filter((id: string) => studentRoles.includes(id));
    score += (matchedRoles.length / projectRoles.length) * 30;
  } else {
    score += 30;
  }
  
  const projectHardware = project.hardware_required || false;
  const studentHardware = student.user_hardware && student.user_hardware.length > 0;
  
  if (projectHardware) {
    if (studentHardware) {
      score += 10;
    }
  } else {
    score += 10;
  }

  return Math.min(100, Math.round(score));
}

// Supabase query builder for students
export function buildStudentQuery(query: any, filters: { search?: string, skills?: string[], roles?: string[], hardware?: boolean, batch?: string }) {
  let finalQuery = query;

  if (filters.search) {
    finalQuery = finalQuery.ilike('display_name', `%${filters.search}%`);
  }
  if (filters.batch) {
    finalQuery = finalQuery.eq('batch', filters.batch);
  }
  
  // Note: filtering by relation array is complex in postgrest, 
  // usually requires RPC or custom views if it's strict intersection.
  // For basic client/server fetch, we return the base query to be further processed
  return finalQuery;
}
