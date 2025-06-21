/*
  # Fix Duplicate Policy Error

  1. Problem
    - Multiple migrations have created duplicate policies
    - Specifically "Users can update own comments" policy already exists
    - Need to clean up and ensure no duplicates

  2. Solution
    - Drop all potentially duplicate policies with IF EXISTS
    - Recreate them cleanly
    - Use proper error handling

  3. Security
    - Maintain all existing security requirements
    - Ensure no data access is compromised
*/

-- Drop all potentially duplicate policies with IF EXISTS to avoid errors
DROP POLICY IF EXISTS "Users can update own comments" ON task_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON task_comments;
DROP POLICY IF EXISTS "Users can view comments in accessible projects" ON task_comments;
DROP POLICY IF EXISTS "Users can create comments in accessible projects" ON task_comments;

-- Recreate task_comments policies cleanly
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

-- Also fix the Select component issue by ensuring assigned_to can be empty string
-- This is handled in the frontend code, but let's make sure the database allows it
DO $$
BEGIN
  -- Check if assigned_to column allows null (it should)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' 
    AND column_name = 'assigned_to' 
    AND is_nullable = 'YES'
  ) THEN
    -- Make assigned_to nullable if it isn't already
    ALTER TABLE tasks ALTER COLUMN assigned_to DROP NOT NULL;
  END IF;
END $$;

-- Add a comment to document the fix
COMMENT ON TABLE task_comments IS 'Comments on tasks - policies fixed for duplicate error in migration 20250621181600';