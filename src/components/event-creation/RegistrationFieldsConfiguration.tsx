import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, FileText, User, Phone, Mail, Calendar, MapPin, Heart, Shield } from "lucide-react";

interface RegistrationField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'select' | 'textarea' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: string[];
  category: 'personal' | 'event' | 'medical' | 'emergency';
}

interface RegistrationFieldsConfigurationProps {
  eventType: 'sports' | 'cultural';
  fields: RegistrationField[];
  onFieldsChange: (fields: RegistrationField[]) => void;
}

const defaultSportsFields: RegistrationField[] = [
  { id: 'cc', name: 'cc', label: 'Cartão de Cidadão', type: 'text', required: true, category: 'personal' },
  { id: 'name', name: 'name', label: 'Nome Completo', type: 'text', required: true, category: 'personal' },
  { id: 'email', name: 'email', label: 'Email', type: 'email', required: true, category: 'personal' },
  { id: 'phone', name: 'phone', label: 'Telefone', type: 'phone', required: true, category: 'personal' },
  { id: 'birth_date', name: 'birth_date', label: 'Data de Nascimento', type: 'date', required: true, category: 'personal' },
  { id: 'gender', name: 'gender', label: 'Género', type: 'select', required: true, options: ['Masculino', 'Feminino'], category: 'personal' },
  { id: 'address', name: 'address', label: 'Morada', type: 'text', required: false, category: 'personal' },
  { id: 'tshirt_size', name: 'tshirt_size', label: 'Tamanho T-shirt', type: 'select', required: true, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], category: 'event' },
  { id: 'category', name: 'category', label: 'Escalão', type: 'select', required: true, category: 'event' },
  { id: 'team_name', name: 'team_name', label: 'Nome da Equipa', type: 'text', required: false, category: 'event' },
  { id: 'emergency_contact', name: 'emergency_contact', label: 'Contacto de Emergência', type: 'text', required: true, category: 'emergency' },
  { id: 'emergency_phone', name: 'emergency_phone', label: 'Telefone de Emergência', type: 'phone', required: true, category: 'emergency' },
  { id: 'medical_conditions', name: 'medical_conditions', label: 'Condições Médicas', type: 'textarea', required: false, category: 'medical' },
  { id: 'medical_certificate', name: 'medical_certificate', label: 'Atestado Médico', type: 'checkbox', required: false, category: 'medical' },
];

const defaultCulturalFields: RegistrationField[] = [
  { id: 'cc', name: 'cc', label: 'Cartão de Cidadão', type: 'text', required: true, category: 'personal' },
  { id: 'name', name: 'name', label: 'Nome Completo', type: 'text', required: true, category: 'personal' },
  { id: 'email', name: 'email', label: 'Email', type: 'email', required: true, category: 'personal' },
  { id: 'phone', name: 'phone', label: 'Telefone', type: 'phone', required: false, category: 'personal' },
  { id: 'birth_date', name: 'birth_date', label: 'Data de Nascimento', type: 'date', required: false, category: 'personal' },
  { id: 'category', name: 'category', label: 'Categoria', type: 'select', required: false, category: 'event' },
  { id: 'special_needs', name: 'special_needs', label: 'Necessidades Especiais', type: 'textarea', required: false, category: 'event' },
];

const fieldIcons = {
  personal: User,
  event: FileText,
  medical: Heart,
  emergency: Shield,
};

const fieldTypeLabels = {
  text: 'Texto',
  email: 'Email',
  phone: 'Telefone',
  date: 'Data',
  select: 'Lista',
  textarea: 'Texto Longo',
  checkbox: 'Checkbox'
};

