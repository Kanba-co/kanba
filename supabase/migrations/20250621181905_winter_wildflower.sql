/*
  # Enable Team Collaboration and Add Notifications

  1. Problem Fixes
    - Team members can't see shared projects on dashboard
    - Need notifications for task assignments
    - Current policies only allow project owners access

  2. New Features
    - Update policies to allow team members to see shared projects
    - Add notifications table for task assignments
    - Add notification component to dashboard

  3. Security
    - Maintain proper access control
    - Team members can only see projects they're invited to
    - Notifications are private to each user
*/

-- First, update the policies to allow team members to see shared projects
-- We need to modify the existing simple policies to include team member access

-- Drop the restrictive project policies
DROP POLICY IF EXISTS "projects_select_owner" ON projects;

-- Create new policy that allows both owners and team members to see projects
CREATE POLICY "projects_select_accessible" ON projects 
FOR SELECT TO authenticated 
USING (
  -- Project owner can see their projects
  auth.uid() = user_id
  OR
  -- Team members can see projects they're invited to
  id IN (
    SELECT project_id FROM project_members 
    WHERE user_id = auth.uid()
  )
);

-- Update columns policies to include team member access
DROP POLICY IF EXISTS "columns_select_owner" ON columns;
CREATE POLICY "columns_select_accessible" ON columns 
FOR SELECT TO authenticated 
USING (
  project_id IN (
    -- Own projects
    SELECT id FROM projects WHERE user_id = auth.uid()
    UNION
    -- Projects where user is a member
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "columns_insert_owner" ON columns;
CREATE POLICY "columns_insert_accessible" ON columns 
FOR INSERT TO authenticated 
WITH CHECK (
  project_id IN (
    -- Own projects
    SELECT id FROM projects WHERE user_id = auth.uid()
    UNION
    -- Projects where user is a member
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "columns_update_owner" ON columns;
CREATE POLICY "columns_update_accessible" ON columns 
FOR UPDATE TO authenticated 
USING (
  project_id IN (
    -- Own projects
    SELECT id FROM projects WHERE user_id = auth.uid()
    UNION
    -- Projects where user is a member
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "columns_delete_owner" ON columns;
CREATE POLICY "columns_delete_accessible" ON columns 
FOR DELETE TO authenticated 
USING (
  project_id IN (
    -- Only owners and admins can delete columns
    SELECT id FROM projects WHERE user_id = auth.uid()
    UNION
    SELECT project_id FROM project_members 
    WHERE user_id = auth.uid() AND role IN ('admin')
  )
);

-- Update tasks policies to include team member access
DROP POLICY IF EXISTS "tasks_select_owner" ON tasks;
CREATE POLICY "tasks_select_accessible" ON tasks 
FOR SELECT TO authenticated 
USING (
  column_id IN (
    SELECT c.id FROM columns c 
    WHERE c.project_id IN (
      -- Own projects
      SELECT id FROM projects WHERE user_id = auth.uid()
      UNION
      -- Projects where user is a member
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "tasks_insert_owner" ON tasks;
CREATE POLICY "tasks_insert_accessible" ON tasks 
FOR INSERT TO authenticated 
WITH CHECK (
  column_id IN (
    SELECT c.id FROM columns c 
    WHERE c.project_id IN (
      -- Own projects
      SELECT id FROM projects WHERE user_id = auth.uid()
      UNION
      -- Projects where user is a member
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "tasks_update_owner" ON tasks;
CREATE POLICY "tasks_update_accessible" ON tasks 
FOR UPDATE TO authenticated 
USING (
  column_id IN (
    SELECT c.id FROM columns c 
    WHERE c.project_id IN (
      -- Own projects
      SELECT id FROM projects WHERE user_id = auth.uid()
      UNION
      -- Projects where user is a member
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "tasks_delete_owner" ON tasks;
CREATE POLICY "tasks_delete_accessible" ON tasks 
FOR DELETE TO authenticated 
USING (
  column_id IN (
    SELECT c.id FROM columns c 
    WHERE c.project_id IN (
      -- Own projects
      SELECT id FROM projects WHERE user_id = auth.uid()
      UNION
      -- Projects where user is a member
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  )
);

-- Update task comments policies
DROP POLICY IF EXISTS "task_comments_select_owner" ON task_comments;
CREATE POLICY "task_comments_select_accessible" ON task_comments 
FOR SELECT TO authenticated 
USING (
  task_id IN (
    SELECT t.id FROM tasks t
    JOIN columns c ON c.id = t.column_id
    WHERE c.project_id IN (
      -- Own projects
      SELECT id FROM projects WHERE user_id = auth.uid()
      UNION
      -- Projects where user is a member
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "task_comments_insert_owner" ON task_comments;
CREATE POLICY "task_comments_insert_accessible" ON task_comments 
FOR INSERT TO authenticated 
WITH CHECK (
  task_id IN (
    SELECT t.id FROM tasks t
    JOIN columns c ON c.id = t.column_id
    WHERE c.project_id IN (
      -- Own projects
      SELECT id FROM projects WHERE user_id = auth.uid()
      UNION
      -- Projects where user is a member
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  )
  AND user_id = auth.uid()
);

-- Update activity logs policies
DROP POLICY IF EXISTS "activity_logs_select_owner" ON activity_logs;
CREATE POLICY "activity_logs_select_accessible" ON activity_logs 
FOR SELECT TO authenticated 
USING (
  project_id IN (
    -- Own projects
    SELECT id FROM projects WHERE user_id = auth.uid()
    UNION
    -- Projects where user is a member
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "activity_logs_insert_owner" ON activity_logs;
CREATE POLICY "activity_logs_insert_accessible" ON activity_logs 
FOR INSERT TO authenticated 
WITH CHECK (
  project_id IN (
    -- Own projects
    SELECT id FROM projects WHERE user_id = auth.uid()
    UNION
    -- Projects where user is a member
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
  )
);

-- Create notifications table for task assignments and other events
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('task_assigned', 'task_updated', 'project_invited', 'comment_added')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications (users can only see their own)
CREATE POLICY "notifications_select_own" ON notifications 
FOR SELECT TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_any" ON notifications 
FOR INSERT TO authenticated 
WITH CHECK (true); -- Allow inserting notifications for any user

CREATE POLICY "notifications_update_own" ON notifications 
FOR UPDATE TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_delete_own" ON notifications 
FOR DELETE TO authenticated 
USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Create function to create task assignment notifications
CREATE OR REPLACE FUNCTION create_task_assignment_notification()
RETURNS trigger AS $$
DECLARE
  task_title text;
  project_name text;
  assigner_name text;
BEGIN
  -- Only create notification if assigned_to changed and is not null
  IF (TG_OP = 'UPDATE' AND OLD.assigned_to IS DISTINCT FROM NEW.assigned_to AND NEW.assigned_to IS NOT NULL) 
     OR (TG_OP = 'INSERT' AND NEW.assigned_to IS NOT NULL) THEN
    
    -- Get task title
    task_title := NEW.title;
    
    -- Get project name
    SELECT p.name INTO project_name
    FROM projects p
    JOIN columns c ON c.project_id = p.id
    WHERE c.id = NEW.column_id;
    
    -- Get assigner name (current user)
    SELECT COALESCE(full_name, email) INTO assigner_name
    FROM profiles
    WHERE id = auth.uid();
    
    -- Create notification for the assigned user
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data
    ) VALUES (
      NEW.assigned_to,
      'task_assigned',
      'New Task Assignment',
      format('%s assigned you to task "%s" in project "%s"', 
             COALESCE(assigner_name, 'Someone'), 
             task_title, 
             COALESCE(project_name, 'Unknown Project')),
      jsonb_build_object(
        'task_id', NEW.id,
        'task_title', task_title,
        'project_name', project_name,
        'assigned_by', auth.uid(),
        'assigned_by_name', assigner_name
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for task assignment notifications
CREATE OR REPLACE TRIGGER task_assignment_notification_trigger
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION create_task_assignment_notification();

-- Create function to create project invitation notifications
CREATE OR REPLACE FUNCTION create_project_invitation_notification()
RETURNS trigger AS $$
DECLARE
  project_name text;
  inviter_name text;
BEGIN
  -- Only for new project members
  IF TG_OP = 'INSERT' THEN
    
    -- Get project name
    SELECT name INTO project_name
    FROM projects
    WHERE id = NEW.project_id;
    
    -- Get inviter name
    SELECT COALESCE(full_name, email) INTO inviter_name
    FROM profiles
    WHERE id = NEW.invited_by;
    
    -- Create notification for the invited user (skip if it's the project owner adding themselves)
    IF NEW.user_id != NEW.invited_by THEN
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        data
      ) VALUES (
        NEW.user_id,
        'project_invited',
        'Project Invitation',
        format('%s invited you to collaborate on project "%s"', 
               COALESCE(inviter_name, 'Someone'), 
               COALESCE(project_name, 'Unknown Project')),
        jsonb_build_object(
          'project_id', NEW.project_id,
          'project_name', project_name,
          'invited_by', NEW.invited_by,
          'invited_by_name', inviter_name,
          'role', NEW.role
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for project invitation notifications
CREATE OR REPLACE TRIGGER project_invitation_notification_trigger
  AFTER INSERT ON project_members
  FOR EACH ROW EXECUTE FUNCTION create_project_invitation_notification();

-- Update the updated_at trigger for notifications
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment to track this migration
COMMENT ON TABLE notifications IS 'Notifications for task assignments and project invitations - enables team collaboration';