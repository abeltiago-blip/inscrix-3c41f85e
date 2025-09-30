import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Calendar, Phone, Mail, MapPin, Users, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { validateDocumentByCountry, getDocumentTypeInfo, formatDocumentInput } from "@/utils/documentValidation";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface ParticipantData {
  id: string;
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
}

interface ParticipantRegistrationProps {
  eventTitle: string;
  ticketTypeName: string;
  quantity: number;
  participants: ParticipantData[];
  onParticipantsChange: (participants: ParticipantData[]) => void;
}

export default function ParticipantRegistration({
  eventTitle,
  ticketTypeName,
  quantity,
  participants,
  onParticipantsChange
}: ParticipantRegistrationProps) {
  const { user, profile } = useAuth();
  const [useMyData, setUseMyData] = useState(false);
  const [documentValidation, setDocumentValidation] = useState<Record<number, { isValid: boolean; message: string }>>({});

  const updateParticipant = (index: number, field: keyof ParticipantData, value: string) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    
    // Validate document when document number or nationality changes
    if (field === 'documentNumber' || field === 'nationality') {
      const participant = updated[index];
      if (field === 'nationality') {
        // Clear document number when nationality changes
        updated[index].documentNumber = '';
        setDocumentValidation(prev => {
          const updatedValidation = { ...prev };
          delete updatedValidation[index];
          return updatedValidation;
        });
      } else if (participant.documentNumber) {
        const validation = validateDocumentByCountry(participant.documentNumber, participant.nationality);
        setDocumentValidation(prev => ({
          ...prev,
          [index]: validation
        }));
      }
    }
    
    onParticipantsChange(updated);
  };

  const handleUseMyData = (checked: boolean) => {
    console.log('HandleUseMyData clicked:', checked);
    console.log('Profile data:', profile);
    console.log('Current participants:', participants);
    
    setUseMyData(checked);
    if (checked && profile && participants.length > 0) {
      const updated = [...participants];
      
      // Extract birth date from user metadata if available
      const birthDate = profile.user_id ? 
        (profile as any).birth_date || '' : '';
      
      updated[0] = {
        ...updated[0],
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        email: profile.email || '',
        phone: profile.phone || '',
        birthDate: birthDate,
        gender: (profile as any).gender || '',
        documentNumber: (profile as any).document_number || '',
        nationality: (profile as any).nationality || 'Portugal'
      };
      
      console.log('Updated participant:', updated[0]);
      onParticipantsChange(updated);
    } else if (!checked) {
      // Clear first participant data when unchecked
      const updated = [...participants];
      updated[0] = {
        ...updated[0],
        name: '',
        email: '',
        phone: '',
        birthDate: '',
        gender: '',
        documentNumber: '',
        nationality: 'Portugal'
      };
      onParticipantsChange(updated);
    }
  };

  // Initialize participants if not already done
  if (participants.length !== quantity) {
    const newParticipants: ParticipantData[] = Array.from({ length: quantity }, (_, i) => ({
      id: `${eventTitle}-${ticketTypeName}-${i}`,
      name: "",
      email: "",
      phone: "",
      birthDate: "",
      gender: "",
      documentNumber: "",
      nationality: "Portugal",
      emergencyContactName: "",
      emergencyContactPhone: "",
      medicalConditions: "",
      tshirtSize: ""
    }));
    onParticipantsChange(newParticipants);
  }

  function renderParticipantForm(index: number) {
    const participant = participants[index] || {
      id: `${eventTitle}-${ticketTypeName}-${index}`,
      name: "", email: "", phone: "", birthDate: "", gender: "", 
      documentNumber: "", nationality: "Portugal", emergencyContactName: "", 
      emergencyContactPhone: "", medicalConditions: "", tshirtSize: ""
    };

    // Get document type info based on nationality
    const documentTypeInfo = getDocumentTypeInfo(participant.nationality);

    return (
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4" />
          <h3 className="font-semibold">Participante {index + 1}</h3>
        </div>

        {/* Dados Pessoais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`name-${index}`}>Nome Completo *</Label>
            <Input
              id={`name-${index}`}
              value={participant.name}
              onChange={(e) => updateParticipant(index, 'name', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`documentNumber-${index}`}>
              {documentTypeInfo.name} *
            </Label>
            <Input
              id={`documentNumber-${index}`}
              value={participant.documentNumber}
              onChange={(e) => {
                const formatted = formatDocumentInput(e.target.value, participant.nationality);
                updateParticipant(index, 'documentNumber', formatted);
              }}
              placeholder={documentTypeInfo.placeholder}
              required
              maxLength={documentTypeInfo.placeholder.length || 20}
              className={documentValidation[index] && !documentValidation[index].isValid ? 'border-destructive' : ''}
            />
            {documentValidation[index] && (
              <Alert variant={documentValidation[index].isValid ? 'default' : 'destructive'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {documentValidation[index].message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`email-${index}`}>Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id={`email-${index}`}
                type="email"
                value={participant.email}
                onChange={(e) => updateParticipant(index, 'email', e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`phone-${index}`}>Telefone *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id={`phone-${index}`}
                value={participant.phone}
                onChange={(e) => updateParticipant(index, 'phone', e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`birthDate-${index}`}>Data de Nascimento *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id={`birthDate-${index}`}
                type="date"
                value={participant.birthDate}
                onChange={(e) => updateParticipant(index, 'birthDate', e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

           <div className="space-y-2">
             <Label htmlFor={`gender-${index}`}>Género *</Label>
             <Select onValueChange={(value) => updateParticipant(index, 'gender', value)} value={participant.gender}>
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
             <Label htmlFor={`nationality-${index}`}>Nacionalidade *</Label>
             <div className="relative">
               <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
               <Select 
                 onValueChange={(value) => {
                   updateParticipant(index, 'nationality', value);
                 }}
                 value={participant.nationality}
               >
                 <SelectTrigger className="pl-10">
                   <SelectValue placeholder="Selecione a nacionalidade" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="Portugal">Portugal</SelectItem>
                   <SelectItem value="Espanha">Espanha</SelectItem>
                   <SelectItem value="França">França</SelectItem>
                   <SelectItem value="Itália">Itália</SelectItem>
                   <SelectItem value="Alemanha">Alemanha</SelectItem>
                   <SelectItem value="Reino Unido">Reino Unido</SelectItem>
                   <SelectItem value="Brasil">Brasil</SelectItem>
                   <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                   <SelectItem value="Outro">Outro</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </div>

           <div className="space-y-2">
             <Label htmlFor={`tshirtSize-${index}`}>Tamanho T-Shirt</Label>
             <Select onValueChange={(value) => updateParticipant(index, 'tshirtSize', value)} value={participant.tshirtSize}>
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
        </div>

        {/* Contacto de Emergência */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Contacto de Emergência</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`emergencyName-${index}`}>Nome</Label>
              <Input
                id={`emergencyName-${index}`}
                value={participant.emergencyContactName}
                onChange={(e) => updateParticipant(index, 'emergencyContactName', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`emergencyPhone-${index}`}>Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id={`emergencyPhone-${index}`}
                  value={participant.emergencyContactPhone}
                  onChange={(e) => updateParticipant(index, 'emergencyContactPhone', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Condições Médicas */}
        <div className="space-y-2">
          <Label htmlFor={`medical-${index}`}>Condições Médicas / Alergias</Label>
          <Textarea
            id={`medical-${index}`}
            value={participant.medicalConditions}
            onChange={(e) => updateParticipant(index, 'medicalConditions', e.target.value)}
            placeholder="Indique qualquer condição médica, alergia ou medicação relevante..."
            rows={3}
          />
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Dados dos Participantes
        </CardTitle>
        <CardDescription>
          {eventTitle} - {ticketTypeName} ({quantity} participante{quantity > 1 ? 's' : ''})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Opção para usar dados do utilizador logado - apenas para o primeiro participante */}
        {profile && (
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-my-data"
                checked={useMyData}
                onCheckedChange={handleUseMyData}
              />
              <Label htmlFor="use-my-data" className="text-sm font-medium">
                Usar os meus dados para o primeiro participante
              </Label>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Preenche automaticamente os dados do primeiro participante com as informações da sua conta.
            </p>
          </div>
        )}

        {quantity > 1 ? (
          <Tabs defaultValue="0" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1">
              {Array.from({ length: Math.min(quantity, 6) }, (_, index) => (
                <TabsTrigger key={index} value={index.toString()}>
                  Participante {index + 1}
                </TabsTrigger>
              ))}
              {quantity > 6 && (
                <div className="text-xs text-muted-foreground p-2">
                  +{quantity - 6} mais
                </div>
              )}
            </TabsList>
            
            {Array.from({ length: quantity }, (_, index) => (
              <TabsContent key={index} value={index.toString()}>
                {renderParticipantForm(index)}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          renderParticipantForm(0)
        )}
      </CardContent>
    </Card>
  );
}