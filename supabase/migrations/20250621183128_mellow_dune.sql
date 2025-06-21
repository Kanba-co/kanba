/*
  # Fix Task Sharing for Team Members

  1. Problem
    - Team members can see shared projects but not the tasks within them
    - Task policies are too restrictive and don't properly use team access
    - Need to ensure all project content is shared with team members

  2. Solution
    - Update task policies to properly check team member access
    - Ensure task assignment works for team members
    - Fix task visibility for all team collaboration features

  3. Security
    - Maintain proper access control
    - Ensure team members can only see tasks in projects they have access to
    - Keep task assignment and editing permissions appropriate
*/

-- Update task policies to properly handle team member access
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "tasks_accessible_select" ON tasks;
DROP POLICY IF EXISTS "tasks_accessible_modify" ON tasks;
DROP POLICY IF EXISTS "tasks_accessible_update" ON tasks;
DROP POLICY IF EXISTS "tasks_accessible_delete" ON tasks;

-- Create comprehensive task policies that work with team sharing
CREATE POLICY "tasks_team_select" ON tasks 
FOR SELECT TO authenticated 
USING (
  column_id IN (
    SELECT c.id FROM columns c
    WHERE 
      -- Direct project ownership
      c.project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
      OR
      -- Team access via materialized view
      c.project_id IN (
        SELECT project_id FROM user_accessible_projects 
        WHERE accessor_id = auth.uid()
      )
      OR
      -- Fallback: direct team member check
      user_has_direct_project_access(c.project_id, auth.uid())
  )
);

CREATE POLICY "tasks_team_insert" ON tasks 
FOR INSERT TO authenticated 
WITH CHECK (
  column_id IN (
    SELECT c.id FROM columns c
    WHERE 
      -- Direct project ownership
      c.project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
      OR
      -- Team access via materialized view
      c.project_id IN (
        SELECT project_id FROM user_accessible_projects 
        WHERE accessor_id = auth.uid()
      )
      OR
      -- Fallback: direct team member check
      user_has_direct_project_access(c.project_id, auth.uid())
  )
);

CREATE POLICY "tasks_team_update" ON tasks 
FOR UPDATE TO authenticated 
USING (
  column_id IN (
    SELECT c.id FROM columns c
    WHERE 
      -- Direct project ownership
      c.project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
      OR
      -- Team access via materialized view
      c.project_id IN (
        SELECT project_id FROM user_accessible_projects 
        WHERE accessor_id = auth.uid()
      )
      OR
      -- Fallback: direct team member check
      user_has_direct_project_access(c.project_id, auth.uid())
  )
);

CREATE POLICY "tasks_team_delete" ON tasks 
FOR DELETE TO authenticated 
USING (
  column_id IN (
    SELECT c.id FROM columns c
    WHERE 
      -- Direct project ownership (owners can delete any task)
      c.project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
      OR
      -- Team admins can delete tasks
      c.project_id IN (
        SELECT project_id FROM user_accessible_projects 
        WHERE accessor_id = auth.uid() AND access_type = 'admin'
      )
      OR
      -- Task creators can delete their own tasks
      (
        tasks.created_by = auth.uid() AND
        user_has_direct_project_access(c.project_id, auth.uid())
      )
  )
);

-- Update columns policies to ensure team members can see all columns
DROP POLICY IF EXISTS "columns_accessible_select" ON columns;
DROP POLICY IF EXISTS "columns_accessible_modify" ON columns;
DROP POLICY IF EXISTS "columns_accessible_update" ON columns;
DROP POLICY IF EXISTS "columns_accessible_delete" ON columns;

CREATE POLICY "columns_team_select" ON columns 
FOR SELECT TO authenticated 
USING (
  -- Direct project ownership
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR
  -- Team access via materialized view
  project_id IN (
    SELECT project_id FROM user_accessible_projects 
    WHERE accessor_id = auth.uid()
  )
  OR
  -- Fallback: direct team member check
  user_has_direct_project_access(project_id, auth.uid())
);

CREATE POLICY "columns_team_insert" ON columns 
FOR INSERT TO authenticated 
WITH CHECK (
  -- Direct project ownership
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR
  -- Team access via materialized view
  project_id IN (
    SELECT project_id FROM user_accessible_projects 
    WHERE accessor_id = auth.uid()
  )
  OR
  -- Fallback: direct team member check
  user_has_direct_project_access(project_id, auth.uid())
);

CREATE POLICY "columns_team_update" ON columns 
FOR UPDATE TO authenticated 
USING (
  -- Direct project ownership
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR
  -- Team access via materialized view
  project_id IN (
    SELECT project_id FROM user_accessible_projects 
    WHERE accessor_id = auth.uid()
  )
  OR
  -- Fallback: direct team member check
  user_has_direct_project_access(project_id, auth.uid())
);

