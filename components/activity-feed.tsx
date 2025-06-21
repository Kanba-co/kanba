'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  MessageSquare, 
  Users,
  FolderOpen,
  Columns,
  CheckSquare
} from 'lucide-react';

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: string;
  user_id: string;
  profiles: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface ActivityFeedProps {
  projectId: string;
  limit?: number;
}

export function ActivityFeed({ projectId, limit = 20 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [projectId]);

  const loadActivities = async () => {
    try {
      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          profiles:user_id (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data: activities, error } = await query;

      if (error) throw error;
      setActivities(activities || []);
    } catch (error: any) {
      console.error('Error loading activities:', error);
      toast.error('Failed to load activity feed');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (entityType: string, action: string) => {
    switch (entityType) {
      case 'project':
        return <FolderOpen className="h-4 w-4" />;
      case 'column':
        return <Columns className="h-4 w-4" />;
      case 'task':
        return <CheckSquare className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'member':
        return <Users className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'updated':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'deleted':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const formatActivityMessage = (activity: ActivityLog) => {
    const { action, entity_type, details } = activity;
    const userName = activity.profiles.full_name || activity.profiles.email;
    
    switch (entity_type) {
      case 'project':
        return `${userName} ${action} the project`;
      case 'column':
        const columnName = details?.name || details?.new?.name || 'a column';
        return `${userName} ${action} column "${columnName}"`;
      case 'task':
        const taskTitle = details?.title || details?.new?.title || 'a task';
        return `${userName} ${action} task "${taskTitle}"`;
      case 'comment':
        return `${userName} ${action} a comment`;
      case 'member':
        if (action === 'created') {
          return `${userName} joined the project`;
        } else if (action === 'deleted') {
          return `${userName} left the project`;
        }
        return `${userName} ${action} a team member`;
      default:
        return `${userName} ${action} ${entity_type}`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          See what your team has been working on
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={activity.profiles.avatar_url || ''} alt={activity.profiles.full_name || ''} />
                <AvatarFallback className="text-xs">
                  {activity.profiles.full_name 
                    ? activity.profiles.full_name.charAt(0).toUpperCase() 
                    : activity.profiles.email.charAt(0).toUpperCase()
                  }
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <div className={`p-1 rounded-full ${getActivityColor(activity.action)}`}>
                    {getActivityIcon(activity.entity_type, activity.action)}
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {activity.action}
                  </Badge>
                </div>
                
                <p className="text-sm text-foreground mt-1">
                  {formatActivityMessage(activity)}
                </p>
                
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(activity.created_at)}
                </p>
              </div>
            </div>
          ))}

          {activities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No activity yet</p>
              <p className="text-sm">Activity will appear here as your team works on the project</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}