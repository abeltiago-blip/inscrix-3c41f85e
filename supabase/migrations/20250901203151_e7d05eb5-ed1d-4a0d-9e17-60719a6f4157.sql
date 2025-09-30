-- Improve RLS policies for better security

-- Update profiles table policies for better security
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile (except role)" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create more secure policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile (except role and critical fields)"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    role = (SELECT role FROM public.profiles WHERE user_id = auth.uid()) AND
    user_id = OLD.user_id AND
    email = OLD.email
  );

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add policy for registration validation - only allow registrations for authenticated users
DROP POLICY IF EXISTS "Users can create registrations secure" ON public.registrations;
CREATE POLICY "Users can create registrations secure"
  ON public.registrations FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (participant_id = auth.uid() OR user_id = auth.uid())
  );

-- Improve event checkins security
DROP POLICY IF EXISTS "Checkins are viewable for published events" ON public.event_checkins;
CREATE POLICY "Organizers and participants can view event checkins"
  ON public.event_checkins FOR SELECT
  USING (
    auth.uid() = participant_id OR
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_checkins.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

-- Add policy to prevent duplicate CC registrations
CREATE OR REPLACE FUNCTION public.validate_unique_participant_cc()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for duplicate CC in the same event
  IF EXISTS (
    SELECT 1 FROM registrations 
    WHERE event_id = NEW.event_id 
    AND participant_document_number = NEW.participant_document_number
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Este documento já está registado neste evento';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for CC validation
DROP TRIGGER IF EXISTS validate_unique_cc_trigger ON registrations;
CREATE TRIGGER validate_unique_cc_trigger
  BEFORE INSERT OR UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION validate_unique_participant_cc();