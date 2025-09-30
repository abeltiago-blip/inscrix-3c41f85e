-- Add missing fields to profiles table to support all registration forms

-- Address fields (for participants)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS street TEXT,
ADD COLUMN IF NOT EXISTS street_number TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Company/Organization fields (for organizers)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_nif TEXT,
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS company_city TEXT,
ADD COLUMN IF NOT EXISTS company_phone TEXT,
ADD COLUMN IF NOT EXISTS support_email TEXT,
ADD COLUMN IF NOT EXISTS cae TEXT;

-- Team fields (for team registrations)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS team_description TEXT,
ADD COLUMN IF NOT EXISTS affiliation_code TEXT;

-- Event registration fields (used in participant registrations)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tshirt_size TEXT,
ADD COLUMN IF NOT EXISTS medical_conditions TEXT;

-- Add unique constraint for username (if not null)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique 
ON public.profiles (username) 
WHERE username IS NOT NULL;

-- Update existing profiles table comment
COMMENT ON TABLE public.profiles IS 'User profiles with comprehensive data for participants, organizers, and teams';

-- Add column comments for documentation
COMMENT ON COLUMN public.profiles.username IS 'Unique username for the user (optional)';
COMMENT ON COLUMN public.profiles.street IS 'Street name for user address';
COMMENT ON COLUMN public.profiles.street_number IS 'Street number for user address';
COMMENT ON COLUMN public.profiles.city IS 'City for user address';
COMMENT ON COLUMN public.profiles.postal_code IS 'Postal code for user address';
COMMENT ON COLUMN public.profiles.company_nif IS 'Company tax identification number (for organizers)';
COMMENT ON COLUMN public.profiles.company_address IS 'Company address (for organizers)';
COMMENT ON COLUMN public.profiles.company_city IS 'Company city (for organizers)';
COMMENT ON COLUMN public.profiles.company_phone IS 'Company phone number (for organizers)';
COMMENT ON COLUMN public.profiles.support_email IS 'Support email contact (for organizers)';
COMMENT ON COLUMN public.profiles.cae IS 'Economic Activity Code (for organizers)';
COMMENT ON COLUMN public.profiles.team_description IS 'Team description (for team registrations)';
COMMENT ON COLUMN public.profiles.affiliation_code IS 'Team affiliation code';
COMMENT ON COLUMN public.profiles.tshirt_size IS 'T-shirt size preference for events';
COMMENT ON COLUMN public.profiles.medical_conditions IS 'Medical conditions or allergies for events';