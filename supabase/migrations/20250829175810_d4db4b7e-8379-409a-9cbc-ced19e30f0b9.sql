-- Priority 1: Fix Critical Role Escalation Vulnerability
-- Update the profiles table policy to prevent users from changing their own role

-- Drop the existing policy that allows users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a new policy that allows users to update their profile but NOT their role
CREATE POLICY "Users can update their own profile (except role)"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  -- Prevent role changes by ensuring new role equals old role
  role = (SELECT role FROM public.profiles WHERE user_id = auth.uid())
);

-- Create a separate admin-only policy for role updates
CREATE POLICY "Admins can update any profile role"
ON public.profiles
FOR UPDATE
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- Priority 2: Strengthen Registration Data Protection
-- Drop redundant policies on registrations table
DROP POLICY IF EXISTS "Users can create registrations for themselves" ON public.registrations;
DROP POLICY IF EXISTS "Users can update their own registrations" ON public.registrations;

-- Keep only the secure policies
-- (The existing secure policies are already good, just removing the redundant ones)

-- Priority 3: Fix Database Function Security
-- Update all functions to have proper search_path settings

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_team_member_count(team_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COUNT(*)::integer
    FROM public.team_members
    WHERE team_id = team_uuid AND is_active = true;
$$;

-- Priority 4: Add Security Audit Logging
-- Create a security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type text NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    target_user_id uuid REFERENCES auth.users(id),
    details jsonb DEFAULT '{}',
    ip_address text,
    user_agent text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view security audit logs
CREATE POLICY "Admins can view security audit logs"
ON public.security_audit_log
FOR SELECT
USING (get_current_user_role() = 'admin');

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    _event_type text,
    _target_user_id uuid DEFAULT NULL,
    _details jsonb DEFAULT '{}',
    _ip_address text DEFAULT NULL,
    _user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.security_audit_log (
        event_type,
        user_id,
        target_user_id,
        details,
        ip_address,
        user_agent
    ) VALUES (
        _event_type,
        auth.uid(),
        _target_user_id,
        _details,
        _ip_address,
        _user_agent
    );
END;
$$;

-- Create trigger to log role changes
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Log when a user's role is changed
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        PERFORM public.log_security_event(
            'role_changed',
            NEW.user_id,
            jsonb_build_object(
                'old_role', OLD.role,
                'new_role', NEW.role,
                'changed_by', auth.uid()
            )
        );
    END IF;
    RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS log_profile_role_changes ON public.profiles;
CREATE TRIGGER log_profile_role_changes
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_role_changes();