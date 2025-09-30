-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('sports', 'cultural')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  registration_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  registration_end TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  max_participants INTEGER,
  min_age INTEGER,
  max_age INTEGER,
  requires_medical_certificate BOOLEAN DEFAULT false,
  organizer_notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket types table
CREATE TABLE public.ticket_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  max_quantity INTEGER,
  early_bird_price DECIMAL(10, 2),
  early_bird_end_date TIMESTAMP WITH TIME ZONE,
  includes_tshirt BOOLEAN DEFAULT false,
  includes_kit BOOLEAN DEFAULT false,
  includes_meal BOOLEAN DEFAULT false,
  includes_insurance BOOLEAN DEFAULT false,
  age_group TEXT,
  gender_restriction TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create registrations table
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ticket_type_id UUID NOT NULL REFERENCES public.ticket_types(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  participant_email TEXT NOT NULL,
  participant_phone TEXT,
  participant_birth_date DATE,
  participant_gender TEXT,
  participant_document_number TEXT,
  participant_nationality TEXT DEFAULT 'Portugal',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_conditions TEXT,
  team_name TEXT,
  tshirt_size TEXT,
  registration_number TEXT UNIQUE,
  amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'cancelled')),
  payment_method TEXT,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  voucher_code TEXT,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  check_in_status TEXT NOT NULL DEFAULT 'not_checked_in' CHECK (check_in_status IN ('not_checked_in', 'checked_in')),
  check_in_time TIMESTAMP WITH TIME ZONE,
  bib_number TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create results table
CREATE TABLE public.results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  bib_number TEXT,
  category TEXT,
  gender TEXT,
  finish_time INTERVAL,
  position_overall INTEGER,
  position_category INTEGER,
  position_gender INTEGER,
  dnf BOOLEAN DEFAULT false,
  dsq BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, registration_id)
);

-- Create vouchers table
CREATE TABLE public.vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10, 2) NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  applies_to_ticket_types UUID[],
  minimum_purchase_amount DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "Events are viewable by everyone" 
ON public.events FOR SELECT USING (true);

CREATE POLICY "Organizers can create their own events" 
ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their own events" 
ON public.events FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their own events" 
ON public.events FOR DELETE USING (auth.uid() = organizer_id);

-- RLS Policies for ticket_types
CREATE POLICY "Ticket types are viewable by everyone" 
ON public.ticket_types FOR SELECT USING (true);

CREATE POLICY "Organizers can manage ticket types for their events" 
ON public.ticket_types FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = ticket_types.event_id 
    AND events.organizer_id = auth.uid()
  )
);

-- RLS Policies for registrations
CREATE POLICY "Users can view their own registrations" 
ON public.registrations FOR SELECT USING (auth.uid() = participant_id);

CREATE POLICY "Organizers can view registrations for their events" 
ON public.registrations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = registrations.event_id 
    AND events.organizer_id = auth.uid()
  )
);

CREATE POLICY "Anyone can create registrations" 
ON public.registrations FOR INSERT WITH CHECK (true);

CREATE POLICY "Organizers can update registrations for their events" 
ON public.registrations FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = registrations.event_id 
    AND events.organizer_id = auth.uid()
  )
);

-- RLS Policies for results
CREATE POLICY "Results are viewable by everyone" 
ON public.results FOR SELECT USING (true);

CREATE POLICY "Organizers can manage results for their events" 
ON public.results FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = results.event_id 
    AND events.organizer_id = auth.uid()
  )
);

-- RLS Policies for vouchers
CREATE POLICY "Vouchers are viewable by everyone" 
ON public.vouchers FOR SELECT USING (true);

CREATE POLICY "Organizers can manage their own vouchers" 
ON public.vouchers FOR ALL USING (auth.uid() = organizer_id);

-- Create indexes for better performance
CREATE INDEX idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_ticket_types_event_id ON public.ticket_types(event_id);
CREATE INDEX idx_registrations_event_id ON public.registrations(event_id);
CREATE INDEX idx_registrations_participant_id ON public.registrations(participant_id);
CREATE INDEX idx_registrations_payment_status ON public.registrations(payment_status);
CREATE INDEX idx_results_event_id ON public.results(event_id);
CREATE INDEX idx_vouchers_code ON public.vouchers(code);
CREATE INDEX idx_vouchers_event_id ON public.vouchers(event_id);

-- Create function to generate registration numbers
CREATE OR REPLACE FUNCTION public.generate_registration_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.registration_number := 'REG-' || EXTRACT(YEAR FROM NEW.created_at) || '-' || LPAD(nextval('registration_number_seq')::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for registration numbers
CREATE SEQUENCE registration_number_seq START 1;

-- Create trigger for automatic registration number generation
CREATE TRIGGER generate_registration_number_trigger
  BEFORE INSERT ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_registration_number();

-- Create triggers for updating timestamps
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ticket_types_updated_at
  BEFORE UPDATE ON public.ticket_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_results_updated_at
  BEFORE UPDATE ON public.results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vouchers_updated_at
  BEFORE UPDATE ON public.vouchers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();