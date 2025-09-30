import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Loader2 } from 'lucide-react';
import { useTeams } from '@/hooks/useTeams';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

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

export const CreateTeamModal = ({ isOpen, onClose, onSuccess }: CreateTeamModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sport_category: '',
    location: '',
    is_public: true
  });
  
  const [loading, setLoading] = useState(false);
  const { createTeam } = useTeams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setLoading(true);

    const result = await createTeam({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      sport_category: formData.sport_category || undefined,
      location: formData.location.trim() || undefined,
      max_members: 20, // Valor padrão
      is_public: formData.is_public,
      is_active: true
    });

    if (result) {
      setFormData({
        name: '',
        description: '',
        sport_category: '',
        location: '',
        is_public: true
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Criar Nova Equipa
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Equipa *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Dragões FC"
              required
              disabled={loading}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              {formData.name.length}/50 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sport_category">Modalidade</Label>
            <Select 
              value={formData.sport_category} 
              onValueChange={(value) => setFormData({ ...formData, sport_category: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma modalidade" />
              </SelectTrigger>
              <SelectContent>
                {sportCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: Lisboa, Porto, Coimbra..."
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva a sua equipa, objetivos, modalidades praticadas..."
              rows={3}
              disabled={loading}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/500 caracteres
            </p>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="is_public" className="text-sm font-medium">
                Equipa Pública
              </Label>
              <p className="text-xs text-muted-foreground">
                Permitir que outros utilizadores vejam e se juntem à equipa
              </p>
            </div>
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
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
              disabled={loading || !formData.name.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  A criar...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Equipa
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};