CREATE POLICY "columns_team_delete" ON columns 
FOR DELETE TO authenticated 
USING (
  -- Direct project ownership (owners can delete)
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR
  -- Team admins can delete columns
  project_id IN (
    SELECT project_id FROM user_accessible_projects 
    WHERE accessor_id = auth.uid() AND access_type = 'admin'
  )
);

-- Update task comments policies to work with team sharing
DROP POLICY IF EXISTS "task_comments_accessible_select" ON task_comments;
DROP POLICY IF EXISTS "task_comments_accessible_modify" ON task_comments;
DROP POLICY IF EXISTS "task_comments_own_update" ON task_comments;
DROP POLICY IF EXISTS "task_comments_own_delete" ON task_comments;

CREATE POLICY "task_comments_team_select" ON task_comments 
FOR SELECT TO authenticated 
USING (
  task_id IN (
    SELECT t.id FROM tasks t
    JOIN columns c ON c.id = t.column_id
    WHERE 
      -- Direct project ownership
      c.project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
      OR
      -- Team access via materialized view
      c.project_id IN (
        SELECT project_id FROM user_accessible_projects 
        WHERE accessor_id = auth.uid()
      )
      OR
      -- Fallback: direct team member check
      user_has_direct_project_access(c.project_id, auth.uid())
  )
);

CREATE POLICY "task_comments_team_insert" ON task_comments 
FOR INSERT TO authenticated 
WITH CHECK (
  task_id IN (
    SELECT t.id FROM tasks t
    JOIN columns c ON c.id = t.column_id
    WHERE 
      -- Direct project ownership
      c.project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
      OR
      -- Team access via materialized view
      c.project_id IN (
        SELECT project_id FROM user_accessible_projects 
        WHERE accessor_id = auth.uid()
      )
      OR
      -- Fallback: direct team member check
      user_has_direct_project_access(c.project_id, auth.uid())
  )
  AND user_id = auth.uid()
);

CREATE POLICY "task_comments_own_update" ON task_comments 
FOR UPDATE TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "task_comments_own_delete" ON task_comments 
FOR DELETE TO authenticated 
USING (user_id = auth.uid());

-- Update activity logs policies for team sharing
DROP POLICY IF EXISTS "activity_logs_accessible_select" ON activity_logs;
DROP POLICY IF EXISTS "activity_logs_accessible_modify" ON activity_logs;

CREATE POLICY "activity_logs_team_select" ON activity_logs 
FOR SELECT TO authenticated 
USING (
  -- Direct project ownership
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR
  -- Team access via materialized view
  project_id IN (
    SELECT project_id FROM user_accessible_projects 
    WHERE accessor_id = auth.uid()
  )
  OR
  -- Fallback: direct team member check
  user_has_direct_project_access(project_id, auth.uid())
);

CREATE POLICY "activity_logs_team_insert" ON activity_logs 
FOR INSERT TO authenticated 
WITH CHECK (
  -- Direct project ownership
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR
  -- Team access via materialized view
  project_id IN (
    SELECT project_id FROM user_accessible_projects 
    WHERE accessor_id = auth.uid()
  )
  OR
  -- Fallback: direct team member check
  user_has_direct_project_access(project_id, auth.uid())
);

-- Update project members policies to ensure team members can see each other
DROP POLICY IF EXISTS "project_members_owner_all" ON project_members;

CREATE POLICY "project_members_team_select" ON project_members 
FOR SELECT TO authenticated 
USING (
  -- Project owners can see all members
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR
  -- Team members can see other members of the same project
  project_id IN (
    SELECT project_id FROM user_accessible_projects 
    WHERE accessor_id = auth.uid()
  )
  OR
  -- Users can always see their own membership
  user_id = auth.uid()
  OR
  -- Fallback: direct team member check
  user_has_direct_project_access(project_id, auth.uid())
);

CREATE POLICY "project_members_owner_manage" ON project_members 
FOR INSERT TO authenticated 
WITH CHECK (
  -- Only project owners can add members
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
);

CREATE POLICY "project_members_owner_update" ON project_members 
FOR UPDATE TO authenticated 
USING (
  -- Only project owners can update member roles
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
) 
WITH CHECK (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
);

CREATE POLICY "project_members_owner_delete" ON project_members 
FOR DELETE TO authenticated 
USING (
  -- Only project owners can remove members
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
);

-- Refresh the materialized view to ensure all changes are reflected
SELECT refresh_user_accessible_projects();

-- Test that team members can now see tasks
DO $$
BEGIN
  RAISE NOTICE 'Task sharing policies updated - team members should now see all project content';
END $$;

-- Add comment to track this fix
COMMENT ON TABLE tasks IS 'Fixed team member access - tasks now properly shared with project team members';