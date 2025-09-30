-- Create easypay_payments table for tracking EasyPay payment requests
CREATE TABLE public.easypay_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  easypay_payment_id VARCHAR(255) NOT NULL UNIQUE,
  method VARCHAR(50) NOT NULL, -- 'multibanco', 'mbway', 'cc', 'dd', etc.
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  
  -- EasyPay specific fields
  entity VARCHAR(10), -- For Multibanco
  reference VARCHAR(20), -- For Multibanco
  phone VARCHAR(20), -- For MB WAY
  
  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'expired', 'failed'
  
  -- EasyPay response data
  easypay_status VARCHAR(50),
  easypay_response JSONB,
  
  -- Timestamps
  expires_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add RLS policies
ALTER TABLE public.easypay_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own EasyPay payments through orders
CREATE POLICY "Users can view their own easypay payments" 
ON public.easypay_payments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders o 
    JOIN public.registrations r ON o.registration_id = r.id 
    WHERE o.id = easypay_payments.order_id 
    AND r.participant_id = auth.uid()
  )
);

-- Admins can view all EasyPay payments
CREATE POLICY "Admins can view all easypay payments" 
ON public.easypay_payments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- System can insert EasyPay payments (for edge functions)
CREATE POLICY "System can insert easypay payments" 
ON public.easypay_payments 
FOR INSERT 
WITH CHECK (true);

-- System can update EasyPay payments (for webhooks)
CREATE POLICY "System can update easypay payments" 
ON public.easypay_payments 
FOR UPDATE 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_easypay_payments_order_id ON public.easypay_payments(order_id);
CREATE INDEX idx_easypay_payments_easypay_id ON public.easypay_payments(easypay_payment_id);
CREATE INDEX idx_easypay_payments_status ON public.easypay_payments(status);
CREATE INDEX idx_easypay_payments_method ON public.easypay_payments(method);

-- Update payment_methods table to add EasyPay method
INSERT INTO public.payment_methods (name, provider, config, is_active, fees_percentage, fees_fixed, currency) 
VALUES (
  'EasyPay', 
  'easypay', 
  '{"account_id": "", "api_key": "", "sandbox": true}'::jsonb,
  true,
  0.0, 
  0.0, 
  'EUR'
) ON CONFLICT DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_easypay_payments_updated_at
BEFORE UPDATE ON public.easypay_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();