-- Corrigir função com search_path seguro
CREATE OR REPLACE FUNCTION public.get_team_member_count(team_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COUNT(*)::integer
    FROM public.team_members
    WHERE team_id = team_uuid AND is_active = true;
$$;