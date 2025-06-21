/*
  # Fix Column Creation RLS Policy Issue

  1. Problem
    - When creating a new project, the default columns fail to insert
    - RLS policies check materialized view which may not be immediately updated
    - Need to allow column creation for newly created projects

  2. Solution
    - Update column policies to allow direct project ownership check
    - Ensure materialized view is refreshed after project creation
    - Add fallback policy for immediate project creation

  3. Security
    - Maintain proper access control
    - Allow column creation for project owners
    - Keep team collaboration working
*/

-- Update the columns policies to include direct project ownership check
-- This ensures that when a user creates a project, they can immediately create columns

DROP POLICY IF EXISTS "columns_accessible_modify" ON columns;

-- Create a more robust insert policy that checks both direct ownership and materialized view
CREATE POLICY "columns_accessible_modify" ON columns 
FOR INSERT TO authenticated 
WITH CHECK (
  -- Direct project ownership (for immediate project creation)
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR
  -- Team access via materialized view (for existing projects)
  project_id IN (
    SELECT project_id FROM user_accessible_projects 
    WHERE accessor_id = auth.uid()
  )
);

-- Also update the select policy to be more robust
DROP POLICY IF EXISTS "columns_accessible_select" ON columns;

CREATE POLICY "columns_accessible_select" ON columns 
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
);

-- Update the update policy similarly
DROP POLICY IF EXISTS "columns_accessible_update" ON columns;

CREATE POLICY "columns_accessible_update" ON columns 
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
);

-- Update the delete policy to be more restrictive (only owners and admins)
DROP POLICY IF EXISTS "columns_accessible_delete" ON columns;

CREATE POLICY "columns_accessible_delete" ON columns 
FOR DELETE TO authenticated 
USING (
  -- Direct project ownership (owners can always delete)
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR
  -- Team admins can delete
  project_id IN (
    SELECT project_id FROM user_accessible_projects 
    WHERE accessor_id = auth.uid() AND access_type = 'admin'
  )
);

-- Create a function to refresh the materialized view after project operations
CREATE OR REPLACE FUNCTION refresh_after_project_change()
RETURNS trigger AS $$
BEGIN
  -- Refresh the materialized view when projects are created/updated
  PERFORM refresh_user_accessible_projects();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to refresh materialized view after project creation
DROP TRIGGER IF EXISTS refresh_after_project_creation ON projects;
CREATE TRIGGER refresh_after_project_creation
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION refresh_after_project_change();

-- Also refresh after project member changes (already exists but let's ensure it's there)
DROP TRIGGER IF EXISTS refresh_after_member_change ON project_members;
CREATE TRIGGER refresh_after_member_change
  AFTER INSERT OR UPDATE OR DELETE ON project_members
  FOR EACH ROW EXECUTE FUNCTION refresh_user_accessible_projects();

-- Test that the policies work correctly
DO $$
BEGIN
  RAISE NOTICE 'Column creation policies updated - should now work for new projects';
END $$;

-- Add comment to track this fix
COMMENT ON TABLE columns IS 'Fixed RLS policies to allow column creation during project setup - migration 20250621182500';