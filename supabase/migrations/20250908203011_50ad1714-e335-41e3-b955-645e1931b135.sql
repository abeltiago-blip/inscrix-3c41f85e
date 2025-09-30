-- Add minimum and maximum age fields to ticket_types table
ALTER TABLE public.ticket_types 
ADD COLUMN min_age INTEGER,
ADD COLUMN max_age INTEGER;

-- Add check constraint to ensure min_age <= max_age when both are provided
ALTER TABLE public.ticket_types 
ADD CONSTRAINT ticket_types_age_range_check 
CHECK (min_age IS NULL OR max_age IS NULL OR min_age <= max_age);

-- Add comments for documentation
COMMENT ON COLUMN public.ticket_types.min_age IS 'Minimum age required for this ticket type (inclusive)';
COMMENT ON COLUMN public.ticket_types.max_age IS 'Maximum age allowed for this ticket type (inclusive)';