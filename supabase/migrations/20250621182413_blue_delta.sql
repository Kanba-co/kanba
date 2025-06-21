/*
  # Fix Duplicate Key Error in Materialized View

  1. Problem
    - The materialized view has duplicate entries when a user is both owner and member
    - This causes the unique index creation to fail
    - Key (project_id, accessor_id) is duplicated

  2. Solution
    - Drop the existing materialized view
    - Recreate it with DISTINCT to eliminate duplicates
    - Use COALESCE to prioritize 'owner' over other roles
    - Create the unique index successfully

  3. Changes
    - Fix the materialized view query to handle duplicates
    - Ensure proper indexing for performance
    - Maintain team collaboration functionality
*/

-- Drop the existing materialized view and its indexes
DROP MATERIALIZED VIEW IF EXISTS user_accessible_projects CASCADE;

-- Recreate the materialized view with proper duplicate handling
CREATE MATERIALIZED VIEW user_accessible_projects AS
SELECT DISTINCT ON (project_id, accessor_id)
  project_id,
  owner_id,
  accessor_id,
  -- Prioritize 'owner' role over others
  CASE 
    WHEN access_type = 'owner' THEN 'owner'
    ELSE access_type
  END as access_type
FROM (
  -- Project owners
  SELECT 
    p.id as project_id,
    p.user_id as owner_id,
    p.user_id as accessor_id,
    'owner' as access_type
  FROM projects p
  
  UNION ALL
  
  -- Project members (excluding owners to avoid duplicates)
  SELECT 
    pm.project_id,
    p.user_id as owner_id,
    pm.user_id as accessor_id,
    pm.role as access_type
  FROM project_members pm
  JOIN projects p ON p.id = pm.project_id
  WHERE pm.user_id != p.user_id  -- Exclude owners who are also members
) combined_access
ORDER BY project_id, accessor_id, 
  -- Ensure 'owner' comes first in case of duplicates
  CASE WHEN access_type = 'owner' THEN 0 ELSE 1 END;

-- Create the unique index (should work now without duplicates)
CREATE UNIQUE INDEX idx_user_accessible_projects_unique 
ON user_accessible_projects (project_id, accessor_id);

-- Create additional indexes for performance
CREATE INDEX idx_user_accessible_projects_accessor 
ON user_accessible_projects (accessor_id);

CREATE INDEX idx_user_accessible_projects_project 
ON user_accessible_projects (project_id);

-- Grant access to the materialized view
GRANT SELECT ON user_accessible_projects TO authenticated;

-- Update the refresh function to handle the new structure
CREATE OR REPLACE FUNCTION refresh_user_accessible_projects()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_accessible_projects;
EXCEPTION WHEN OTHERS THEN
  -- If concurrent refresh fails, do a regular refresh
  REFRESH MATERIALIZED VIEW user_accessible_projects;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initial refresh of the materialized view
SELECT refresh_user_accessible_projects();

-- Test the view to ensure it works correctly
DO $$
DECLARE
  view_count integer;
  duplicate_count integer;
BEGIN
  -- Count total rows
  SELECT COUNT(*) INTO view_count FROM user_accessible_projects;
  
  -- Count potential duplicates
  SELECT COUNT(*) INTO duplicate_count 
  FROM (
    SELECT project_id, accessor_id, COUNT(*) 
    FROM user_accessible_projects 
    GROUP BY project_id, accessor_id 
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_count > 0 THEN
    RAISE EXCEPTION 'Still have % duplicate entries in materialized view', duplicate_count;
  END IF;
  
  RAISE NOTICE 'Materialized view created successfully with % unique entries', view_count;
END $$;

-- Add comment to track this fix
COMMENT ON MATERIALIZED VIEW user_accessible_projects IS 'Fixed duplicate key issue - ensures unique (project_id, accessor_id) combinations';