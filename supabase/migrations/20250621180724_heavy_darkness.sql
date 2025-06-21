/*
  # Fix Missing Functions Error

  1. Problem
    - Function user_has_project_access(uuid, uuid) does not exist
    - This causes all policies using this function to fail
    - Projects and other data become inaccessible

  2. Solution
    - Recreate the missing helper functions
    - Ensure they have proper permissions
    - Test that they work correctly

  3. Security
    - Maintain proper access control
    - Ensure functions are secure and efficient
*/

-- Drop existing functions if they exist (cleanup)
DROP FUNCTION IF EXISTS user_has_project_access(uuid, uuid);
DROP FUNCTION IF EXISTS user_can_manage_project(uuid, uuid);

-- Create the user_has_project_access function
CREATE OR REPLACE FUNCTION user_has_project_access(project_uuid uuid, user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  -- Return false if either parameter is null
  IF project_uuid IS NULL OR user_uuid IS NULL THEN
    RETURN false;
  END IF;

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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create the user_can_manage_project function
CREATE OR REPLACE FUNCTION user_can_manage_project(project_uuid uuid, user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  -- Return false if either parameter is null
  IF project_uuid IS NULL OR user_uuid IS NULL THEN
    RETURN false;
  END IF;

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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION user_has_project_access(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION user_can_manage_project(uuid, uuid) TO authenticated;

-- Test the functions to make sure they work
DO $$
DECLARE
  test_result boolean;
BEGIN
  -- Test with null values
  SELECT user_has_project_access(NULL, NULL) INTO test_result;
  IF test_result IS NOT false THEN
    RAISE EXCEPTION 'Function test failed: should return false for null inputs';
  END IF;
  
  RAISE NOTICE 'Functions created and tested successfully';
END $$;

-- Add comments for documentation
COMMENT ON FUNCTION user_has_project_access(uuid, uuid) IS 'Checks if a user has access to a project (owner or member)';
COMMENT ON FUNCTION user_can_manage_project(uuid, uuid) IS 'Checks if a user can manage a project (owner or admin)';