-- Remove the problematic constraint that prevents admin role creation
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_role_elevation;