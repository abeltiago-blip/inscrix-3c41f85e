import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, RefreshCw, Users, Plus, Upload } from 'lucide-react';
import { TeamCard } from './TeamCard';
import { CreateTeamModal } from './CreateTeamModal';
import { FeedImporter } from './FeedImporter';
import { useTeams } from '@/hooks/useTeams';
import { useAuth } from '@/contexts/AuthContext';

const sportCategories = [
  'Futebol',
  'Basquetebol',
  'Voleibol',
  'Andebol',
  'Ciclismo',
  'Atletismo',
  'Natação',
  'Ténis',
  'Padel',
  'Rugby',
  'Outros'
];

export const TeamsList = () => {
  const { teams, loading, fetchTeams } = useTeams();
  const { profile } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFeedImporter, setShowFeedImporter] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    sport_category: '',
    location: ''
  });

  // Verificar se o utilizador tem permissões para importar feeds
  const canImportFeeds = profile?.role === 'admin' || profile?.role === 'organizer' || profile?.role === 'team';

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchTeams(newFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleRefresh = () => {
    fetchTeams(filters);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchTeams(filters);
  };

  const handleFeedImportSuccess = () => {
    setShowFeedImporter(false);
    fetchTeams(filters);
  };

  const handleTeamJoin = () => {
    fetchTeams(filters);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Equipas</h1>
            <p className="text-muted-foreground">
              Descubra equipas ou crie a sua própria
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {canImportFeeds && (
              <Button 
                variant="outline" 
                onClick={() => setShowFeedImporter(true)} 
                className="flex-1 sm:flex-none"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar Feed
              </Button>
            )}
            <Button onClick={() => setShowCreateModal(true)} className="flex-1 sm:flex-none">
              <Plus className="h-4 w-4 mr-2" />
              Criar Equipa
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar equipas..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={filters.sport_category}
                onValueChange={(value) => handleFilterChange('sport_category', value)}
              >
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Modalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as modalidades</SelectItem>
                  {sportCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Localização"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full lg:w-48"
              />

              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
                className="w-full lg:w-auto"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-muted rounded-full" />
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-32" />
                          <div className="h-3 bg-muted rounded w-24" />
                        </div>
                      </div>
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-8 bg-muted rounded w-full mt-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : teams.length > 0 ? (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{teams.length} equipas encontradas</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    onJoin={handleTeamJoin}
                  />
                ))}
              </div>
            </>
          ) : (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Nenhuma equipa encontrada</h3>
                  <p className="text-muted-foreground">
                    Tente ajustar os filtros ou crie a sua própria equipa
                  </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Nova Equipa
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <FeedImporter
        isOpen={showFeedImporter}
        onClose={() => setShowFeedImporter(false)}
        onSuccess={handleFeedImportSuccess}
      />
    </>
  );
};