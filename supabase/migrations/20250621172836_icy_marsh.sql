/*
  # Fix Infinite Recursion in Project Members Policies

  1. Problem
    - The project_members policies were causing infinite recursion
    - Policies were referencing project_members table within project_members policies
    - This created a circular dependency

  2. Solution
    - Simplify the policies to avoid self-referencing
    - Use direct project ownership checks
    - Create clear, non-recursive access patterns

  3. Security
    - Maintain proper access control
    - Ensure only authorized users can manage team members
    - Keep data secure while fixing recursion
*/

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view project members if they are members" ON project_members;
DROP POLICY IF EXISTS "Project owners can manage members" ON project_members;

-- Create new, non-recursive policies for project_members
CREATE POLICY "Users can view members of their projects"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (
    -- Can view if they own the project
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid()
    )
    -- OR if they are the member being viewed
    OR user_id = auth.uid()
  );

CREATE POLICY "Project owners can insert members"
  ON project_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update members"
  ON project_members
  FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can delete members"
  ON project_members
  FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid()
    )
  );

-- Fix the projects policies to avoid recursion
DROP POLICY IF EXISTS "Users can view accessible projects" ON projects;
CREATE POLICY "Users can view accessible projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    -- Own projects
    auth.uid() = user_id
    -- OR projects where user is explicitly a member (direct check)
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = projects.id 
      AND pm.user_id = auth.uid()
    )
  );

-- Fix columns policies to avoid recursion
DROP POLICY IF EXISTS "Users can view columns of accessible projects" ON columns;
CREATE POLICY "Users can view columns of accessible projects"
  ON columns
  FOR SELECT
  TO authenticated
  USING (
    -- Own projects
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid()
    )
    -- OR member of project (direct check)
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = columns.project_id 
      AND pm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create columns in accessible projects" ON columns;
CREATE POLICY "Users can create columns in accessible projects"
  ON columns
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Own projects
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid()
    )
    -- OR member of project (direct check)
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = columns.project_id 
      AND pm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update columns in accessible projects" ON columns;
CREATE POLICY "Users can update columns in accessible projects"
  ON columns
  FOR UPDATE
  TO authenticated
  USING (
    -- Own projects
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid()
    )
    -- OR member of project (direct check)
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = columns.project_id 
      AND pm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete columns in accessible projects" ON columns;
CREATE POLICY "Users can delete columns in accessible projects"
  ON columns
  FOR DELETE
  TO authenticated
  USING (
    -- Only owners and admins can delete columns
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = columns.project_id 
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin')
    )
  );

-- Fix tasks policies to avoid recursion
DROP POLICY IF EXISTS "Users can view tasks in accessible projects" ON tasks;
CREATE POLICY "Users can view tasks in accessible projects"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM columns c
      JOIN projects p ON p.id = c.project_id
      WHERE c.id = tasks.column_id 
      AND (
        p.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id 
          AND pm.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can create tasks in accessible projects" ON tasks;
CREATE POLICY "Users can create tasks in accessible projects"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM columns c
      JOIN projects p ON p.id = c.project_id
      WHERE c.id = tasks.column_id 
      AND (
        p.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id 
          AND pm.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can update tasks in accessible projects" ON tasks;
CREATE POLICY "Users can update tasks in accessible projects"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM columns c
      JOIN projects p ON p.id = c.project_id
      WHERE c.id = tasks.column_id 
      AND (
        p.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id 
          AND pm.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete tasks in accessible projects" ON tasks;
CREATE POLICY "Users can delete tasks in accessible projects"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM columns c
      JOIN projects p ON p.id = c.project_id
      WHERE c.id = tasks.column_id 
      AND (
        p.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id 
          AND pm.user_id = auth.uid()
        )
      )
    )
  );

-- Fix task_comments policies
DROP POLICY IF EXISTS "Users can view comments on accessible tasks" ON task_comments;
CREATE POLICY "Users can view comments on accessible tasks"
  ON task_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN columns c ON c.id = t.column_id
      JOIN projects p ON p.id = c.project_id
      WHERE t.id = task_comments.task_id
      AND (
        p.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id 
          AND pm.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can create comments on accessible tasks" ON task_comments;
CREATE POLICY "Users can create comments on accessible tasks"
  ON task_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN columns c ON c.id = t.column_id
      JOIN projects p ON p.id = c.project_id
      WHERE t.id = task_comments.task_id
      AND (
        p.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id 
          AND pm.user_id = auth.uid()
        )
      )
    )
    AND user_id = auth.uid()
  );

-- Fix activity_logs policies
DROP POLICY IF EXISTS "Users can view activity logs for accessible projects" ON activity_logs;
CREATE POLICY "Users can view activity logs for accessible projects"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    -- Own projects
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid()
    )
    -- OR member of project (direct check)
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = activity_logs.project_id 
      AND pm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create activity logs for accessible projects" ON activity_logs;
CREATE POLICY "Users can create activity logs for accessible projects"
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Own projects
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid()
    )
    -- OR member of project (direct check)
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = activity_logs.project_id 
      AND pm.user_id = auth.uid()
    )
  );