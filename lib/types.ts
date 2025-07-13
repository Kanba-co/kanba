export interface Project {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  created_at: string;
  user_id: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  subscription_status: 'free' | 'pro' | null;
}

export interface Column {
  id: string;
  name: string;
  position: number;
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  position: number;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
  column_id: string;
  created_by: string | null;
  updated_by: string | null;
  assigned_to: string | null;
  profiles?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ProjectMember {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  profiles: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}