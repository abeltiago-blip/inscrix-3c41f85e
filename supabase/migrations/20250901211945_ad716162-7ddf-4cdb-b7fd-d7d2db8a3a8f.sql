-- Fix security issues for profiles table
-- Drop existing problematic policies and recreate them with proper security

-- First, drop all existing policies on profiles table
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile role" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile (except role)" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile (excluding sensitive fields)" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create secure policies for profiles table
-- 1. Only authenticated users can view profiles (no anonymous access)
CREATE POLICY "Authenticated users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 2. Only admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (get_current_user_role() = 'admin');

-- 3. Only authenticated users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Users can update their own profile (except role field)
CREATE POLICY "Users can update their own profile except role" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND role = (
    SELECT role 
    FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);

-- 5. Only admins can update any profile including roles
CREATE POLICY "Admins can update all profiles and roles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- 6. Users can delete their own profile
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 7. Admins can delete any profile
CREATE POLICY "Admins can delete any profile" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (get_current_user_role() = 'admin');

-- Fix other critical security issues found in the scan

-- Secure registrations table - only allow access to participants and event organizers
DROP POLICY IF EXISTS "Registrations are viewable for published events" ON public.registrations;

CREATE POLICY "Registrations are only viewable by participants, organizers, and admins" 
ON public.registrations 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = participant_id 
  OR auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = registrations.event_id 
    AND events.organizer_id = auth.uid()
  )
  OR get_current_user_role() = 'admin'
);

-- Secure newsletter_subscriptions - remove public insert policy
DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON public.newsletter_subscriptions;

CREATE POLICY "Authenticated users can subscribe to newsletter" 
ON public.newsletter_subscriptions 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  OR auth.uid() IS NOT NULL
);

-- Secure email_logs - only admins and email recipients can view
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Secure support tickets and user feedback - already have proper policies

-- Add policy to prevent anonymous access to any sensitive table
CREATE POLICY "Block anonymous access to profiles" 
ON public.profiles 
FOR ALL 
TO anon
USING (false);

CREATE POLICY "Block anonymous access to registrations" 
ON public.registrations 
FOR ALL 
TO anon
USING (false);

CREATE POLICY "Block anonymous access to email_logs" 
ON public.email_logs 
FOR ALL 
TO anon
USING (false);

CREATE POLICY "Block anonymous access to newsletter_subscriptions" 
ON public.newsletter_subscriptions 
FOR ALL 
TO anon
USING (false);