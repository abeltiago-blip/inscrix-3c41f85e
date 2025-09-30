-- Add regulation document URL field to events table
ALTER TABLE public.events 
ADD COLUMN regulation_document_url TEXT NULL;