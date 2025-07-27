/**
 * Database Usage Examples
 * 
 * This file demonstrates how to use the new database abstraction layer
 * that allows seamless switching between Supabase and PostgreSQL.
 */

import { db, dbHelpers, databaseConfig } from './database';

// Example 1: Basic database operations
export async function exampleBasicOperations() {
  // These work the same way for both Supabase and PostgreSQL
  
  // Get user profile
  const { data: profile, error } = await db.profiles
    .select('*')
    .eq('id', 'user-id')
    .single();

  // Create a new project
  const { data: project, error: projectError } = await db.projects.insert({
    name: 'My Project',
    description: 'A new project',
    user_id: 'user-id',
    slug: 'my-project',
  });

  // Update a task
  const { data: updatedTask, error: taskError } = await db.tasks.update({
    id: 'task-id',
    title: 'Updated task title',
    priority: 'high',
  });

  // Get tasks with relations (works with both adapters)
  const { data: tasks, error: tasksError } = await db.tasks
    .select('*')
    .eq('column_id', 'column-id')
    .include({
      assignee: {
        select: {
          id: true,
          email: true,
          full_name: true,
        },
      },
    })
    .order('position');
}

// Example 2: Using helper functions
export async function exampleHelperFunctions() {
  // These helper functions work with both databases
  
  // Get project with all details
  const { data: project, error } = await dbHelpers.getProjectWithDetails('project-id');
  
  // Get user's projects
  const { data: projects, error: projectsError } = await dbHelpers.getUserProjects('user-id');
  
  // Get assigned tasks
  const { data: tasks, error: tasksError } = await dbHelpers.getAssignedTasks('user-id', 10);
  
  // Search users for team collaboration
  const { data: users, error: usersError } = await dbHelpers.searchUsers('john', 'current-user-id', 5);
}

// Example 3: Checking database provider
export function exampleDatabaseProvider() {
  console.log('Current database provider:', databaseConfig.provider);
  console.log('Is PostgreSQL?', databaseConfig.isPostgres);
  console.log('Is Supabase?', databaseConfig.isSupabase);
  
  // You can conditionally use different logic based on the provider
  if (databaseConfig.isPostgres) {
    console.log('Using PostgreSQL with Prisma');
  } else {
    console.log('Using Supabase');
  }
}

// Example 4: Error handling
export async function exampleErrorHandling() {
  try {
    const { data, error } = await db.projects
      .select('*')
      .eq('user_id', 'user-id')
      .execute();
    
    if (error) {
      console.error('Database error:', error);
      return;
    }
    
    console.log('Projects:', data);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Example 5: Complex queries
export async function exampleComplexQueries() {
  // Get projects with member information
  const { data: projects, error } = await db.projects
    .select('*')
    .include({
      project_members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              full_name: true,
            },
          },
        },
      },
    })
    .order('created_at', { ascending: false });
}

// Example 6: Migration from existing Supabase code
export async function exampleMigration() {
  // OLD WAY (Supabase only):
  // const { data, error } = await supabase
  //   .from('projects')
  //   .select('*')
  //   .eq('user_id', userId);
  
  // NEW WAY (works with both Supabase and PostgreSQL):
  const { data, error } = await db.projects
    .select('*')
    .eq('user_id', 'user-id');
  
  return { data, error };
}

// Example 7: Environment-based configuration
export function exampleEnvironmentConfig() {
  // You can check which database is being used
  const provider = databaseConfig.provider;
  
  // Configure different settings based on the provider
  const config = {
    cacheTimeout: provider === 'postgresql' ? 300 : 60, // PostgreSQL can handle longer cache
    batchSize: provider === 'postgresql' ? 1000 : 100,  // PostgreSQL can handle larger batches
    retryAttempts: provider === 'postgresql' ? 3 : 1,   // PostgreSQL might need more retries
  };
  
  return config;
} 