/* eslint-disable react/no-unescaped-entities */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { TeamManagement } from '@/components/team-management';
import { TaskComments } from '@/components/task-comments';
import { ActivityFeed } from '@/components/activity-feed';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/components/user-provider';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Plus, 
  MoreHorizontal,
  Calendar,
  Flag,
  User,
  Loader2,
  Edit,
  Trash2,
  MessageSquare,
  Users,
  Activity,
  Code,
  Share2
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { DropResult } from '@hello-pangea/dnd';
import { nanoid } from 'nanoid';

const KanbanBoard = dynamic(() => import('@/components/kanban-board').then(mod => mod.KanbanBoard), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});

import type { Project as ProjectBase, Profile, Column, Task, ProjectMember } from '@/lib/types';

type Project = ProjectBase & { public_share_token?: string };


export default function ProjectPage() {
  const { user, signOut } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [editColumnDialogOpen, setEditColumnDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [projectRenameDialogOpen, setProjectRenameDialogOpen] = useState(false);
  const [projectDeleteDialogOpen, setProjectDeleteDialogOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  
  // Task form state - FIXED: Use undefined instead of empty string for assigned_to
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState<string | undefined>(undefined);
  
  // Column form state
  const [columnName, setColumnName] = useState('');
  
  // Project form state
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  
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

  // Prevent page reload after project deletion
  useEffect(() => {
    if (project === null && !loading) {
      router.push('/dashboard');
    }
  }, [project, loading, router]);

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
      
      await loadProject();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const loadProject = async () => {
    try {
      // Get project by slug
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', projectId)
        .single();

      if (projectError) throw projectError;
      setProject(project);

      // Load project members
      await loadProjectMembers();

      // Get columns with tasks
      const { data: columns, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .eq('project_id', project?.id)
        .order('position');

      if (columnsError) throw columnsError;

      // Get tasks for each column with assigned user info
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

      setColumns(columnsWithTasks);
    } catch (error: any) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project');
      router.push('/dashboard');
    }
  };

  const loadProjectMembers = async () => {
    try {
      const { data: members, error } = await supabase
        .from('project_members')
        .select(`
          *,
          profiles:user_id (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('project_id', project?.id);

      if (error) throw error;
      setProjectMembers(members || []);
    } catch (error: any) {
      console.error('Error loading project members:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedColumnId || !taskTitle.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreating(true);

    try {
      // Get the next position for the task
      const column = columns.find(c => c.id === selectedColumnId);
      const nextPosition = column ? column.tasks.length : 0;

      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          title: taskTitle.trim(),
          description: taskDescription.trim() || null,
          column_id: selectedColumnId,
          position: nextPosition,
          priority: taskPriority,
          due_date: taskDueDate || null,
          assigned_to: taskAssignedTo || null, // FIXED: Use null instead of empty string
          created_by: user!.id,
          updated_by: user!.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Task created successfully!');
      
      // Reset form
      resetTaskForm();
      setTaskDialogOpen(false);
      
      // Reload project data
      await loadProject();
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error.message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !editingTask || !taskTitle.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreating(true);

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: taskTitle.trim(),
          description: taskDescription.trim() || null,
          column_id: selectedColumnId,
          priority: taskPriority,
          due_date: taskDueDate || null,
          assigned_to: taskAssignedTo || null, // FIXED: Use null instead of empty string
          updated_by: user!.id,
        })
        .eq('id', editingTask.id);

      if (error) throw error;

      toast.success('Task updated successfully!');
      
      // Reset form
      resetTaskForm();
      setEditTaskDialogOpen(false);
      setEditingTask(null);
      
      // Reload project data
      await loadProject();
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error(error.message || 'Failed to update task');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast.success('Task deleted successfully!');
      await loadProject();
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error(error.message || 'Failed to delete task');
    }
  };

  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!columnName.trim()) {
      toast.error('Please enter a column name');
      return;
    }

    setCreating(true);

    try {
      const nextPosition = columns.length;

      const { data: column, error } = await supabase
        .from('columns')
        .insert({
          name: columnName.trim(),
          project_id: project?.id,
          position: nextPosition,
          created_by: user!.id,
          updated_by: user!.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Column created successfully!');
      
      // Reset form
      setColumnName('');
      setColumnDialogOpen(false);
      
      // Reload project data
      await loadProject();
    } catch (error: any) {
      console.error('Error creating column:', error);
      toast.error(error.message || 'Failed to create column');
    } finally {
      setCreating(false);
    }
  };

  const handleEditColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingColumn || !columnName.trim()) {
      toast.error('Please enter a column name');
      return;
    }

    setCreating(true);

    try {
      const { error } = await supabase
        .from('columns')
        .update({
          name: columnName.trim(),
          updated_by: user!.id,
        })
        .eq('id', editingColumn.id);

      if (error) throw error;

      toast.success('Column renamed successfully!');
      
      // Reset form
      setColumnName('');
      setEditColumnDialogOpen(false);
      setEditingColumn(null);
      
      // Reload project data
      await loadProject();
    } catch (error: any) {
      console.error('Error renaming column:', error);
      toast.error(error.message || 'Failed to rename column');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId);

      if (error) throw error;

      toast.success('Column deleted successfully!');
      await loadProject();
    } catch (error: any) {
      console.error('Error deleting column:', error);
      toast.error(error.message || 'Failed to delete column');
    }
  };

  const handleRenameProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project || !projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    try {
      const newSlug = generateSlug(projectName);
      
      const { error } = await supabase
        .from('projects')
        .update({
          name: projectName.trim(),
          description: projectDescription.trim() || null,
          slug: newSlug,
        })
        .eq('id', project.id);

      if (error) throw error;

      toast.success('Project updated successfully!');
      setProjectRenameDialogOpen(false);
      await loadProject();
      
      // Call callback to update sidebar
      handleProjectUpdate('rename', project.id);
      
      // Navigate to new slug if it changed
      if (newSlug !== project.slug) {
        router.push(`/dashboard/projects/${newSlug}`);
      }
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error(error.message || 'Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;

    setDeletingProject(true);
    try {
      // First, delete all tasks in the project (using .in() for multiple column IDs)
      if (columns.length > 0) {
        const columnIds = columns.map(col => col.id);
        const { error: tasksError } = await supabase
          .from('tasks')
          .delete()
          .in('column_id', columnIds);

        if (tasksError) throw tasksError;
      }

      // Then, delete all columns in the project
      const { error: columnsError } = await supabase
        .from('columns')
        .delete()
        .eq('project_id', project.id);

      if (columnsError) throw columnsError;

      // Delete project members
      const { error: membersError } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', project.id);

      if (membersError) throw membersError;

      // Finally, delete the project
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (projectError) throw projectError;

      toast.success('Project deleted successfully!');
      
      // Clear all states
      setProject(null);
      setColumns([]);
      setProjectMembers([]);
      setProjectDeleteDialogOpen(false);
      
      // Call callback to update sidebar
      handleProjectUpdate('delete', project.id);
      
      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error(error.message || 'Failed to delete project');
    } finally {
      setDeletingProject(false);
    }
  };

  const openRenameProjectDialog = () => {
    if (project) {
      // First update form states
      setProjectName(project.name);
      setProjectDescription(project.description || '');
      
      // Then delay dialog opening to prevent UI freezing
      setTimeout(() => {
        setProjectRenameDialogOpen(true);
      }, 50);
    }
  };

  const openTaskDialog = (columnId: string) => {
    setSelectedColumnId(columnId);
    setTaskDialogOpen(true);
  };

  const openEditTaskDialog = (task: Task) => {
    // First update all form states
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskPriority(task.priority);
    setTaskDueDate(task.due_date ? task.due_date.split('T')[0] : '');
    setTaskAssignedTo(task.assigned_to || undefined);
    setSelectedColumnId(task.column_id);
    
    // Then delay dialog opening to prevent UI freezing
    setTimeout(() => {
      setEditTaskDialogOpen(true);
    }, 50);
  };

  const openEditColumnDialog = (column: Column) => {
    // First update form state
    setEditingColumn(column);
    setColumnName(column.name);
    
    // Then delay dialog opening to prevent UI freezing
    setTimeout(() => {
      setEditColumnDialogOpen(true);
    }, 50);
  };

  const openCommentsDialog = (task: Task) => {
    // First update state
    setSelectedTask(task);
    
    // Then delay dialog opening to prevent UI freezing
    setTimeout(() => {
      setCommentsDialogOpen(true);
    }, 50);
  };

  const openDeleteProjectDialog = () => {
    // Delay dialog opening to prevent UI freezing
    setTimeout(() => {
      setProjectDeleteDialogOpen(true);
    }, 50);
  };

  const handleShareProject = async () => {
    if (!project) return;
    let token = project.public_share_token;
    if (!token) {
      token = nanoid(16);
      const { error } = await supabase
        .from('projects')
        .update({ public_share_token: token })
        .eq('id', project.id);
      if (error) {
        toast.error('Error creating share link.');
        return;
      }
      setProject({ ...project, public_share_token: token });
    }
    setShareUrl(`${window.location.origin}/share/${token}`);
    setShareDialogOpen(true);
  };

  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('medium');
    setTaskDueDate('');
    setTaskAssignedTo(undefined); // FIXED: Use undefined instead of empty string
    setSelectedColumnId('');
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = columns.find(col => col.id === source.droppableId);
    const finishColumn = columns.find(col => col.id === destination.droppableId);

    if (!startColumn || !finishColumn) return;

    const startTasks = Array.from(startColumn.tasks);
    const [movedTask] = startTasks.splice(source.index, 1);

    // Optimistic UI Update
    if (startColumn === finishColumn) {
      // Moving within the same column
      const newTasks = Array.from(startTasks);
      newTasks.splice(destination.index, 0, movedTask);

      const newColumn = {
        ...startColumn,
        tasks: newTasks,
      };

      setColumns(prev =>
        prev.map(col => (col.id === newColumn.id ? newColumn : col))
      );

      // Update database
      const updatePromises = newTasks.map((task, index) =>
        supabase
          .from('tasks')
          .update({ position: index, updated_by: user!.id })
          .eq('id', task.id)
      );
      await Promise.all(updatePromises);
      toast.success('Task reordered!');

    } else {
      // Moving to a different column
      const finishTasks = Array.from(finishColumn.tasks);
      finishTasks.splice(destination.index, 0, movedTask);

      const newStartColumn = {
        ...startColumn,
        tasks: startTasks,
      };
      const newFinishColumn = {
        ...finishColumn,
        tasks: finishTasks,
      };

      setColumns(prev =>
        prev.map(col => {
          if (col.id === newStartColumn.id) return newStartColumn;
          if (col.id === newFinishColumn.id) return newFinishColumn;
          return col;
        })
      );
      
      // Update database
      try {
        // 1. Update moved task's column and position
        await supabase
          .from('tasks')
          .update({
            column_id: destination.droppableId,
            position: destination.index,
            updated_by: user!.id
          })
          .eq('id', draggableId);

        // 2. Update positions in the source column
        const sourceUpdatePromises = startTasks.map((task, index) =>
          supabase
            .from('tasks')
            .update({ position: index, updated_by: user!.id })
            .eq('id', task.id)
        );

        // 3. Update positions in the destination column
        const finishUpdatePromises = finishTasks.map((task, index) =>
          supabase
            .from('tasks')
            .update({ position: index, updated_by: user!.id })
            .eq('id', task.id)
        );

        await Promise.all([...sourceUpdatePromises, ...finishUpdatePromises]);
        toast.success('Task moved to new column!');
      } catch (error) {
        console.error("Error moving task:", error);
        toast.error("Failed to move task. Reverting changes.");
        // Revert UI on error
        await loadProject();
      }
    }
  };


  const isProjectOwner = project?.user_id === user?.id;

  // Project update handler
  const handleProjectUpdate = (action: 'rename' | 'delete', projectId?: string) => {
    if ((window as any).handleProjectUpdate) {
      (window as any).handleProjectUpdate(action, projectId);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 overflow-auto ">
        <div className="max-w-7xl h-screen px-4 border border-border sm:px-6 lg:px-8 py-8  mx-4 my-4 rounded-xl shadow-sm bg-white dark:bg-[#0A0A0A]">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Project not found</h1>
            <p className="text-muted-foreground mb-4">
              The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
            </p>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="mb-8">
       
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-semibold">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground mt-1">{project.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              Created {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={openRenameProjectDialog}>
                  <Edit className="h-4 w-4 mr-2" />
                  Rename Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareProject}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Code className="h-4 w-4 mr-2" />
                  Embed (soon)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={openDeleteProjectDialog}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> 
                <Dialog open={columnDialogOpen} onOpenChange={setColumnDialogOpen}>
                  <DialogTrigger asChild>
                        <Button size="xs" variant="default" className="text-xs">
                          <Plus className="h-4 w-4" />
                          Add Column
                        </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Column</DialogTitle>
                      <DialogDescription>
                        Add a new column to organize your tasks.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateColumn} className="space-y-4">
                      <div className="space-y-2">
                        <Input
                          id="columnName"
                          value={columnName}
                          onChange={(e) => setColumnName(e.target.value)}
                          placeholder="Enter column name"
                          required
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button type="submit" size="xs" disabled={creating} className="flex-1">
                          {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Create Column
                        </Button>
                        <Button type="button" variant="outline" size="xs" onClick={() => setColumnDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="board" className="space-y-6">
        <TabsList>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Team
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="space-y-6">
          <KanbanBoard
            columns={columns}
            projectMembers={projectMembers}
            handleDragEnd={handleDragEnd}
            onEditColumn={openEditColumnDialog}
            onDeleteColumn={handleDeleteColumn}
            onAddTask={openTaskDialog}
            onEditTask={openEditTaskDialog}
            onDeleteTask={handleDeleteTask}
            onViewComments={openCommentsDialog}
          />
        </TabsContent>

        <TabsContent value="team">
          <TeamManagement 
            projectId={project?.id}
            userSubscriptionStatus={profile?.subscription_status || 'free'}
            isProjectOwner={isProjectOwner}
          />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityFeed projectId={project?.id} />
        </TabsContent>
      </Tabs>

      {/* Edit Task Dialog */}
      <Dialog key={editingTask?.id || 'edit-dialog'} open={editTaskDialogOpen} onOpenChange={setEditTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the task details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editColumn">Column *</Label>
              <Select value={selectedColumnId} onValueChange={setSelectedColumnId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editTitle">Task Title *</Label>
              <Input
                id="editTitle"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Enter task title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Enter task description (optional)"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editPriority">Priority</Label>
                <Select value={taskPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setTaskPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editDueDate">Due Date</Label>
                <Input
                  id="editDueDate"
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editAssignedTo">Assign To</Label>
              <Select value={taskAssignedTo || ''} onValueChange={(value) => setTaskAssignedTo(value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {projectMembers.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.profiles.full_name || member.profiles.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" size="xs" disabled={creating} className="flex-1">
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Task
              </Button>
              <Button type="button" size="xs" variant="outline" onClick={() => setEditTaskDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Column Dialog */}
      <Dialog open={editColumnDialogOpen} onOpenChange={setEditColumnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Column</DialogTitle>
            <DialogDescription>
              Change the name of this column.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditColumn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editColumnName">Column Name *</Label>
              <Input
                id="editColumnName"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                placeholder="Enter column name"
                required
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={creating} className="flex-1">
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Rename Column
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditColumnDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Comments Dialog */}
      <Dialog open={commentsDialogOpen} onOpenChange={setCommentsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              {selectedTask?.title}
            </DialogTitle>
            <DialogDescription>
              Task comments and discussion
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <TaskComments 
              taskId={selectedTask.id} 
              currentUserId={user!.id}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Rename Project Dialog */}
      <Dialog open={projectRenameDialogOpen} onOpenChange={setProjectRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Update the project name and description.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRenameProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectDescription">Description</Label>
              <Textarea
                id="projectDescription"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Enter project description (optional)"
                rows={3}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" size="xs" disabled={creating} className="flex-1">
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Project
              </Button>
              <Button type="button" size="xs" variant="outline" onClick={() => setProjectRenameDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={projectDeleteDialogOpen} onOpenChange={setProjectDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone and will permanently remove all tasks, columns, and team members.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button 
              variant="destructive" 
              onClick={handleDeleteProject}
              disabled={deletingProject}
              className="flex-1"
            >
              {deletingProject && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Project
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setProjectDeleteDialogOpen(false)}
              disabled={deletingProject}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your project board.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="column">Column *</Label>
              <Select value={selectedColumnId} onValueChange={setSelectedColumnId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Enter task title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Enter task description (optional)"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={taskPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setTaskPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign To</Label>
              <Select value={taskAssignedTo || ''} onValueChange={(value) => setTaskAssignedTo(value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {projectMembers.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.profiles.full_name || member.profiles.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" size="xs" disabled={creating} className="flex-1">
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Task
              </Button>
              <Button type="button" variant="outline" size="xs" onClick={() => setTaskDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Project Share</DialogTitle>
            <DialogDescription>
You can share this link with everyone to see your board.
           </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 mt-4">
            <Input value={shareUrl} readOnly className="flex-1" />
            <Button type="button" onClick={() => {navigator.clipboard.writeText(shareUrl); toast.success('Link copied!')}}>
              Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}