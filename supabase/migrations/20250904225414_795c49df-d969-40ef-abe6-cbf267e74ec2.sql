-- Remove mbway, paypal, and stripe payment methods
DELETE FROM public.payment_methods 
WHERE provider IN ('mbway', 'paypal', 'stripe');