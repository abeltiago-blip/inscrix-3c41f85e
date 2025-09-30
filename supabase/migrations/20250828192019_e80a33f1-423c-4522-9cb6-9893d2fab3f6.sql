-- =============================================
-- CRITICAL SECURITY FIX: Implement proper RLS and user roles system
-- =============================================

-- 1. Create user role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'organizer', 'participant', 'team');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update profiles table to use proper role system (if needed)
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE user_role USING role::user_role;

-- 3. Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- 4. Create security definer function to check if user has role
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

-- 5. Create security definer function to check if user is organizer of event
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

-- 6. CRITICAL: Enable RLS on registrations table and fix policies
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users can create registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users can update their own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Organizers can view registrations for their events" ON public.registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.registrations;

-- Create secure RLS policies for registrations
-- Users can only view their own registrations
CREATE POLICY "Users can view their own registrations" 
ON public.registrations 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create registrations for themselves
CREATE POLICY "Users can create their own registrations" 
ON public.registrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own registrations
CREATE POLICY "Users can update their own registrations" 
ON public.registrations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Event organizers can view registrations for their events
CREATE POLICY "Organizers can view registrations for their events" 
ON public.registrations 
FOR SELECT 
USING (public.is_event_organizer(event_id));

-- Admins can view all registrations
CREATE POLICY "Admins can view all registrations" 
ON public.registrations 
FOR SELECT 
USING (public.has_role('admin'));

-- 7. Create audit log table for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name text NOT NULL,
    operation text NOT NULL,
    old_values jsonb,
    new_values jsonb,
    user_id uuid REFERENCES auth.users(id),
    timestamp timestamptz DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" 
ON public.audit_log 
FOR SELECT 
USING (public.has_role('admin'));

-- 8. Create triggers for sensitive data audit
CREATE OR REPLACE FUNCTION public.audit_sensitive_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Log sensitive data changes
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_log (table_name, operation, old_values, new_values, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_log (table_name, operation, old_values, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), auth.uid());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Add audit trigger to registrations table
DROP TRIGGER IF EXISTS audit_registrations_trigger ON public.registrations;
CREATE TRIGGER audit_registrations_trigger
    AFTER UPDATE OR DELETE ON public.registrations
    FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_data();

-- 9. Secure other critical tables
-- Events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published events" ON public.events;
DROP POLICY IF EXISTS "Organizers can manage their events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;

CREATE POLICY "Public can view published events" 
ON public.events 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Organizers can manage their events" 
ON public.events 
FOR ALL 
USING (auth.uid() = organizer_id);

CREATE POLICY "Admins can manage all events" 
ON public.events 
FOR ALL 
USING (public.has_role('admin'));

-- Profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view basic profile info" 
ON public.profiles 
FOR SELECT 
USING (true);