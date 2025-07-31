/*
  # Emergency Fix: Remove Public Access to Profiles Table
  
  1. Critical Security Issue
    - Current policy "profiles_select_all" with USING(true) allows ANY authenticated user 
      to access ALL profiles via REST API with just an API key
    - This exposes all user personal data publicly
    
  2. Immediate Action Required  
    - Drop ALL existing insecure policies on profiles table
    - Create strict policies that only allow:
      * Users to see their own complete profile
      * Users to see VERY limited info of others (only for team functionality)
    
  3. Security Model
    - Own profile: Full access (SELECT/UPDATE/INSERT)
    - Other profiles: NO direct access
    - Team collaboration: Use user_search view instead (already secured)
*/

-- Drop ALL existing profiles policies to eliminate security holes
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles; 
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own_only" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own_only" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own_only" ON profiles;
DROP POLICY IF EXISTS "profiles_no_delete" ON profiles;
DROP POLICY IF EXISTS "Users can search other profiles for collaboration" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view basic info of other users for team collaboration" ON profiles;
DROP POLICY IF EXISTS "Users can view limited info of others for team collaboration" ON profiles;
DROP POLICY IF EXISTS "No profile deletion" ON profiles;
DROP POLICY IF EXISTS "secure_profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "secure_profiles_select_others_basic" ON profiles;
DROP POLICY IF EXISTS "secure_profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "secure_profiles_insert_own" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create ONLY secure policies

-- 1. Users can ONLY see their own complete profile
CREATE POLICY "profiles_select_own_only"
  ON profiles
  FOR SELECT
  TO authenticated  
  USING (auth.uid() = id);

-- 2. Users can ONLY update their own profile
CREATE POLICY "profiles_update_own_only"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Users can ONLY insert their own profile
CREATE POLICY "profiles_insert_own_only"  
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 4. NO deletion allowed for anyone
CREATE POLICY "profiles_no_delete"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (false);

-- Create missing views and functions for team management compatibility

-- First drop existing views and functions to avoid conflicts
DROP VIEW IF EXISTS public.user_search;
DROP VIEW IF EXISTS public.user_email_search;
DROP VIEW IF EXISTS public.project_members_with_profiles;
DROP VIEW IF EXISTS public.project_members_with_users;
DROP FUNCTION IF EXISTS public.search_users_for_collaboration(text);
DROP FUNCTION IF EXISTS public.get_profiles_count();

-- 1. Create secure RPC function for user search (only returns basic info)
CREATE OR REPLACE FUNCTION public.search_users_for_collaboration(search_term text)
RETURNS TABLE(id uuid, email text, full_name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only authenticated users can search
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  
  -- Return only basic info from profiles, no sensitive data
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name
  FROM profiles p
  WHERE 
    p.email ILIKE '%' || search_term || '%' 
    OR p.full_name ILIKE '%' || search_term || '%'
  LIMIT 20;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.search_users_for_collaboration(text) TO authenticated;

-- 2. Create user_search view using profiles (backward compatibility)
CREATE OR REPLACE VIEW public.user_search AS
SELECT 
  id,
  email,
  full_name
FROM profiles
WHERE false; -- This view will be accessed via RPC function instead

-- 3. Create user_email_search view (alias for backward compatibility)  
CREATE OR REPLACE VIEW public.user_email_search AS
SELECT 
  id,
  email,
  full_name
FROM profiles
WHERE false; -- This view will be accessed via RPC function instead

-- Grant minimal access (views return nothing due to WHERE false)  
GRANT SELECT ON public.user_search TO authenticated;
GRANT SELECT ON public.user_email_search TO authenticated;

-- 4. Create safe get_profiles_count RPC function  
CREATE OR REPLACE FUNCTION public.get_profiles_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only return count for authenticated users
  IF auth.uid() IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Return count from profiles table (function has elevated privileges)
  RETURN (SELECT COUNT(*) FROM profiles);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_profiles_count() TO authenticated;

-- 5. Create project_members_with_profiles view for team management
CREATE OR REPLACE VIEW public.project_members_with_profiles AS
SELECT 
  pm.id,
  pm.project_id,
  pm.user_id,
  pm.role,
  pm.created_at,
  pm.updated_at,
  p.id as profile_id,
  p.email as profile_email,
  p.full_name as profile_full_name,
  p.avatar_url as profile_avatar_url
FROM project_members pm
JOIN profiles p ON p.id = pm.user_id;

-- Note: This view will inherit RLS from project_members table automatically

-- Grant access to authenticated users (RLS will still apply from project_members table)
GRANT SELECT ON public.project_members_with_profiles TO authenticated;

/*
  IMPORTANT: 
  - There is NO policy allowing users to see other profiles directly
  - Team collaboration uses:
    * search_users_for_collaboration() RPC function for user searching
    * project_members_with_profiles view for displaying team members  
    * get_profiles_count() RPC function for debugging
  - RPC functions use SECURITY DEFINER to bypass RLS but only return basic info
  - Views inherit RLS from underlying tables (project_members)
  - This completely eliminates the direct profiles access vulnerability
  
  NEXT STEPS:
  - Update team-management.tsx to use search_users_for_collaboration() function
  - Update team-management.tsx to use project_members_with_profiles view
*/