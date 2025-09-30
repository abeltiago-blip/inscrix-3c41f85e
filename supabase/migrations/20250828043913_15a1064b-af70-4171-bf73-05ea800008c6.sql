-- CRITICAL SECURITY FIXES (Fixed version)

-- 1. Fix RLS Policy Recursion - Create security definer function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Drop the problematic recursive policy and create a secure one
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.get_current_user_role() = 'admin');

-- 2. Secure Registration Data - Fix dangerous public access
DROP POLICY IF EXISTS "Anyone can create registrations" ON public.registrations;
DROP POLICY IF EXISTS "Authenticated users can create registrations" ON public.registrations;
CREATE POLICY "Authenticated users can create registrations" ON public.registrations
FOR INSERT TO authenticated
WITH CHECK (true);

-- 3. Secure Voucher Access - Restrict public voucher viewing
DROP POLICY IF EXISTS "Vouchers are viewable by everyone" ON public.vouchers;
CREATE POLICY "Organizers can view their own vouchers" ON public.vouchers
FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "Authenticated users can view active vouchers for events" ON public.vouchers
FOR SELECT TO authenticated
USING (is_active = true AND valid_from <= now() AND valid_until >= now());

-- 4. Prevent Role Escalation - Add constraint to prevent unauthorized role changes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'check_role_elevation'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT check_role_elevation 
    CHECK (
      CASE 
        WHEN role = 'admin' THEN false  -- Admins can only be created by superuser
        ELSE true
      END
    );
  END IF;
END $$;

-- 5. Fix Database Functions - Add proper search_path to existing functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    email, 
    first_name, 
    last_name,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'participant')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_registration_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.registration_number := 'REG-' || EXTRACT(YEAR FROM NEW.created_at) || '-' || LPAD(nextval('registration_number_seq')::text, 6, '0');
  RETURN NEW;
END;
$$;

-- 6. Add Missing RLS Policies for DELETE operations where appropriate
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile" ON public.profiles
FOR DELETE USING (auth.uid() = user_id);

-- 7. Strengthen ticket type security
DROP POLICY IF EXISTS "Ticket types are viewable by everyone" ON public.ticket_types;
CREATE POLICY "Ticket types are viewable for active events" ON public.ticket_types
FOR SELECT USING (
  is_active = true AND EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = ticket_types.event_id 
    AND events.status = 'published'
  )
);

CREATE POLICY "Organizers can view all ticket types for their events" ON public.ticket_types
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = ticket_types.event_id 
    AND events.organizer_id = auth.uid()
  )
);

-- 8. Secure results viewing - only show results for published events
DROP POLICY IF EXISTS "Results are viewable by everyone" ON public.results;
CREATE POLICY "Results are viewable for published events" ON public.results
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = results.event_id 
    AND events.status = 'published'
  )
);

-- 9. Add audit logging for critical operations
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_log;
CREATE POLICY "Admins can view audit logs" ON public.audit_log
FOR SELECT USING (public.get_current_user_role() = 'admin');