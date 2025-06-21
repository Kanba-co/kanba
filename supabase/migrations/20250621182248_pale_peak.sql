/*
  # Enable Team Collaboration After Basic Functionality Works

  This migration enables team collaboration features after ensuring
  that basic project creation works without infinite recursion.
*/

-- Enable team collaboration now that basic policies are stable
SELECT enable_team_collaboration();

-- Add team-aware policies for other tables

-- COLUMNS: Add team member access
DROP POLICY IF EXISTS "columns_owner_all" ON columns;

CREATE POLICY "columns_accessible_select" ON columns 
FOR SELECT TO authenticated 
USING (
  project_id IN (
    SELECT project_id FROM user_accessible_projects 
    WHERE accessor_id = auth.uid()
  )
);

CREATE POLICY "columns_accessible_modify" ON columns 
FOR INSERT TO authenticated 
WITH CHECK (
  project_id IN (
    SELECT project_id FROM user_accessible_projects 
    WHERE accessor_id = auth.uid()
  )
);

CREATE POLICY "columns_accessible_update" ON columns 
FOR UPDATE TO authenticated 
USING (
  project_id IN (
    SELECT project_id FROM user_accessible_projects 
    WHERE accessor_id = auth.uid()
  )
);

CREATE POLICY "columns_accessible_delete" ON columns 
FOR DELETE TO authenticated 
USING (
  project_id IN (
    SELECT project_id FROM user_accessible_projects 
    WHERE accessor_id = auth.uid() AND access_type IN ('owner', 'admin')
  )
);

-- TASKS: Add team member access
DROP POLICY IF EXISTS "tasks_owner_all" ON tasks;

CREATE POLICY "tasks_accessible_select" ON tasks 
FOR SELECT TO authenticated 
USING (
  column_id IN (
    SELECT c.id FROM columns c
    WHERE c.project_id IN (
      SELECT project_id FROM user_accessible_projects 
      WHERE accessor_id = auth.uid()
    )
  )
);

CREATE POLICY "tasks_accessible_modify" ON tasks 
FOR INSERT TO authenticated 
WITH CHECK (
  column_id IN (
    SELECT c.id FROM columns c
    WHERE c.project_id IN (
      SELECT project_id FROM user_accessible_projects 
      WHERE accessor_id = auth.uid()
    )
  )
);

CREATE POLICY "tasks_accessible_update" ON tasks 
FOR UPDATE TO authenticated 
USING (
  column_id IN (
    SELECT c.id FROM columns c
    WHERE c.project_id IN (
      SELECT project_id FROM user_accessible_projects 
      WHERE accessor_id = auth.uid()
    )
  )
);

CREATE POLICY "tasks_accessible_delete" ON tasks 
FOR DELETE TO authenticated 
USING (
  column_id IN (
    SELECT c.id FROM columns c
    WHERE c.project_id IN (
      SELECT project_id FROM user_accessible_projects 
      WHERE accessor_id = auth.uid()
    )
  )
);

-- TASK_COMMENTS: Add team member access
DROP POLICY IF EXISTS "task_comments_owner_all" ON task_comments;

CREATE POLICY "task_comments_accessible_select" ON task_comments 
FOR SELECT TO authenticated 
USING (
  task_id IN (
    SELECT t.id FROM tasks t
    JOIN columns c ON c.id = t.column_id
    WHERE c.project_id IN (
      SELECT project_id FROM user_accessible_projects 
      WHERE accessor_id = auth.uid()
    )
  )
);

CREATE POLICY "task_comments_accessible_modify" ON task_comments 
FOR INSERT TO authenticated 
WITH CHECK (
  task_id IN (
    SELECT t.id FROM tasks t
    JOIN columns c ON c.id = t.column_id
    WHERE c.project_id IN (
      SELECT project_id FROM user_accessible_projects 
      WHERE accessor_id = auth.uid()
    )
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

-- ACTIVITY_LOGS: Add team member access
DROP POLICY IF EXISTS "activity_logs_owner_all" ON activity_logs;

CREATE POLICY "activity_logs_accessible_select" ON activity_logs 
FOR SELECT TO authenticated 
USING (
  project_id IN (
    SELECT project_id FROM user_accessible_projects 
    WHERE accessor_id = auth.uid()
  )
);

CREATE POLICY "activity_logs_accessible_modify" ON activity_logs 
FOR INSERT TO authenticated 
WITH CHECK (
  project_id IN (
    SELECT project_id FROM user_accessible_projects 
    WHERE accessor_id = auth.uid()
  )
);

-- Refresh the materialized view to ensure it's up to date
SELECT refresh_user_accessible_projects();

-- Add comment
COMMENT ON MATERIALIZED VIEW user_accessible_projects IS 'Materialized view for team collaboration - prevents infinite recursion in policies';