import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Euro, MapPin, Utensils, Package, Shield, Clock, Shirt, Gift, UtensilsCrossed, ShieldCheck } from "lucide-react";

interface TicketExtra {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ComponentType<{ className?: string }>;
  editable: boolean;
}

interface SeatingZone {
  id: string;
  name: string;
  capacity: number;
  price: number;
  description: string;
}

interface TicketType {
  id?: string;
  name: string;
  description: string;
  price: string;
  max_quantity: string;
  early_bird_price: string;
  early_bird_end_date: string;
  includes_tshirt: boolean;
  includes_kit: boolean;
  includes_meal: boolean;
  includes_insurance: boolean;
  age_group?: string;
  min_age?: string;
  max_age?: string;
  gender_restriction: string;
  custom_extras: string[];
  seating_zones: string[];
  has_seating: boolean;
}

interface TicketConfigurationProps {
  ticketTypes: TicketType[];
  onTicketTypesChange: (ticketTypes: TicketType[]) => void;
}

const defaultExtras: TicketExtra[] = [
  { id: "tshirt", name: "T-shirt Oficial", description: "T-shirt comemorativa do evento", price: 15, icon: Shirt, editable: true },
  { id: "kit", name: "Kit Participante", description: "Kit com brindes do evento", price: 25, icon: Gift, editable: true },
  { id: "meal", name: "Refeição", description: "Almoço ou jantar incluído", price: 20, icon: UtensilsCrossed, editable: true },
  { id: "insurance", name: "Seguro", description: "Seguro de participação", price: 5, icon: ShieldCheck, editable: true },
];

