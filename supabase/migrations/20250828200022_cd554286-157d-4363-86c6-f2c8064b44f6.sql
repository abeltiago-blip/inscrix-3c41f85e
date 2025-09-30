-- Create event_checkins table for QR code check-ins
CREATE TABLE public.event_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  participant_id UUID,
  registration_id UUID,
  participant_name TEXT NOT NULL,
  participant_email TEXT NOT NULL,
  checkin_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  checkin_method TEXT NOT NULL DEFAULT 'qr_scan',
  scanner_user_id UUID,
  notes TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_checkins ENABLE ROW LEVEL SECURITY;

-- Create policies for event_checkins
CREATE POLICY "Organizers can manage checkins for their events" 
ON public.event_checkins 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM events 
  WHERE events.id = event_checkins.event_id 
  AND events.organizer_id = auth.uid()
));

CREATE POLICY "Participants can view their own checkins" 
ON public.event_checkins 
FOR SELECT 
USING (auth.uid() = participant_id);

CREATE POLICY "Checkins are viewable for published events" 
ON public.event_checkins 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM events 
  WHERE events.id = event_checkins.event_id 
  AND events.status = 'published'
));

-- Add trigger for updated_at
CREATE TRIGGER update_event_checkins_updated_at
BEFORE UPDATE ON public.event_checkins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add event_qr_codes table for managing different types of QR codes
CREATE TABLE public.event_qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  qr_type TEXT NOT NULL DEFAULT 'checkin', -- 'checkin', 'info', 'feedback'
  qr_code_data TEXT NOT NULL,
  qr_code_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  scan_count INTEGER NOT NULL DEFAULT 0,
  last_scanned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for QR codes
ALTER TABLE public.event_qr_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for QR codes
CREATE POLICY "Organizers can manage QR codes for their events" 
ON public.event_qr_codes 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM events 
  WHERE events.id = event_qr_codes.event_id 
  AND events.organizer_id = auth.uid()
));

CREATE POLICY "QR codes are viewable for active events" 
ON public.event_qr_codes 
FOR SELECT 
USING (is_active = true AND EXISTS (
  SELECT 1 FROM events 
  WHERE events.id = event_qr_codes.event_id 
  AND events.status = 'published'
));

-- Add trigger for updated_at
CREATE TRIGGER update_event_qr_codes_updated_at
BEFORE UPDATE ON public.event_qr_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();