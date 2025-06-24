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
import { AppSidebar } from '@/components/app-sidebar';
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
  Activity
} from 'lucide-react';
import Link from 'next/link';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  user_id: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  subscription_status: 'free' | 'pro' | null;
}

interface Column {
  id: string;
  name: string;
  position: number;
  tasks: Task[];
}

interface Task {
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

interface ProjectMember {
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

interface SortableTaskProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onViewComments: (task: Task) => void;
  projectMembers: ProjectMember[];
}

interface DroppableColumnProps {
  column: Column;
  children: React.ReactNode;
  onEdit: (column: Column) => void;
  onDelete: (columnId: string) => void;
  onAddTask: (columnId: string) => void;
}

function DroppableColumn({ column, children, onEdit, onDelete, onAddTask }: DroppableColumnProps) {
  const {
    setNodeRef,
    isOver,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-80">
      <Card className={`transition-colors ${isOver ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">
              {column.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {column.tasks.length}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(column)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(column.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <SortableContext 
            items={column.tasks.map(task => task.id)} 
            strategy={verticalListSortingStrategy}
          >
            {children}
          </SortableContext>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            size="sm"
            onClick={() => onAddTask(column.id)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add a task
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SortableTask({ task, onEdit, onDelete, onViewComments, projectMembers }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAssignedUser = () => {
    if (!task.assigned_to) return null;
    return projectMembers.find(member => member.user_id === task.assigned_to);
  };

  const assignedUser = getAssignedUser();

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing"
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-sm leading-tight flex-1">
              {task.title}
            </h4>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={`text-xs ${getPriorityColor(task.priority)}`}
              >
                <Flag className="h-3 w-3 mr-1" />
                {task.priority}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewComments(task)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comments
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(task.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              {task.due_date && (
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(task.due_date)}
                </div>
              )}
            </div>
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              {assignedUser 
                ? (assignedUser.profiles.full_name || assignedUser.profiles.email)
                : 'Unassigned'
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  
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
  const projectId = params.id as string;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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
      // Get project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      setProject(project);

      // Load project members
      await loadProjectMembers();

      // Get columns with tasks
      const { data: columns, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .eq('project_id', projectId)
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
        .eq('project_id', projectId);

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
          project_id: projectId,
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
      const { error } = await supabase
        .from('projects')
        .update({
          name: projectName.trim(),
          description: projectDescription.trim() || null,
        })
        .eq('id', project.id);

      if (error) throw error;

      toast.success('Project updated successfully!');
      setProjectRenameDialogOpen(false);
      await loadProject();
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
      setProjectName(project.name);
      setProjectDescription(project.description || '');
      setProjectRenameDialogOpen(true);
    }
  };

  const openTaskDialog = (columnId: string) => {
    setSelectedColumnId(columnId);
    setTaskDialogOpen(true);
  };

  const openEditTaskDialog = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskPriority(task.priority);
    setTaskDueDate(task.due_date ? task.due_date.split('T')[0] : '');
    setTaskAssignedTo(task.assigned_to || undefined); // FIXED: Use undefined instead of empty string
    setSelectedColumnId(task.column_id);
    setEditTaskDialogOpen(true);
  };

  const openEditColumnDialog = (column: Column) => {
    setEditingColumn(column);
    setColumnName(column.name);
    setEditColumnDialogOpen(true);
  };

  const openCommentsDialog = (task: Task) => {
    setSelectedTask(task);
    setCommentsDialogOpen(true);
  };

  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('medium');
    setTaskDueDate('');
    setTaskAssignedTo(undefined); // FIXED: Use undefined instead of empty string
    setSelectedColumnId('');
  };

  const findContainer = (id: UniqueIdentifier) => {
    if (columns.some(col => col.id === id)) {
      return id;
    }

    return columns.find(col => 
      col.tasks.some(task => task.id === id)
    )?.id;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) return;

    // Find the active task
    const activeTask = columns
      .flatMap(col => col.tasks)
      .find(task => task.id === activeId);

    if (!activeTask) return;

    try {
      // If moving within the same container
      if (activeContainer === overContainer) {
        const container = columns.find(col => col.id === activeContainer);
        if (!container) return;

        const oldIndex = container.tasks.findIndex(task => task.id === activeId);
        let newIndex: number;

        if (overId === activeContainer) {
          // Dropped on the container itself (at the end)
          newIndex = container.tasks.length - 1;
        } else {
          // Dropped on a specific task
          newIndex = container.tasks.findIndex(task => task.id === overId);
        }

        if (oldIndex !== newIndex && newIndex >= 0) {
          const newTasks = arrayMove(container.tasks, oldIndex, newIndex);
          
          // Update local state immediately for better UX
          setColumns(prev => prev.map(col => {
            if (col.id === activeContainer) {
              return {
                ...col,
                tasks: newTasks
              };
            }
            return col;
          }));

          // Update positions in database
          const updatePromises = newTasks.map((task, index) => 
            supabase
              .from('tasks')
              .update({ 
                position: index,
                updated_by: user!.id
              })
              .eq('id', task.id)
          );

          await Promise.all(updatePromises);
          toast.success('Task moved successfully!');
        }
      } else {
        // Moving between containers - don't update UI immediately, wait for database update
        const sourceColumn = columns.find(col => col.id === activeContainer);
        const targetColumn = columns.find(col => col.id === overContainer);
        
        if (!sourceColumn || !targetColumn) return;

        let newPosition: number;
        if (overId === overContainer) {
          // Dropped on the container itself (at the end)
          newPosition = targetColumn.tasks.length;
        } else {
          // Dropped on a specific task
          const targetTaskIndex = targetColumn.tasks.findIndex(task => task.id === overId);
          newPosition = targetTaskIndex >= 0 ? targetTaskIndex : targetColumn.tasks.length;
        }

        // Update the moved task's column_id and position in database
        const { error: moveError } = await supabase
          .from('tasks')
          .update({ 
            column_id: overContainer,
            position: newPosition,
            updated_by: user!.id
          })
          .eq('id', activeId);

        if (moveError) {
          console.error('Failed to update task column_id:', moveError);
          throw moveError;
        }

        // Update positions of other tasks in target column (shift them down)
        const targetTasks = targetColumn.tasks.slice();
        const positionUpdatePromises = targetTasks
          .filter((_, index) => index >= newPosition)
          .map((task, index) => {
            const newPos = newPosition + index + 1;
            return supabase
              .from('tasks')
              .update({ 
                position: newPos,
                updated_by: user!.id
              })
              .eq('id', task.id);
          });

        await Promise.all(positionUpdatePromises);

        // Update positions in source column (compact the gaps)
        const sourceTasks = sourceColumn.tasks.filter(task => task.id !== activeId);
        const sourceUpdatePromises = sourceTasks.map((task, index) => {
          return supabase
            .from('tasks')
            .update({ 
              position: index,
              updated_by: user!.id
            })
            .eq('id', task.id);
        });

        await Promise.all(sourceUpdatePromises);

        // Reload data to ensure UI matches database
        await loadProject();
        toast.success('Task moved to new column successfully!');
      }
    } catch (error: any) {
      console.error('Error moving task:', error);
      toast.error('Failed to move task. Refreshing data...');
      // Reload to get correct state from database
      await loadProject();
    }
  };

  const getActiveTask = () => {
    if (!activeId) return null;
    return columns
      .flatMap(col => col.tasks)
      .find(task => task.id === activeId);
  };

  const isProjectOwner = project?.user_id === user?.id;

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

  if (!project) {
    return (
      <div className="flex h-screen">
        <AppSidebar user={user} onSignOut={handleSignOut} />
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setProjectDeleteDialogOpen(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={columns.length === 0}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </DialogTrigger>
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
                        <Button type="submit" disabled={creating} className="flex-1">
                          {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Create Task
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setTaskDialogOpen(false)}>
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
              {/* Kanban Board with Drag and Drop */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="flex gap-6 overflow-x-auto pb-4">
                  <SortableContext items={columns.map(col => col.id)}>
                    {columns.map((column) => (
                      <DroppableColumn
                        key={column.id}
                        column={column}
                        onEdit={openEditColumnDialog}
                        onDelete={handleDeleteColumn}
                        onAddTask={openTaskDialog}
                      >
                        {column.tasks.map((task) => (
                          <SortableTask
                            key={task.id}
                            task={task}
                            onEdit={openEditTaskDialog}
                            onDelete={handleDeleteTask}
                            onViewComments={openCommentsDialog}
                            projectMembers={projectMembers}
                          />
                        ))}
                      </DroppableColumn>
                    ))}
                  </SortableContext>
                  
                  {/* Add Column */}
                  <div className="flex-shrink-0 w-80">
                    <Dialog open={columnDialogOpen} onOpenChange={setColumnDialogOpen}>
                      <DialogTrigger asChild>
                        <Card className="border-dashed cursor-pointer hover:border-primary/50 transition-colors">
                          <CardContent className="flex items-center justify-center h-32">
                            <Button variant="ghost" className="text-muted-foreground">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Column
                            </Button>
                          </CardContent>
                        </Card>
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
                            <Label htmlFor="columnName">Column Name *</Label>
                            <Input
                              id="columnName"
                              value={columnName}
                              onChange={(e) => setColumnName(e.target.value)}
                              placeholder="Enter column name"
                              required
                            />
                          </div>
                          
                          <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={creating} className="flex-1">
                              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Create Column
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setColumnDialogOpen(false)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                  {activeId ? (
                    <div className="opacity-90 rotate-3 scale-105">
                      <SortableTask
                        task={getActiveTask()!}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        onViewComments={() => {}}
                        projectMembers={projectMembers}
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </TabsContent>

            <TabsContent value="team">
              <TeamManagement 
                projectId={projectId}
                userSubscriptionStatus={profile?.subscription_status || 'free'}
                isProjectOwner={isProjectOwner}
              />
            </TabsContent>

            <TabsContent value="activity">
              <ActivityFeed projectId={projectId} />
            </TabsContent>
          </Tabs>

          {/* Edit Task Dialog */}
          <Dialog open={editTaskDialogOpen} onOpenChange={setEditTaskDialogOpen}>
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
                  <Button type="submit" disabled={creating} className="flex-1">
                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Task
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditTaskDialogOpen(false)}>
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
                  <Button type="submit" disabled={creating} className="flex-1">
                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Project
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setProjectRenameDialogOpen(false)}>
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
        </div>
      </div>
    </div>
  );
}