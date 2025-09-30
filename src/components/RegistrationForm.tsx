import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Smartphone, Building, Users, CheckCircle, XCircle, AlertCircle, Search, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTeams } from "@/hooks/useTeams";
import { TeamCard } from "@/components/teams/TeamCard";
import Header from "@/components/Header";
import { handleError, validateRequired } from "@/utils/errorHandler";
import { formatCC, validateCC } from "@/utils/validationUtils";

interface RegistrationFormProps {
  event: {
    id: string;
    title: string;
    price?: number;
    individualRegistration?: boolean;
    teamRegistration?: boolean;
    subcategories?: string[];
    event_regulation?: string;
    terms_and_conditions?: string;
    image_rights_clause?: string;
    liability_waiver?: string;
  };
  ticketType: {
    price: number;
    name: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const RegistrationForm = ({ event, ticketType, onClose, onSuccess }: RegistrationFormProps) => {
  const [step, setStep] = useState(1);
  const [registrationType, setRegistrationType] = useState("individual");
  const [teamSelectionMode, setTeamSelectionMode] = useState<"existing" | "create" | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [showTeamSearch, setShowTeamSearch] = useState(false);
  const [ccValidation, setCcValidation] = useState({ isValid: false, isDuplicate: false, isChecking: false });
  const [formData, setFormData] = useState({
    // Personal info - CC primeiro!
    cc: "",
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
    address: "",
    city: "",
    postalCode: "",
    
    // Event specific
    category: "",
    tshirtSize: "",
    emergencyContact: "",
    emergencyPhone: "",
    medicalInfo: "",
    
    // Team info (if applicable)
    teamName: "",
    teamMembers: [],
    
    // Payment
    paymentMethod: "",
    
    // Agreements
    terms: false,
    dataProcessing: false,
    marketing: false,
    eventRegulation: false,
    imageRights: false,
    liabilityWaiver: false
  });

  const [teamMember, setTeamMember] = useState({
    name: "",
    email: "",
    cc: "",
    birthDate: "",
    gender: ""
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const { teams, loading: teamsLoading, fetchTeams } = useTeams();

  // Carregar equipas quando componente monta
  useEffect(() => {
    fetchTeams();
  }, []);

  // Mock database of existing CCs (in real app would be API call)
  const existingCCs = [
    "12345678", "87654321", "11111111", "99999999"
  ];

  // Função para validar CC português
  const validatePortugueseCC = (cc) => {
    // Remove espaços e outros caracteres
    const cleanCC = cc.replace(/\s/g, '');
    
    // Deve ter exatamente 8 dígitos
    if (!/^\d{8}$/.test(cleanCC)) {
      return false;
    }

    // Algoritmo de validação do CC português
    const digits = cleanCC.split('').map(Number);
    let sum = 0;
    
    for (let i = 0; i < 7; i++) {
      sum += digits[i] * (8 - i);
    }
    
    const remainder = sum % 11;
    const checkDigit = digits[7];
    
    if (remainder < 2) {
      return checkDigit === 0;
    } else {
      return checkDigit === (11 - remainder);
    }
  };

  // Validação do CC com timeout e melhor UX
  useEffect(() => {
    if (formData.cc.length >= 8) {
      setCcValidation(prev => ({ ...prev, isChecking: true }));
      
      const timeoutId = setTimeout(() => {
        const ccResult = validateCC(formData.cc.replace(/\s/g, ''));
        const isDuplicate = existingCCs.includes(formData.cc.replace(/\s/g, ''));
        
        setCcValidation({
          isValid: ccResult.isValid && !isDuplicate,
          isDuplicate,
          isChecking: false
        });

        if (isDuplicate) {
          handleError('Este Cartão de Cidadão já está registado neste evento', 'CC Validation');
        } else if (!ccResult.isValid) {
          handleError(ccResult.message || 'Cartão de Cidadão inválido', 'CC Validation');
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setCcValidation({ isValid: false, isDuplicate: false, isChecking: false });
    }
  }, [formData.cc]);

  const handleCCChange = (e) => {
    const formatted = formatCC(e.target.value);
    setFormData({...formData, cc: formatted});
  };

  const tshirtSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const paymentMethods = [
    { id: "mbway", name: "MBWay", icon: Smartphone },
    { id: "multibanco", name: "Referência Multibanco", icon: Building },
    { id: "card", name: "Cartão de Crédito", icon: CreditCard },
    { id: "paypal", name: "PayPal", icon: CreditCard }
  ];

  const addTeamMember = () => {
    if (teamMember.name && teamMember.email && teamMember.cc) {
      setFormData({
        ...formData,
        teamMembers: [...formData.teamMembers, { ...teamMember, id: Date.now() }]
      });
      setTeamMember({ name: "", email: "", cc: "", birthDate: "", gender: "" });
    }
  };

  const removeTeamMember = (id) => {
    setFormData({
      ...formData,
      teamMembers: formData.teamMembers.filter(member => member.id !== id)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação do CC antes de avançar do step 1
    if (step === 1) {
      if (!formData.cc || !ccValidation.isValid || ccValidation.isDuplicate) {
        toast({
          title: "CC obrigatório",
          description: "Por favor, introduza um Cartão de Cidadão válido e não duplicado.",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Final submission
    toast({
      title: "Inscrição submetida com sucesso!",
      description: "Será redirecionado para o checkout para efetuar o pagamento.",
    });
    
    // Registration data validated and submitted
    if (onSuccess) onSuccess();
  };

  const calculateTotal = () => {
    const basePrice = ticketType?.price || event.price || 0;
    const memberCount = registrationType === "team" ? formData.teamMembers.length + 1 : 1;
    return basePrice * memberCount;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="icon" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Inscrição - {event.title}</h1>
              <p className="text-muted-foreground">Passo {step} de 3</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-secondary rounded-full h-2 mb-8">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Registration Type & Personal Info */}
            {step === 1 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tipo de Inscrição</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup 
                      value={registrationType} 
                      onValueChange={setRegistrationType}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {event.individualRegistration && (
                        <div className="flex items-center space-x-2 p-4 border rounded-lg">
                          <RadioGroupItem value="individual" id="individual" />
                          <Label htmlFor="individual" className="flex-1 cursor-pointer">
                            <div>
                              <p className="font-semibold">Individual</p>
                              <p className="text-sm text-muted-foreground">Inscrição individual</p>
                            </div>
                          </Label>
                        </div>
                      )}
                      
                      {event.teamRegistration && (
                        <div className="flex items-center space-x-2 p-4 border rounded-lg">
                          <RadioGroupItem value="team" id="team" />
                          <Label htmlFor="team" className="flex-1 cursor-pointer">
                            <div>
                              <p className="font-semibold">Equipa</p>
                              <p className="text-sm text-muted-foreground">Inscrição por equipa</p>
                            </div>
                          </Label>
                        </div>
                      )}
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Seleção de Equipa (para ambos os tipos de inscrição) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Equipa (opcional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground mb-4">
                      {registrationType === "individual" 
                        ? "Pode inscrever-se individualmente numa equipa existente ou continuar sem equipa."
                        : "Pode inscrever a sua equipa numa equipa existente ou criar uma nova equipa."
                      }
                    </div>

                    <RadioGroup 
                      value={teamSelectionMode || "none"} 
                      onValueChange={(value) => {
                        setTeamSelectionMode(value === "none" ? null : value as "existing" | "create");
                        setSelectedTeam(null);
                        setShowTeamSearch(false);
                      }}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="none" id="no-team" />
                        <Label htmlFor="no-team" className="flex-1 cursor-pointer">
                          <div>
                            <p className="font-medium">
                              {registrationType === "individual" ? "Sem equipa" : "Equipa nova"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {registrationType === "individual" 
                                ? "Inscrição individual sem equipa" 
                                : "Criar uma nova equipa durante a inscrição"
                              }
                            </p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="existing" id="existing-team" />
                        <Label htmlFor="existing-team" className="flex-1 cursor-pointer">
                          <div>
                            <p className="font-medium">Juntar-me a equipa existente</p>
                            <p className="text-xs text-muted-foreground">
                              {registrationType === "individual" 
                                ? "Participar como membro de equipa existente"
                                : "Inscrever a equipa numa equipa existente"
                              }
                            </p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>

                    {/* Pesquisa e seleção de equipa existente */}
                    {teamSelectionMode === "existing" && (
                      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="Pesquisar equipas..."
                              className="pl-10"
                              onChange={(e) => {
                                const search = e.target.value;
                                if (search.length > 2) {
                                  fetchTeams({ search });
                                } else if (search.length === 0) {
                                  fetchTeams();
                                }
                              }}
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setShowTeamSearch(!showTeamSearch)}
                          >
                            {showTeamSearch ? "Ocultar" : "Mostrar"} Equipas
                          </Button>
                        </div>

                        {showTeamSearch && (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {teamsLoading ? (
                              <div className="text-center py-4">
                                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                                <p className="text-sm text-muted-foreground">A carregar equipas...</p>
                              </div>
                            ) : teams.length > 0 ? (
                              <div className="grid gap-3">
                                {teams.slice(0, 6).map((team) => (
                                  <div key={team.id} className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                    selectedTeam?.id === team.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                                  }`}
                                  onClick={() => setSelectedTeam(team)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-medium">{team.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {team.member_count || 0}/{team.max_members} membros
                                          {team.sport_category && ` • ${team.sport_category}`}
                                          {team.location && ` • ${team.location}`}
                                        </p>
                                      </div>
                                      {selectedTeam?.id === team.id && (
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-sm text-muted-foreground">
                                Nenhuma equipa encontrada
                              </div>
                            )}
                          </div>
                        )}

                        {selectedTeam && (
                          <div className="p-3 bg-primary/10 border border-primary rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-primary" />
                              <span className="font-medium text-primary">Equipa selecionada:</span>
                            </div>
                            <p className="font-semibold">{selectedTeam.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedTeam.member_count || 0}/{selectedTeam.max_members} membros
                              {selectedTeam.sport_category && ` • ${selectedTeam.sport_category}`}
                            </p>
                            {selectedTeam.description && (
                              <p className="text-sm mt-2">{selectedTeam.description}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Identificação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* CC como primeiro campo */}
                    <div className="space-y-2">
                      <Label htmlFor="cc" className="text-base font-semibold">
                        Cartão de Cidadão *
                      </Label>
                      <div className="relative">
                        <Input
                          id="cc"
                          value={formData.cc}
                          onChange={handleCCChange}
                          placeholder="1234 5678"
                          maxLength={9}
                          className={`pr-10 ${
                            formData.cc.length >= 8 
                              ? ccValidation.isChecking 
                                ? 'border-yellow-500' 
                                : ccValidation.isDuplicate 
                                  ? 'border-red-500' 
                                  : ccValidation.isValid 
                                    ? 'border-green-500' 
                                    : 'border-red-500'
                              : ''
                          }`}
                          required
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {formData.cc.length >= 8 && (
                            <>
                              {ccValidation.isChecking && (
                                <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />
                              )}
                              {!ccValidation.isChecking && ccValidation.isDuplicate && (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              {!ccValidation.isChecking && !ccValidation.isDuplicate && ccValidation.isValid && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              {!ccValidation.isChecking && !ccValidation.isDuplicate && !ccValidation.isValid && (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-sm">
                        {formData.cc.length >= 8 && !ccValidation.isChecking && (
                          <>
                            {ccValidation.isDuplicate && (
                              <p className="text-red-500 flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                Este CC já está registado no sistema
                              </p>
                            )}
                            {!ccValidation.isDuplicate && ccValidation.isValid && (
                              <p className="text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                CC válido e disponível
                              </p>
                            )}
                            {!ccValidation.isDuplicate && !ccValidation.isValid && (
                              <p className="text-red-500 flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                Formato de CC inválido
                              </p>
                            )}
                          </>
                        )}
                        {ccValidation.isChecking && (
                          <p className="text-yellow-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            A validar CC...
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Data de Nascimento *</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Género *</Label>
                        <Select onValueChange={(value) => setFormData({...formData, gender: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Masculino</SelectItem>
                            <SelectItem value="F">Feminino</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 2: Event Details & Team (if applicable) */}
            {step === 2 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes do Evento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoria *</Label>
                        <Select onValueChange={(value) => setFormData({...formData, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {event.subcategories?.map((cat, index) => (
                              <SelectItem key={index} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="tshirtSize">Tamanho da T-shirt *</Label>
                        <Select onValueChange={(value) => setFormData({...formData, tshirtSize: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tamanho" />
                          </SelectTrigger>
                          <SelectContent>
                            {tshirtSizes.map((size) => (
                              <SelectItem key={size} value={size}>{size}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContact">Contacto de Emergência *</Label>
                        <Input
                          id="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyPhone">Telefone de Emergência *</Label>
                        <Input
                          id="emergencyPhone"
                          value={formData.emergencyPhone}
                          onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medicalInfo">Informações Médicas (opcional)</Label>
                      <Textarea
                        id="medicalInfo"
                        value={formData.medicalInfo}
                        onChange={(e) => setFormData({...formData, medicalInfo: e.target.value})}
                        placeholder="Alergias, medicação, condições médicas relevantes..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {registrationType === "team" && teamSelectionMode !== "existing" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Informações da Equipa
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="teamName">Nome da Equipa *</Label>
                        <Input
                          id="teamName"
                          value={formData.teamName}
                          onChange={(e) => setFormData({...formData, teamName: e.target.value})}
                          required={registrationType === "team"}
                        />
                      </div>

                      <div className="space-y-4">
                        <Label>Membros da Equipa</Label>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          <Input
                            placeholder="Nome"
                            value={teamMember.name}
                            onChange={(e) => setTeamMember({...teamMember, name: e.target.value})}
                          />
                          <Input
                            placeholder="Email"
                            type="email"
                            value={teamMember.email}
                            onChange={(e) => setTeamMember({...teamMember, email: e.target.value})}
                          />
                          <Input
                            placeholder="CC"
                            value={teamMember.cc}
                            onChange={(e) => setTeamMember({...teamMember, cc: e.target.value})}
                          />
                        </div>
                        
                        <Button type="button" onClick={addTeamMember} className="w-full">
                          Adicionar Membro
                        </Button>

                        <div className="space-y-2">
                          {formData.teamMembers.map((member, index) => (
                            <div key={member.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                              <div>
                                <p className="font-semibold">{member.name}</p>
                                <p className="text-sm text-muted-foreground">{member.email}</p>
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeTeamMember(member.id)}
                              >
                                Remover
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 3: Terms & Confirmation */}
            {step === 3 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo da Inscrição</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Participante Principal</p>
                        <p className="font-semibold">{formData.name}</p>
                        <p className="text-sm">{formData.email}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Categoria</p>
                        <p className="font-semibold">{formData.category}</p>
                      </div>
                    </div>

                    {(registrationType === "team" && teamSelectionMode !== "existing" && formData.teamMembers.length > 0) && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Equipa: {formData.teamName}</p>
                        <div className="space-y-1">
                          {formData.teamMembers.map((member, index) => (
                            <p key={member.id} className="text-sm">{member.name}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTeam && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Equipa selecionada: {selectedTeam.name}</p>
                        <p className="text-sm">{selectedTeam.member_count || 0}/{selectedTeam.max_members} membros</p>
                        {selectedTeam.description && (
                          <p className="text-xs text-muted-foreground mt-1">{selectedTeam.description}</p>
                        )}
                      </div>
                    )}

                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex justify-between items-center font-bold">
                        <span>Total a pagar:</span>
                        <span>€{calculateTotal()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Termos e Condições</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {event.event_regulation && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Regulamento do Evento</h4>
                        <div className="bg-muted p-3 rounded-lg text-sm max-h-32 overflow-y-auto">
                          <p className="whitespace-pre-wrap">{event.event_regulation}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="eventRegulation" 
                            checked={formData.eventRegulation}
                            onCheckedChange={(checked) => setFormData({...formData, eventRegulation: !!checked})}
                          />
                          <Label htmlFor="eventRegulation" className="text-sm">
                            Li e aceito o regulamento específico deste evento *
                          </Label>
                        </div>
                      </div>
                    )}

                    {event.terms_and_conditions && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Termos e Condições Gerais</h4>
                        <div className="bg-muted p-3 rounded-lg text-sm max-h-32 overflow-y-auto">
                          <p className="whitespace-pre-wrap">{event.terms_and_conditions}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="terms" 
                            checked={formData.terms}
                            onCheckedChange={(checked) => setFormData({...formData, terms: !!checked})}
                          />
                          <Label htmlFor="terms" className="text-sm">
                            Li e aceito os termos e condições do evento *
                          </Label>
                        </div>
                      </div>
                    )}

                    {event.image_rights_clause && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Autorização de Uso de Imagem</h4>
                        <div className="bg-muted p-3 rounded-lg text-sm max-h-32 overflow-y-auto">
                          <p className="whitespace-pre-wrap">{event.image_rights_clause}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="imageRights" 
                            checked={formData.imageRights}
                            onCheckedChange={(checked) => setFormData({...formData, imageRights: !!checked})}
                          />
                          <Label htmlFor="imageRights" className="text-sm">
                            Autorizo o uso da minha imagem conforme descrito *
                          </Label>
                        </div>
                      </div>
                    )}

                    {event.liability_waiver && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Termo de Responsabilidade</h4>
                        <div className="bg-muted p-3 rounded-lg text-sm max-h-32 overflow-y-auto">
                          <p className="whitespace-pre-wrap">{event.liability_waiver}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="liabilityWaiver" 
                            checked={formData.liabilityWaiver}
                            onCheckedChange={(checked) => setFormData({...formData, liabilityWaiver: !!checked})}
                          />
                          <Label htmlFor="liabilityWaiver" className="text-sm">
                            Aceito participar por minha conta e risco *
                          </Label>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="dataProcessing" 
                        checked={formData.dataProcessing}
                        onCheckedChange={(checked) => setFormData({...formData, dataProcessing: !!checked})}
                      />
                      <Label htmlFor="dataProcessing" className="text-sm">
                        Consinto o tratamento dos meus dados pessoais para fins de inscrição *
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="marketing" 
                        checked={formData.marketing}
                        onCheckedChange={(checked) => setFormData({...formData, marketing: !!checked})}
                      />
                      <Label htmlFor="marketing" className="text-sm">
                        Aceito receber comunicações sobre futuros eventos (opcional)
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                  Anterior
                </Button>
              )}
              
              <Button 
                type="submit" 
                className="ml-auto"
                disabled={step === 3 && (
                  !formData.dataProcessing || 
                  (event.event_regulation && !formData.eventRegulation) ||
                  (event.terms_and_conditions && !formData.terms) ||
                  (event.image_rights_clause && !formData.imageRights) ||
                  (event.liability_waiver && !formData.liabilityWaiver)
                )}
              >
                {step === 3 ? "Finalizar Inscrição" : "Continuar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;