export function TicketConfiguration({ ticketTypes, onTicketTypesChange }: TicketConfigurationProps) {
  const [customExtras, setCustomExtras] = useState<TicketExtra[]>([]);
  const [seatingZones, setSeatingZones] = useState<SeatingZone[]>([]);
  const [showNewExtra, setShowNewExtra] = useState(false);
  const [showNewZone, setShowNewZone] = useState(false);
  const [newExtra, setNewExtra] = useState({ name: "", description: "", price: "" });
  const [newZone, setNewZone] = useState({ name: "", capacity: "", price: "", description: "" });
  const [extrasConfig, setExtrasConfig] = useState<Record<string, number>>(
    defaultExtras.reduce((acc, extra) => ({ ...acc, [extra.id]: extra.price }), {})
  );

  const addTicketType = () => {
    const newTicket: TicketType = {
      name: "",
      description: "",
      price: "0",
      max_quantity: "",
      early_bird_price: "",
      early_bird_end_date: "",
      includes_tshirt: false,
      includes_kit: false,
      includes_meal: false,
      includes_insurance: false,
      age_group: "",
      min_age: "",
      max_age: "",
      gender_restriction: "",
      custom_extras: [],
      seating_zones: [],
      has_seating: false
    };
    onTicketTypesChange([...ticketTypes, newTicket]);
  };

  const removeTicketType = (index: number) => {
    if (ticketTypes.length > 1) {
      onTicketTypesChange(ticketTypes.filter((_, i) => i !== index));
    }
  };

  const updateTicketType = (index: number, field: keyof TicketType, value: any) => {
    const updated = ticketTypes.map((ticket, i) => 
      i === index ? { ...ticket, [field]: value } : ticket
    );
    onTicketTypesChange(updated);
  };

  const addCustomExtra = () => {
    if (!newExtra.name || !newExtra.price) return;
    
    const extra: TicketExtra = {
      id: `custom-${Date.now()}`,
      name: newExtra.name,
      description: newExtra.description,
      price: parseFloat(newExtra.price),
      icon: Package,
      editable: true
    };
    
    setCustomExtras([...customExtras, extra]);
    setNewExtra({ name: "", description: "", price: "" });
    setShowNewExtra(false);
  };

  const addSeatingZone = () => {
    if (!newZone.name || !newZone.capacity || !newZone.price) return;
    
    const zone: SeatingZone = {
      id: `zone-${Date.now()}`,
      name: newZone.name,
      capacity: parseInt(newZone.capacity),
      price: parseFloat(newZone.price),
      description: newZone.description
    };
    
    setSeatingZones([...seatingZones, zone]);
    setNewZone({ name: "", capacity: "", price: "", description: "" });
    setShowNewZone(false);
  };

  const allExtras = [...defaultExtras.filter(extra => !customExtras.some(ce => ce.id === `removed-${extra.id}`)), ...customExtras.filter(extra => !extra.id.startsWith('removed-'))];

  return (
    <div className="space-y-6">
      {/* Custom Extras Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Extras Personalizados
          </CardTitle>
          <CardDescription>
            Crie extras adicionais além dos pré-definidos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {defaultExtras.filter(extra => !customExtras.some(ce => ce.id === `removed-${extra.id}`)).map((extra) => (
                  <div key={extra.id} className="p-3 border rounded-lg text-center relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => setCustomExtras([...customExtras, { 
                        id: `removed-${extra.id}`, 
                        name: extra.name, 
                        description: extra.description, 
                        price: extra.price, 
                        icon: X, 
                        editable: false 
                      }])}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="flex justify-center mb-2">
                      <extra.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-sm font-medium">{extra.name}</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="text-xs">€</span>
                      <input
                        type="number"
                        value={extrasConfig[extra.id] || extra.price}
                        onChange={(e) => setExtrasConfig(prev => ({ 
                          ...prev, 
                          [extra.id]: parseFloat(e.target.value) || 0 
                        }))}
                        className="w-12 text-xs text-center border-0 bg-transparent font-medium"
                        min="0"
                        step="0.5"
                      />
                    </div>
                  </div>
                ))}
                
                {/* Mostrar extras removidos em cinza claro */}
                {customExtras.filter(ce => ce.id.startsWith('removed-')).map((extra) => (
                  <div key={extra.id} className="p-3 border rounded-lg text-center relative bg-muted/30 opacity-50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => setCustomExtras(customExtras.filter(e => e.id !== extra.id))}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <div className="flex justify-center mb-2">
                      <X className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">{extra.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">Cancelado</div>
                  </div>
                ))}
            </div>
            
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewExtra(!showNewExtra)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Extra
              </Button>
            </div>
          </div>

          {showNewExtra && (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Nome do Extra</Label>
                  <Input
                    value={newExtra.name}
                    onChange={(e) => setNewExtra({ ...newExtra, name: e.target.value })}
                    placeholder="Ex: Medalha Personalizada"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço (€)</Label>
                  <Input
                    type="number"
                    value={newExtra.price}
                    onChange={(e) => setNewExtra({ ...newExtra, price: e.target.value })}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={newExtra.description}
                    onChange={(e) => setNewExtra({ ...newExtra, description: e.target.value })}
                    placeholder="Medalha comemorativa"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addCustomExtra} size="sm">Adicionar Extra</Button>
                <Button variant="outline" size="sm" onClick={() => setShowNewExtra(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          {customExtras.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {customExtras.map((extra, extraIndex) => (
                <div key={extra.id} className="p-3 border rounded-lg text-center relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => setCustomExtras(customExtras.filter(e => e.id !== extra.id))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="flex justify-center mb-2">
                    <extra.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-sm font-medium">{extra.name}</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="text-xs">€</span>
                    <input
                      type="number"
                      value={extra.price}
                      onChange={(e) => {
                        const updatedExtras = customExtras.map((ex, idx) => 
                          idx === extraIndex ? { ...ex, price: parseFloat(e.target.value) || 0 } : ex
                        );
                        setCustomExtras(updatedExtras);
                      }}
                      className="w-12 text-xs text-center border-0 bg-transparent font-medium"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seating Zones Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Zonas e Lugares Sentados
          </CardTitle>
          <CardDescription>
            Configure zonas com lugares marcados para o seu evento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Útil para eventos com lugares marcados, bancadas, etc.
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewZone(!showNewZone)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Zona
            </Button>
          </div>

          {showNewZone && (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome da Zona</Label>
                  <Input
                    value={newZone.name}
                    onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                    placeholder="Ex: Bancada VIP"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Capacidade</Label>
                  <Input
                    type="number"
                    value={newZone.capacity}
                    onChange={(e) => setNewZone({ ...newZone, capacity: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço Base (€)</Label>
                  <Input
                    type="number"
                    value={newZone.price}
                    onChange={(e) => setNewZone({ ...newZone, price: e.target.value })}
                    placeholder="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={newZone.description}
                    onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                    placeholder="Vista privilegiada"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addSeatingZone} size="sm">Adicionar Zona</Button>
                <Button variant="outline" size="sm" onClick={() => setShowNewZone(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          {seatingZones.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {seatingZones.map((zone) => (
                <div key={zone.id} className="p-4 border rounded-lg relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={() => setSeatingZones(seatingZones.filter(z => z.id !== zone.id))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="font-medium">{zone.name}</div>
                  <div className="text-sm text-muted-foreground mb-2">{zone.description}</div>
                  <div className="flex justify-between text-sm">
                    <span>{zone.capacity} lugares</span>
                    <span className="font-medium">€{zone.price}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Types Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Configuração de Bilhetes
          </CardTitle>
          <CardDescription>
            Configure os diferentes tipos de bilhetes disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {ticketTypes.map((ticket, index) => (
            <div key={index} className="border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Bilhete {index + 1}</h3>
                {ticketTypes.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTicketType(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome do Bilhete *</Label>
                  <Input
                    value={ticket.name}
                    onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                    placeholder="Ex: Entrada Geral"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço (€) *</Label>
                  <Input
                    type="number"
                    value={ticket.price}
                    onChange={(e) => updateTicketType(index, 'price', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={ticket.description}
                  onChange={(e) => updateTicketType(index, 'description', e.target.value)}
                  placeholder="Descrição do bilhete..."
                  rows={2}
                />
              </div>

              {/* Age Restrictions */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Restrições de Idade</Label>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Escalão Etário</Label>
                    <Select
                      value={ticket.age_group || "none"}
                      onValueChange={(value) => updateTicketType(index, 'age_group', value === "none" ? "" : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar escalão" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Manual</SelectItem>
                        <SelectItem value="juvenil">Juvenil (16-18 anos)</SelectItem>
                        <SelectItem value="junior">Júnior (18-23 anos)</SelectItem>
                        <SelectItem value="senior">Sénior (23-40 anos)</SelectItem>
                        <SelectItem value="veterano">Veterano (40+ anos)</SelectItem>
                        <SelectItem value="master">Master (50+ anos)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Idade Mínima</Label>
                    <Input
                      type="number"
                      value={ticket.min_age || ""}
                      onChange={(e) => updateTicketType(index, 'min_age', e.target.value)}
                      placeholder="Ex: 18"
                      min="0"
                      max="100"
                      disabled={ticket.age_group && ticket.age_group !== ""}
                    />
                    <p className="text-xs text-muted-foreground">
                      {ticket.age_group ? "Definido pelo escalão" : "Deixe vazio para sem restrição"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Idade Máxima</Label>
                    <Input
                      type="number"
                      value={ticket.max_age || ""}
                      onChange={(e) => updateTicketType(index, 'max_age', e.target.value)}
                      placeholder="Ex: 65"
                      min="0"
                      max="120"
                      disabled={ticket.age_group && ticket.age_group !== ""}
                    />
                    <p className="text-xs text-muted-foreground">
                      {ticket.age_group ? "Definido pelo escalão" : "Deixe vazio para sem restrição"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Restrição de Género</Label>
                     <Select
                       value={ticket.gender_restriction || "none"}
                       onValueChange={(value) => updateTicketType(index, 'gender_restriction', value === "none" ? "" : value)}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Sem restrição" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="none">Sem restrição</SelectItem>
                         <SelectItem value="masculino">Masculino</SelectItem>
                         <SelectItem value="feminino">Feminino</SelectItem>
                       </SelectContent>
                     </Select>
                  </div>
                </div>
                
                {/* Age Range Validation */}
                {ticket.min_age && ticket.max_age && parseInt(ticket.min_age) >= parseInt(ticket.max_age) && (
                  <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    ⚠️ A idade mínima deve ser menor que a idade máxima
                  </div>
                )}
                
                {/* Age Range Display */}
                {(ticket.min_age || ticket.max_age) && (
                  <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                    <strong>Restrição:</strong> {
                      ticket.min_age && ticket.max_age 
                        ? `${ticket.min_age}-${ticket.max_age} anos`
                        : ticket.min_age 
                        ? `Mínimo ${ticket.min_age} anos`
                        : `Máximo ${ticket.max_age} anos`
                    }
                    {ticket.gender_restriction && (
                      <span> • {ticket.gender_restriction}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Seating Option */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`seating-${index}`}
                    checked={ticket.has_seating}
                    onCheckedChange={(checked) => updateTicketType(index, 'has_seating', checked)}
                  />
                  <Label htmlFor={`seating-${index}`}>Este bilhete tem lugares marcados</Label>
                </div>

                {ticket.has_seating && seatingZones.length > 0 && (
                  <div className="space-y-2">
                    <Label>Zonas Disponíveis</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {seatingZones.map((zone) => (
                        <div key={zone.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`zone-${index}-${zone.id}`}
                            checked={ticket.seating_zones.includes(zone.id)}
                            onCheckedChange={(checked) => {
                              const zones = checked
                                ? [...ticket.seating_zones, zone.id]
                                : ticket.seating_zones.filter(z => z !== zone.id);
                              updateTicketType(index, 'seating_zones', zones);
                            }}
                          />
                          <Label htmlFor={`zone-${index}-${zone.id}`} className="text-sm">
                            {zone.name} (+€{zone.price})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Extras Included */}
              <div className="space-y-4">
                <Label>Extras Incluídos</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {allExtras.map((extra) => (
                    <div key={extra.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`extra-${index}-${extra.id}`}
                        checked={
                          (extra.id === 'tshirt' && ticket.includes_tshirt) ||
                          (extra.id === 'kit' && ticket.includes_kit) ||
                          (extra.id === 'meal' && ticket.includes_meal) ||
                          (extra.id === 'insurance' && ticket.includes_insurance) ||
                          ticket.custom_extras.includes(extra.id)
                        }
                        onCheckedChange={(checked) => {
                          if (['tshirt', 'kit', 'meal', 'insurance'].includes(extra.id)) {
                            const field = `includes_${extra.id}` as keyof TicketType;
                            updateTicketType(index, field, checked);
                          } else {
                            const customs = checked
                              ? [...ticket.custom_extras, extra.id]
                              : ticket.custom_extras.filter(e => e !== extra.id);
                            updateTicketType(index, 'custom_extras', customs);
                          }
                        }}
                      />
                      <Label htmlFor={`extra-${index}-${extra.id}`} className="text-sm">
                        {extra.name} (+€{extrasConfig[extra.id] || extra.price})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Quantidade Máxima</Label>
                  <Input
                    type="number"
                    value={ticket.max_quantity}
                    onChange={(e) => updateTicketType(index, 'max_quantity', e.target.value)}
                    placeholder="Ilimitado"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço Early Bird (€)</Label>
                  <Input
                    type="number"
                    value={ticket.early_bird_price}
                    onChange={(e) => updateTicketType(index, 'early_bird_price', e.target.value)}
                    placeholder="Opcional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fim Early Bird</Label>
                  <Input
                    type="datetime-local"
                    value={ticket.early_bird_end_date}
                    onChange={(e) => updateTicketType(index, 'early_bird_end_date', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button onClick={addTicketType} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Tipo de Bilhete
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}