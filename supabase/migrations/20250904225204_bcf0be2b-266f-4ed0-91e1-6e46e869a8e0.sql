-- Fix security issue: Restrict easypay_payments access to authorized users only

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "System can insert easypay payments" ON public.easypay_payments;
DROP POLICY IF EXISTS "System can update easypay payments" ON public.easypay_payments;

-- Create secure INSERT policy: Only allow payment owner or service role
CREATE POLICY "Secure easypay payments insert" 
ON public.easypay_payments 
FOR INSERT 
WITH CHECK (
  -- Allow service role (for edge functions)
  (auth.jwt() ->> 'role' = 'service_role') OR
  -- Allow payment owner (user who owns the related order)
  (EXISTS (
    SELECT 1 
    FROM orders o
    JOIN registrations r ON o.registration_id = r.id
    WHERE o.id = easypay_payments.order_id 
    AND r.participant_id = auth.uid()
  ))
);

-- Create secure UPDATE policy: Only allow payment owner, service role, or admin
CREATE POLICY "Secure easypay payments update" 
ON public.easypay_payments 
FOR UPDATE 
USING (
  -- Allow service role (for edge functions and webhooks)
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
)
WITH CHECK (
  -- Same conditions for the check constraint
  (auth.jwt() ->> 'role' = 'service_role') OR
  (get_current_user_role() = 'admin') OR
  (EXISTS (
    SELECT 1 
    FROM orders o
    JOIN registrations r ON o.registration_id = r.id
    WHERE o.id = easypay_payments.order_id 
    AND r.participant_id = auth.uid()
  ))
);