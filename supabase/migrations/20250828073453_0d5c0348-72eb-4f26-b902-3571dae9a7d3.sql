-- Create payment methods table
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL, -- stripe, paypal, mbway, etc
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  fees_percentage DECIMAL(5,2) DEFAULT 0,
  fees_fixed DECIMAL(10,2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create platform settings table
CREATE TABLE public.platform_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table for comprehensive order management
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  event_id UUID REFERENCES public.events(id),
  registration_id UUID REFERENCES public.registrations(id),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, cancelled, refunded
  payment_method TEXT,
  payment_provider TEXT,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  fees_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_date TIMESTAMP WITH TIME ZONE,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  refund_amount DECIMAL(10,2) DEFAULT 0,
  refund_reason TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create support tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  category TEXT NOT NULL DEFAULT 'general', -- general, technical, billing, event
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, resolved, closed
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL, -- email, sms, push, system
  category TEXT NOT NULL, -- registration, payment, event, system
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_number TEXT NOT NULL UNIQUE,
  order_id UUID REFERENCES public.orders(id),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL, -- payment, refund, payout, fee
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed
  payment_method TEXT,
  provider_transaction_id TEXT,
  provider_fee DECIMAL(10,2) DEFAULT 0,
  platform_fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2),
  processed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  order_id UUID REFERENCES public.orders(id),
  user_id UUID REFERENCES auth.users(id),
  organizer_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  due_date DATE,
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  paid_date DATE,
  notes TEXT,
  billing_address JSONB,
  line_items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payouts table for organizer payments
CREATE TABLE public.payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payout_number TEXT NOT NULL UNIQUE,
  organizer_id UUID NOT NULL REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  payment_method TEXT,
  bank_account_info JSONB,
  processed_at TIMESTAMP WITH TIME ZONE,
  reference TEXT,
  fees DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  events_included UUID[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payment_methods (admin only)
CREATE POLICY "Admins can manage payment methods" ON public.payment_methods
  FOR ALL USING (get_current_user_role() = 'admin');

-- Create RLS policies for platform_settings (admin only for management, public for reading public settings)
CREATE POLICY "Admins can manage platform settings" ON public.platform_settings
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Public settings are viewable by everyone" ON public.platform_settings
  FOR SELECT USING (is_public = true);

-- Create RLS policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Organizers can view orders for their events" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = orders.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (get_current_user_role() = 'admin');

-- Create RLS policies for support_tickets
CREATE POLICY "Users can manage their own tickets" ON public.support_tickets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all tickets" ON public.support_tickets
  FOR ALL USING (get_current_user_role() = 'admin');

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications" ON public.notifications
  FOR ALL USING (get_current_user_role() = 'admin');

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transactions" ON public.transactions
  FOR ALL USING (get_current_user_role() = 'admin');

-- Create RLS policies for invoices
CREATE POLICY "Users can view their own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Organizers can view their event invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "Admins can manage all invoices" ON public.invoices
  FOR ALL USING (get_current_user_role() = 'admin');

-- Create RLS policies for payouts
CREATE POLICY "Organizers can view their own payouts" ON public.payouts
  FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "Admins can manage all payouts" ON public.payouts
  FOR ALL USING (get_current_user_role() = 'admin');

-- Create sequences for numbering
CREATE SEQUENCE order_number_seq START 1000;
CREATE SEQUENCE ticket_number_seq START 1000;
CREATE SEQUENCE transaction_number_seq START 1000;
CREATE SEQUENCE invoice_number_seq START 1000;
CREATE SEQUENCE payout_number_seq START 1000;

-- Create triggers for auto-generating numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || EXTRACT(YEAR FROM NEW.created_at) || '-' || LPAD(nextval('order_number_seq')::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || EXTRACT(YEAR FROM NEW.created_at) || '-' || LPAD(nextval('ticket_number_seq')::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.transaction_number := 'TXN-' || EXTRACT(YEAR FROM NEW.created_at) || '-' || LPAD(nextval('transaction_number_seq')::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number := 'INV-' || EXTRACT(YEAR FROM NEW.created_at) || '-' || LPAD(nextval('invoice_number_seq')::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_payout_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.payout_number := 'PAY-' || EXTRACT(YEAR FROM NEW.created_at) || '-' || LPAD(nextval('payout_number_seq')::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

CREATE TRIGGER generate_ticket_number_trigger
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION generate_ticket_number();

CREATE TRIGGER generate_transaction_number_trigger
  BEFORE INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION generate_transaction_number();

CREATE TRIGGER generate_invoice_number_trigger
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION generate_invoice_number();

CREATE TRIGGER generate_payout_number_trigger
  BEFORE INSERT ON public.payouts
  FOR EACH ROW
  EXECUTE FUNCTION generate_payout_number();

-- Add update triggers for timestamps
CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at
  BEFORE UPDATE ON public.payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default platform settings
INSERT INTO public.platform_settings (key, value, description, category, is_public) VALUES
('platform_fee_percentage', '5.0', 'Platform fee percentage on transactions', 'financial', false),
('platform_fee_fixed', '0.50', 'Fixed platform fee per transaction', 'financial', false),
('tax_rate', '23.0', 'Default tax rate (IVA)', 'financial', false),
('currency', '"EUR"', 'Default platform currency', 'general', true),
('maintenance_mode', 'false', 'Platform maintenance mode', 'system', true),
('registration_enabled', 'true', 'Allow new registrations', 'system', true),
('event_creation_enabled', 'true', 'Allow event creation', 'system', true),
('max_events_per_organizer', '50', 'Maximum events per organizer', 'limits', false),
('max_participants_per_event', '10000', 'Maximum participants per event', 'limits', false),
('payout_minimum_amount', '50.00', 'Minimum amount for payouts', 'financial', false),
('email_notifications_enabled', 'true', 'Enable email notifications', 'notifications', true),
('sms_notifications_enabled', 'false', 'Enable SMS notifications', 'notifications', true);

-- Insert default payment methods
INSERT INTO public.payment_methods (name, provider, config, is_active, fees_percentage, fees_fixed) VALUES
('Stripe', 'stripe', '{"public_key": "", "secret_key": "", "webhook_secret": ""}', true, 2.9, 0.30),
('PayPal', 'paypal', '{"client_id": "", "client_secret": "", "sandbox": true}', false, 3.4, 0.35),
('MB Way', 'mbway', '{"entity": "", "reference": ""}', false, 1.5, 0.25),
('Transferência Bancária', 'bank_transfer', '{"iban": "", "swift": "", "account_name": ""}', true, 0, 0);