import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, MapPin, Trophy, UserPlus, Loader2 } from 'lucide-react';
import { Team, useTeams } from '@/hooks/useTeams';

interface JoinTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  onSuccess: () => void;
}

export const JoinTeamModal = ({ isOpen, onClose, team, onSuccess }: JoinTeamModalProps) => {
  const [formData, setFormData] = useState({
    participant_name: '',
    participant_email: '',
    participant_cc: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const { joinTeam } = useTeams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.participant_name || !formData.participant_email) {
      return;
    }

    setLoading(true);

    const result = await joinTeam(team.id, {
      participant_name: formData.participant_name,
      participant_email: formData.participant_email,
      participant_cc: formData.participant_cc
    });

    if (result) {
      setFormData({
        participant_name: '',
        participant_email: '',
        participant_cc: '',
        message: ''
      });
      onSuccess();
    }

    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Juntar-se à Equipa
          </DialogTitle>
        </DialogHeader>

        {/* Info da equipa */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={team.logo_url} alt={team.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {team.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{team.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{team.member_count || 0}/{team.max_members} membros</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {team.sport_category && (
              <Badge variant="secondary" className="text-xs">
                <Trophy className="h-3 w-3 mr-1" />
                {team.sport_category}
              </Badge>
            )}
            {team.location && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {team.location}
              </Badge>
            )}
          </div>

          {team.description && (
            <p className="text-sm text-muted-foreground">{team.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="participant_name">Nome Completo *</Label>
            <Input
              id="participant_name"
              value={formData.participant_name}
              onChange={(e) => setFormData({ ...formData, participant_name: e.target.value })}
              placeholder="O seu nome completo"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="participant_email">Email *</Label>
            <Input
              id="participant_email"
              type="email"
              value={formData.participant_email}
              onChange={(e) => setFormData({ ...formData, participant_email: e.target.value })}
              placeholder="seu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="participant_cc">Cartão de Cidadão (opcional)</Label>
            <Input
              id="participant_cc"
              value={formData.participant_cc}
              onChange={(e) => setFormData({ ...formData, participant_cc: e.target.value })}
              placeholder="12345678"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem (opcional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Conte um pouco sobre si ou porque quer juntar-se a esta equipa..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.participant_name || !formData.participant_email}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  A processar...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Juntar-me
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};