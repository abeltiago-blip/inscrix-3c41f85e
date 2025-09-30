-- Add unique constraint to prevent duplicate documents in the same event
-- This will prevent race conditions where two registrations with the same document
-- are submitted simultaneously

-- First, clean up any existing duplicates if they exist
-- (This should be safe since the previous query showed no duplicates)

-- Add a unique constraint on event_id and participant_document_number combination
-- where status is active and document_number is not null
CREATE UNIQUE INDEX CONCURRENTLY idx_registrations_unique_document_per_event 
ON public.registrations (event_id, participant_document_number) 
WHERE status = 'active' AND participant_document_number IS NOT NULL;

-- Add a comment to document the purpose of this constraint
COMMENT ON INDEX idx_registrations_unique_document_per_event IS 
'Prevents duplicate document numbers for active registrations in the same event';