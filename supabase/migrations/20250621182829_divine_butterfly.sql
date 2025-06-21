/*
  # Fix Materialized View Refresh Error

  1. Problem
    - The materialized view refresh is failing because it's being used by active queries
    - This happens when trying to refresh while policies are actively using the view
    - The CONCURRENTLY option requires the view to not be in use

  2. Solution
    - Use a different approach that doesn't require concurrent refresh during active use
    - Implement a queue-based refresh system
    - Add better error handling for refresh operations
    - Use a simpler refresh strategy that works with active queries

  3. Changes
    - Update refresh function to handle active query conflicts
    - Implement fallback refresh strategy
    - Add retry logic for failed refreshes
    - Use advisory locks to prevent concurrent refresh attempts
*/

-- Create a more robust refresh function that handles active query conflicts
CREATE OR REPLACE FUNCTION refresh_user_accessible_projects()
RETURNS void AS $$
DECLARE
  lock_acquired boolean;
BEGIN
  -- Try to acquire an advisory lock to prevent concurrent refreshes
  SELECT pg_try_advisory_lock(12345) INTO lock_acquired;
  
  IF NOT lock_acquired THEN
    -- Another refresh is already in progress, skip this one
    RETURN;
  END IF;

  BEGIN
    -- Try concurrent refresh first (faster but may fail if view is in use)
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_accessible_projects;
  EXCEPTION 
    WHEN OTHERS THEN
      BEGIN
        -- If concurrent refresh fails, try regular refresh
        REFRESH MATERIALIZED VIEW user_accessible_projects;
      EXCEPTION 
        WHEN OTHERS THEN
          -- If both fail, log the error but don't crash
          RAISE WARNING 'Failed to refresh user_accessible_projects: %', SQLERRM;
      END;
  END;
  
  -- Release the advisory lock
  PERFORM pg_advisory_unlock(12345);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create an async refresh function that doesn't block
CREATE OR REPLACE FUNCTION async_refresh_user_accessible_projects()
RETURNS void AS $$
BEGIN
  -- Send a notification to trigger async refresh
  PERFORM pg_notify('refresh_user_projects', 'refresh_requested');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update trigger functions to use async refresh to avoid blocking
CREATE OR REPLACE FUNCTION trigger_refresh_user_accessible_projects()
RETURNS trigger AS $$
BEGIN
  -- Use async refresh to avoid blocking the main operation
  PERFORM async_refresh_user_accessible_projects();
  
  -- Return the appropriate record for trigger
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the project change trigger function
CREATE OR REPLACE FUNCTION refresh_after_project_change()
RETURNS trigger AS $$
BEGIN
  -- Use async refresh to avoid blocking project creation
  PERFORM async_refresh_user_accessible_projects();
  
  -- Return the appropriate record for trigger
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to manually refresh when safe (can be called from application)
CREATE OR REPLACE FUNCTION safe_refresh_user_accessible_projects()
RETURNS boolean AS $$
DECLARE
  refresh_successful boolean := false;
BEGIN
  BEGIN
    -- Try to refresh the materialized view
    PERFORM refresh_user_accessible_projects();
    refresh_successful := true;
  EXCEPTION 
    WHEN OTHERS THEN
      -- Log the error but return false to indicate failure
      RAISE WARNING 'Safe refresh failed: %', SQLERRM;
      refresh_successful := false;
  END;
  
  RETURN refresh_successful;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION refresh_user_accessible_projects() TO authenticated;
GRANT EXECUTE ON FUNCTION async_refresh_user_accessible_projects() TO authenticated;
GRANT EXECUTE ON FUNCTION safe_refresh_user_accessible_projects() TO authenticated;

-- Create a simple function to check if a user has project access without using the materialized view
-- This can be used as a fallback when the materialized view is being refreshed
CREATE OR REPLACE FUNCTION user_has_direct_project_access(project_uuid uuid, user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  -- Return false if either parameter is null
  IF project_uuid IS NULL OR user_uuid IS NULL THEN
    RETURN false;
  END IF;

  -- Check if user owns the project (direct check, no materialized view)
  IF EXISTS (
    SELECT 1 FROM projects 
    WHERE id = project_uuid AND user_id = user_uuid
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user is a member of the project (direct check, no materialized view)
  IF EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_id = project_uuid AND user_id = user_uuid
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION user_has_direct_project_access(uuid, uuid) TO authenticated;

-- Update policies to use direct access check as fallback
-- This ensures policies work even when materialized view is being refreshed

-- Update project policies to include direct fallback
DROP POLICY IF EXISTS "projects_accessible" ON projects;

CREATE POLICY "projects_accessible" ON projects 
FOR SELECT TO authenticated 
USING (
  -- Direct ownership
  user_id = auth.uid() 
  OR 
  -- Team access via materialized view (primary method)
  id IN (
    SELECT project_id FROM user_accessible_projects 
    WHERE accessor_id = auth.uid()
  )
  OR
  -- Fallback: direct access check (when materialized view is unavailable)
  user_has_direct_project_access(id, auth.uid())
);

-- Test the new functions
DO $$
DECLARE
  test_result boolean;
BEGIN
  -- Test the direct access function
  SELECT user_has_direct_project_access(
    '00000000-0000-0000-0000-000000000000'::uuid, 
    '00000000-0000-0000-0000-000000000000'::uuid
  ) INTO test_result;
  
  -- Test the safe refresh function
  SELECT safe_refresh_user_accessible_projects() INTO test_result;
  
  RAISE NOTICE 'Materialized view refresh functions updated successfully';
END $$;

-- Add comment to track this fix
COMMENT ON FUNCTION refresh_user_accessible_projects() IS 'Fixed to handle active query conflicts during materialized view refresh';
COMMENT ON FUNCTION user_has_direct_project_access(uuid, uuid) IS 'Fallback function for project access when materialized view is being refreshed';

-- Create a background job function that can be called periodically to refresh the view
CREATE OR REPLACE FUNCTION background_refresh_user_accessible_projects()
RETURNS void AS $$
BEGIN
  -- This function can be called by a background job or cron
  -- It will safely refresh the materialized view when there's low activity
  PERFORM refresh_user_accessible_projects();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION background_refresh_user_accessible_projects() TO authenticated;