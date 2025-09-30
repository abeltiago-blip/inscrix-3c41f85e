-- Fix security vulnerabilities in registrations table RLS policies
-- Current issue: Multiple overlapping SELECT policies create complexity and potential vulnerabilities

-- First, drop all existing policies on registrations table to start clean
DROP POLICY IF EXISTS "Block anonymous access to registrations" ON public.registrations;
DROP POLICY IF EXISTS "Organizers can update registrations for their events" ON public.registrations;
DROP POLICY IF EXISTS "Organizers can view registrations for their events" ON public.registrations;
DROP POLICY IF EXISTS "Registrations are only viewable by participants, organizers, an" ON public.registrations;
DROP POLICY IF EXISTS "Users can create registrations secure" ON public.registrations;
DROP POLICY IF EXISTS "Users can update registrations secure" ON public.registrations;
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users can view their own registrations secure" ON public.registrations;

-- Create simplified and secure RLS policies
-- 1. Block all anonymous access (base security)
CREATE POLICY "registrations_block_anonymous" 
ON public.registrations 
FOR ALL 
TO anon 
USING (false);

-- 2. SELECT policies - consolidate into single clear policy
CREATE POLICY "registrations_select_authorized" 
ON public.registrations 
FOR SELECT 
TO authenticated
USING (
  -- Participant can view their own registration
  (auth.uid() = participant_id) 
  OR 
  -- User who created the registration can view it
  (auth.uid() = user_id) 
  OR 
  -- Event organizer can view registrations for their events
  (EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = registrations.event_id 
    AND events.organizer_id = auth.uid()
  ))
  OR 
  -- Admin can view all registrations
  (get_current_user_role() = 'admin')
);

-- 3. INSERT policy - users can only create registrations for themselves
CREATE POLICY "registrations_insert_own" 
ON public.registrations 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Must be authenticated
  auth.uid() IS NOT NULL
  AND
  -- Must be creating for themselves (either as participant_id or user_id)
  (auth.uid() = participant_id OR auth.uid() = user_id)
  AND
  -- Required fields must be present
  participant_email IS NOT NULL 
  AND 
  participant_name IS NOT NULL
  AND
  -- Event must exist and be accepting registrations
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = registrations.event_id 
    AND events.status = 'published'
    AND events.registration_end > now()
  )
);

-- 4. UPDATE policy - strict control over who can modify registrations
CREATE POLICY "registrations_update_authorized" 
ON public.registrations 
FOR UPDATE 
TO authenticated
USING (
  -- Participant can update their own registration (limited fields)
  (auth.uid() = participant_id) 
  OR 
  -- User who created the registration can update it
  (auth.uid() = user_id) 
  OR 
  -- Event organizer can update registrations for their events (check-in, etc.)
  (EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = registrations.event_id 
    AND events.organizer_id = auth.uid()
  ))
  OR 
  -- Admin can update all registrations
  (get_current_user_role() = 'admin')
)
WITH CHECK (
  -- Same conditions for check as using
  (auth.uid() = participant_id) 
  OR 
  (auth.uid() = user_id) 
  OR 
  (EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = registrations.event_id 
    AND events.organizer_id = auth.uid()
  ))
  OR 
  (get_current_user_role() = 'admin')
);

-- 5. DELETE policy - very restrictive, only admin and registration owner
CREATE POLICY "registrations_delete_restricted" 
ON public.registrations 
FOR DELETE 
TO authenticated
USING (
  -- Admin can delete any registration
  (get_current_user_role() = 'admin')
  OR
  -- User who created the registration can delete it (before event starts)
  (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = registrations.event_id 
    AND events.start_date > now()
  ))
);

-- Add security event logging trigger for registrations table
CREATE OR REPLACE FUNCTION public.log_registration_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log sensitive registration data access
  PERFORM public.log_security_event(
    'registration_' || lower(TG_OP),
    COALESCE(NEW.participant_id, OLD.participant_id),
    NULL,
    NULL,
    jsonb_build_object(
      'registration_id', COALESCE(NEW.id, OLD.id),
      'event_id', COALESCE(NEW.event_id, OLD.event_id),
      'participant_email', COALESCE(NEW.participant_email, OLD.participant_email),
      'action_by', auth.uid()
    ),
    CASE 
      WHEN TG_OP = 'DELETE' THEN 40
      WHEN TG_OP = 'UPDATE' THEN 15
      WHEN TG_OP = 'INSERT' THEN 10
      ELSE 5
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for registration access logging
CREATE TRIGGER registrations_security_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.log_registration_access();