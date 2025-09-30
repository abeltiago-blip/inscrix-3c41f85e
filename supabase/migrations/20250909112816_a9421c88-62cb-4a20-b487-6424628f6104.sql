-- Add event approval system
ALTER TABLE public.events 
ADD COLUMN approval_status TEXT DEFAULT 'published' CHECK (approval_status IN ('draft', 'pending_approval', 'approved', 'published', 'rejected'));

-- Add approval fields
ALTER TABLE public.events 
ADD COLUMN approved_by UUID REFERENCES auth.users(id),
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN rejection_reason TEXT,
ADD COLUMN submitted_for_approval_at TIMESTAMP WITH TIME ZONE;

-- Update existing events to have approved status
UPDATE public.events SET approval_status = 'approved', approved_at = created_at WHERE status = 'published';

-- Create index for better performance
CREATE INDEX idx_events_approval_status ON public.events(approval_status);
CREATE INDEX idx_events_organizer_approval ON public.events(organizer_id, approval_status);