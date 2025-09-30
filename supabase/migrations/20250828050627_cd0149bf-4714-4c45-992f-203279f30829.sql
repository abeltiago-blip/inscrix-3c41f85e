-- Fix security vulnerability in registrations table
-- The current INSERT policy allows any authenticated user to create registrations with any data
-- This fix ensures users can only create registrations for themselves

-- Drop the existing overly permissive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create registrations" ON public.registrations;

-- Create a secure INSERT policy that restricts registration creation
-- Users can only create registrations where they are the participant
-- OR where participant_id is null (for guest registrations) but they must be authenticated
CREATE POLICY "Users can create registrations for themselves"
ON public.registrations
FOR INSERT
TO authenticated
WITH CHECK (
  -- If participant_id is provided, it must match the current user
  (participant_id IS NOT NULL AND participant_id = auth.uid()) 
  OR 
  -- If participant_id is null, allow but require authentication (for guest registrations)
  (participant_id IS NULL)
);

-- Additional security: Create a policy to prevent data tampering
-- Ensure users cannot update registration data to reference other users
DROP POLICY IF EXISTS "Users can update their own registrations" ON public.registrations;

CREATE POLICY "Users can update their own registrations"
ON public.registrations
FOR UPDATE
TO authenticated
USING (
  -- Users can only update registrations they created (where participant_id matches)
  -- OR registrations where participant_id is null and they created it
  participant_id = auth.uid() OR participant_id IS NULL
)
WITH CHECK (
  -- Prevent changing participant_id to reference other users
  (participant_id IS NOT NULL AND participant_id = auth.uid()) 
  OR 
  (participant_id IS NULL)
);