-- Adicionar campos para regulamento e termos do evento
ALTER TABLE public.events 
ADD COLUMN event_regulation TEXT,
ADD COLUMN terms_and_conditions TEXT,
ADD COLUMN image_rights_clause TEXT,
ADD COLUMN liability_waiver TEXT;