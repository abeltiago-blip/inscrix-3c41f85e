import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Users } from "lucide-react";
import { genderCategories, getCategoryById } from "@/data/eventCategories";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AgeGroup {
  id: string;
  name: string;
  minAge: number | null;
  maxAge: number | null;
  genders: string[];
}

interface AgeGroupSelectorProps {
  selectedAgeGroups: AgeGroup[];
  onAgeGroupsChange: (ageGroups: AgeGroup[]) => void;
  category?: string;
  subcategory?: string;
}

export function AgeGroupSelector({ selectedAgeGroups, onAgeGroupsChange, category, subcategory }: AgeGroupSelectorProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [availableAgeGroups, setAvailableAgeGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [customGroup, setCustomGroup] = useState({
    name: "",
    minAge: "",
    maxAge: "",
    genders: [] as string[]
  });

  // Load age groups from database
  useEffect(() => {
    if (category) {
      loadAgeGroups();
    }
  }, [category, subcategory]); // Add subcategory to dependencies

  const loadAgeGroups = async () => {
    if (!category) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('age_groups')
        .select('*')
        .eq('category_id', category)
        .eq('is_active', true);

      // Filter by subcategory if provided
      if (subcategory) {
        query = query.eq('subcategory', subcategory);
      }

      const { data, error } = await query.order('sort_order');

      if (error) throw error;
      
      // Convert database format to component format
      const formattedGroups = (data || []).map(group => ({
        id: group.id,
        name: group.name,
        minAge: group.min_age,
        maxAge: group.max_age,
        description: group.description,
        subcategory: group.subcategory
      }));
      
      // If no groups found in database, fallback to hardcoded groups
      if (formattedGroups.length === 0) {
        const categoryData = getCategoryById(category);
        const fallbackGroups = categoryData?.ageGroups || [];
        console.log(`No age groups found in database for ${category}${subcategory ? ` - ${subcategory}` : ''}, using fallback:`, fallbackGroups.length, 'groups');
        setAvailableAgeGroups(fallbackGroups);
      } else {
        setAvailableAgeGroups(formattedGroups);
      }
    } catch (error) {
      console.error('Error loading age groups:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar escalões etários",
        variant: "destructive",
      });
      // Fallback to hardcoded age groups
      const categoryData = getCategoryById(category);
      setAvailableAgeGroups(categoryData?.ageGroups || []);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get gender display text
  const getGenderDisplayText = (genderName: string) => {
    switch (genderName) {
      case 'Masculino':
        return 'MASCULINO';
      case 'Feminino':
        return 'FEMININO';
      case 'Misto':
        return 'MISTO';
      default:
        return genderName.charAt(0);
    }
  };

  // Get age groups specific to the selected category
  const getAvailableAgeGroups = () => {
    return availableAgeGroups;
  };

  const displayAgeGroups = getAvailableAgeGroups();

  const handleStandardGroupToggle = (group: any, checked: boolean) => {
    if (checked) {
      const newGroup: AgeGroup = {
        id: `standard-${group.name}`,
        name: group.name,
        minAge: group.minAge,
        maxAge: group.maxAge,
        genders: ["Masculino", "Feminino"] // Default to both
      };
      onAgeGroupsChange([...selectedAgeGroups, newGroup]);
    } else {
      onAgeGroupsChange(selectedAgeGroups.filter(g => g.id !== `standard-${group.name}`));
    }
  };

  const addCustomGroup = () => {
    if (!customGroup.name) return;

    const newGroup: AgeGroup = {
      id: `custom-${Date.now()}`,
      name: customGroup.name,
      minAge: customGroup.minAge ? parseInt(customGroup.minAge) : null,
      maxAge: customGroup.maxAge ? parseInt(customGroup.maxAge) : null,
      genders: customGroup.genders.length > 0 ? customGroup.genders : ["Masculino", "Feminino"]
    };

    onAgeGroupsChange([...selectedAgeGroups, newGroup]);
    setCustomGroup({ name: "", minAge: "", maxAge: "", genders: [] });
    setShowCustom(false);
  };

  const removeGroup = (id: string) => {
    onAgeGroupsChange(selectedAgeGroups.filter(g => g.id !== id));
  };

  const updateGroupGenders = (groupId: string, genders: string[]) => {
    onAgeGroupsChange(
      selectedAgeGroups.map(g => 
        g.id === groupId ? { ...g, genders } : g
      )
    );
  };

  const isStandardGroupSelected = (groupName: string) => {
    return selectedAgeGroups.some(g => g.id === `standard-${groupName}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Escalões Etários
        </CardTitle>
        <CardDescription>
          {category ? (
            <>
              Escalões para {category}
              {subcategory && ` - ${subcategory}`}
              <br />
              <span className="text-xs">
                {availableAgeGroups.length > 0 
                  ? `${availableAgeGroups.length} escalões disponíveis na base de dados`  
                  : 'A usar escalões predefinidos (não existem na base de dados)'
                }
              </span>
            </>
          ) : (
            'Selecione uma categoria primeiro para ver os escalões sugeridos'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">
            {category ? `Escalões Sugeridos para ${category}` : 'Escalões Pré-definidos'}
          </h4>
          {!category ? (
            <p className="text-sm text-muted-foreground mb-4">
              Selecione uma categoria no separador "Detalhes" para ver os escalões específicos.
            </p>
          ) : loading ? (
            <p className="text-sm text-muted-foreground mb-4">
              Carregando escalões...
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {displayAgeGroups.map((group) => (
                <div key={group.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={`age-group-${group.name}`}
                    checked={isStandardGroupSelected(group.name)}
                    onCheckedChange={(checked) => handleStandardGroupToggle(group, checked as boolean)}
                  />
                  <Label htmlFor={`age-group-${group.name}`} className="text-sm">
                    {group.name} ({group.minAge || "0"}-{group.maxAge || "∞"} anos)
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Escalões Personalizados</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustom(!showCustom)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>

          {showCustom && (
            <div className="border rounded-lg p-4 space-y-4 mb-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Nome do Escalão</Label>
                  <Input
                    value={customGroup.name}
                    onChange={(e) => setCustomGroup({ ...customGroup, name: e.target.value })}
                    placeholder="Ex: Veteranos"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Idade Mínima</Label>
                  <Input
                    type="number"
                    value={customGroup.minAge}
                    onChange={(e) => setCustomGroup({ ...customGroup, minAge: e.target.value })}
                    placeholder="Ex: 40"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Idade Máxima</Label>
                  <Input
                    type="number"
                    value={customGroup.maxAge}
                    onChange={(e) => setCustomGroup({ ...customGroup, maxAge: e.target.value })}
                    placeholder="Ex: 65"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Géneros Permitidos</Label>
                <div className="flex gap-4">
                  {genderCategories.map((gender) => (
                    <div key={gender.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`custom-gender-${gender.name}`}
                        checked={customGroup.genders.includes(gender.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCustomGroup({
                              ...customGroup,
                              genders: [...customGroup.genders, gender.name]
                            });
                          } else {
                            setCustomGroup({
                              ...customGroup,
                              genders: customGroup.genders.filter(g => g !== gender.name)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={`custom-gender-${gender.name}`} className="text-sm">
                        {gender.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={addCustomGroup} size="sm">
                  Adicionar Escalão
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowCustom(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>

        {selectedAgeGroups.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Escalões Selecionados</h4>
            <div className="space-y-2">
              {selectedAgeGroups.map((group) => (
                <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{group.name}</div>
                     <div className="text-sm text-muted-foreground">
                       {group.minAge || "0"}-{group.maxAge || "∞"} anos • {group.genders.map(g => getGenderDisplayText(g)).join(", ")}
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-2">
                      {genderCategories.map((gender) => (
                        <div key={gender.name} className="flex items-center space-x-1">
                          <Checkbox
                            checked={group.genders.includes(gender.name)}
                            onCheckedChange={(checked) => {
                              const newGenders = checked
                                ? [...group.genders, gender.name]
                                : group.genders.filter(g => g !== gender.name);
                              updateGroupGenders(group.id, newGenders);
                            }}
                          />
                          <Label className="text-xs">{getGenderDisplayText(gender.name)}</Label>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGroup(group.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}