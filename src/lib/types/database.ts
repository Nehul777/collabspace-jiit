export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          enrollment_no: string | null
          batch: string | null
          branch: string | null
          github_url: string | null
          linkedin_url: string | null
          is_admin: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_admin?: boolean | null
          enrollment_no?: string | null
          batch?: string | null
          branch?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          enrollment_no?: string | null
          batch?: string | null
          branch?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          created_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      user_skills: {
        Row: {
          id: string
          user_id: string
          skill_id: string
          proficiency: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skill_id: string
          proficiency?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skill_id?: string
          proficiency?: string | null
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role_id?: string
          created_at?: string
        }
      }
      user_hardware: {
        Row: {
          id: string
          user_id: string
          hardware_info: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          hardware_info: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          hardware_info?: string
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string
          status: 'IDEATION' | 'IN_PROGRESS' | 'COMPLETED'
          github_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description: string
          status?: 'IDEATION' | 'IN_PROGRESS' | 'COMPLETED'
          github_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string
          status?: 'IDEATION' | 'IN_PROGRESS' | 'COMPLETED'
          github_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_open_roles: {
        Row: {
          id: string
          project_id: string
          role_id: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          role_id: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          role_id?: string
          description?: string | null
          created_at?: string
        }
      }
      project_required_skills: {
        Row: {
          id: string
          project_id: string
          skill_id: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          skill_id: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          skill_id?: string
          created_at?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role_id: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role_id?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role_id?: string | null
          joined_at?: string
        }
      }
      join_requests: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role_id: string | null
          message: string | null
          status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role_id?: string | null
          message?: string | null
          status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role_id?: string | null
          message?: string | null
          status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
          created_at?: string
          updated_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          project_id: string
          inviter_id: string
          invitee_id: string
          role_id: string | null
          message: string | null
          status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          inviter_id: string
          invitee_id: string
          role_id?: string | null
          message?: string | null
          status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          inviter_id?: string
          invitee_id?: string
          role_id?: string | null
          message?: string | null
          status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
          created_at?: string
          updated_at?: string
        }
      }
      chat_rooms: {
        Row: {
          id: string
          project_id: string | null
          type: 'DIRECT' | 'PROJECT'
          created_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          type: 'DIRECT' | 'PROJECT'
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          type?: 'DIRECT' | 'PROJECT'
          created_at?: string
        }
      }
      direct_chats: {
        Row: {
          id: string
          room_id: string
          user1_id: string
          user2_id: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user1_id: string
          user2_id: string
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user1_id?: string
          user2_id?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          room_id: string
          sender_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          sender_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          sender_id?: string
          content?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'JOIN_REQUEST' | 'INVITATION' | 'MESSAGE' | 'PROJECT_UPDATE' | 'SYSTEM'
          content: string
          is_read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'JOIN_REQUEST' | 'INVITATION' | 'MESSAGE' | 'PROJECT_UPDATE' | 'SYSTEM'
          content: string
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'JOIN_REQUEST' | 'INVITATION' | 'MESSAGE' | 'PROJECT_UPDATE' | 'SYSTEM'
          content?: string
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Skill = Database['public']['Tables']['skills']['Row'];
export type Role = Database['public']['Tables']['roles']['Row'];
export type UserSkill = Database['public']['Tables']['user_skills']['Row'];
export type UserRole = Database['public']['Tables']['user_roles']['Row'];
export type UserHardware = Database['public']['Tables']['user_hardware']['Row'];

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectOpenRole = Database['public']['Tables']['project_open_roles']['Row'];
export type ProjectRequiredSkill = Database['public']['Tables']['project_required_skills']['Row'];
export type ProjectMember = Database['public']['Tables']['project_members']['Row'];

export type JoinRequest = Database['public']['Tables']['join_requests']['Row'];
export type Invitation = Database['public']['Tables']['invitations']['Row'];
export type ChatRoom = Database['public']['Tables']['chat_rooms']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

// Helper Types
export type ProfileWithDetails = Profile & {
  user_skills: (UserSkill & { skill: Skill })[];
  user_roles: (UserRole & { role: Role })[];
  user_hardware: UserHardware[];
};

export type ProjectWithDetails = Project & {
  project_members: (ProjectMember & { user: Profile; role: Role | null })[];
  project_open_roles: (ProjectOpenRole & { role: Role })[];
  project_required_skills: (ProjectRequiredSkill & { skill: Skill })[];
  owner: Profile;
};
