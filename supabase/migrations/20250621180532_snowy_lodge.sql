/*
  # Fix Infinite Recursion in RLS Policies

  1. Problem
    - RLS policies are causing infinite recursion when checking project_members
    - The policies reference project_members table within project access checks
    - This creates circular dependencies

  2. Solution
    - Create helper functions to check project access
    - Use these functions in policies to avoid direct table references
    - Simplify the policy structure

  3. Security
    - Maintain proper access control
    - Ensure team members can access shared projects
    - Prevent unauthorized access
*/

-- Create a function to check if user has access to a project
CREATE OR REPLACE FUNCTION user_has_project_access(project_uuid uuid, user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  -- Check if user owns the project
  IF EXISTS (
    SELECT 1 FROM projects 
    WHERE id = project_uuid AND user_id = user_uuid
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user is a member of the project
  IF EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_id = project_uuid AND user_id = user_uuid
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user can manage project (owner or admin)
CREATE OR REPLACE FUNCTION user_can_manage_project(project_uuid uuid, user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  -- Check if user owns the project
  IF EXISTS (
    SELECT 1 FROM projects 
    WHERE id = project_uuid AND user_id = user_uuid
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user is an admin of the project
  IF EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_id = project_uuid AND user_id = user_uuid AND role = 'admin'
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view accessible projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

DROP POLICY IF EXISTS "Users can view columns in accessible projects" ON columns;
DROP POLICY IF EXISTS "Users can create columns in accessible projects" ON columns;
DROP POLICY IF EXISTS "Users can update columns in accessible projects" ON columns;
DROP POLICY IF EXISTS "Users can delete columns in accessible projects" ON columns;

DROP POLICY IF EXISTS "Users can view tasks in accessible projects" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks in accessible projects" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks in accessible projects" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks in accessible projects" ON tasks;

DROP POLICY IF EXISTS "Users can view members of accessible projects" ON project_members;
DROP POLICY IF EXISTS "Project owners can manage members" ON project_members;

DROP POLICY IF EXISTS "Users can view comments in accessible projects" ON task_comments;
DROP POLICY IF EXISTS "Users can create comments in accessible projects" ON task_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON task_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON task_comments;

DROP POLICY IF EXISTS "Users can view activity in accessible projects" ON activity_logs;
DROP POLICY IF EXISTS "Users can create activity in accessible projects" ON activity_logs;

-- Create new non-recursive policies using the helper functions

-- Projects policies
CREATE POLICY "Users can view accessible projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (user_has_project_access(id, auth.uid()));

CREATE POLICY "Users can create projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update accessible projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (user_can_manage_project(id, auth.uid()))
  WITH CHECK (user_can_manage_project(id, auth.uid()));

CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Columns policies
CREATE POLICY "Users can view columns in accessible projects"
  ON columns
  FOR SELECT
  TO authenticated
  USING (user_has_project_access(project_id, auth.uid()));

CREATE POLICY "Users can create columns in accessible projects"
  ON columns
  FOR INSERT
  TO authenticated
  WITH CHECK (user_has_project_access(project_id, auth.uid()));

CREATE POLICY "Users can update columns in accessible projects"
  ON columns
  FOR UPDATE
  TO authenticated
  USING (user_has_project_access(project_id, auth.uid()));

CREATE POLICY "Users can delete columns in accessible projects"
  ON columns
  FOR DELETE
  TO authenticated
  USING (user_can_manage_project(project_id, auth.uid()));

-- Tasks policies
CREATE POLICY "Users can view tasks in accessible projects"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM columns c
      WHERE c.id = tasks.column_id 
      AND user_has_project_access(c.project_id, auth.uid())
    )
  );

CREATE POLICY "Users can create tasks in accessible projects"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM columns c
      WHERE c.id = tasks.column_id 
      AND user_has_project_access(c.project_id, auth.uid())
    )
  );

CREATE POLICY "Users can update tasks in accessible projects"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM columns c
      WHERE c.id = tasks.column_id 
      AND user_has_project_access(c.project_id, auth.uid())
    )
  );

CREATE POLICY "Users can delete tasks in accessible projects"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM columns c
      WHERE c.id = tasks.column_id 
      AND user_has_project_access(c.project_id, auth.uid())
    )
  );

-- Project members policies (simplified to avoid recursion)
CREATE POLICY "Users can view project members"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (
    -- Project owners can see all members
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
    OR
    -- Users can see their own membership
    user_id = auth.uid()
    OR
    -- Members can see other members of the same project
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Project owners can manage members"
  ON project_members
  FOR ALL
  TO authenticated
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  )
  WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- Task comments policies
CREATE POLICY "Users can view comments in accessible projects"
  ON task_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN columns c ON c.id = t.column_id
      WHERE t.id = task_comments.task_id 
      AND user_has_project_access(c.project_id, auth.uid())
    )
  );

CREATE POLICY "Users can create comments in accessible projects"
  ON task_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN columns c ON c.id = t.column_id
      WHERE t.id = task_comments.task_id 
      AND user_has_project_access(c.project_id, auth.uid())
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update own comments"
  ON task_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON task_comments
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Activity logs policies
CREATE POLICY "Users can view activity in accessible projects"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (user_has_project_access(project_id, auth.uid()));

CREATE POLICY "Users can create activity in accessible projects"
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_has_project_access(project_id, auth.uid()));

-- Grant execute permissions on the helper functions
GRANT EXECUTE ON FUNCTION user_has_project_access(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION user_can_manage_project(uuid, uuid) TO authenticated;