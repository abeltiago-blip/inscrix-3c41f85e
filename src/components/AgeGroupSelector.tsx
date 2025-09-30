import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sportCategories, culturalCategories } from "@/data/eventCategories";

interface AgeGroupSelectorProps {
  eventType: 'sports' | 'cultural';
  eventCategory: string;
  value: {
    age_group?: string;
    min_age?: number;
    max_age?: number;
  };
  onChange: (value: {
    age_group?: string;
    min_age?: number;
    max_age?: number;
  }) => void;
}

type AgeSelectionMode = 'predefined' | 'manual' | 'custom';

export default function AgeGroupSelector({ eventType, eventCategory, value, onChange }: AgeGroupSelectorProps) {
  const [mode, setMode] = useState<AgeSelectionMode>('predefined');
  const isInitialLoad = useRef(true);

  // Determine available age groups based on event type and category
  const getAvailableAgeGroups = () => {
    const categories = eventType === 'sports' ? sportCategories : culturalCategories;
    const category = categories.find(cat => cat.name === eventCategory);
    return category?.ageGroups || [];
  };

  const availableAgeGroups = getAvailableAgeGroups();

  // Auto-detect current mode only on initial load
  useEffect(() => {
    if (isInitialLoad.current) {
      if (value.min_age !== undefined && value.max_age !== undefined) {
        setMode('manual');
      } else if (value.age_group && availableAgeGroups.some(ag => ag.name === value.age_group)) {
        setMode('predefined');
      } else if (value.age_group) {
        setMode('custom');
      } else {
        setMode('predefined');
      }
      isInitialLoad.current = false;
    }
  }, [value, availableAgeGroups]);

  const handleModeChange = (newMode: AgeSelectionMode) => {
    setMode(newMode);
    
    // Clear current values when switching modes
    if (newMode === 'predefined') {
      onChange({ age_group: undefined, min_age: undefined, max_age: undefined });
    } else if (newMode === 'manual') {
      onChange({ age_group: undefined, min_age: undefined, max_age: undefined });
    } else if (newMode === 'custom') {
      onChange({ age_group: '', min_age: undefined, max_age: undefined });
    }
  };

  const handlePredefinedChange = (selectedAgeGroupId: string) => {
    const selectedAgeGroup = availableAgeGroups.find(ag => ag.id === selectedAgeGroupId);
    if (selectedAgeGroup) {
      onChange({
        age_group: selectedAgeGroup.name,
        min_age: selectedAgeGroup.minAge,
        max_age: selectedAgeGroup.maxAge
      });
    }
  };

  const handleManualChange = (field: 'min_age' | 'max_age', newValue: number | undefined) => {
    onChange({
      ...value,
      age_group: undefined,
      [field]: newValue
    });
  };

  const handleCustomChange = (customValue: string) => {
    onChange({
      age_group: customValue,
      min_age: undefined,
      max_age: undefined
    });
  };

  const getAgePreview = () => {
    if (mode === 'manual' && value.min_age !== undefined && value.max_age !== undefined) {
      return `${value.min_age}-${value.max_age} anos`;
    } else if (mode === 'predefined' && value.age_group) {
      const ageGroup = availableAgeGroups.find(ag => ag.name === value.age_group);
      if (ageGroup) {
        return `${ageGroup.minAge}-${ageGroup.maxAge} anos`;
      }
    } else if (mode === 'custom' && value.age_group) {
      return value.age_group;
    }
    return null;
  };

  const isValidManualAge = () => {
    if (value.min_age !== undefined && value.max_age !== undefined) {
      return value.min_age <= value.max_age;
    }
    return true;
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Configuração de Idade</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            type="button"
            variant={mode === 'predefined' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeChange('predefined')}
            disabled={availableAgeGroups.length === 0}
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Escalões Pré-definidos</span>
            <span className="sm:hidden">Escalões</span>
          </Button>
          <Button
            type="button"
            variant={mode === 'manual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeChange('manual')}
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Idade Manual</span>
            <span className="sm:hidden">Manual</span>
          </Button>
          <Button
            type="button"
            variant={mode === 'custom' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeChange('custom')}
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Escalão Personalizado</span>
            <span className="sm:hidden">Personalizado</span>
          </Button>
        </div>
      </div>

      {mode === 'predefined' && (
        <div className="space-y-2">
          <Label>Escalão Etário</Label>
          {availableAgeGroups.length > 0 ? (
            <Select
              value={availableAgeGroups.find(ag => ag.name === value.age_group)?.id || ''}
              onValueChange={handlePredefinedChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um escalão" />
              </SelectTrigger>
              <SelectContent>
                {availableAgeGroups.map((ageGroup) => (
                  <SelectItem key={ageGroup.id} value={ageGroup.id}>
                    {ageGroup.name} ({ageGroup.minAge}-{ageGroup.maxAge} anos)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
              Nenhum escalão pré-definido disponível para esta categoria.
              Use "Idade Manual" ou "Escalão Personalizado".
            </div>
          )}
        </div>
      )}

      {mode === 'manual' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Idade Mínima</Label>
            <Input
              type="number"
              min="0"
              max="120"
              value={value.min_age || ''}
              onChange={(e) => {
                const val = e.target.value;
                const numVal = val === '' ? undefined : parseInt(val, 10);
                handleManualChange('min_age', numVal);
              }}
              placeholder="Ex: 18"
            />
          </div>
          <div className="space-y-2">
            <Label>Idade Máxima</Label>
            <Input
              type="number"
              min="0"
              max="120"
              value={value.max_age || ''}
              onChange={(e) => {
                const val = e.target.value;
                const numVal = val === '' ? undefined : parseInt(val, 10);
                handleManualChange('max_age', numVal);
              }}
              placeholder="Ex: 65"
            />
          </div>
          {!isValidManualAge() && (
            <div className="col-span-2 text-sm text-red-600">
              A idade mínima deve ser menor ou igual à idade máxima.
            </div>
          )}
        </div>
      )}

      {mode === 'custom' && (
        <div className="space-y-2">
          <Label>Escalão Personalizado</Label>
          <Input
            value={value.age_group || ''}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="Ex: Veteranos, Absolutos, etc."
          />
        </div>
      )}

      {getAgePreview() && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Preview:</span>
          <Badge variant="secondary">{getAgePreview()}</Badge>
        </div>
      )}
    </div>
  );
}