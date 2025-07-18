'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/components/user-provider';
import { toast } from 'sonner';
import { Plus, FolderOpen, Calendar, Users, Crown, Bell, CheckSquare, User, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useTheme } from 'next-themes';

interface Project {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  created_at: string;
  user_id: string;
  // For shared projects
  project_members?: {
    role: string;
  }[];
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_status: 'free' | 'pro' | null;
}

interface TaskAssignment {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  project_name: string;
  project_id: string;
  project_slug: string;
  column_name: string;
}

export default function DashboardPage() {
  const { user, signOut } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<TaskAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { theme, setTheme } = useTheme();


  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    checkUser();
  }, [user, router]);

  const checkUser = async () => {
    if (!user) return;
    
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profile);

      // Get user projects (both owned and shared)
      const { data: projects } = await supabase
        .from('projects')
        .select(`
          *,
          project_members!inner(role)
        `)
        .order('created_at', { ascending: false });
      
      setProjects(projects || []);

      // Get tasks assigned to the user
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          priority,
          due_date,
          column_id
        `)
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (tasks) {
        // Get column and project info for each task
        const formattedTasks = await Promise.all(
          tasks.map(async (task: any) => {
            // Get column info
            const { data: column } = await supabase
              .from('columns')
              .select(`
                name,
                project_id
              `)
              .eq('id', task.column_id)
              .single();

            // Get project info
            const { data: project } = await supabase
              .from('projects')
              .select('id, name, slug')
              .eq('id', column?.project_id)
              .single();

            return {
              id: task.id,
              title: task.title,
              priority: task.priority,
              due_date: task.due_date,
              project_name: project?.name || 'Unknown Project',
              project_id: project?.id || '',
              project_slug: project?.slug || '',
              column_name: column?.name || 'Unknown Column',
            };
          })
        );
        setAssignedTasks(formattedTasks);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const canCreateProject = () => {
    if (!profile) return false;
    const ownedProjects = projects.filter(p => p.user_id === user?.id);
    return profile.subscription_status === 'pro' || ownedProjects.length < 1;
  };

  const getProjectRole = (project: Project) => {
    if (project.user_id === user?.id) return 'owner';
    return project.project_members?.[0]?.role || 'member';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.full_name || user?.email} 👋
          </p>
          
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={profile?.subscription_status === 'pro' ? 'default' : 'secondary'}>
            {profile?.subscription_status === 'pro' ? (
              <><Crown className="h-3 w-3 mr-1" /> Pro</>
            ) : (
              'Free'
            )}
          </Badge>
          {profile?.subscription_status !== 'pro' && (
            <Button size='xs' asChild className='text-xs'>
              <Link href="/dashboard/billing">Upgrade to Pro</Link>
            </Button>
          )}
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between  ">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <div className="text-sm font-bold">{projects.length}</div>            
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between  ">
            <CardTitle className="text-sm font-medium">Assigned Tasks</CardTitle>
            <div className="text-sm font-bold">{assignedTasks.length}</div>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between ">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <div className="text-sm font-bold">
              {projects.filter(p => new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
            </div>            
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between ">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <div className="text-sm font-bold capitalize">
              {profile?.subscription_status || 'Free'}
            </div>            
          </CardHeader>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Projects</h2>
            <Button 
              onClick={() => router.push('/dashboard/projects/new')}
              disabled={!canCreateProject()}
              size="xs"
              className='text-xs'
            >
              <Plus className="h-4 w-4 " />
              New Project
            </Button>
          </div>

          {!canCreateProject() && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/10">
              <CardContent className="pt-6">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  You&apos;ve reached the free plan limit of 1 project. 
                  <Link href="/dashboard/billing" className="font-medium underline ml-1">
                    Upgrade to Pro
                  </Link> for unlimited projects.
                </p>
              </CardContent>
            </Card>
          )}

          {projects.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="mb-2">No projects yet</CardTitle>
                <CardDescription className="mb-4">
                  Create your first project to get started with Kanba
                </CardDescription>
                <Button onClick={() => router.push('/dashboard/projects/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => {
                const role = getProjectRole(project);
                const isOwner = project.user_id === user?.id;
                
                return (
                  <Card key={project.id} onClick={() => router.push(`/dashboard/projects/${project.slug}`)} className="hover:shadow-md transition-shadow cursor-pointer border-gradient">

                    <CardHeader>

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <CardDescription>
                            {project.description || 'No description'}
                          </CardDescription>
                        </div>
                        <Badge variant={isOwner ? 'default' : 'secondary'} className="ml-2">
                          {role}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {isOwner ? 'Created' : 'Joined'} {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      
                      </div>
                    </CardContent>
                    </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Assigned Tasks Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                <span className="text-lg font-normal">Tasks Assigned to You</span>
              </CardTitle>
              <CardDescription>
                Recent tasks you need to work on
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignedTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks assigned</p>
                  <p className="text-sm">Tasks assigned to you will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm leading-tight flex-1">
                          {task.title}
                        </h4>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ml-2 ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>📁 {task.project_name}</p>
                        <p>📋 {task.column_name}</p>
                        {task.due_date && (
                          <p>📅 Due {new Date(task.due_date).toLocaleDateString()}</p>
                        )}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={() => router.push(`/dashboard/projects/${task.project_slug}`)}
                      >
                        View Project
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>
              <span className="text-lg font-normal">
              Quick Actions</span></CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/projects/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Project
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/billing">
                  <Crown className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}