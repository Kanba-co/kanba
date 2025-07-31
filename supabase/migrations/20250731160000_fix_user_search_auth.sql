/*
  # Fix User Search - Use Auth.Users Instead of Profiles

  1. Problem
    - user_search view is based on profiles table which is now restricted
    - Team member search is broken due to RLS policies
    - Need to search users without exposing sensitive profile data

  2. Solution
    - Recreate user_search view based on auth.users
    - Only expose necessary fields (id, email)
    - Maintain security while enabling team functionality

  3. Security
    - Only authenticated users can search
    - Only basic info exposed (id, email, raw_user_meta_data.full_name)
    - No access to sensitive profile data
*/

-- Drop existing user_search view
DROP VIEW IF EXISTS public.user_search;

-- Create new user_search view based on auth.users
CREATE OR REPLACE VIEW public.user_search 
WITH (security_invoker = true) AS
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
WHERE auth.uid() IS NOT NULL; -- Only for authenticated users

-- Grant access to authenticated users
GRANT SELECT ON public.user_search TO authenticated;

-- Ensure RLS is enabled on the view (if supported)
-- Note: Views inherit security from underlying tables