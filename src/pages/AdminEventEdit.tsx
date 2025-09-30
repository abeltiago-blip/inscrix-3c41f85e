import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Calendar, MapPin, Users, Euro, CreditCard, Plus, Trash2, Percent, Upload, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { sportCategories, culturalCategories } from "@/data/eventCategories";
import RichTextEditor from "@/components/RichTextEditor";
import AgeGroupSelector from "@/components/AgeGroupSelector";
import { EventImageUploadSection } from "@/components/event-creation/EventImageUploadSection";
import { DocumentUploadSection } from "@/components/event-creation/DocumentUploadSection";
import LocationSelector from "@/components/LocationSelector";

interface TicketType {
  id?: string;
  name: string;
  description: string;
  price: number;
  early_bird_price?: number;
  early_bird_end_date?: string;
  max_quantity?: number;
  includes_tshirt: boolean;
  includes_kit: boolean;
  includes_meal: boolean;
  includes_insurance: boolean;
  age_group?: string;
  min_age?: number;
  max_age?: number;
  gender_restriction?: string;
  is_active: boolean;
}

interface EventCommission {
  id?: string;
  event_id: string;
  commission_type: 'percentage' | 'fixed';
  commission_value: number;
  description: string;
  applies_to_ticket_types?: string[];
  is_active: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  event_type: 'sports' | 'cultural';
  start_date: string;
  end_date: string;
  registration_start: string;
  registration_end: string;
  location: string;
  address: string;
  latitude?: number;
  longitude?: number;
  max_participants: number;
  min_age: number;
  max_age: number;
  requires_medical_certificate: boolean;
  featured: boolean;
  status: 'draft' | 'published' | 'cancelled';
  organizer_notes: string;
  image_url: string;
  organizer_id: string;
  event_regulation?: string;
  terms_and_conditions?: string;
  image_rights_clause?: string;
  liability_waiver?: string;
  regulation_document_url?: string;
  slug?: string;
}

