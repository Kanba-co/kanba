/*
  # Enable Project Sharing Between Team Members

  1. Problem
    - Current RLS policies only allow project owners to see their own projects
    - Team members can't see projects they've been invited to
    - This breaks the core collaboration feature

  2. Solution
    - Update project policies to include team member access
    - Add proper team member visibility for columns, tasks, comments, and activity
    - Maintain security while enabling collaboration

  3. Security
    - Team members can only see projects they're explicitly added to
    - Maintain proper access control based on roles
    - Keep data secure while enabling sharing
*/

-- Update projects policies to include team member access
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view accessible projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    -- Own projects
    user_id = auth.uid()
    OR
    -- Projects where user is a team member
    id IN (
      SELECT pm.project_id 
      FROM project_members pm 
      WHERE pm.user_id = auth.uid()
    )
  );

-- Update columns policies to include team member access
DROP POLICY IF EXISTS "Users can view columns in own projects" ON columns;
CREATE POLICY "Users can view columns in accessible projects"
  ON columns
  FOR SELECT
  TO authenticated
  USING (
    -- Own projects
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
    OR
    -- Projects where user is a team member
    project_id IN (
      SELECT pm.project_id 
      FROM project_members pm 
      WHERE pm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create columns in own projects" ON columns;
CREATE POLICY "Users can create columns in accessible projects"
  ON columns
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Own projects
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
    OR
    -- Projects where user is a team member
    project_id IN (
      SELECT pm.project_id 
      FROM project_members pm 
      WHERE pm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update columns in own projects" ON columns;
CREATE POLICY "Users can update columns in accessible projects"
  ON columns
  FOR UPDATE
  TO authenticated
  USING (
    -- Own projects
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
    OR
    -- Projects where user is a team member
    project_id IN (
      SELECT pm.project_id 
      FROM project_members pm 
      WHERE pm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete columns in own projects" ON columns;
CREATE POLICY "Users can delete columns in accessible projects"
  ON columns
  FOR DELETE
  TO authenticated
  USING (
    -- Own projects (owners can delete)
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
    OR
    -- Projects where user is admin (admins can delete)
    project_id IN (
      SELECT pm.project_id 
      FROM project_members pm 
      WHERE pm.user_id = auth.uid() AND pm.role IN ('admin')
    )
  );

-- Update tasks policies to include team member access
DROP POLICY IF EXISTS "Users can view tasks in own projects" ON tasks;
CREATE POLICY "Users can view tasks in accessible projects"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    column_id IN (
      SELECT c.id FROM columns c
      JOIN projects p ON p.id = c.project_id
      WHERE p.user_id = auth.uid()
      OR p.id IN (
        SELECT pm.project_id 
        FROM project_members pm 
        WHERE pm.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can create tasks in own projects" ON tasks;
CREATE POLICY "Users can create tasks in accessible projects"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    column_id IN (
      SELECT c.id FROM columns c
      JOIN projects p ON p.id = c.project_id
      WHERE p.user_id = auth.uid()
      OR p.id IN (
        SELECT pm.project_id 
        FROM project_members pm 
        WHERE pm.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can update tasks in own projects" ON tasks;
CREATE POLICY "Users can update tasks in accessible projects"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (
    column_id IN (
      SELECT c.id FROM columns c
      JOIN projects p ON p.id = c.project_id
      WHERE p.user_id = auth.uid()
      OR p.id IN (
        SELECT pm.project_id 
        FROM project_members pm 
        WHERE pm.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete tasks in own projects" ON tasks;
CREATE POLICY "Users can delete tasks in accessible projects"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (
    column_id IN (
      SELECT c.id FROM columns c
      JOIN projects p ON p.id = c.project_id
      WHERE p.user_id = auth.uid()
      OR p.id IN (
        SELECT pm.project_id 
        FROM project_members pm 
        WHERE pm.user_id = auth.uid()
      )
    )
  );

-- Update project_members policies to include team member visibility
DROP POLICY IF EXISTS "Users can view members of own projects" ON project_members;
CREATE POLICY "Users can view members of accessible projects"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (
    -- Own projects
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
    OR
    -- Projects where user is a team member
    project_id IN (
      SELECT pm.project_id 
      FROM project_members pm 
      WHERE pm.user_id = auth.uid()
    )
    OR
    -- Users can always see their own membership
    user_id = auth.uid()
  );

-- Update task_comments policies to include team member access
DROP POLICY IF EXISTS "Users can view comments in own projects" ON task_comments;
CREATE POLICY "Users can view comments in accessible projects"
  ON task_comments
  FOR SELECT
  TO authenticated
  USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN columns c ON c.id = t.column_id
      JOIN projects p ON p.id = c.project_id
      WHERE p.user_id = auth.uid()
      OR p.id IN (
        SELECT pm.project_id 
        FROM project_members pm 
        WHERE pm.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can create comments in own projects" ON task_comments;
CREATE POLICY "Users can create comments in accessible projects"
  ON task_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN columns c ON c.id = t.column_id
      JOIN projects p ON p.id = c.project_id
      WHERE p.user_id = auth.uid()
      OR p.id IN (
        SELECT pm.project_id 
        FROM project_members pm 
        WHERE pm.user_id = auth.uid()
      )
    )
    AND user_id = auth.uid()
  );

-- Update activity_logs policies to include team member access
DROP POLICY IF EXISTS "Users can view activity in own projects" ON activity_logs;
CREATE POLICY "Users can view activity in accessible projects"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
    OR
    project_id IN (
      SELECT pm.project_id 
      FROM project_members pm 
      WHERE pm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create activity in own projects" ON activity_logs;
CREATE POLICY "Users can create activity in accessible projects"
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
    OR
    project_id IN (
      SELECT pm.project_id 
      FROM project_members pm 
      WHERE pm.user_id = auth.uid()
    )
  );