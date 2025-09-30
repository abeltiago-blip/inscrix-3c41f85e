import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Smartphone, Building2, ArrowLeft, Users } from "lucide-react";
import Footer from "@/components/Footer";
import ParticipantRegistration, { ParticipantData } from "@/components/ParticipantRegistration";
import { validateDocumentByCountry, getDocumentTypeInfo } from "@/utils/documentValidation";
import { supabase } from "@/integrations/supabase/client";
import { useEmailAutomation } from "@/hooks/useEmailAutomation";

export default function Checkout() {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mbway");
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Check if all items have participant data (skip participant section)
  const hasAllParticipantData = items.every(item => item.participantData);
  
  // Estado para os dados dos participantes (apenas se necessário)
  const [participantsData, setParticipantsData] = useState<Record<string, ParticipantData[]>>({});
  
  // Email automation hook
  const { triggerRegistrationFlow } = useEmailAutomation({
    enableAutoEmails: true,
    onEmailSent: (result) => {
      console.log('Email sent successfully:', result);
    },
    onEmailError: (error) => {
      console.error('Email sending failed:', error);
    }
  });
  
  const [billingData, setBillingData] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    taxNumber: "",
    companyName: "",
    isCompany: false,
    isFinalConsumer: false,
  });

  const [isCompanyBilling, setIsCompanyBilling] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setBillingData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompanyChange = (isCompany: boolean) => {
    setIsCompanyBilling(isCompany);
    console.log('Company billing changed to:', isCompany);
    setBillingData(prev => ({ 
      ...prev, 
      isCompany,
      isFinalConsumer: isCompany ? false : prev.isFinalConsumer,
      // Clear company-specific fields when switching to individual
      ...(isCompany ? {} : { companyName: "" })
    }));
  };

  const handleFinalConsumerChange = (isFinalConsumerValue: boolean) => {
    console.log('Final consumer changed to:', isFinalConsumerValue);
    setBillingData(prev => ({ 
      ...prev, 
      isFinalConsumer: isFinalConsumerValue,
      // Clear non-essential fields when switching to final consumer
      ...(isFinalConsumerValue ? { 
        name: "", 
        email: user?.email || "", 
        phone: "", 
        address: "", 
        city: "", 
        postalCode: "", 
        taxNumber: "" 
      } : {})
    }));
  };

  const handleParticipantsChange = (itemKey: string, participants: ParticipantData[]) => {
    setParticipantsData(prev => ({
      ...prev,
      [itemKey]: participants
    }));
  };

  const validateParticipants = async () => {
    // Se todos os itens já têm dados de participante, não precisa validar
    if (hasAllParticipantData) {
      const allDocuments: string[] = [];
      
      for (const item of items) {
        if (!item.participantData) continue;
        
        const participant = item.participantData;
        
        // Check for duplicates within the current cart
        if (allDocuments.includes(participant.documentNumber)) {
          return `Cartão de Cidadão duplicado no carrinho: ${participant.name} tem o mesmo Cartão de Cidadão que outro participante`;
        }
        allDocuments.push(participant.documentNumber);

        // Check for duplicates in the database
        try {
          const { data: existingRegistration } = await supabase
            .from('registrations')
            .select('id')
            .eq('event_id', item.eventId)
            .eq('participant_document_number', participant.documentNumber)
            .eq('status', 'active')
            .maybeSingle();

          if (existingRegistration) {
            return `O Cartão de Cidadão de ${participant.name} já está registado neste evento`;
          }
        } catch (error) {
          console.error('Error checking document duplicates:', error);
          return `Erro ao validar Cartões de Cidadão. Tente novamente.`;
        }
      }
      return null;
    }
    
    // Validação original para itens sem dados de participante
    const allDocuments: string[] = [];
    
    for (const item of items) {
      const itemKey = `${item.eventId}-${item.ticketTypeId}`;
      const participants = participantsData[itemKey] || [];
      
      if (participants.length !== item.quantity) {
        return `Dados em falta para ${item.eventTitle}`;
      }

      for (let i = 0; i < item.quantity; i++) {
        const participant = participants[i];
        if (!participant?.name || !participant?.email || !participant?.phone || 
            !participant?.birthDate || !participant?.gender || !participant?.nationality) {
          return `Dados obrigatórios em falta para o participante ${i + 1} de ${item.eventTitle}`;
        }

        // Validar documento
        if (!participant.documentNumber) {
          return `Cartão de Cidadão é obrigatório para o participante ${i + 1} de ${item.eventTitle}`;
        }
        
        const validation = validateDocumentByCountry(participant.documentNumber, participant.nationality);
        if (!validation.isValid) {
          return `${validation.documentType} inválido para o participante ${i + 1} de ${item.eventTitle}: ${validation.message}`;
        }

        // Check for duplicates within the current cart
        if (allDocuments.includes(participant.documentNumber)) {
          return `Cartão de Cidadão duplicado no carrinho: o participante ${i + 1} de ${item.eventTitle} tem o mesmo Cartão de Cidadão que outro participante`;
        }
        allDocuments.push(participant.documentNumber);

        // Check for duplicates in the database
        try {
          const { data: existingRegistration } = await supabase
            .from('registrations')
            .select('id')
            .eq('event_id', item.eventId)
            .eq('participant_document_number', participant.documentNumber)
            .eq('status', 'active')
            .maybeSingle();

          if (existingRegistration) {
            return `O Cartão de Cidadão do participante ${i + 1} de ${item.eventTitle} já está registado neste evento`;
          }
        } catch (error) {
          console.error('Error checking document duplicates:', error);
          return `Erro ao validar Cartões de Cidadão. Tente novamente.`;
        }
      }
    }
    return null;
  };

  const createRealRegistrations = async () => {
    console.log('Creating real registrations...');
    const createdRegistrations = [];
    
    try {
      // For each item, create registrations
      for (const item of items) {
        if (item.participantData) {
          // Item já tem dados de participante
          const participant = item.participantData;
          
          console.log(`Creating registration for participant:`, participant);
          
          const registrationData = {
            event_id: item.eventId,
            ticket_type_id: item.ticketTypeId,
            user_id: user?.id || null,
            participant_id: user?.id || null,
            participant_name: participant.name,
            participant_email: participant.email,
            participant_phone: participant.phone,
            participant_birth_date: participant.birthDate,
            participant_gender: participant.gender,
            participant_nationality: participant.nationality,
            participant_document_number: participant.documentNumber || null,
            participant_nif: participant.nif || null,
            emergency_contact_name: participant.emergencyContactName || null,
            emergency_contact_phone: participant.emergencyContactPhone || null,
            tshirt_size: participant.tshirtSize || null,
            team_name: participant.teamName || null,
            medical_conditions: participant.medicalConditions || null,
            amount_paid: item.price,
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'transfer' ? 'pending' : 'paid',
            status: 'active'
          };
          
          const { data: registration, error: regError } = await supabase
            .from('registrations')
            .insert([registrationData])
            .select()
            .single();
            
          if (regError) {
            console.error('Error creating registration:', regError);
            throw regError;
          }
          
          console.log('Registration created:', registration);
          createdRegistrations.push(registration);
          
          // Trigger email automation for each registration
          if (registration?.id) {
            await triggerRegistrationFlow(registration.id);
          }
        } else {
          // Item não tem dados de participante - usar o fluxo original
          const itemKey = `${item.eventId}-${item.ticketTypeId}`;
          const participants = participantsData[itemKey] || [];
          
          for (let i = 0; i < item.quantity; i++) {
            const participant = participants[i];
            if (!participant) continue;
            
            console.log(`Creating registration for participant ${i + 1}:`, participant);
            
            const registrationData = {
              event_id: item.eventId,
              ticket_type_id: item.ticketTypeId,
              user_id: user?.id || null,
              participant_id: user?.id || null,
              participant_name: participant.name,
              participant_email: participant.email,
              participant_phone: participant.phone,
              participant_birth_date: participant.birthDate,
              participant_gender: participant.gender,
              participant_nationality: participant.nationality,
              participant_document_number: participant.documentNumber || null,
              participant_nif: participant.nif || null,
              emergency_contact_name: participant.emergencyContactName || null,
              emergency_contact_phone: participant.emergencyContactPhone || null,
              tshirt_size: participant.tshirtSize || null,
              team_name: null,
              medical_conditions: participant.medicalConditions || null,
              amount_paid: item.price,
              payment_method: paymentMethod,
              payment_status: paymentMethod === 'transfer' ? 'pending' : 'paid',
              status: 'active'
            };
            
            const { data: registration, error: regError } = await supabase
              .from('registrations')
              .insert([registrationData])
              .select()
              .single();
              
            if (regError) {
              console.error('Error creating registration:', regError);
              throw regError;
            }
            
            console.log('Registration created:', registration);
            createdRegistrations.push(registration);
            
            // Trigger email automation for each registration
            if (registration?.id) {
              await triggerRegistrationFlow(registration.id);
            }
          }
        }
      }
      
      // Create order record
      const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
      const orderData = {
        user_id: user?.id || null,
        event_id: items[0]?.eventId || null,
        order_number: orderNumber,
        subtotal: getTotal(),
        total_amount: getTotal(),
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'transfer' ? 'pending' : 'paid',
        status: 'completed',
        metadata: JSON.parse(JSON.stringify({
          billing_data: billingData,
          participants_count: items.length, // Each item is now one participant
          items_count: items.length
        }))
      };
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();
        
      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }
      
      console.log('Order created:', order);
      
      return { registrations: createdRegistrations, order };
      
    } catch (error) {
      console.error('Error in createRealRegistrations:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with billing data:', billingData);
    console.log('Is final consumer:', billingData.isFinalConsumer);
    console.log('Is company:', isCompanyBilling);
    
    // Validate billing data based on consumer type
    if (!billingData.isFinalConsumer) {
      if (isCompanyBilling) {
        // Company validation
        if (!billingData.companyName || !billingData.name || !billingData.email || 
            !billingData.phone || !billingData.taxNumber || !billingData.address || 
            !billingData.city || !billingData.postalCode) {
          toast({
            title: "Dados de Faturação",
            description: "Todos os campos são obrigatórios para empresas.",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Individual validation (particular)
        if (!billingData.name || !billingData.email || !billingData.taxNumber) {
          toast({
            title: "Dados de Faturação",
            description: "Nome, email e NIF são obrigatórios para particulares.",
            variant: "destructive",
          });
          return;
        }
      }
    }
    // Final consumer has no mandatory fields
    
    // Validar dados dos participantes
    const participantError = await validateParticipants();
    if (participantError) {
      toast({
        title: "Dados dos Participantes",
        description: participantError,
        variant: "destructive",
      });
      return;
    }
    
    if (!acceptTerms) {
      toast({
        title: "Termos e Condições",
        description: "Deve aceitar os termos e condições para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Não há itens no carrinho para processar.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Login Necessário",
        description: "É necessário estar autenticado para completar a inscrição.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Starting checkout process...');
      
      // Create real registrations and order in database
      const { registrations, order } = await createRealRegistrations();
      
      toast({
        title: "Inscrição Concluída!",
        description: "A sua inscrição foi processada com sucesso. Receberá um email de confirmação em breve.",
      });
      
      // Clear cart after successful processing
      clearCart();
      
      // Navigate to success page with real data
      navigate("/order-received", { 
        state: { 
          orderData: { 
            items, 
            total: getTotal(), 
            paymentMethod,
            billingData,
            participantsData,
            registrations,
            order
          } 
        } 
      });
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      
      // Check if it's a duplicate document error from database constraint
      if (error.message?.includes('duplicate key value violates unique constraint') || 
          error.message?.includes('idx_registrations_unique_document_per_event')) {
        toast({
          title: "Documento duplicado",
          description: "Um dos Cartões de Cidadão já está registado neste evento. Verifique os dados e tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro no processamento",
          description: error.message || "Ocorreu um erro ao processar a inscrição. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Carrinho vazio</h2>
            <p className="text-muted-foreground mb-6">
              Não há itens no carrinho para processar.
            </p>
            <Button onClick={() => navigate("/eventos")}>
              Explorar Eventos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => navigate("/cart")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao carrinho
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Dados dos Participantes - apenas se necessário */}
            {!hasAllParticipantData && items.map((item) => {
              const itemKey = `${item.eventId}-${item.ticketTypeId}`;
              return (
                <ParticipantRegistration
                  key={itemKey}
                  eventTitle={item.eventTitle}
                  ticketTypeName={item.ticketTypeName}
                  quantity={item.quantity}
                  participants={participantsData[itemKey] || []}
                  onParticipantsChange={(participants) => 
                    handleParticipantsChange(itemKey, participants)
                  }
                />
              );
            })}

            {/* Mostrar resumo dos participantes se já existirem */}
            {hasAllParticipantData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Participantes
                  </CardTitle>
                  <CardDescription>
                    Dados dos participantes já preenchidos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{item.eventTitle}</h4>
                          <p className="text-sm text-muted-foreground">{item.ticketTypeName}</p>
                        </div>
                      </div>
                      {item.participantData && (
                        <div className="mt-3 p-3 bg-muted rounded-md">
                          <p className="font-medium">{item.participantData.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.participantData.email} • CC: {item.participantData.documentNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

              {/* Dados de Faturação */}
              <Card>
                <CardHeader>
                  <CardTitle>Dados de Faturação</CardTitle>
                  <CardDescription>
                    Preencha os seus dados para a faturação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tipo de Faturação */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Tipo de Faturação</Label>
                    <RadioGroup 
                      value={isCompanyBilling ? "company" : "individual"} 
                      onValueChange={(value) => handleCompanyChange(value === "company")}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="individual" id="individual" />
                        <Label htmlFor="individual" className="cursor-pointer">
                          Particular
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="company" id="company" />
                        <Label htmlFor="company" className="cursor-pointer">
                          Empresa
                        </Label>
                      </div>
                    </RadioGroup>
                    
                    {/* Opção Consumidor Final - apenas para particulares */}
                    {!isCompanyBilling && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                         <div className="flex items-center space-x-2">
                           <Checkbox
                             id="finalConsumer"
                             checked={billingData.isFinalConsumer}
                             onCheckedChange={(checked) => handleFinalConsumerChange(checked as boolean)}
                           />
                          <Label htmlFor="finalConsumer" className="cursor-pointer text-sm">
                            Consumidor Final (sem dados obrigatórios)
                          </Label>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isCompanyBilling ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Nome da Empresa *</Label>
                          <Input
                            id="companyName"
                            value={billingData.companyName}
                            onChange={(e) => handleInputChange("companyName", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">Pessoa de Contacto *</Label>
                          <Input
                            id="name"
                            value={billingData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            required
                          />
                        </div>
                      </>
                    ) : (
                       <div className="space-y-2">
                         <Label htmlFor="name">
                           Nome Completo {!billingData.isFinalConsumer ? "*" : ""}
                         </Label>
                         <Input
                           id="name"
                           value={billingData.name}
                           onChange={(e) => handleInputChange("name", e.target.value)}
                         />
                       </div>
                    )}
                     <div className="space-y-2">
                       <Label htmlFor="email">
                         Email {!billingData.isFinalConsumer ? "*" : ""}
                       </Label>
                       <Input
                         id="email"
                         type="email"
                         value={billingData.email}
                         onChange={(e) => handleInputChange("email", e.target.value)}
                       />
                     </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={billingData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required={isCompanyBilling}
                      />
                    </div>
                     <div className="space-y-2">
                       <Label htmlFor="taxNumber">
                         {isCompanyBilling ? "NIPC *" : (!isCompanyBilling && !billingData.isFinalConsumer) ? "NIF *" : "NIF"}
                       </Label>
                       <Input
                         id="taxNumber"
                         value={billingData.taxNumber}
                         onChange={(e) => handleInputChange("taxNumber", e.target.value)}
                         placeholder={isCompanyBilling ? "Número de Identificação de Pessoa Coletiva" : "Número de Identificação Fiscal"}
                       />
                     </div>
                     {/* Campos de morada - ocultos para consumidor final */}
                     {(isCompanyBilling || !billingData.isFinalConsumer) && (
                      <>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address">
                            Morada {isCompanyBilling ? "*" : ""}
                          </Label>
                          <Input
                            id="address"
                            value={billingData.address}
                            onChange={(e) => handleInputChange("address", e.target.value)}
                            required={isCompanyBilling}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">
                            Cidade {isCompanyBilling ? "*" : ""}
                          </Label>
                          <Input
                            id="city"
                            value={billingData.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                            required={isCompanyBilling}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postalCode">
                            Código Postal {isCompanyBilling ? "*" : ""}
                          </Label>
                          <Input
                            id="postalCode"
                            value={billingData.postalCode}
                            onChange={(e) => handleInputChange("postalCode", e.target.value)}
                            required={isCompanyBilling}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Método de Pagamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Método de Pagamento</CardTitle>
                  <CardDescription>
                    Escolha como pretende pagar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="mbway" id="mbway" />
                      <Label htmlFor="mbway" className="flex items-center gap-2 cursor-pointer">
                        <Smartphone className="h-5 w-5" />
                        MB WAY
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                        <CreditCard className="h-5 w-5" />
                        Cartão de Crédito/Débito
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="multibanco" id="multibanco" />
                      <Label htmlFor="multibanco" className="flex items-center gap-2 cursor-pointer">
                        <Building2 className="h-5 w-5" />
                        Multibanco
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="transfer" id="transfer" />
                      <Label htmlFor="transfer" className="flex items-center gap-2 cursor-pointer">
                        <Building2 className="h-5 w-5" />
                        Transferência Bancária
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Termos e Condições */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      Li e aceito os{" "}
                      <Link to="/termosecondicoesinscrix" className="text-primary hover:underline">
                        Termos e Condições
                      </Link>{" "}
                      e a{" "}
                      <Link to="/politica-privacidade" className="text-primary hover:underline">
                        Política de Privacidade
                      </Link>
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumo do Pedido */}
            <div className="space-y-4">
              <div className="sticky top-4 z-10">
                <Card className="shadow-lg border-primary/20">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                    <CardTitle className="text-center">Resumo do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>
                            {item.eventTitle}
                            {item.participantData ? ` - ${item.participantData.name}` : ` x${item.quantity}`}
                          </span>
                          <span>€{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>€{getTotal().toFixed(2)}</span>
                    </div>
                    <Button 
                      type="submit"
                      className="w-full" 
                      size="lg"
                      disabled={loading || !acceptTerms}
                    >
                      {loading ? "A processar..." : "Finalizar Pagamento"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}