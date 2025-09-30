-- Fix security issue: Restrict easypay_payments access to authorized users only
-- Using a more careful approach to avoid deadlocks

BEGIN;

-- First, drop the problematic policies
DROP POLICY IF EXISTS "System can insert easypay payments" ON public.easypay_payments;
DROP POLICY IF EXISTS "System can update easypay payments" ON public.easypay_payments;

-- Create secure INSERT policy
CREATE POLICY "Secure easypay payments insert" 
ON public.easypay_payments 
FOR INSERT 
WITH CHECK (
  -- Allow service role (edge functions)
  (auth.jwt() ->> 'role' = 'service_role') OR
  -- Allow payment owner
  (EXISTS (
    SELECT 1 
    FROM orders o
    JOIN registrations r ON o.registration_id = r.id
    WHERE o.id = easypay_payments.order_id 
    AND r.participant_id = auth.uid()
  ))
);

-- Create secure UPDATE policy  
CREATE POLICY "Secure easypay payments update" 
ON public.easypay_payments 
FOR UPDATE 
USING (
  -- Allow service role (edge functions/webhooks)
  (auth.jwt() ->> 'role' = 'service_role') OR
  -- Allow admins
  (get_current_user_role() = 'admin') OR
  -- Allow payment owner
  (EXISTS (
    SELECT 1 
    FROM orders o
    JOIN registrations r ON o.registration_id = r.id
    WHERE o.id = easypay_payments.order_id 
    AND r.participant_id = auth.uid()
  ))
);

COMMIT;