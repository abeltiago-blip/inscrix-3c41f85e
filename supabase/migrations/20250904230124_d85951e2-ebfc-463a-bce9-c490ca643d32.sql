-- Remove fields de taxas da tabela payment_methods já que não são necessários
ALTER TABLE public.payment_methods 
DROP COLUMN IF EXISTS fees_percentage,
DROP COLUMN IF EXISTS fees_fixed;