export function RegistrationFieldsConfiguration({ eventType, fields, onFieldsChange }: RegistrationFieldsConfigurationProps) {
  const [showNewField, setShowNewField] = useState(false);
  const [newField, setNewField] = useState<Partial<RegistrationField>>({
    name: '',
    label: '',
    type: 'text',
    required: false,
    category: 'personal',
    options: []
  });

  // Initialize with default fields if empty
  if (fields.length === 0) {
    const defaultFields = eventType === 'sports' ? defaultSportsFields : defaultCulturalFields;
    onFieldsChange(defaultFields);
  }

  const addCustomField = () => {
    if (!newField.name || !newField.label) return;

    const field: RegistrationField = {
      id: `custom-${Date.now()}`,
      name: newField.name,
      label: newField.label,
      type: newField.type || 'text',
      required: newField.required || false,
      category: newField.category || 'personal',
      placeholder: newField.placeholder,
      options: newField.type === 'select' ? newField.options : undefined
    };

    onFieldsChange([...fields, field]);
    setNewField({ name: '', label: '', type: 'text', required: false, category: 'personal', options: [] });
    setShowNewField(false);
  };

  const removeField = (id: string) => {
    onFieldsChange(fields.filter(field => field.id !== id));
  };

  const updateField = (id: string, updates: Partial<RegistrationField>) => {
    onFieldsChange(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const resetToDefaults = () => {
    const defaultFields = eventType === 'sports' ? defaultSportsFields : defaultCulturalFields;
    onFieldsChange(defaultFields);
  };

  const groupedFields = fields.reduce((groups, field) => {
    if (!groups[field.category]) {
      groups[field.category] = [];
    }
    groups[field.category].push(field);
    return groups;
  }, {} as Record<string, RegistrationField[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Campos de Inscrição
              </CardTitle>
              <CardDescription>
                Configure os campos que os participantes devem preencher na inscrição.
                Eventos de desporto têm campos adicionais como atestado médico e contactos de emergência.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetToDefaults}>
                Restaurar Padrão
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewField(!showNewField)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Campo Personalizado
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* New Field Form */}
          {showNewField && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h4 className="font-medium">Novo Campo Personalizado</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome do Campo</Label>
                  <Input
                    value={newField.name || ''}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    placeholder="Ex: experiencia_anterior"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Etiqueta</Label>
                  <Input
                    value={newField.label || ''}
                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                    placeholder="Ex: Experiência Anterior"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select 
                    value={newField.type} 
                    onValueChange={(value) => setNewField({ ...newField, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(fieldTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select 
                    value={newField.category} 
                    onValueChange={(value) => setNewField({ ...newField, category: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Pessoal</SelectItem>
                      <SelectItem value="event">Evento</SelectItem>
                      <SelectItem value="medical">Médico</SelectItem>
                      <SelectItem value="emergency">Emergência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newField.type === 'select' && (
                <div className="space-y-2">
                  <Label>Opções (uma por linha)</Label>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                    onChange={(e) => setNewField({ 
                      ...newField, 
                      options: e.target.value.split('\n').filter(o => o.trim()) 
                    })}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="required"
                  checked={newField.required}
                  onCheckedChange={(checked) => setNewField({ ...newField, required: !!checked })}
                />
                <Label htmlFor="required">Campo obrigatório</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={addCustomField} size="sm">Adicionar Campo</Button>
                <Button variant="outline" size="sm" onClick={() => setShowNewField(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Fields by Category */}
          {Object.entries(groupedFields).map(([category, categoryFields]) => {
            const Icon = fieldIcons[category as keyof typeof fieldIcons];
            const categoryLabels = {
              personal: 'Informações Pessoais',
              event: 'Informações do Evento',
              medical: 'Informações Médicas',
              emergency: 'Contactos de Emergência'
            };

            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <h4 className="font-medium">{categoryLabels[category as keyof typeof categoryLabels]}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {categoryFields.length} campos
                  </Badge>
                </div>
                
                <div className="grid gap-3">
                  {categoryFields.map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{field.label}</span>
                          {field.required && <Badge variant="destructive" className="text-xs">Obrigatório</Badge>}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {fieldTypeLabels[field.type]}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={field.required}
                          onCheckedChange={(checked) => updateField(field.id, { required: !!checked })}
                        />
                        <Label className="text-xs">Obrigatório</Label>
                        {!['cc', 'name', 'email'].includes(field.id) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeField(field.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}