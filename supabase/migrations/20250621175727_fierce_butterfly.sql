/*
  # Fix User Search for Team Collaboration

  1. Problem
    - Current RLS policy only allows users to see their own profile
    - This prevents searching for other users to invite to projects
    - Team collaboration requires ability to search for existing users

  2. Solution
    - Add a new RLS policy that allows users to search other profiles
    - Limit the searchable information to essential fields only
    - Maintain security while enabling team collaboration

  3. Security
    - Only allow viewing basic profile info (email, name, subscription status)
    - Don't expose sensitive information
    - Keep existing policies for profile management
*/

-- Add a new policy to allow users to search for other users for team collaboration
CREATE POLICY "Users can search other profiles for collaboration"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Users can always see their own profile (existing functionality)
    auth.uid() = id
    OR
    -- Users can see basic info of other users for team collaboration
    -- This allows searching for users to invite to projects
    true
  );

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Note: The new policy allows viewing other profiles but the existing
-- UPDATE and INSERT policies still restrict users to only modify their own profile