-- Create event_commissions table
CREATE TABLE public.event_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  commission_type TEXT NOT NULL CHECK (commission_type IN ('percentage', 'fixed')),
  commission_value NUMERIC NOT NULL CHECK (commission_value >= 0),
  description TEXT NOT NULL,
  applies_to_ticket_types UUID[] DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID DEFAULT auth.uid()
);

-- Add foreign key to events table
ALTER TABLE public.event_commissions 
ADD CONSTRAINT fk_event_commissions_event_id 
FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.event_commissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all event commissions" 
ON public.event_commissions 
FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Organizers can view commissions for their events" 
ON public.event_commissions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_commissions.event_id 
    AND events.organizer_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_event_commissions_updated_at
  BEFORE UPDATE ON public.event_commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit trigger
CREATE TRIGGER audit_event_commissions_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.event_commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger();