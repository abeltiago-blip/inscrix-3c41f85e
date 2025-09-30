import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Calendar, MapPin, Plus, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { TeamSelector } from "@/components/teams/TeamSelector";
import { validateDocumentByCountry, formatDocumentInput, getDocumentTypeInfo } from "@/utils/documentValidation";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export interface ParticipantFormData {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  documentNumber: string;
  nif?: string;
  nationality: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalConditions: string;
  tshirtSize: string;
  teamId?: string;
  teamName?: string;
}

interface LocalTicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  early_bird_price?: number;
  early_bird_end_date?: string;
  includes_kit: boolean;
  includes_meal: boolean;
  includes_tshirt: boolean;
  includes_insurance: boolean;
  min_age?: number;
  max_age?: number;
  gender_restriction?: string;
}

interface Event {
  id: string;
  title: string;
  start_date: string;
  location: string;
  liability_waiver?: string;
}

interface ParticipantRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  ticketTypes: LocalTicketType[];
  onAddToCart: (participantData: ParticipantFormData, ticketType: LocalTicketType) => void;
  editMode?: boolean;
  editIndex?: number;
  initialData?: {
    ticketTypeId: string;
    participantData: ParticipantFormData;
  };
}

export default function ParticipantRegistrationModal({
  isOpen,
  onClose,
  event,
  ticketTypes,
  onAddToCart,
  editMode = false,
  editIndex,
  initialData,
}: ParticipantRegistrationModalProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { editItem } = useCart();
  const navigate = useNavigate();
  
  console.log('🎫 ParticipantRegistrationModal - User:', user?.id);
  console.log('👤 ParticipantRegistrationModal - Profile:', profile);
  
  const [selectedTicketType, setSelectedTicketType] = useState<string>(initialData?.ticketTypeId || "");
  const [useMyData, setUseMyData] = useState(false);
  const [acceptLiabilityWaiver, setAcceptLiabilityWaiver] = useState(false);
  const [participantData, setParticipantData] = useState<ParticipantFormData>(
    initialData?.participantData || {
      name: "",
      email: "",
      phone: "",
      birthDate: "",
      gender: "",
      documentNumber: "",
      nif: "",
      nationality: "Portugal",
      emergencyContactName: "",
      emergencyContactPhone: "",
      medicalConditions: "",
      tshirtSize: "",
      teamId: "",
      teamName: ""
    }
  );

  const selectedTicket = ticketTypes.find(t => t.id === selectedTicketType);
  
  // Get document type info based on nationality
  const documentTypeInfo = getDocumentTypeInfo(participantData.nationality);

  const getCurrentPrice = (ticket: LocalTicketType) => {
    if (ticket.early_bird_price && ticket.early_bird_end_date) {
      const earlyBirdEnd = new Date(ticket.early_bird_end_date);
      const now = new Date();
      return now <= earlyBirdEnd ? ticket.early_bird_price : ticket.price;
    }
    return ticket.price;
  };

  const isEarlyBird = (ticket: LocalTicketType) => {
    if (ticket.early_bird_price && ticket.early_bird_end_date) {
      const earlyBirdEnd = new Date(ticket.early_bird_end_date);
      const now = new Date();
      return now <= earlyBirdEnd;
    }
    return false;
  };

  const handleInputChange = (field: keyof ParticipantFormData, value: string) => {
    setParticipantData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Clear document fields when nationality changes
      if (field === 'nationality') {
        updated.documentNumber = '';
      }
      
      return updated;
    });
  };

  const handleUseMyData = (checked: boolean) => {
    setUseMyData(checked);
    console.log('🔍 UseMyData clicked:', checked);
    console.log('👤 Profile data available:', profile);
    
    if (checked && profile) {
      const extendedProfile = profile as any;
      console.log('📋 Extended profile fields:', Object.keys(extendedProfile));
      console.log('📋 Profile values:', {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        birth_date: extendedProfile.birth_date,
        gender: extendedProfile.gender,
        document_number: extendedProfile.document_number,
        nationality: extendedProfile.nationality,
        nif: extendedProfile.nif,
        emergency_contact_name: extendedProfile.emergency_contact_name,
        emergency_contact_phone: extendedProfile.emergency_contact_phone
      });
      
      // Format birth date if it exists
      let formattedBirthDate = '';
      if (extendedProfile.birth_date) {
        // Handle different date formats
        const date = new Date(extendedProfile.birth_date);
        if (!isNaN(date.getTime())) {
          formattedBirthDate = date.toISOString().split('T')[0];
        }
      }
      
      const newData = {
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        email: profile.email || '',
        phone: profile.phone || '',
        birthDate: formattedBirthDate,
        gender: extendedProfile.gender || '',
        documentNumber: extendedProfile.document_number || '',
        nationality: extendedProfile.nationality || 'Portugal',
        nif: extendedProfile.nif || '',
        emergencyContactName: extendedProfile.emergency_contact_name || '',
        emergencyContactPhone: extendedProfile.emergency_contact_phone || '',
        medicalConditions: '',
        tshirtSize: '',
        teamId: '',
        teamName: ''
      };
      
      console.log('✅ Setting participant data to:', newData);
      setParticipantData(newData);
    } else if (!checked) {
      setParticipantData({
        name: "",
        email: "",
        phone: "",
        birthDate: "",
        gender: "",
        documentNumber: "",
        nif: "",
        nationality: "Portugal",
        emergencyContactName: "",
        emergencyContactPhone: "",
        medicalConditions: "",
        tshirtSize: "",
        teamId: "",
        teamName: ""
      });
    }
  };

  const validateForm = async () => {
    if (!selectedTicket) {
      toast({
        title: "Tipo de bilhete obrigatório",
        description: "Selecione um tipo de bilhete",
        variant: "destructive"
      });
      return false;
    }

    if (!participantData.name || !participantData.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são obrigatórios",
        variant: "destructive"
      });
      return false;
    }

    // Validate age restrictions if birth date is provided
    if (participantData.birthDate && selectedTicket) {
      const birthDate = new Date(participantData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // Adjust age if birthday hasn't occurred this year
      const finalAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) 
        ? age - 1 
        : age;

      // Check minimum age
      if (selectedTicket.min_age && finalAge < selectedTicket.min_age) {
        toast({
          title: "Idade não permitida",
          description: `Este bilhete requer idade mínima de ${selectedTicket.min_age} anos. Idade atual: ${finalAge} anos`,
          variant: "destructive"
        });
        return false;
      }

      // Check maximum age
      if (selectedTicket.max_age && finalAge > selectedTicket.max_age) {
        toast({
          title: "Idade não permitida",
          description: `Este bilhete requer idade máxima de ${selectedTicket.max_age} anos. Idade atual: ${finalAge} anos`,
          variant: "destructive"
        });
        return false;
      }
    }

    // Check gender restriction
    if (selectedTicket.gender_restriction && participantData.gender && 
        selectedTicket.gender_restriction !== participantData.gender) {
      toast({
        title: "Género não permitido",
        description: `Este bilhete é apenas para participantes do género ${selectedTicket.gender_restriction}`,
        variant: "destructive"
      });
      return false;
    }

    // Validate document by country
    if (participantData.documentNumber) {
      const validation = validateDocumentByCountry(participantData.documentNumber, participantData.nationality);
      if (!validation.isValid) {
        const documentInfo = getDocumentTypeInfo(participantData.nationality);
        toast({
          title: `${documentInfo.name} inválido`,
          description: validation.message,
          variant: "destructive"
        });
        return false;
      }
    }

    // Check for duplicate document number in the same event (skip if editing same registration)
    if (participantData.documentNumber && !editMode) {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: existingRegistration } = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', event.id)
        .eq('participant_document_number', participantData.documentNumber)
        .eq('status', 'active')
        .maybeSingle();

      if (existingRegistration) {
        const documentInfo = getDocumentTypeInfo(participantData.nationality);
        toast({
          title: `${documentInfo.name} já registado`,
          description: `Este ${documentInfo.name} já está registado neste evento`,
          variant: "destructive"
        });
        return false;
      }
    }

    // Check liability waiver acceptance if exists
    if (event.liability_waiver && !acceptLiabilityWaiver) {
      toast({
        title: "Termo de responsabilidade",
        description: "Deve aceitar o termo de responsabilidade para continuar",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleAddToCart = async () => {
    try {
      if (!(await validateForm()) || !selectedTicket) return;

      if (editMode && editIndex !== undefined) {
        // Edit existing item
        const cartItem = {
          eventId: event.id,
          eventTitle: event.title,
          ticketTypeId: selectedTicketType,
          ticketTypeName: selectedTicket.name,
          price: getCurrentPrice(selectedTicket),
          eventDate: event.start_date,
          eventLocation: event.location,
        };

        editItem(editIndex, cartItem, participantData);
        
        toast({
          title: "Inscrição atualizada!",
          description: `${participantData.name} - ${selectedTicket.name}`,
        });

        onClose();
      } else {
        // Add new item
        onAddToCart(participantData, selectedTicket);
        
        toast({
          title: "Participante adicionado ao carrinho!",
          description: `${participantData.name} - ${selectedTicket.name}`,
        });

        // Close modal and navigate to cart
        onClose();
        navigate('/cart');
      }
    } catch (error: any) {
      console.error('Error processing cart:', error);
      
      // Check if it's a duplicate document error from database constraint
      if (error.message?.includes('duplicate key value violates unique constraint') || 
          error.message?.includes('idx_registrations_unique_document_per_event')) {
        toast({
          title: "Documento duplicado",
          description: "Este Cartão de Cidadão já está registado neste evento.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: `Ocorreu um erro ao ${editMode ? 'atualizar' : 'adicionar'} o participante. Tente novamente.`,
          variant: "destructive",
        });
      }
    }
  };

  const handleAddAndContinue = async () => {
    if (!(await validateForm()) || !selectedTicket) return;

    onAddToCart(participantData, selectedTicket);
    
    toast({
      title: "Participante adicionado!",
      description: "Pode adicionar mais participantes",
    });

    // Reset form for next participant but keep modal open
    setParticipantData({
      name: "",
      email: "",
      phone: "",
      birthDate: "",
      gender: "",
      documentNumber: "",
      nif: "",
      nationality: "Portugal",
      emergencyContactName: "",
      emergencyContactPhone: "",
      medicalConditions: "",
      tshirtSize: "",
      teamId: "",
      teamName: ""
    });
    setSelectedTicketType("");
    setUseMyData(false);
    setAcceptLiabilityWaiver(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {editMode ? 'Editar Inscrição' : 'Inscrever Participante'}
          </DialogTitle>
          <DialogDescription>
            {event.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tipo de Bilhete</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {ticketTypes.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTicketType === ticket.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedTicketType(ticket.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="ticketType"
                            value={ticket.id}
                            checked={selectedTicketType === ticket.id}
                            onChange={() => setSelectedTicketType(ticket.id)}
                          />
                          <h3 className="font-semibold">{ticket.name}</h3>
                        </div>
                        {ticket.description && (
                          <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                        )}
                        
                        {/* Age and Gender Restrictions */}
                        {(ticket.min_age || ticket.max_age || ticket.gender_restriction) && (
                          <div className="mt-2">
                            <div className="text-xs text-muted-foreground">
                              <strong>Restrições:</strong>
                              {(ticket.min_age || ticket.max_age) && (
                                <span className="ml-1">
                                  {ticket.min_age && ticket.max_age 
                                    ? `${ticket.min_age}-${ticket.max_age} anos`
                                    : ticket.min_age 
                                    ? `Mín. ${ticket.min_age} anos`
                                    : `Máx. ${ticket.max_age} anos`
                                  }
                                </span>
                              )}
                              {ticket.gender_restriction && (
                                <span className="ml-1">• {ticket.gender_restriction}</span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Includes */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {[
                            ticket.includes_tshirt && { label: "T-shirt", icon: "👕" },
                            ticket.includes_meal && { label: "Refeição", icon: "🍽️" },
                            ticket.includes_kit && { label: "Kit", icon: "📦" },
                            ticket.includes_insurance && { label: "Seguro", icon: "🛡️" }
                          ].filter(Boolean).map((item: any, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {item.icon} {item.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {getCurrentPrice(ticket)}€
                        </div>
                        {isEarlyBird(ticket) && (
                          <Badge variant="default" className="text-xs mt-1">
                            Early Bird!
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Participant Data Form */}
          {selectedTicket && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dados do Participante</CardTitle>
                
                {/* Use My Data Option */}
                {profile && (
                  <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                    <Checkbox
                      id="use-my-data"
                      checked={useMyData}
                      onCheckedChange={handleUseMyData}
                    />
                    <Label htmlFor="use-my-data" className="text-sm font-medium">
                      Usar os meus dados ({profile.first_name} {profile.last_name})
                    </Label>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={participantData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={participantData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={participantData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="birthDate"
                        type="date"
                        value={participantData.birthDate}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Género *</Label>
                    <Select onValueChange={(value) => handleInputChange('gender', value)} value={participantData.gender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nacionalidade *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Select 
                        onValueChange={(value) => handleInputChange('nationality', value)}
                        value={participantData.nationality}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Selecione a nacionalidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Portugal">Portugal</SelectItem>
                          <SelectItem value="Espanha">Espanha</SelectItem>
                          <SelectItem value="França">França</SelectItem>
                          <SelectItem value="Brasil">Brasil</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                         <Label htmlFor="documentNumber">
                           {documentTypeInfo.name} *
                         </Label>
                         <Input
                           id="documentNumber"
                           value={participantData.documentNumber}
                           onChange={(e) => {
                             const formatted = formatDocumentInput(e.target.value, participantData.nationality);
                             handleInputChange('documentNumber', formatted);
                           }}
                           placeholder={documentTypeInfo.placeholder}
                           required
                           maxLength={documentTypeInfo.placeholder.length || 20}
                         />
                       </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="nif">NIF (Opcional)</Label>
                        <Input
                          id="nif"
                          value={participantData.nif || ""}
                          onChange={(e) => handleInputChange('nif', e.target.value)}
                          placeholder="Número de Identificação Fiscal"
                        />
                      </div>
                    </div>
                  
                  {selectedTicket.includes_tshirt && (
                    <div className="space-y-2">
                      <Label htmlFor="tshirtSize">Tamanho T-Shirt</Label>
                      <Select onValueChange={(value) => handleInputChange('tshirtSize', value)} value={participantData.tshirtSize}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tamanho" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="XS">XS</SelectItem>
                          <SelectItem value="S">S</SelectItem>
                          <SelectItem value="M">M</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="XL">XL</SelectItem>
                          <SelectItem value="XXL">XXL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Team Selection */}
                <TeamSelector
                  value={participantData.teamId}
                  onValueChange={(teamId) => handleInputChange('teamId', teamId)}
                  onTeamNameChange={(teamName) => handleInputChange('teamName', teamName)}
                />

                {/* Emergency Contact */}
                <div>
                  <h4 className="font-medium mb-3">Contacto de Emergência</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyName">Nome</Label>
                      <Input
                        id="emergencyName"
                        value={participantData.emergencyContactName}
                        onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Telefone</Label>
                      <Input
                        id="emergencyPhone"
                        value={participantData.emergencyContactPhone}
                        onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Conditions */}
                <div className="space-y-2">
                  <Label htmlFor="medicalConditions">Condições Médicas / Alergias</Label>
                  <Textarea
                    id="medicalConditions"
                    value={participantData.medicalConditions}
                    onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                    placeholder="Indique qualquer condição médica, alergia ou medicação relevante..."
                    rows={3}
                  />
                </div>

                {/* Liability Waiver */}
                {event.liability_waiver && (
                  <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-medium text-foreground">Termo de Responsabilidade</h4>
                    <div className="max-h-32 overflow-y-auto text-sm text-muted-foreground border rounded p-3 bg-background">
                      <MarkdownRenderer 
                        content={event.liability_waiver}
                        className="prose-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="accept-liability"
                        checked={acceptLiabilityWaiver}
                        onCheckedChange={(checked) => setAcceptLiabilityWaiver(checked as boolean)}
                      />
                      <Label htmlFor="accept-liability" className="text-sm">
                        Li e aceito o termo de responsabilidade *
                      </Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          
          {selectedTicket && (
            <>
              {!editMode && (
                <Button type="button" onClick={handleAddAndContinue} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar e Inscrever Mais
                </Button>
              )}
              
              <Button onClick={handleAddToCart} className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                {editMode ? 'Atualizar' : 'Finalizar'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
