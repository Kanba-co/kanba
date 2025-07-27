import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase';

// Environment configuration
const DATABASE_PROVIDER = process.env.DATABASE_PROVIDER || 'supabase';
const USE_POSTGRES = DATABASE_PROVIDER === 'postgresql';

// Supabase client (default)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// PostgreSQL adapter (optional)
let postgresAdapter: any = null;
let postgresHelpers: any = null;

if (USE_POSTGRES) {
  try {
    const postgresModule = require('./adapters/postgres');
    postgresAdapter = postgresModule.postgresAdapter;
    postgresHelpers = postgresModule.postgresHelpers;
  } catch (error) {
    console.warn('PostgreSQL adapter not available, falling back to Supabase:', error);
  }
}

// Database interface that matches Supabase's structure
export interface DatabaseAdapter {
  profiles: {
    select: (columns?: string) => any;
    insert: (data: any) => Promise<{ data: any; error: any }>;
    update: (data: any) => Promise<{ data: any; error: any }>;
    delete: () => Promise<{ data: any; error: any }>;
  };
  projects: {
    select: (columns?: string) => any;
    insert: (data: any) => Promise<{ data: any; error: any }>;
    update: (data: any) => Promise<{ data: any; error: any }>;
    delete: () => Promise<{ data: any; error: any }>;
  };
  columns: {
    select: (columns?: string) => any;
    insert: (data: any) => Promise<{ data: any; error: any }>;
    update: (data: any) => Promise<{ data: any; error: any }>;
    delete: () => Promise<{ data: any; error: any }>;
  };
  tasks: {
    select: (columns?: string) => any;
    insert: (data: any) => Promise<{ data: any; error: any }>;
    update: (data: any) => Promise<{ data: any; error: any }>;
    delete: () => Promise<{ data: any; error: any }>;
  };
}

// Helper functions interface
export interface DatabaseHelpers {
  getProjectWithDetails: (projectId: string) => Promise<{ data: any; error: any }>;
  getUserProjects: (userId: string) => Promise<{ data: any; error: any }>;
  getAssignedTasks: (userId: string, limit?: number) => Promise<{ data: any; error: any }>;
  searchUsers: (query: string, currentUserId: string, limit?: number) => Promise<{ data: any; error: any }>;
}

// Supabase helpers implementation
const supabaseHelpers: DatabaseHelpers = {
  async getProjectWithDetails(projectId: string) {
    try {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      const { data: columns, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .eq('project_id', projectId)
        .order('position');

      if (columnsError) throw columnsError;

      const columnsWithTasks = await Promise.all(
        columns.map(async (column) => {
          const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select(`
              *,
              profiles:assigned_to (
                id,
                email,
                full_name,
                avatar_url
              )
            `)
            .eq('column_id', column.id)
            .order('position');

          if (tasksError) throw tasksError;

          return {
            ...column,
            tasks: tasks || [],
          };
        })
      );

      return {
        data: {
          ...project,
          columns: columnsWithTasks,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getUserProjects(userId: string) {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members!inner(role)
        `)
        .order('created_at', { ascending: false });

      return { data: projects, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getAssignedTasks(userId: string, limit = 10) {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          priority,
          due_date,
          column_id
        `)
        .eq('assigned_to', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return { data: tasks, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async searchUsers(query: string, currentUserId: string, limit = 10) {
    try {
      const { data: users, error } = await supabase
        .from('user_search')
        .select('id, email, full_name, avatar_url')
        .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
        .neq('id', currentUserId)
        .limit(limit);

      return { data: users, error };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// Export the appropriate database adapter and helpers
export const db: DatabaseAdapter = USE_POSTGRES && postgresAdapter ? postgresAdapter : supabase;
export const dbHelpers: DatabaseHelpers = USE_POSTGRES && postgresHelpers ? postgresHelpers : supabaseHelpers;

// Export database provider info
export const databaseConfig = {
  provider: DATABASE_PROVIDER,
  isPostgres: USE_POSTGRES,
  isSupabase: !USE_POSTGRES,
};

// Utility function to check if PostgreSQL is available
export const isPostgresAvailable = () => {
  return USE_POSTGRES && postgresAdapter !== null;
};

// Utility function to get current database provider
export const getDatabaseProvider = () => {
  return DATABASE_PROVIDER;
};

// Export types for compatibility
export type { Database }; 