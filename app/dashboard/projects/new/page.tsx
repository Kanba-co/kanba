'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/components/user-provider';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectSlug, setProjectSlug] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;

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

  // Generate slug from project name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Check if slug is available
  const checkSlugAvailability = async (slug: string) => {
    if (!slug.trim()) {
      setSlugAvailable(null);
      return;
    }

    setCheckingSlug(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', slug.trim())
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned - slug is available
        setSlugAvailable(true);
      } else if (data) {
        // Slug exists
        setSlugAvailable(false);
      } else {
        setSlugAvailable(false);
      }
    } catch (error) {
      console.error('Error checking slug:', error);
      setSlugAvailable(false);
    } finally {
      setCheckingSlug(false);
    }
  };

  // Auto-generate slug when project name changes
  useEffect(() => {
    if (projectName) {
      const generatedSlug = generateSlug(projectName);
      setProjectSlug(generatedSlug);
      checkSlugAvailability(generatedSlug);
    } else {
      setProjectSlug('');
      setSlugAvailable(null);
    }
  }, [projectName]);

  // Check slug availability when slug changes manually
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (projectSlug && projectSlug !== generateSlug(projectName)) {
        checkSlugAvailability(projectSlug);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [projectSlug, projectName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreateProject()) {
      toast.error('You have reached the free plan limit. Upgrade to Pro for unlimited projects.');
      return;
    }

    if (!projectSlug.trim()) {
      toast.error('Please enter a project slug');
      return;
    }

    if (slugAvailable === false) {
      toast.error('Please choose a different slug. This one is already taken.');
      return;
    }

    if (slugAvailable === null || checkingSlug) {
      toast.error('Please wait while we check slug availability');
      return;
    }

    setCreating(true);

    try {
      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectName,
          description: projectDescription || null,
          slug: projectSlug.trim(),
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

      // Notify sidebar to update
      if ((window as any).handleProjectUpdate) {
        (window as any).handleProjectUpdate('create', project.id);
      }

      toast.success('Project created successfully!');
      router.push(`/dashboard/projects/${project.slug}`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Failed to create project');
    } finally {
      setCreating(false);
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
    <div className="sm:mx-60">
      {/* Header */}
      <div className="mb-8 ">
         
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
          <CardTitle className="flex items-center text-lg">
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
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Project Slug *</Label>
              <div className="relative">
                <Input
                  id="slug"
                  type="text"
                  placeholder="project-slug"
                  value={projectSlug}
                  onChange={(e) => setProjectSlug(e.target.value)}
                  className={`pr-10 ${
                    slugAvailable === true ? 'border-green-500' : 
                    slugAvailable === false ? 'border-red-500' : ''
                  }`}
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {checkingSlug ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  ) : slugAvailable === true ? (
                    <div className="text-green-500">✓</div>
                  ) : slugAvailable === false ? (
                    <div className="text-red-500">✗</div>
                  ) : null}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                This will be used in the URL. Only lowercase letters, numbers, and hyphens are allowed.
              </p>
              {slugAvailable === false && (
                <p className="text-xs text-red-500">
                  This slug is already taken. Please choose a different one.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter project description (optional)"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={creating || !canCreateProject() || slugAvailable !== true || checkingSlug} 
                className="flex-1"
              >
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
    </>
  );
}