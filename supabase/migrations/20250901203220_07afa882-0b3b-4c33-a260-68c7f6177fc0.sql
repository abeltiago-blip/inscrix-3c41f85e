-- Fix RLS policies security improvements

-- Create simple and secure profile update policy
DROP POLICY IF EXISTS "Users can update their own profile (except role and critical fields)" ON public.profiles;

CREATE POLICY "Users can update their own profile (excluding sensitive fields)"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()) AND
    role = (SELECT role FROM public.profiles WHERE user_id = auth.uid())
  );

-- Improve registration security with better validation
DROP POLICY IF EXISTS "Users can create registrations secure" ON public.registrations;
CREATE POLICY "Users can create registrations secure"
  ON public.registrations FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (participant_id = auth.uid() OR user_id = auth.uid()) AND
    participant_email IS NOT NULL AND
    participant_name IS NOT NULL
  );

-- Prevent duplicate document registrations via database constraint
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_registration_per_event_document 
ON registrations (event_id, participant_document_number) 
WHERE status = 'active' AND participant_document_number IS NOT NULL;