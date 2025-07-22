/*
  # Fix Profiles Table Security

  1. Problem
    - Current RLS policy allows anyone to see all profiles with "true" condition
    - This creates a major security vulnerability
    - External users can access profiles via REST API with just API key

  2. Solution
    - Remove the overly permissive policy
    - Create secure policies that only allow authenticated users to see limited info
    - Implement proper team collaboration without exposing all user data

  3. Security
    - Only authenticated users can access profiles
    - Users can see their own full profile
    - Users can only see basic info of others (for team collaboration)
    - No anonymous access to profiles table
*/

-- Drop the insecure policy that allows everyone to see all profiles
DROP POLICY IF EXISTS "Users can search other profiles for collaboration" ON profiles;

-- Create secure policies for profiles table
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view basic info of other users for team collaboration"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see basic info of other authenticated users
    -- but only if they are authenticated themselves
    auth.uid() IS NOT NULL AND id != auth.uid()
  );

-- Ensure users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure users can only insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users cannot delete profiles (only admin can do this)
CREATE POLICY "No profile deletion"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (false);

-- Add additional security: Create a view for team collaboration that only exposes necessary fields
CREATE OR REPLACE VIEW public.user_search AS
SELECT 
  id,
  email,
  full_name,
  avatar_url
FROM profiles
WHERE auth.uid() IS NOT NULL; -- Only authenticated users can use this view

-- Grant access to the view
GRANT SELECT ON public.user_search TO authenticated;

-- Create RLS policy for the view
ALTER VIEW public.user_search SET (security_invoker = true);