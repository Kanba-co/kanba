/*
  # Team Collaboration Features for Pro Plan

  1. New Tables
    - `project_members`: Manages team members for projects
      - Links users to projects with roles
      - Only Pro users can add team members
    
    - `task_comments`: Comments system for tasks
      - Users can comment on tasks
      - Shows who commented and when
    
    - `activity_logs`: Activity tracking for projects
      - Tracks who created/updated tasks, columns, etc.
      - Shows activity feed for team collaboration

  2. Security
    - Enable RLS on all new tables
    - Add policies for team member access
    - Ensure only Pro users can invite team members

  3. Updates
    - Add created_by and updated_by fields to existing tables
    - Track user activity for better collaboration
*/

-- Create project_members table for team collaboration
CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  invited_by uuid REFERENCES profiles(id),
  invited_at timestamptz DEFAULT now(),
  joined_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create task_comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('project', 'column', 'task', 'comment', 'member')),
  entity_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add created_by and updated_by fields to existing tables
DO $$
BEGIN
  -- Add to projects table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE projects ADD COLUMN created_by uuid REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE projects ADD COLUMN updated_by uuid REFERENCES profiles(id);
  END IF;

  -- Add to columns table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'columns' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE columns ADD COLUMN created_by uuid REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'columns' AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE columns ADD COLUMN updated_by uuid REFERENCES profiles(id);
  END IF;

  -- Add to tasks table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE tasks ADD COLUMN created_by uuid REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE tasks ADD COLUMN updated_by uuid REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'assigned_to'
  ) THEN
    ALTER TABLE tasks ADD COLUMN assigned_to uuid REFERENCES profiles(id);
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for project_members
CREATE POLICY "Users can view project members if they are members"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
    OR 
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can manage members"
  ON project_members
  FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid()
    )
    OR
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid()
    )
    OR
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Create policies for task_comments
CREATE POLICY "Users can view comments on accessible tasks"
  ON task_comments
  FOR SELECT
  TO authenticated
  USING (
    task_id IN (
      SELECT tasks.id FROM tasks
      JOIN columns ON columns.id = tasks.column_id
      JOIN projects ON projects.id = columns.project_id
      WHERE projects.user_id = auth.uid()
      OR projects.id IN (
        SELECT project_id FROM project_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create comments on accessible tasks"
  ON task_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    task_id IN (
      SELECT tasks.id FROM tasks
      JOIN columns ON columns.id = tasks.column_id
      JOIN projects ON projects.id = columns.project_id
      WHERE projects.user_id = auth.uid()
      OR projects.id IN (
        SELECT project_id FROM project_members 
        WHERE user_id = auth.uid()
      )
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own comments"
  ON task_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON task_comments
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for activity_logs
CREATE POLICY "Users can view activity logs for accessible projects"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid()
    )
    OR
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create activity logs for accessible projects"
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid()
    )
    OR
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

-- Update existing policies for projects to include team members
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view accessible projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR
    id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update accessible projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR
    id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update existing policies for columns to include team members
DROP POLICY IF EXISTS "Users can view columns of own projects" ON columns;
CREATE POLICY "Users can view columns of accessible projects"
  ON columns
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = columns.project_id 
      AND (
        projects.user_id = auth.uid()
        OR
        projects.id IN (
          SELECT project_id FROM project_members 
          WHERE user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can create columns in own projects" ON columns;
CREATE POLICY "Users can create columns in accessible projects"
  ON columns
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = columns.project_id 
      AND (
        projects.user_id = auth.uid()
        OR
        projects.id IN (
          SELECT project_id FROM project_members 
          WHERE user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can update columns in own projects" ON columns;
CREATE POLICY "Users can update columns in accessible projects"
  ON columns
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = columns.project_id 
      AND (
        projects.user_id = auth.uid()
        OR
        projects.id IN (
          SELECT project_id FROM project_members 
          WHERE user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete columns in own projects" ON columns;
CREATE POLICY "Users can delete columns in accessible projects"
  ON columns
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = columns.project_id 
      AND (
        projects.user_id = auth.uid()
        OR
        projects.id IN (
          SELECT project_id FROM project_members 
          WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
      )
    )
  );

-- Update existing policies for tasks to include team members
DROP POLICY IF EXISTS "Users can view tasks in own projects" ON tasks;
CREATE POLICY "Users can view tasks in accessible projects"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM columns 
      JOIN projects ON projects.id = columns.project_id
      WHERE columns.id = tasks.column_id 
      AND (
        projects.user_id = auth.uid()
        OR
        projects.id IN (
          SELECT project_id FROM project_members 
          WHERE user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can create tasks in own projects" ON tasks;
CREATE POLICY "Users can create tasks in accessible projects"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM columns 
      JOIN projects ON projects.id = columns.project_id
      WHERE columns.id = tasks.column_id 
      AND (
        projects.user_id = auth.uid()
        OR
        projects.id IN (
          SELECT project_id FROM project_members 
          WHERE user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can update tasks in own projects" ON tasks;
CREATE POLICY "Users can update tasks in accessible projects"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM columns 
      JOIN projects ON projects.id = columns.project_id
      WHERE columns.id = tasks.column_id 
      AND (
        projects.user_id = auth.uid()
        OR
        projects.id IN (
          SELECT project_id FROM project_members 
          WHERE user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete tasks in own projects" ON tasks;
CREATE POLICY "Users can delete tasks in accessible projects"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM columns 
      JOIN projects ON projects.id = columns.project_id
      WHERE columns.id = tasks.column_id 
      AND (
        projects.user_id = auth.uid()
        OR
        projects.id IN (
          SELECT project_id FROM project_members 
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON task_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_id ON activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Create function to automatically add project owner as member
CREATE OR REPLACE FUNCTION add_project_owner_as_member()
RETURNS trigger AS $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role, joined_at)
  VALUES (NEW.id, NEW.user_id, 'owner', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to add project owner as member
CREATE OR REPLACE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION add_project_owner_as_member();

-- Create function to log activity
CREATE OR REPLACE FUNCTION log_activity()
RETURNS trigger AS $$
DECLARE
  project_id_val uuid;
  action_val text;
  entity_type_val text;
  details_val jsonb;
BEGIN
  -- Determine the project_id based on the table
  IF TG_TABLE_NAME = 'projects' THEN
    project_id_val := COALESCE(NEW.id, OLD.id);
    entity_type_val := 'project';
  ELSIF TG_TABLE_NAME = 'columns' THEN
    project_id_val := COALESCE(NEW.project_id, OLD.project_id);
    entity_type_val := 'column';
  ELSIF TG_TABLE_NAME = 'tasks' THEN
    SELECT columns.project_id INTO project_id_val
    FROM columns 
    WHERE columns.id = COALESCE(NEW.column_id, OLD.column_id);
    entity_type_val := 'task';
  ELSIF TG_TABLE_NAME = 'task_comments' THEN
    SELECT columns.project_id INTO project_id_val
    FROM columns 
    JOIN tasks ON tasks.column_id = columns.id
    WHERE tasks.id = COALESCE(NEW.task_id, OLD.task_id);
    entity_type_val := 'comment';
  ELSIF TG_TABLE_NAME = 'project_members' THEN
    project_id_val := COALESCE(NEW.project_id, OLD.project_id);
    entity_type_val := 'member';
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Determine the action
  IF TG_OP = 'INSERT' THEN
    action_val := 'created';
    details_val := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    action_val := 'updated';
    details_val := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    action_val := 'deleted';
    details_val := to_jsonb(OLD);
  END IF;

  -- Insert activity log
  INSERT INTO activity_logs (
    project_id,
    user_id,
    action,
    entity_type,
    entity_id,
    details
  ) VALUES (
    project_id_val,
    auth.uid(),
    action_val,
    entity_type_val,
    COALESCE(NEW.id, OLD.id),
    details_val
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for activity logging
CREATE OR REPLACE TRIGGER log_project_activity
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE OR REPLACE TRIGGER log_column_activity
  AFTER INSERT OR UPDATE OR DELETE ON columns
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE OR REPLACE TRIGGER log_task_activity
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE OR REPLACE TRIGGER log_comment_activity
  AFTER INSERT OR UPDATE OR DELETE ON task_comments
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE OR REPLACE TRIGGER log_member_activity
  AFTER INSERT OR UPDATE OR DELETE ON project_members
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Update the updated_at triggers for new tables
CREATE TRIGGER update_project_members_updated_at
  BEFORE UPDATE ON project_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON task_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();