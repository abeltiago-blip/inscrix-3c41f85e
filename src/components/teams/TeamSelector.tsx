import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeams } from "@/hooks/useTeams";
import { CreateTeamModal } from "./CreateTeamModal";

interface TeamSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  onTeamNameChange: (teamName: string) => void;
  placeholder?: string;
}

export function TeamSelector({ value, onValueChange, onTeamNameChange, placeholder = "Procurar equipa..." }: TeamSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { teams, loading, fetchTeams, searchTeams } = useTeams();

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      searchTeams(searchQuery);
    } else {
      fetchTeams();
    }
  }, [searchQuery]);

  const selectedTeam = teams.find(team => team.id === value);

  const handleSelect = (teamId: string, teamName: string) => {
    onValueChange(teamId);
    onTeamNameChange(teamName);
    setOpen(false);
  };

  const handleCreateTeam = () => {
    setShowCreateModal(true);
    setOpen(false);
  };

  return (
    <>
      <div className="space-y-2">
        <Label>Equipa (opcional)</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedTeam?.name || placeholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Procurar equipa..." 
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">Nenhuma equipa encontrada</p>
                    <Button
                      size="sm"
                      onClick={handleCreateTeam}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Criar nova equipa
                    </Button>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {teams.map((team) => (
                    <CommandItem
                      key={team.id}
                      onSelect={() => handleSelect(team.id, team.name)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === team.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{team.name}</div>
                        {team.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {team.description}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {team.member_count || 0} membros • {team.location}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {teams.length > 0 && (
                  <CommandGroup>
                    <CommandItem onSelect={handleCreateTeam}>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar nova equipa
                    </CommandItem>
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchTeams();
          setShowCreateModal(false);
        }}
      />
    </>
  );
}