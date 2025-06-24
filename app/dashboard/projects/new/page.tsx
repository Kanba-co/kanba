'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppSidebar } from '@/components/app-sidebar';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/components/user-provider';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  subscription_status: 'free' | 'pro' | null;
}

export default function NewProjectPage() {
  const { user, signOut } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projectCount, setProjectCount] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

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

      // Get project count
      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      setProjectCount(count || 0);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load user data');
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
    return profile.subscription_status === 'pro' || projectCount < 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreateProject()) {
      toast.error('You have reached the free plan limit. Upgrade to Pro for unlimited projects.');
      return;
    }

    setCreating(true);

    try {
      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name,
          description: description || null,
          user_id: user!.id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create default columns
      const defaultColumns = [
        { name: 'To Do', position: 0 },
        { name: 'In Progress', position: 1 },
        { name: 'Done', position: 2 },
      ];

      const { error: columnsError } = await supabase
        .from('columns')
        .insert(
          defaultColumns.map(col => ({
            ...col,
            project_id: project.id,
          }))
        );

      if (columnsError) throw columnsError;

      toast.success('Project created successfully!');
      router.push(`/dashboard/projects/${project.id}`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#fafafa] dark:bg-[#171717]">
        <AppSidebar user={user} onSignOut={handleSignOut} />
        <div className="flex-1 flex items-center justify-center  mx-2 my-2 rounded-2xl bg-white dark:bg-[#0A0A0A]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
      <div className="flex h-screen bg-[#fafafa] dark:bg-[#171717]">
      <AppSidebar user={user} onSignOut={handleSignOut} />
      <div className="flex-1 overflow-auto">
      <div className="max-w-7xl h-screen px-4 border border-border sm:px-6 lg:px-8 py-8  mx-4 my-4 rounded-xl shadow-sm bg-white dark:bg-[#0A0A0A]">
      {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">Create New Project</h1>
            <p className="text-muted-foreground">
              Set up a new Kanban project to organize your work
            </p>
          </div>

          {/* Limit Warning */}
          {!canCreateProject() && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/10 mb-6">
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

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Project Details
              </CardTitle>
              <CardDescription>
                Enter the basic information for your new project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter project name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter project description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={creating || !canCreateProject()} className="flex-1">
                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Project
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/dashboard">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}