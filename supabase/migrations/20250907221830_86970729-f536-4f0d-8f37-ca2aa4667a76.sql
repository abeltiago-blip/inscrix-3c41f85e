-- Update the handle_new_user function to save all registration fields
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    email, 
    first_name, 
    last_name,
    phone,
    role,
    username,
    street,
    street_number,
    city,
    postal_code,
    birth_date,
    gender,
    document_number,
    nationality,
    nif,
    emergency_contact_name,
    emergency_contact_phone,
    organization_name,
    company_nif,
    company_address,
    company_city,
    company_phone,
    support_email,
    cae,
    team_name,
    team_description,
    affiliation_code,
    tshirt_size,
    medical_conditions
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'firstName', NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'lastName', NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'participant'),
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'street',
    NEW.raw_user_meta_data ->> 'streetNumber',
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'postalCode',
    (NEW.raw_user_meta_data ->> 'birthDate')::date,
    NEW.raw_user_meta_data ->> 'gender',
    COALESCE(NEW.raw_user_meta_data ->> 'citizenCard', NEW.raw_user_meta_data ->> 'documentNumber'),
    COALESCE(NEW.raw_user_meta_data ->> 'nationality', 'Portugal'),
    NEW.raw_user_meta_data ->> 'nif',
    NEW.raw_user_meta_data ->> 'emergencyContactName',
    NEW.raw_user_meta_data ->> 'emergencyContactPhone',
    COALESCE(NEW.raw_user_meta_data ->> 'companyName', NEW.raw_user_meta_data ->> 'organizationName'),
    NEW.raw_user_meta_data ->> 'companyNif',
    NEW.raw_user_meta_data ->> 'companyAddress',
    NEW.raw_user_meta_data ->> 'companyCity',
    NEW.raw_user_meta_data ->> 'companyPhone',
    NEW.raw_user_meta_data ->> 'supportEmail',
    NEW.raw_user_meta_data ->> 'cae',
    NEW.raw_user_meta_data ->> 'teamName',
    NEW.raw_user_meta_data ->> 'teamDescription',
    NEW.raw_user_meta_data ->> 'affiliationCode',
    NEW.raw_user_meta_data ->> 'tshirtSize',
    NEW.raw_user_meta_data ->> 'medicalConditions'
  );
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();