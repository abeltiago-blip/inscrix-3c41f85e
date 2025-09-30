-- =============================================
-- CRITICAL SECURITY FIX: Secure registrations table immediately
-- =============================================

-- 1. Enable RLS on registrations table if not already enabled
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 2. Drop all current policies on registrations that are insecure
DROP POLICY IF EXISTS "Public can view all registrations" ON public.registrations;
DROP POLICY IF EXISTS "Anyone can view registrations" ON public.registrations;
DROP POLICY IF EXISTS "Registrations are public" ON public.registrations;

-- 3. Add user_id column to registrations if it doesn't exist
-- This links registrations to authenticated users
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'registrations' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.registrations 
        ADD COLUMN user_id uuid REFERENCES auth.users(id);
    END IF;
END $$;

-- 4. Update existing registrations to link them to users where possible
-- This is a one-time data migration
UPDATE public.registrations 
SET user_id = participant_id 
WHERE user_id IS NULL AND participant_id IS NOT NULL;

-- 5. Create secure policies that prevent public access
-- Only allow users to see their own registrations
DROP POLICY IF EXISTS "Users can view their own registrations secure" ON public.registrations;
CREATE POLICY "Users can view their own registrations secure" 
ON public.registrations 
FOR SELECT 
USING (
    auth.uid() = user_id OR 
    auth.uid() = participant_id OR
    -- Allow organizers to see registrations for their events
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = registrations.event_id 
        AND events.organizer_id = auth.uid()
    )
);

-- Users can create registrations for themselves
DROP POLICY IF EXISTS "Users can create registrations secure" ON public.registrations;
CREATE POLICY "Users can create registrations secure" 
ON public.registrations 
FOR INSERT 
WITH CHECK (
    auth.uid() = user_id OR 
    auth.uid() = participant_id
);

-- Users can update their own registrations
DROP POLICY IF EXISTS "Users can update registrations secure" ON public.registrations;
CREATE POLICY "Users can update registrations secure" 
ON public.registrations 
FOR UPDATE 
USING (
    auth.uid() = user_id OR 
    auth.uid() = participant_id OR
    -- Allow organizers to update registrations for their events
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = registrations.event_id 
        AND events.organizer_id = auth.uid()
    )
);

-- 6. Add audit trigger for registrations if it doesn't exist
DROP TRIGGER IF EXISTS audit_registrations_changes ON public.registrations;
CREATE TRIGGER audit_registrations_changes
    AFTER UPDATE OR DELETE ON public.registrations
    FOR EACH ROW 
    EXECUTE FUNCTION public.audit_trigger();

-- 7. Make sure events table is also secure
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Remove any overly permissive policies on events
DROP POLICY IF EXISTS "Events are publicly readable" ON public.events;
DROP POLICY IF EXISTS "Public events access" ON public.events;