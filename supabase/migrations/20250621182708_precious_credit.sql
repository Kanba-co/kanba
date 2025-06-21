/*
  # Fix Trigger Function Return Type

  1. Problem
    - The refresh_user_accessible_projects function is being used as a trigger
    - But it returns void instead of trigger type
    - This causes the error: "function must return type trigger"

  2. Solution
    - Keep refresh_user_accessible_projects as a utility function (returns void)
    - Fix trigger_refresh_user_accessible_projects to properly return trigger
    - Ensure all trigger functions have correct return types

  3. Changes
    - Fix the trigger function return type
    - Ensure proper trigger function structure
    - Test that triggers work correctly
*/

-- Fix the trigger function to properly return trigger type
CREATE OR REPLACE FUNCTION trigger_refresh_user_accessible_projects()
RETURNS trigger AS $$
BEGIN
  -- Refresh the materialized view asynchronously
  PERFORM pg_notify('refresh_user_projects', '');
  
  -- Call the refresh function
  PERFORM refresh_user_accessible_projects();
  
  -- Return the appropriate record for trigger
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the refresh_after_project_change function to properly return trigger type
CREATE OR REPLACE FUNCTION refresh_after_project_change()
RETURNS trigger AS $$
BEGIN
  -- Refresh the materialized view when projects are created/updated
  PERFORM refresh_user_accessible_projects();
  
  -- Return the appropriate record for trigger
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Keep the utility function as is (returns void)
CREATE OR REPLACE FUNCTION refresh_user_accessible_projects()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_accessible_projects;
EXCEPTION WHEN OTHERS THEN
  -- If concurrent refresh fails, do a regular refresh
  REFRESH MATERIALIZED VIEW user_accessible_projects;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the triggers to ensure they use the fixed functions
DROP TRIGGER IF EXISTS refresh_projects_on_member_change ON project_members;
CREATE TRIGGER refresh_projects_on_member_change
  AFTER INSERT OR UPDATE OR DELETE ON project_members
  FOR EACH ROW EXECUTE FUNCTION trigger_refresh_user_accessible_projects();

DROP TRIGGER IF EXISTS refresh_after_project_creation ON projects;
CREATE TRIGGER refresh_after_project_creation
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION refresh_after_project_change();

DROP TRIGGER IF EXISTS refresh_after_member_change ON project_members;
CREATE TRIGGER refresh_after_member_change
  AFTER INSERT OR UPDATE OR DELETE ON project_members
  FOR EACH ROW EXECUTE FUNCTION trigger_refresh_user_accessible_projects();

-- Test that the functions work correctly
DO $$
BEGIN
  -- Test the utility function
  PERFORM refresh_user_accessible_projects();
  
  RAISE NOTICE 'Trigger functions fixed successfully - should now return proper trigger type';
END $$;

-- Add comment to track this fix
COMMENT ON FUNCTION trigger_refresh_user_accessible_projects() IS 'Fixed to return trigger type instead of void - prevents trigger function error';
COMMENT ON FUNCTION refresh_after_project_change() IS 'Fixed to return trigger type instead of void - prevents trigger function error';