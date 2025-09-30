import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, MapPin, Calendar, Trophy, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Team } from '@/hooks/useTeams';
import { JoinTeamModal } from './JoinTeamModal';

interface TeamCardProps {
  team: Team;
  onJoin?: (teamId: string) => void;
  showJoinButton?: boolean;
}

export const TeamCard = ({ team, onJoin, showJoinButton = true }: TeamCardProps) => {
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleJoinSuccess = () => {
    setShowJoinModal(false);
    onJoin?.(team.id);
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={team.logo_url} alt={team.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {team.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {team.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Criada {formatDistanceToNow(new Date(team.created_at), { 
                    addSuffix: true, 
                    locale: pt 
                  })}
                </p>
              </div>
            </div>
            
            {team.sport_category && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                {team.sport_category}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {team.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {team.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{team.member_count || 0}/{team.max_members} membros</span>
              </div>
              
              {team.location && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{team.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar de membros */}
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ 
                width: `${Math.min(((team.member_count || 0) / team.max_members) * 100, 100)}%` 
              }}
            />
          </div>

          {showJoinButton && (
            <div className="pt-2">
              <Button 
                className="w-full" 
                size="sm"
                onClick={() => setShowJoinModal(true)}
                disabled={(team.member_count || 0) >= team.max_members}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {(team.member_count || 0) >= team.max_members ? 'Equipa Cheia' : 'Juntar-me'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <JoinTeamModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        team={team}
        onSuccess={handleJoinSuccess}
      />
    </>
  );
};