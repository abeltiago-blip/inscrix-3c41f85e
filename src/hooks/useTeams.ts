import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Team {
  id: string;
  name: string;
  description?: string;
  captain_user_id: string;
  logo_url?: string;
  sport_category?: string;
  location?: string;
  max_members: number;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  member_count?: number;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id?: string;
  participant_name: string;
  participant_email: string;
  participant_cc?: string;
  role: 'captain' | 'member';
  joined_at: string;
  is_active: boolean;
}

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const { toast } = useToast();

  // Buscar todas as equipas públicas
  const fetchTeams = async (filters?: {
    sport_category?: string;
    location?: string;
    search?: string;
  }) => {
    setLoading(true);
    try {
      let query = supabase
        .from('teams')
        .select(`
          *,
          team_members(count)
        `)
        .eq('is_public', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters?.sport_category && filters.sport_category !== 'all') {
        query = query.eq('sport_category', filters.sport_category);
      }

      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Processar dados com contagem de membros
      const teamsWithCount = data?.map(team => ({
        ...team,
        member_count: team.team_members?.[0]?.count || 0
      })) || [];

      setTeams(teamsWithCount);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar equipas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar equipas do utilizador
  const fetchMyTeams = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members(count)
        `)
        .eq('captain_user_id', user.data.user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const teamsWithCount = data?.map(team => ({
        ...team,
        member_count: team.team_members?.[0]?.count || 0
      })) || [];

      setMyTeams(teamsWithCount);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar as suas equipas",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Criar nova equipa
  const createTeam = async (teamData: Omit<Team, 'id' | 'captain_user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Utilizador não autenticado');

      const { data, error } = await supabase
        .from('teams')
        .insert({
          ...teamData,
          captain_user_id: user.data.user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Equipa criada com sucesso!",
        description: `A equipa ${teamData.name} foi criada.`
      });

      fetchTeams();
      fetchMyTeams();
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao criar equipa",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  // Juntar-se a uma equipa
  const joinTeam = async (teamId: string, participantData: {
    participant_name: string;
    participant_email: string;
    participant_cc?: string;
  }) => {
    try {
      const user = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: user.data.user?.id || null,
          ...participantData,
          role: 'member'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Juntou-se à equipa com sucesso!",
        description: "Agora faz parte da equipa."
      });

      fetchTeams();
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao juntar-se à equipa",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  // Buscar membros de uma equipa
  const fetchTeamMembers = async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .eq('is_active', true)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao carregar membros",
        description: error.message,
        variant: "destructive"
      });
      return [];
    }
  };

  // Search teams by name
  const searchTeams = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      fetchTeams();
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members(count)
        `)
        .eq('is_public', true)
        .eq('is_active', true)
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const teamsWithCount = data?.map(team => ({
        ...team,
        member_count: team.team_members?.[0]?.count || 0
      })) || [];

      setTeams(teamsWithCount);
    } catch (error: any) {
      toast({
        title: "Erro ao procurar equipas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    teams,
    myTeams,
    loading,
    fetchTeams,
    fetchMyTeams,
    createTeam,
    joinTeam,
    fetchTeamMembers,
    searchTeams
  };
};