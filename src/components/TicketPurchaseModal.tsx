import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Building2 } from "lucide-react";
import { formatDocumentInput, getDocumentTypeInfo } from "@/utils/documentValidation";

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  early_bird_price?: number;
  early_bird_end_date?: string;
  currency: string;
  max_quantity?: number;
  includes_tshirt: boolean;
  includes_meal: boolean;
  includes_kit: boolean;
  includes_insurance: boolean;
}

interface Event {
  id: string;
  title: string;
  registration_end: string;
}

interface TicketPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  ticketType: TicketType;
}

const TicketPurchaseModal = ({ isOpen, onClose, event, ticketType }: TicketPurchaseModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    participantName: "",
    participantEmail: "",
    participantPhone: "",
    participantGender: "",
    participantBirthDate: "",
    participantDocumentNumber: "",
    participantNationality: "Portugal",
    emergencyContactName: "",
    emergencyContactPhone: "",
    medicalConditions: "",
    teamName: "",
    tshirtSize: "",
    paymentMethod: "easypay_card"
  });

  const getCurrentPrice = () => {
    if (ticketType.early_bird_end_date && ticketType.early_bird_price) {
      const now = new Date();
      const earlyBirdEnd = new Date(ticketType.early_bird_end_date);
      if (now <= earlyBirdEnd) {
        return ticketType.early_bird_price;
      }
    }
    return ticketType.price;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Clear document field when nationality changes
      if (field === 'participantNationality') {
        updated.participantDocumentNumber = '';
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.participantName || !formData.participantEmail) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Validate MB WAY phone requirement
    if (formData.paymentMethod === 'easypay_mbway' && !formData.participantPhone) {
      toast({
        title: "Campos obrigatórios",
        description: "Telefone é obrigatório para MB WAY",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check if it's an EasyPay payment method
      if (formData.paymentMethod.startsWith('easypay_')) {
        const method = formData.paymentMethod.replace('easypay_', ''); // Remove easypay_ prefix
        
        const { data, error } = await supabase.functions.invoke('create-easypay-registration', {
          body: {
            eventId: event.id,
            ticketTypeId: ticketType.id,
            participantData: formData,
            paymentMethod: method,
            totalAmount: getCurrentPrice()
          }
        });

        if (error) {
          console.error('EasyPay registration error:', error);
          toast({
            title: "Erro no pagamento",
            description: "Ocorreu um erro ao processar o pagamento EasyPay. Tente novamente.",
            variant: "destructive",
          });
          return;
        }

        if (data?.success) {
          toast({
            title: "Registo criado com sucesso!",
            description: `Número de registo: ${data.registration.registration_number || 'Aguardando pagamento'}`,
          });

          // Show payment instructions
          if (data.instructions) {
            if (method === 'multibanco') {
              toast({
                title: "Dados para Pagamento Multibanco",
                description: `Entidade: ${data.payment.entity} | Referência: ${data.payment.reference} | Valor: ${getCurrentPrice()}€`,
              });
            } else if (method === 'mbway') {
              toast({
                title: "Pagamento MB WAY",
                description: "Autorize o pagamento na sua aplicação MB WAY",
              });
            } else {
              toast({
                title: "Instruções de Pagamento",
                description: data.instructions.message || "Siga as instruções de pagamento",
              });
            }
          }
          
          onClose();
        } else {
          throw new Error(data?.error || "Erro ao criar registo EasyPay");
        }
      } else {
        // Original payment flow for bank transfer
        const { data, error } = await supabase.functions.invoke('create-ticket-purchase', {
          body: {
            eventId: event.id,
            ticketTypeId: ticketType.id,
            ...formData
          }
        });

        if (error) throw error;

        if (data.success) {
          toast({
            title: "Registo criado com sucesso!",
            description: `Número de registo: ${data.registration.registration_number}`,
          });
          
          // Show payment instructions for bank transfer
          if (data.payment_instructions) {
            toast({
              title: "Instruções de Pagamento",
              description: data.payment_instructions.message,
            });
          }
          
          onClose();
        } else {
          throw new Error(data.error || "Erro ao criar registo");
        }
      }
    } catch (error) {
      console.error("Error creating registration:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar registo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Inscrever no Evento</DialogTitle>
          <DialogDescription>
            {event.title} - {ticketType.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ticket Info */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">{ticketType.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{ticketType.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">
                {getCurrentPrice()}€
              </span>
              {ticketType.early_bird_end_date && new Date() <= new Date(ticketType.early_bird_end_date) && (
                <span className="text-sm text-green-600">Preço Early Bird!</span>
              )}
            </div>
            
            {/* Includes */}
            <div className="mt-2 text-sm">
              <span className="font-medium">Inclui: </span>
              {[
                ticketType.includes_tshirt && "T-shirt",
                ticketType.includes_meal && "Refeição",
                ticketType.includes_kit && "Kit",
                ticketType.includes_insurance && "Seguro"
              ].filter(Boolean).join(", ") || "Inscrição básica"}
            </div>
          </div>

          {/* Participant Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="participantName">Nome Completo *</Label>
              <Input
                id="participantName"
                value={formData.participantName}
                onChange={(e) => handleInputChange("participantName", e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="participantEmail">Email *</Label>
              <Input
                id="participantEmail"
                type="email"
                value={formData.participantEmail}
                onChange={(e) => handleInputChange("participantEmail", e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="participantPhone">Telefone</Label>
              <Input
                id="participantPhone"
                value={formData.participantPhone}
                onChange={(e) => handleInputChange("participantPhone", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="participantGender">Género</Label>
              <Select value={formData.participantGender} onValueChange={(value) => handleInputChange("participantGender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Feminino</SelectItem>
                  <SelectItem value="Other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="participantBirthDate">Data de Nascimento</Label>
              <Input
                id="participantBirthDate"
                type="date"
                value={formData.participantBirthDate}
                onChange={(e) => handleInputChange("participantBirthDate", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="participantDocumentNumber">{getDocumentTypeInfo(formData.participantNationality).name}</Label>
              <Input
                id="participantDocumentNumber"
                value={formData.participantDocumentNumber}
                onChange={(e) => {
                  const formatted = formatDocumentInput(e.target.value, formData.participantNationality);
                  handleInputChange("participantDocumentNumber", formatted);
                }}
                placeholder={getDocumentTypeInfo(formData.participantNationality).placeholder}
                maxLength={getDocumentTypeInfo(formData.participantNationality).placeholder.length || 20}
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyContactName">Contacto de Emergência</Label>
              <Input
                id="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="emergencyContactPhone">Telefone de Emergência</Label>
              <Input
                id="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
              />
            </div>
          </div>

          {/* Optional Fields */}
          {ticketType.includes_tshirt && (
            <div>
              <Label htmlFor="tshirtSize">Tamanho T-shirt</Label>
              <Select value={formData.tshirtSize} onValueChange={(value) => handleInputChange("tshirtSize", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tamanho" />
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

          {/* Phone field for MB WAY */}
          {formData.paymentMethod === 'easypay_mbway' && (
            <div>
              <Label htmlFor="mbwayPhone">Telefone para MB WAY *</Label>
              <Input
                id="mbwayPhone"
                type="tel"
                value={formData.participantPhone}
                onChange={(e) => handleInputChange("participantPhone", e.target.value)}
                placeholder="9xxxxxxxx"
                required={formData.paymentMethod === 'easypay_mbway'}
              />
            </div>
          )}

          <div>
            <Label htmlFor="teamName">Nome da Equipa (se aplicável)</Label>
            <Input
              id="teamName"
              value={formData.teamName}
              onChange={(e) => handleInputChange("teamName", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="medicalConditions">Condições Médicas</Label>
            <Textarea
              id="medicalConditions"
              value={formData.medicalConditions}
              onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
              placeholder="Indique qualquer condição médica relevante..."
            />
          </div>

          {/* Payment Method */}
          <div>
            <Label htmlFor="paymentMethod">Método de Pagamento</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange("paymentMethod", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easypay_card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Cartão (EasyPay)
                  </div>
                </SelectItem>
                <SelectItem value="easypay_mbway">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    MB WAY (EasyPay)
                  </div>
                </SelectItem>
                <SelectItem value="easypay_multibanco">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Multibanco (EasyPay)
                  </div>
                </SelectItem>
                <SelectItem value="bank_transfer">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Transferência Bancária
                  </div>
                </SelectItem>
                <SelectItem value="credit_card" disabled>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Cartão de Crédito (Em breve)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Inscrição
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TicketPurchaseModal;