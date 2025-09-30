-- Phase 1: Critical Financial Data Protection
-- Strengthen RLS policies for financial tables (orders, transactions, invoices, payouts)

-- Orders table - ensure strict user isolation
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Organizers can view orders for their events" ON public.orders;

CREATE POLICY "Users can view their own orders only" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id AND user_id IS NOT NULL);

CREATE POLICY "Organizers can view orders for their events only" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = orders.event_id 
    AND events.organizer_id = auth.uid()
    AND orders.event_id IS NOT NULL
  )
);

CREATE POLICY "Block anonymous access to orders" 
ON public.orders 
FOR ALL 
TO anon
USING (false);

-- Transactions table - ensure strict user isolation  
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;

CREATE POLICY "Users can view their own transactions only" 
ON public.transactions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id AND user_id IS NOT NULL);

CREATE POLICY "Block anonymous access to transactions" 
ON public.transactions 
FOR ALL 
TO anon
USING (false);

-- Invoices table - ensure strict user isolation
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Organizers can view their event invoices" ON public.invoices;

CREATE POLICY "Users can view their own invoices only" 
ON public.invoices 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id AND user_id IS NOT NULL);

CREATE POLICY "Organizers can view their event invoices only" 
ON public.invoices 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = organizer_id AND organizer_id IS NOT NULL
);

CREATE POLICY "Block anonymous access to invoices" 
ON public.invoices 
FOR ALL 
TO anon
USING (false);

-- Payouts table - ensure strict organizer isolation
DROP POLICY IF EXISTS "Organizers can view their own payouts" ON public.payouts;

CREATE POLICY "Organizers can view their own payouts only" 
ON public.payouts 
FOR SELECT 
TO authenticated
USING (auth.uid() = organizer_id AND organizer_id IS NOT NULL);

CREATE POLICY "Block anonymous access to payouts" 
ON public.payouts 
FOR ALL 
TO anon
USING (false);

-- Phase 2: Enhanced Email Security
-- Restrict email logs to admin and specific recipients only
DROP POLICY IF EXISTS "Users can view their own email logs" ON public.email_logs;

CREATE POLICY "Users can view their own email logs only" 
ON public.email_logs 
FOR SELECT 
TO authenticated
USING (
  (auth.uid() = recipient_user_id AND recipient_user_id IS NOT NULL)
  OR get_current_user_role() = 'admin'
);

-- Phase 3: Security Monitoring - Add comprehensive audit logging

-- Create security events table for monitoring
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'login_attempt', 'data_access', 'payment_attempt', 'registration_attempt'
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  risk_score INTEGER DEFAULT 0, -- 0-100 risk assessment
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Admins can view security events" 
ON public.security_events 
FOR SELECT 
TO authenticated
USING (get_current_user_role() = 'admin');

CREATE POLICY "Block anonymous access to security_events" 
ON public.security_events 
FOR ALL 
TO anon
USING (false);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_risk_score INTEGER DEFAULT 0
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.security_events (
    event_type, 
    user_id, 
    ip_address, 
    user_agent, 
    details, 
    risk_score
  ) VALUES (
    p_event_type,
    COALESCE(p_user_id, auth.uid()),
    p_ip_address::INET,
    p_user_agent,
    p_details,
    p_risk_score
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Add triggers to log critical data modifications (not SELECT)
CREATE OR REPLACE FUNCTION public.log_financial_data_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log when financial data is modified (INSERT/UPDATE/DELETE)
  PERFORM public.log_security_event(
    'financial_data_modified',
    auth.uid(),
    NULL, -- IP will be logged by application
    NULL, -- User agent will be logged by application  
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'record_id', CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.id 
        ELSE NEW.id 
      END,
      'amount', CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.total_amount 
        ELSE NEW.total_amount 
      END
    ),
    CASE TG_OP 
      WHEN 'DELETE' THEN 30
      WHEN 'UPDATE' THEN 20
      ELSE 10
    END -- Higher risk for deletions
  );
  
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- Create triggers for financial tables (INSERT/UPDATE/DELETE only)
DROP TRIGGER IF EXISTS log_orders_modifications ON public.orders;
CREATE TRIGGER log_orders_modifications
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.log_financial_data_modification();

DROP TRIGGER IF EXISTS log_transactions_modifications ON public.transactions;  
CREATE TRIGGER log_transactions_modifications
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_financial_data_modification();

-- Add constraint to prevent duplicate user_id entries where not allowed
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS unique_user_id;
ALTER TABLE public.profiles 
ADD CONSTRAINT unique_user_id UNIQUE (user_id);

-- Ensure email_logs table is properly secured
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Add data validation constraints
ALTER TABLE public.registrations 
DROP CONSTRAINT IF EXISTS valid_participant_email;
ALTER TABLE public.registrations 
ADD CONSTRAINT valid_participant_email 
CHECK (participant_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

ALTER TABLE public.registrations 
DROP CONSTRAINT IF EXISTS valid_participant_name_length;
ALTER TABLE public.registrations 
ADD CONSTRAINT valid_participant_name_length 
CHECK (length(trim(participant_name)) >= 2 AND length(trim(participant_name)) <= 100);

-- Add audit trigger for profile changes
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log profile modifications for security monitoring
  PERFORM public.log_security_event(
    'profile_modified',
    NEW.user_id,
    NULL,
    NULL,
    jsonb_build_object(
      'changed_fields', (
        SELECT jsonb_object_agg(key, value)
        FROM jsonb_each(to_jsonb(NEW))
        WHERE key IN ('email', 'first_name', 'last_name', 'role', 'phone')
        AND (OLD IS NULL OR to_jsonb(OLD)->key != value)
      )
    ),
    CASE WHEN OLD IS NULL THEN 5 
         WHEN OLD.role != NEW.role THEN 50 
         ELSE 5 END -- Higher risk for role changes
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_profile_changes ON public.profiles;
CREATE TRIGGER audit_profile_changes
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_changes();