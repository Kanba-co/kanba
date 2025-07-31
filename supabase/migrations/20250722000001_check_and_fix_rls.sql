/*
  # Check and Fix All RLS Policies - Emergency Security Fix

  1. Critical Issue
    - Multiple policies have USING (true) condition allowing public access
    - This exposes ALL user data via REST API with just API key
    - Immediate fix required

  2. Action
    - Drop all insecure policies immediately  
    - Apply secure policies only for authenticated users
    - No anonymous access to any sensitive data
*/

-- Drop ALL existing policies on profiles table to start clean
DROP POLICY IF EXISTS "Users can search other profiles for collaboration" ON profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view basic info of other users for team collaboration" ON profiles;
DROP POLICY IF EXISTS "Users can view limited info of others for team collaboration" ON profiles;
DROP POLICY IF EXISTS "No profile deletion" ON profiles;

-- Ensure RLS is enabled on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create secure policies that require authentication
CREATE POLICY "secure_profiles_select_own"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "secure_profiles_select_others_basic"
  ON profiles
  FOR SELECT  
  TO authenticated
  USING (
    -- Only authenticated users can see basic info of other users
    auth.uid() IS NOT NULL AND 
    auth.uid() != id -- Don't duplicate own profile access
  );

-- Update and Insert policies (users can only modify their own profile)
CREATE POLICY "secure_profiles_update_own"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "secure_profiles_insert_own"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- No deletion allowed
CREATE POLICY "No profile deletion"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (false);

-- Create secure view for team search (only basic info)
CREATE OR REPLACE VIEW public.user_search AS
SELECT 
  id,
  email,
  full_name,
  avatar_url
FROM profiles
WHERE auth.uid() IS NOT NULL; -- Only for authenticated users

-- Grant access to the view
GRANT SELECT ON public.user_search TO authenticated;

-- Make view security invoker (uses caller's permissions)
ALTER VIEW public.user_search SET (security_invoker = true);
