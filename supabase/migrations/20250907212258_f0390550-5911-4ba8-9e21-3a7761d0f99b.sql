-- Add NIF columns to support optional tax identification number
ALTER TABLE public.registrations 
ADD COLUMN participant_nif TEXT;

ALTER TABLE public.profiles 
ADD COLUMN nif TEXT;

-- Add index for better performance on document number queries
CREATE INDEX idx_registrations_event_document ON public.registrations(event_id, participant_document_number) WHERE participant_document_number IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.registrations.participant_nif IS 'Optional Portuguese tax identification number (NIF)';
COMMENT ON COLUMN public.profiles.nif IS 'Optional Portuguese tax identification number (NIF) for profile pre-fill';