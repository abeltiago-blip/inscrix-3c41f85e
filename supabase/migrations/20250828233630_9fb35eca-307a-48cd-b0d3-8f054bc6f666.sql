-- Criar tabela de equipas
CREATE TABLE public.teams (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text,
    captain_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    logo_url text,
    sport_category text,
    location text,
    max_members integer DEFAULT 20,
    is_public boolean DEFAULT true,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de membros de equipas
CREATE TABLE public.team_members (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    participant_name text NOT NULL,
    participant_email text NOT NULL,
    participant_cc text,
    role text DEFAULT 'member' CHECK (role IN ('captain', 'member')),
    joined_at timestamp with time zone NOT NULL DEFAULT now(),
    is_active boolean DEFAULT true,
    UNIQUE(team_id, user_id),
    UNIQUE(team_id, participant_email)
);

-- Modificar tabela registrations para suportar referência a equipas
ALTER TABLE public.registrations 
ADD COLUMN team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
ADD COLUMN is_team_captain boolean DEFAULT false;

-- Índices para performance
CREATE INDEX idx_teams_captain ON public.teams(captain_user_id);
CREATE INDEX idx_teams_sport_category ON public.teams(sport_category);
CREATE INDEX idx_teams_location ON public.teams(location);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_registrations_team_id ON public.registrations(team_id);

-- RLS Policies para teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams are viewable by everyone" 
ON public.teams 
FOR SELECT 
USING (is_public = true AND is_active = true);

CREATE POLICY "Users can create teams" 
ON public.teams 
FOR INSERT 
WITH CHECK (auth.uid() = captain_user_id);

CREATE POLICY "Team captains can update their teams" 
ON public.teams 
FOR UPDATE 
USING (auth.uid() = captain_user_id)
WITH CHECK (auth.uid() = captain_user_id);

CREATE POLICY "Team captains can delete their teams" 
ON public.teams 
FOR DELETE 
USING (auth.uid() = captain_user_id);

-- RLS Policies para team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members are viewable for team visibility" 
ON public.team_members 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.teams 
        WHERE teams.id = team_members.team_id 
        AND teams.is_public = true 
        AND teams.is_active = true
    )
    OR auth.uid() = user_id
    OR EXISTS (
        SELECT 1 FROM public.teams 
        WHERE teams.id = team_members.team_id 
        AND teams.captain_user_id = auth.uid()
    )
);

CREATE POLICY "Team captains can manage team members" 
ON public.team_members 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.teams 
        WHERE teams.id = team_members.team_id 
        AND teams.captain_user_id = auth.uid()
    )
);

CREATE POLICY "Users can join teams as members" 
ON public.team_members 
FOR INSERT 
WITH CHECK (
    (auth.uid() = user_id OR user_id IS NULL) AND
    EXISTS (
        SELECT 1 FROM public.teams 
        WHERE teams.id = team_members.team_id 
        AND teams.is_public = true 
        AND teams.is_active = true
    )
);

-- Trigger para updated_at
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Função para contar membros da equipa
CREATE OR REPLACE FUNCTION public.get_team_member_count(team_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT COUNT(*)::integer
    FROM public.team_members
    WHERE team_id = team_uuid AND is_active = true;
$$;