export default function AdminEventEdit() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [eventCommissions, setEventCommissions] = useState<EventCommission[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventImages, setEventImages] = useState<string[]>([]);

  useEffect(() => {
    if (!user || profile?.role !== 'admin') {
      navigate("/admin");
      return;
    }
    if (eventId) {
      loadEvent();
    }
  }, [eventId, user, profile, navigate]);

  const loadEvent = async () => {
    try {
      // Load event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData as Event);

      // Load ticket types
      const { data: ticketData, error: ticketError } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order');

      if (ticketError) throw ticketError;
      setTicketTypes(ticketData || []);

      // Load payment methods (global)
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (paymentError) throw paymentError;
      setPaymentMethods(paymentData || []);

      // Load event commissions
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('event_commissions')
        .select('*')
        .eq('event_id', eventId)
        .eq('is_active', true)
        .order('created_at');

      if (commissionsError) throw commissionsError;
      setEventCommissions((commissionsData || []).map(commission => ({
        ...commission,
        commission_type: commission.commission_type as 'percentage' | 'fixed'
      })));

    } catch (error) {
      console.error('Error loading event:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar evento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!event) return;

    setSaving(true);
    try {
      // Update event
      const { error: eventError } = await supabase
        .from('events')
        .update({
          title: event.title,
          description: event.description,
          category: event.category,
          subcategory: event.subcategory,
          event_type: event.event_type,
          start_date: event.start_date,
          end_date: event.end_date,
          registration_start: event.registration_start,
          registration_end: event.registration_end,
          location: event.location,
          address: event.address,
          latitude: event.latitude,
          longitude: event.longitude,
          max_participants: event.max_participants,
          min_age: event.min_age,
          max_age: event.max_age,
          requires_medical_certificate: event.requires_medical_certificate,
          featured: event.featured,
          status: event.status,
          organizer_notes: event.organizer_notes,
          image_url: event.image_url,
          event_regulation: event.event_regulation,
          terms_and_conditions: event.terms_and_conditions,
          image_rights_clause: event.image_rights_clause,
          liability_waiver: event.liability_waiver,
          regulation_document_url: event.regulation_document_url,
        })
        .eq('id', eventId);

      if (eventError) throw eventError;

      // Update ticket types
      for (const ticket of ticketTypes) {
        if (ticket.id) {
          // Update existing ticket
          const { error } = await supabase
            .from('ticket_types')
            .update({
              name: ticket.name,
              description: ticket.description,
              price: ticket.price,
              early_bird_price: ticket.early_bird_price,
              early_bird_end_date: ticket.early_bird_end_date,
              max_quantity: ticket.max_quantity,
              includes_tshirt: ticket.includes_tshirt,
              includes_kit: ticket.includes_kit,
              includes_meal: ticket.includes_meal,
              includes_insurance: ticket.includes_insurance,
              age_group: ticket.age_group,
              min_age: ticket.min_age,
              max_age: ticket.max_age,
              gender_restriction: ticket.gender_restriction,
              is_active: ticket.is_active,
            })
            .eq('id', ticket.id);
          
          if (error) throw error;
        } else {
          // Create new ticket
          const { error } = await supabase
            .from('ticket_types')
            .insert({
              event_id: eventId,
              name: ticket.name,
              description: ticket.description,
              price: ticket.price,
              early_bird_price: ticket.early_bird_price,
              early_bird_end_date: ticket.early_bird_end_date,
              max_quantity: ticket.max_quantity,
              includes_tshirt: ticket.includes_tshirt,
              includes_kit: ticket.includes_kit,
              includes_meal: ticket.includes_meal,
              includes_insurance: ticket.includes_insurance,
              age_group: ticket.age_group,
              min_age: ticket.min_age,
              max_age: ticket.max_age,
              gender_restriction: ticket.gender_restriction,
              is_active: ticket.is_active,
              sort_order: ticketTypes.indexOf(ticket),
            });
          
          if (error) throw error;
        }
      }

      // Update commissions
      for (const commission of eventCommissions) {
        if (commission.id) {
          // Update existing commission
          const { error } = await supabase
            .from('event_commissions')
            .update({
              commission_type: commission.commission_type,
              commission_value: commission.commission_value,
              description: commission.description,
              applies_to_ticket_types: commission.applies_to_ticket_types,
              is_active: commission.is_active,
            })
            .eq('id', commission.id);
          
          if (error) throw error;
        } else {
          // Create new commission
          const { error } = await supabase
            .from('event_commissions')
            .insert({
              event_id: eventId,
              commission_type: commission.commission_type,
              commission_value: commission.commission_value,
              description: commission.description,
              applies_to_ticket_types: commission.applies_to_ticket_types,
              is_active: commission.is_active,
            });
          
          if (error) throw error;
        }
      }

      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso",
      });

      navigate(`/event/${event.slug || event.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}`);
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar evento",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof Event, value: any) => {
    if (!event) return;
    setEvent({ ...event, [field]: value });
  };

  const addTicketType = () => {
    const newTicket: TicketType = {
      name: "",
      description: "",
      price: 0,
      includes_tshirt: false,
      includes_kit: false,
      includes_meal: false,
      includes_insurance: false,
      is_active: true,
    };
    setTicketTypes([...ticketTypes, newTicket]);
  };

  const updateTicketType = (index: number, field: keyof TicketType, value: any) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTypes(updated);
  };

  const removeTicketType = async (index: number) => {
    const ticket = ticketTypes[index];
    if (ticket.id) {
      // Delete from database
      try {
        const { error } = await supabase
          .from('ticket_types')
          .delete()
          .eq('id', ticket.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Tipo de bilhete removido",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao remover tipo de bilhete",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Remove from state
    const updated = ticketTypes.filter((_, i) => i !== index);
    setTicketTypes(updated);
  };

  const addCommission = () => {
    if (!eventId) return;
    
    const newCommission: EventCommission = {
      event_id: eventId,
      commission_type: 'percentage',
      commission_value: 0,
      description: "",
      applies_to_ticket_types: [],
      is_active: true,
    };
    setEventCommissions([...eventCommissions, newCommission]);
  };

  const updateCommission = (index: number, field: keyof EventCommission, value: any) => {
    const updated = [...eventCommissions];
    updated[index] = { ...updated[index], [field]: value };
    setEventCommissions(updated);
  };

  const removeCommission = async (index: number) => {
    const commission = eventCommissions[index];
    if (commission.id) {
      // Delete from database
      try {
        const { error } = await supabase
          .from('event_commissions')
          .update({ is_active: false })
          .eq('id', commission.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Comissão removida",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao remover comissão",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Remove from state
    const updated = eventCommissions.filter((_, i) => i !== index);
    setEventCommissions(updated);
  };

  const getCategoriesForType = () => {
    return event?.event_type === 'sports' ? sportCategories : culturalCategories;
  };

  const getSubcategoriesForCategory = () => {
    const categories = getCategoriesForType();
    const category = categories.find(cat => cat.name === event?.category);
    return category?.subcategories || [];
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500 text-white';
      case 'draft': return 'bg-yellow-500 text-black';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!event) {
    return <div className="flex items-center justify-center min-h-screen">Evento não encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Editar Evento</h1>
            <p className="text-muted-foreground">Modificar configurações do evento</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusBadgeColor(event.status)}>
              {event.status.toUpperCase()}
            </Badge>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="images">Imagens</TabsTrigger>
              <TabsTrigger value="tickets">Bilhetes</TabsTrigger>
              <TabsTrigger value="terms">Regulamentos</TabsTrigger>
              <TabsTrigger value="payments">Pagamentos</TabsTrigger>
              <TabsTrigger value="commissions">Comissões</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Informações Básicas
                    </CardTitle>
                    <CardDescription>Detalhes principais do evento</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título do Evento</Label>
                      <Input
                        id="title"
                        value={event.title}
                        onChange={(e) => updateField('title', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <RichTextEditor
                        value={event.description || ''}
                        onChange={(value) => updateField('description', value)}
                        placeholder="Descreva o seu evento com detalhes..."
                        rows={6}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="event_type">Tipo de Evento</Label>
                        <Select
                          value={event.event_type}
                          onValueChange={(value: 'sports' | 'cultural') => {
                            updateField('event_type', value);
                            updateField('category', '');
                            updateField('subcategory', '');
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sports">Desportivo</SelectItem>
                            <SelectItem value="cultural">Cultural</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={event.status}
                          onValueChange={(value) => updateField('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Rascunho</SelectItem>
                            <SelectItem value="published">Publicado</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select
                          value={event.category || ''}
                          onValueChange={(value) => {
                            updateField('category', value);
                            updateField('subcategory', '');
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria">
                              {event.category || "Selecione uma categoria"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="z-50 bg-popover">
                            {getCategoriesForType().map((category) => (
                              <SelectItem key={category.name} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subcategory">Subcategoria</Label>
                        <Select
                          value={event.subcategory || ''}
                          onValueChange={(value) => updateField('subcategory', value)}
                          disabled={!event.category}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma subcategoria">
                              {event.subcategory || "Selecione uma subcategoria"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="z-50 bg-popover">
                            {getSubcategoriesForCategory().map((subcategory) => (
                              <SelectItem key={subcategory.name} value={subcategory.name}>
                                {subcategory.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                     </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={event.featured}
                        onCheckedChange={(checked) => updateField('featured', checked)}
                      />
                      <Label htmlFor="featured">Evento em destaque</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requires_medical_certificate"
                        checked={event.requires_medical_certificate}
                        onCheckedChange={(checked) => updateField('requires_medical_certificate', checked)}
                      />
                      <Label htmlFor="requires_medical_certificate">Requer atestado médico</Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Datas do Evento
                    </CardTitle>
                    <CardDescription>Cronograma e períodos</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start_date">Data de Início</Label>
                        <Input
                          id="start_date"
                          type="datetime-local"
                          value={event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : ''}
                          onChange={(e) => updateField('start_date', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end_date">Data de Fim</Label>
                        <Input
                          id="end_date"
                          type="datetime-local"
                          value={event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : ''}
                          onChange={(e) => updateField('end_date', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="registration_start">Início das Inscrições</Label>
                        <Input
                          id="registration_start"
                          type="datetime-local"
                          value={event.registration_start ? new Date(event.registration_start).toISOString().slice(0, 16) : ''}
                          onChange={(e) => updateField('registration_start', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="registration_end">Fim das Inscrições</Label>
                        <Input
                          id="registration_end"
                          type="datetime-local"
                          value={event.registration_end ? new Date(event.registration_end).toISOString().slice(0, 16) : ''}
                          onChange={(e) => updateField('registration_end', e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Configurações de Participação
                    </CardTitle>
                    <CardDescription>Limites e restrições</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_participants">Máximo de Participantes</Label>
                      <Input
                        id="max_participants"
                        type="number"
                        min="1"
                        value={event.max_participants || ''}
                        onChange={(e) => updateField('max_participants', parseInt(e.target.value) || null)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="min_age">Idade Mínima</Label>
                        <Input
                          id="min_age"
                          type="number"
                          min="0"
                          value={event.min_age || ''}
                          onChange={(e) => updateField('min_age', parseInt(e.target.value) || null)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max_age">Idade Máxima</Label>
                        <Input
                          id="max_age"
                          type="number"
                          min="0"
                          value={event.max_age || ''}
                          onChange={(e) => updateField('max_age', parseInt(e.target.value) || null)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organizer_notes">Notas do Organizador</Label>
                      <Textarea
                        id="organizer_notes"
                        value={event.organizer_notes || ''}
                        onChange={(e) => updateField('organizer_notes', e.target.value)}
                        rows={3}
                        placeholder="Informações adicionais para os participantes..."
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Localização
                    </CardTitle>
                    <CardDescription>Local e endereço do evento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LocationSelector
                      location={event.location || ''}
                      address={event.address || ''}
                      latitude={event.latitude}
                      longitude={event.longitude}
                      onLocationChange={(location) => updateField('location', location)}
                      onAddressChange={(address) => updateField('address', address)}
                      onCoordinatesChange={(lat, lng) => {
                        updateField('latitude', lat);
                        updateField('longitude', lng);
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <EventImageUploadSection
                eventId={eventId!}
                images={eventImages}
                onImagesChange={setEventImages}
                primaryImageUrl={event.image_url}
                onPrimaryImageChange={(url) => updateField('image_url', url)}
              />
            </TabsContent>

            <TabsContent value="terms" className="space-y-4">
              <DocumentUploadSection
                eventId={eventId!}
                eventRegulation={event.event_regulation}
                onEventRegulationChange={(value) => updateField('event_regulation', value)}
                regulationDocumentUrl={event.regulation_document_url}
                onRegulationDocumentUrlChange={(url) => updateField('regulation_document_url', url)}
                termsAndConditions={event.terms_and_conditions}
                onTermsAndConditionsChange={(value) => updateField('terms_and_conditions', value)}
                imageRightsClause={event.image_rights_clause}
                onImageRightsClauseChange={(value) => updateField('image_rights_clause', value)}
                liabilityWaiver={event.liability_waiver}
                onLiabilityWaiverChange={(value) => updateField('liability_waiver', value)}
              />
            </TabsContent>

            <TabsContent value="tickets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="h-5 w-5" />
                    Gestão de Bilhetes e Preços
                  </CardTitle>
                  <CardDescription>Configure os tipos de bilhetes disponíveis para este evento</CardDescription>
                  <Button onClick={addTicketType} className="w-fit">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Tipo de Bilhete
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {ticketTypes.map((ticket, index) => (
                    <Card key={index} className="p-4">
                       <div className="flex justify-between items-start mb-4">
                         <h4 className="font-medium">Bilhete #{index + 1}</h4>
                         <div className="flex items-center gap-4">
                           <div className="flex items-center space-x-2">
                             <Switch
                               checked={ticket.is_active}
                               onCheckedChange={(checked) => updateTicketType(index, 'is_active', checked)}
                             />
                             <Label>Ativo</Label>
                           </div>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => removeTicketType(index)}
                             className="text-red-600 hover:text-red-700"
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </div>
                       </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label>Nome do Bilhete</Label>
                          <Input
                            value={ticket.name}
                            onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                            placeholder="Ex: Entrada Geral"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Preço (€)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={ticket.price}
                            onChange={(e) => updateTicketType(index, 'price', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <Label>Descrição</Label>
                        <Textarea
                          value={ticket.description}
                          onChange={(e) => updateTicketType(index, 'description', e.target.value)}
                          placeholder="Descrição do bilhete..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label>Preço Early Bird (€)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={ticket.early_bird_price || ''}
                            onChange={(e) => updateTicketType(index, 'early_bird_price', parseFloat(e.target.value) || null)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Fim Early Bird</Label>
                          <Input
                            type="datetime-local"
                            value={ticket.early_bird_end_date ? new Date(ticket.early_bird_end_date).toISOString().slice(0, 16) : ''}
                            onChange={(e) => updateTicketType(index, 'early_bird_end_date', e.target.value || null)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Quantidade Máxima</Label>
                          <Input
                            type="number"
                            value={ticket.max_quantity || ''}
                            onChange={(e) => updateTicketType(index, 'max_quantity', parseInt(e.target.value) || null)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={ticket.includes_tshirt}
                            onCheckedChange={(checked) => updateTicketType(index, 'includes_tshirt', checked)}
                          />
                          <Label>Inclui T-shirt</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={ticket.includes_kit}
                            onCheckedChange={(checked) => updateTicketType(index, 'includes_kit', checked)}
                          />
                          <Label>Inclui Kit</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={ticket.includes_meal}
                            onCheckedChange={(checked) => updateTicketType(index, 'includes_meal', checked)}
                          />
                          <Label>Inclui Refeição</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={ticket.includes_insurance}
                            onCheckedChange={(checked) => updateTicketType(index, 'includes_insurance', checked)}
                          />
                          <Label>Inclui Seguro</Label>
                        </div>
                      </div>

                       <div className="space-y-6">
                         <div className="grid grid-cols-3 gap-6">
                           <div className="col-span-2">
                             <AgeGroupSelector
                               eventType={event.event_type}
                               eventCategory={event.category}
                               value={{
                                 age_group: ticket.age_group,
                                 min_age: ticket.min_age,
                                 max_age: ticket.max_age
                               }}
                               onChange={(ageConfig) => {
                                 updateTicketType(index, 'age_group', ageConfig.age_group);
                                 updateTicketType(index, 'min_age', ageConfig.min_age);
                                 updateTicketType(index, 'max_age', ageConfig.max_age);
                               }}
                             />
                           </div>
                           
                            <div className="col-span-1 flex flex-col justify-start">
                              <div className="space-y-2 mt-6">
                                <Label>Género</Label>
                                <Select
                                  value={ticket.gender_restriction || 'none'}
                                  onValueChange={(value) => updateTicketType(index, 'gender_restriction', value === 'none' ? null : value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Todos" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">Todos</SelectItem>
                                    <SelectItem value="Masculino">Masculino</SelectItem>
                                    <SelectItem value="Feminino">Feminino</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                         </div>
                       </div>
                     </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Métodos de Pagamento
                  </CardTitle>
                  <CardDescription>Configure os métodos de pagamento disponíveis para este evento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{method.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Provedor: {method.provider}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Taxa: {method.fees_percentage}% + €{method.fees_fixed}
                          </p>
                        </div>
                        <Badge variant={method.is_active ? "default" : "secondary"}>
                          {method.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="commissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="h-5 w-5" />
                    Comissões do Evento
                  </CardTitle>
                  <CardDescription>Configure comissões específicas para este evento</CardDescription>
                  <Button onClick={addCommission} className="w-fit">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Comissão
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {eventCommissions.length === 0 ? (
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <h4 className="font-medium mb-2">Nenhuma comissão personalizada</h4>
                      <p className="text-sm text-muted-foreground">
                        Adicione comissões específicas para este evento. A comissão padrão da plataforma será aplicada se nenhuma comissão personalizada for definida.
                      </p>
                    </div>
                  ) : (
                    eventCommissions.map((commission, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">Comissão #{index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCommission(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label>Descrição da Comissão</Label>
                            <Input
                              value={commission.description}
                              onChange={(e) => updateCommission(index, 'description', e.target.value)}
                              placeholder="Ex: Comissão promocional"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Tipo de Comissão</Label>
                            <Select
                              value={commission.commission_type}
                              onValueChange={(value: 'percentage' | 'fixed') => 
                                updateCommission(index, 'commission_type', value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Percentual (%)</SelectItem>
                                <SelectItem value="fixed">Valor Fixo (€)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label>
                              Valor da Comissão {commission.commission_type === 'percentage' ? '(%)' : '(€)'}
                            </Label>
                            <Input
                              type="number"
                              step={commission.commission_type === 'percentage' ? '0.01' : '0.01'}
                              min="0"
                              max={commission.commission_type === 'percentage' ? '100' : undefined}
                              value={commission.commission_value}
                              onChange={(e) => 
                                updateCommission(index, 'commission_value', parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-6">
                            <Switch
                              checked={commission.is_active}
                              onCheckedChange={(checked) => 
                                updateCommission(index, 'is_active', checked)
                              }
                            />
                            <Label>Comissão Ativa</Label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Aplicar a Tipos de Bilhete (Opcional)</Label>
                          <p className="text-xs text-muted-foreground mb-2">
                            Se não especificado, a comissão aplica-se a todos os tipos de bilhete
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {ticketTypes.map((ticket, ticketIndex) => (
                              <div key={ticketIndex} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`commission-${index}-ticket-${ticketIndex}`}
                                  checked={
                                    !commission.applies_to_ticket_types?.length || 
                                    commission.applies_to_ticket_types?.includes(ticket.id || '')
                                  }
                                  onChange={(e) => {
                                    const currentAppliesTo = commission.applies_to_ticket_types || [];
                                    const ticketId = ticket.id || '';
                                    
                                    if (e.target.checked) {
                                      if (!currentAppliesTo.includes(ticketId)) {
                                        updateCommission(
                                          index, 
                                          'applies_to_ticket_types', 
                                          [...currentAppliesTo, ticketId]
                                        );
                                      }
                                    } else {
                                      updateCommission(
                                        index, 
                                        'applies_to_ticket_types', 
                                        currentAppliesTo.filter(id => id !== ticketId)
                                      );
                                    }
                                  }}
                                />
                                <Label 
                                  htmlFor={`commission-${index}-ticket-${ticketIndex}`}
                                  className="text-sm"
                                >
                                  {ticket.name || `Bilhete ${ticketIndex + 1}`}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                          <div className="text-sm">
                            <strong>Resumo:</strong> {commission.description} - {' '}
                            {commission.commission_type === 'percentage' 
                              ? `${commission.commission_value}%` 
                              : `€${commission.commission_value.toFixed(2)}`
                            }
                            {commission.applies_to_ticket_types?.length ? 
                              ` (aplicado a ${commission.applies_to_ticket_types.length} tipo(s) de bilhete)` : 
                              ' (aplicado a todos os bilhetes)'
                            }
                          </div>
                        </div>
                      </Card>
                    ))
                  )}

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-900">Informação sobre Comissões</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• As comissões personalizadas substituem a comissão padrão da plataforma</li>
                      <li>• Comissões percentuais são calculadas sobre o valor do bilhete</li>
                      <li>• Comissões fixas são aplicadas por bilhete vendido</li>
                      <li>• Apenas comissões ativas são aplicadas nas vendas</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}