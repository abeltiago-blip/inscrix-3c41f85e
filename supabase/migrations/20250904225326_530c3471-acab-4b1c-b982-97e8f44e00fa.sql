-- Fix security issue: Replace existing insecure easypay_payments policies

BEGIN;

-- Drop all existing easypay_payments policies first
DROP POLICY IF EXISTS "Secure easypay payments insert" ON public.easypay_payments;
DROP POLICY IF EXISTS "Secure easypay payments update" ON public.easypay_payments;
DROP POLICY IF EXISTS "System can insert easypay payments" ON public.easypay_payments;
DROP POLICY IF EXISTS "System can update easypay payments" ON public.easypay_payments;

-- Create properly secured INSERT policy
CREATE POLICY "Restricted easypay payments insert" 
ON public.easypay_payments 
FOR INSERT 
WITH CHECK (
  -- Allow service role (for edge functions)
  (auth.jwt() ->> 'role' = 'service_role') OR
  -- Allow payment owner only
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 
    FROM orders o
    JOIN registrations r ON o.registration_id = r.id
    WHERE o.id = easypay_payments.order_id 
    AND r.participant_id = auth.uid()
  ))
);

-- Create properly secured UPDATE policy
CREATE POLICY "Restricted easypay payments update" 
ON public.easypay_payments 
FOR UPDATE 
USING (
  -- Allow service role (for edge functions and webhooks)
  (auth.jwt() ->> 'role' = 'service_role') OR
  -- Allow admins
  (get_current_user_role() = 'admin') OR
  -- Allow payment owner only
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 
    FROM orders o
    JOIN registrations r ON o.registration_id = r.id
    WHERE o.id = easypay_payments.order_id 
    AND r.participant_id = auth.uid()
  ))
);

COMMIT;