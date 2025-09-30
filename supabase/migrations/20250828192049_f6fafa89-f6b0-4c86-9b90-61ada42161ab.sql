-- =============================================
-- CRITICAL SECURITY FIX: Fix existing function and implement RLS
-- =============================================

-- 1. Drop existing function first
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- 2. Create user role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'organizer', 'participant', 'team');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Update profiles table role column
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE user_role USING role::user_role;

-- 4. Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- 5. Create security definer function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = _role
  );
$$;

-- 6. Create security definer function to check if user is organizer of event
CREATE OR REPLACE FUNCTION public.is_event_organizer(_event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = _event_id AND organizer_id = auth.uid()
  );
$$;

-- 7. CRITICAL: Enable RLS on registrations table and fix policies
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users can create registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users can update their own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Organizers can view registrations for their events" ON public.registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.registrations;

-- Create secure RLS policies for registrations
CREATE POLICY "Users can view their own registrations" 
ON public.registrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own registrations" 
ON public.registrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" 
ON public.registrations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Organizers can view registrations for their events" 
ON public.registrations 
FOR SELECT 
USING (public.is_event_organizer(event_id));

CREATE POLICY "Admins can view all registrations" 
ON public.registrations 
FOR SELECT 
USING (public.has_role('admin'));

-- 8. Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name text NOT NULL,
    operation text NOT NULL,
    old_values jsonb,
    new_values jsonb,
    user_id uuid REFERENCES auth.users(id),
    timestamp timestamptz DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs" 
ON public.audit_log 
FOR SELECT 
USING (public.has_role('admin'));