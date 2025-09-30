-- Add missing fields to profiles table for complete participant data
ALTER TABLE public.profiles 
ADD COLUMN birth_date DATE NULL,
ADD COLUMN gender TEXT NULL,
ADD COLUMN document_number TEXT NULL,
ADD COLUMN nationality TEXT DEFAULT 'Portugal',
ADD COLUMN emergency_contact_name TEXT NULL,
ADD COLUMN emergency_contact_phone TEXT NULL;