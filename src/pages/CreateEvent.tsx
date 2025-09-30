import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, MapPin, Euro, Save, Eye, X, Plus, Upload, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sportCategories, culturalCategories } from "@/data/eventCategories";
import LocationSelector from "@/components/LocationSelector";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RichTextEditor from "@/components/RichTextEditor";
import { ImageUploadSection } from "@/components/event-creation/ImageUploadSection";
import { AgeGroupSelector } from "@/components/event-creation/AgeGroupSelector";
import { TicketConfiguration } from "@/components/event-creation/TicketConfiguration";
import { RegistrationFieldsConfiguration } from "@/components/event-creation/RegistrationFieldsConfiguration";
import organizerHero from "@/assets/organizer-hero.jpg";
import { CheckCircle, Calendar, Users, BarChart3 } from "lucide-react";

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

interface EventFormData {
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
  max_participants: string;
  min_age: string;
  max_age: string;
  requires_medical_certificate: boolean;
  organizer_notes: string;
  images: string[];
  registration_fields: RegistrationField[];
  event_regulation: string;
  terms_and_conditions: string;
  image_rights_clause: string;
  liability_waiver: string;
}

interface AgeGroup {
  id: string;
  name: string;
  minAge: number | null;
  maxAge: number | null;
  genders: string[];
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
  min_age?: string;
  max_age?: string;
  gender_restriction: string;
  custom_extras: string[];
  seating_zones: string[];
  has_seating: boolean;
}

export default function CreateEvent() {
  const { user, profile } = useAuth();
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(false);
  const isEditing = !!eventId;
  
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    // Scroll to top when changing tabs
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to top when component mounts and load event data if editing
  useEffect(() => {
    window.scrollTo(0, 0);
    if (isEditing && eventId) {
      loadEventData(eventId);
    }
  }, [eventId, isEditing]);

  // Check if user needs organizer access - removed redirect
  const needsOrganizerAccess = !user || (profile?.role !== 'organizer' && profile?.role !== 'admin');

  const [eventData, setEventData] = useState<EventFormData>({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    event_type: 'sports',
    start_date: "",
    end_date: "",
    registration_start: new Date().toISOString().slice(0, 16),
    registration_end: "",
    location: "",
    address: "",
    max_participants: "",
    min_age: "",
    max_age: "",
    requires_medical_certificate: false,
    organizer_notes: "",
    images: [],
    registration_fields: [],
    event_regulation: "",
    terms_and_conditions: "",
    image_rights_clause: "",
    liability_waiver: ""
  });

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    {
      name: "Inscrição Geral",
      description: "Entrada padrão para o evento",
      price: "0",
      max_quantity: "",
      early_bird_price: "",
      early_bird_end_date: "",
      includes_tshirt: false,
      includes_kit: false,
      includes_meal: false,
      includes_insurance: false,
      min_age: "",
      max_age: "",
      gender_restriction: "",
      custom_extras: [],
      seating_zones: [],
      has_seating: false
    }
  ]);

  const [selectedAgeGroups, setSelectedAgeGroups] = useState<AgeGroup[]>([]);

  const handleRegistrationFieldsChange = (fields: RegistrationField[]) => {
    setEventData(prev => ({ ...prev, registration_fields: fields }));
  };

  const handleInputChange = (field: keyof EventFormData, value: string | boolean | string[]) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  const handleTicketChange = (index: number, field: keyof TicketType, value: string | boolean) => {
    setTicketTypes(prev => 
      prev.map((ticket, i) => 
        i === index ? { ...ticket, [field]: value } : ticket
      )
    );
  };

  const addTicketType = () => {
    setTicketTypes(prev => [...prev, {
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
      min_age: "",
      max_age: "",
      gender_restriction: "",
      custom_extras: [],
      seating_zones: [],
      has_seating: false
    }]);
  };

  const removeTicketType = (index: number) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    if (!eventData.title || !eventData.category || !eventData.start_date || 
        !eventData.registration_end || !eventData.location || !eventData.address) {
      return "Por favor, preencha todos os campos obrigatórios";
    }
    // Temporary Disable due to date issue in event creation 
    // if (new Date(eventData.start_date) <= new Date()) {
    //   return "A data do evento deve ser no futuro";
    // }

    if (new Date(eventData.registration_end) >= new Date(eventData.start_date)) {
      return "O fim das inscrições deve ser antes do início do evento";
    }

    for (const ticket of ticketTypes) {
      if (!ticket.name || !ticket.price) {
        return "Todos os tipos de bilhete devem ter nome e preço";
      }
      if (parseFloat(ticket.price) < 0) {
        return "O preço não pode ser negativo";
      }
    }

    return null;
  };

  const loadEventData = async (eventId: string) => {
    try {
      setLoading(true);
      
      // Load event data
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      // Check if user can edit this event
      if (eventData.organizer_id !== user?.id && profile?.role !== 'admin') {
        toast({
          title: "Acesso negado",
          description: "Não tem permissão para editar este evento",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      // Load ticket types
      const { data: ticketTypesData, error: ticketError } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order');

      if (ticketError) throw ticketError;

      // Update form data
      setEventData({
        title: eventData.title || "",
        description: eventData.description || "",
        category: eventData.category || "",
        subcategory: eventData.subcategory || "",
        event_type: (eventData.event_type as 'sports' | 'cultural') || 'sports',
        start_date: eventData.start_date ? eventData.start_date.slice(0, 16) : "",
        end_date: eventData.end_date ? eventData.end_date.slice(0, 16) : "",
        registration_start: eventData.registration_start ? eventData.registration_start.slice(0, 16) : "",
        registration_end: eventData.registration_end ? eventData.registration_end.slice(0, 16) : "",
        location: eventData.location || "",
        address: eventData.address || "",
        max_participants: eventData.max_participants?.toString() || "",
        min_age: eventData.min_age?.toString() || "",
        max_age: eventData.max_age?.toString() || "",
        requires_medical_certificate: eventData.requires_medical_certificate || false,
        organizer_notes: eventData.organizer_notes || "",
        images: eventData.image_url ? [eventData.image_url] : [],
        registration_fields: [],
        event_regulation: eventData.event_regulation || "",
        terms_and_conditions: eventData.terms_and_conditions || "",
        image_rights_clause: eventData.image_rights_clause || "",
        liability_waiver: eventData.liability_waiver || ""
      });

      // Update ticket types
      if (ticketTypesData && ticketTypesData.length > 0) {
        setTicketTypes(ticketTypesData.map(ticket => ({
          id: ticket.id,
          name: ticket.name || "",
          description: ticket.description || "",
          price: ticket.price?.toString() || "0",
          max_quantity: ticket.max_quantity?.toString() || "",
          early_bird_price: ticket.early_bird_price?.toString() || "",
          early_bird_end_date: ticket.early_bird_end_date || "",
          includes_tshirt: ticket.includes_tshirt || false,
          includes_kit: ticket.includes_kit || false,
          includes_meal: ticket.includes_meal || false,
          includes_insurance: ticket.includes_insurance || false,
          min_age: ticket.min_age?.toString() || "",
          max_age: ticket.max_age?.toString() || "",
          gender_restriction: ticket.gender_restriction || "",
          custom_extras: [],
          seating_zones: [],
          has_seating: false
        })));
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar evento",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const saveEvent = async (status: 'draft' | 'published') => {
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Erro de validação",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { images, registration_fields, ...eventDataWithoutExtraFields } = eventData;
      const eventPayload = {
        ...eventDataWithoutExtraFields,
        end_date: eventData.end_date || null,
        image_url: images.length > 0 ? images[0] : null,
        organizer_id: user!.id,
        status,
        max_participants: eventData.max_participants ? parseInt(eventData.max_participants) : null,
        min_age: eventData.min_age ? parseInt(eventData.min_age) : null,
        max_age: eventData.max_age ? parseInt(eventData.max_age) : null,
      };

      let eventResult;

      if (isEditing) {
        // Update existing event
        const { data: updatedEvent, error: updateError } = await supabase
          .from('events')
          .update(eventPayload)
          .eq('id', eventId)
          .select()
          .single();

        if (updateError) throw updateError;
        eventResult = updatedEvent;

        // Delete existing ticket types
        const { error: deleteError } = await supabase
          .from('ticket_types')
          .delete()
          .eq('event_id', eventId);

        if (deleteError) throw deleteError;
      } else {
        // Create new event
        const { data: newEvent, error: eventError } = await supabase
          .from('events')
          .insert(eventPayload)
          .select()
          .single();

        if (eventError) throw eventError;
        eventResult = newEvent;
      }

      // Create ticket types
      const ticketPayloads = ticketTypes.map((ticket, index) => ({
        event_id: eventResult.id,
        name: ticket.name,
        description: ticket.description,
        price: parseFloat(ticket.price),
        max_quantity: ticket.max_quantity ? parseInt(ticket.max_quantity) : null,
        early_bird_price: ticket.early_bird_price ? parseFloat(ticket.early_bird_price) : null,
        early_bird_end_date: ticket.early_bird_end_date || null,
        includes_tshirt: ticket.includes_tshirt,
        includes_kit: ticket.includes_kit,
        includes_meal: ticket.includes_meal,
        includes_insurance: ticket.includes_insurance,
        min_age: ticket.min_age ? parseInt(ticket.min_age) : null,
        max_age: ticket.max_age ? parseInt(ticket.max_age) : null,
        gender_restriction: ticket.gender_restriction || null,
        sort_order: index
      }));

      const { error: ticketError } = await supabase
        .from('ticket_types')
        .insert(ticketPayloads);

      if (ticketError) throw ticketError;

      toast({
        title: isEditing 
          ? (status === 'draft' ? "Evento atualizado como rascunho" : "Evento atualizado e publicado!")
          : (status === 'draft' ? "Evento salvo como rascunho" : "Evento publicado com sucesso!"),
        description: isEditing 
          ? "As alterações foram guardadas"
          : (status === 'draft' 
              ? "Pode continuar a editar o evento mais tarde" 
              : "O evento está agora disponível para inscrições"),
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: isEditing ? "Erro ao atualizar evento" : "Erro ao criar evento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoriesForType = () => {
    return eventData.event_type === 'sports' ? sportCategories : culturalCategories;
  };

  const getSubcategoriesForCategory = () => {
    const categories = getCategoriesForType();
    const category = categories.find(cat => cat.id === eventData.category || cat.name === eventData.category);
    return category?.subcategories || [];
  };

  // Show organizer registration page if not authorized
  if (needsOrganizerAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="relative">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
            <div className="container mx-auto px-6 py-16 lg:py-24">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                      Crie Eventos
                      <span className="text-primary block">Extraordinários</span>
                    </h1>
                    <p className="text-xl text-muted-foreground">
                      hello anjali Torne-se um organizador Inscrix e aceda a ferramentas profissionais para criar, gerir e promover os seus eventos desportivos e culturais.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild size="lg" className="text-lg px-8">
                      <Link to="/register?tab=organizer">Criar Conta de Organizador</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="text-lg px-8">
                      <Link to="/login">Já tenho conta</Link>
                    </Button>
                  </div>
                </div>
                
                <div className="relative">
                  <img 
                    src={organizerHero} 
                    alt="Organizador profissional criando eventos" 
                    className="rounded-2xl shadow-2xl"
                  />
                  <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-4 rounded-xl shadow-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">Plataforma Profissional</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="container mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Porquê Escolher a Inscrix?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Ferramentas completas para organizar eventos profissionais com facilidade
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center p-6">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Gestão Completa</h3>
                  <p className="text-muted-foreground">
                    Crie eventos com imagens, escalões personalizados, tipos de bilhetes e campos de inscrição adaptados.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Inscrições Automáticas</h3>
                  <p className="text-muted-foreground">
                    Sistema de inscrições online, pagamentos seguros, check-in com QR Code e gestão de participantes.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Relatórios & Analytics</h3>
                  <p className="text-muted-foreground">
                    Acompanhe inscrições, receitas, estatísticas detalhadas e gere relatórios profissionais.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <div className="container mx-auto px-6 py-16 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Pronto para Começar?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Junte-se a centenas de organizadores que confiam na Inscrix
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                  <Link to="/register?tab=organizer">Registar como Organizador</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  <Link to="/login">Iniciar Sessão</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto p-6 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {isEditing ? "Editar Evento" : "Criar Novo Evento"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing 
              ? "Altere os detalhes do seu evento" 
              : "Configure o seu evento com imagens, escalões personalizados e bilhetes avançados"}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="relative">
            {/* Desktop TabsList */}
            <TabsList className="hidden lg:grid w-full grid-cols-6">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="images">Imagens</TabsTrigger>
              <TabsTrigger value="tickets">Bilhetes</TabsTrigger>
              <TabsTrigger value="registration">Inscrições</TabsTrigger>
              <TabsTrigger value="terms">Termos</TabsTrigger>
              <TabsTrigger value="review">Revisão</TabsTrigger>
            </TabsList>
            
            {/* Mobile TabsList - Scrollable */}
            <div className="lg:hidden">
              <div className="overflow-x-auto scrollbar-hide">
                <TabsList className="inline-flex w-max min-w-full">
                  <TabsTrigger value="details" className="whitespace-nowrap px-4">Detalhes</TabsTrigger>
                  <TabsTrigger value="images" className="whitespace-nowrap px-4">Imagens</TabsTrigger>
                  <TabsTrigger value="tickets" className="whitespace-nowrap px-4">Bilhetes</TabsTrigger>
                  <TabsTrigger value="registration" className="whitespace-nowrap px-4">Inscrições</TabsTrigger>
                  <TabsTrigger value="terms" className="whitespace-nowrap px-4">Termos</TabsTrigger>
                  <TabsTrigger value="review" className="whitespace-nowrap px-4">Revisão</TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Informações do Evento
              </CardTitle>
              <CardDescription>
                Defina os detalhes básicos do seu evento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Evento *</Label>
                  <Input
                    id="title"
                    value={eventData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ex: Maratona da Liberdade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_type">Tipo de Evento *</Label>
                  <Select
                    value={eventData.event_type}
                    onValueChange={(value: 'sports' | 'cultural') => {
                      handleInputChange('event_type', value);
                      handleInputChange('category', '');
                      handleInputChange('subcategory', '');
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
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={eventData.category}
                    onValueChange={(value) => {
                      handleInputChange('category', value);
                      handleInputChange('subcategory', '');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                     <SelectContent>
                       {getCategoriesForType().map((category) => (
                         <SelectItem key={category.id} value={category.id}>
                           {category.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategoria</Label>
                   <Select
                     value={eventData.subcategory}
                     onValueChange={(value) => handleInputChange('subcategory', value === "none" ? "" : value)}
                     disabled={!eventData.category}
                   >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma subcategoria" />
                    </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="none">Nenhuma subcategoria</SelectItem>
                       {getSubcategoriesForCategory().map((subcategory) => (
                         <SelectItem key={subcategory.id} value={subcategory.name}>
                           {subcategory.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={eventData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva o seu evento com detalhes..."
                  rows={6}
                  className="resize-vertical"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Data de Início *</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={eventData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">Data de Fim</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={eventData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="registration_start">Início das Inscrições</Label>
                  <Input
                    id="registration_start"
                    type="datetime-local"
                    value={eventData.registration_start}
                    onChange={(e) => handleInputChange('registration_start', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration_end">Fim das Inscrições *</Label>
                  <Input
                    id="registration_end"
                    type="datetime-local"
                    value={eventData.registration_end}
                    onChange={(e) => handleInputChange('registration_end', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Age Groups Section for Sports Events */}
          {eventData.event_type === 'sports' && eventData.category && (
            <Card>
              <CardHeader>
                <CardTitle>Escalões Etários</CardTitle>
                <CardDescription>
                  Configure os escalões etários para o seu evento desportivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AgeGroupSelector
                  selectedAgeGroups={selectedAgeGroups}
                  onAgeGroupsChange={setSelectedAgeGroups}
                  category={eventData.category}
                  subcategory={eventData.subcategory}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <LocationSelector
                location={eventData.location}
                address={eventData.address}
                onLocationChange={(location) => handleInputChange('location', location)}
                onAddressChange={(address) => handleInputChange('address', address)}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => handleTabChange("images")}>
              Próximo: Imagens
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <ImageUploadSection 
            images={eventData.images}
            onImagesChange={(images) => handleInputChange('images', images)}
          />
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => handleTabChange("details")}>
              Anterior: Detalhes
            </Button>
            <Button onClick={() => handleTabChange("tickets")}>
              Próximo: Bilhetes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <TicketConfiguration 
            ticketTypes={ticketTypes}
            onTicketTypesChange={setTicketTypes}
          />
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => handleTabChange("images")}>
              Anterior: Imagens
            </Button>
            <Button onClick={() => handleTabChange("registration")}>
              Próximo: Inscrições
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="registration" className="space-y-6">
          <RegistrationFieldsConfiguration
            eventType={eventData.event_type}
            fields={eventData.registration_fields}
            onFieldsChange={handleRegistrationFieldsChange}
          />
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => handleTabChange("tickets")}>
              Anterior: Bilhetes
            </Button>
            <Button onClick={() => handleTabChange("terms")}>
              Próximo: Termos
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="terms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regulamento e Termos do Evento</CardTitle>
              <CardDescription>
                Defina o regulamento e termos que os participantes devem aceitar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="event_regulation">Regulamento do Evento</Label>
                <div className="space-y-3">
                  <Textarea
                    id="event_regulation"
                    value={eventData.event_regulation}
                    onChange={(e) => handleInputChange('event_regulation', e.target.value)}
                    placeholder="Defina as regras específicas do evento, categorias, condições de participação, equipamentos necessários, etc..."
                    rows={6}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      id="event_regulation_file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Here you would typically upload the file and set the URL
                          console.log('File selected:', file.name);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('event_regulation_file')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Carregar ficheiro
                    </Button>
                    <span className="text-sm text-muted-foreground">ou escreva no campo acima</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Este regulamento será mostrado aos participantes durante a inscrição
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms_and_conditions">Termos e Condições Gerais</Label>
                <div className="space-y-3">
                  <Textarea
                    id="terms_and_conditions"
                    value={eventData.terms_and_conditions}
                    onChange={(e) => handleInputChange('terms_and_conditions', e.target.value)}
                    placeholder="Condições gerais de participação, políticas de cancelamento, reembolsos, etc..."
                    rows={4}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      id="terms_conditions_file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          console.log('File selected:', file.name);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('terms_conditions_file')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Carregar ficheiro
                    </Button>
                    <span className="text-sm text-muted-foreground">ou escreva no campo acima</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_rights_clause">Autorização de Uso de Imagem</Label>
                <div className="space-y-3">
                  <Textarea
                    id="image_rights_clause"
                    value={eventData.image_rights_clause}
                    onChange={(e) => handleInputChange('image_rights_clause', e.target.value)}
                    placeholder="Eu autorizo a Inscrix e os organizadores do evento a utilizarem a minha imagem em fotografias e vídeos..."
                    rows={3}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      id="image_rights_file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          console.log('File selected:', file.name);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('image_rights_file')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Carregar ficheiro
                    </Button>
                    <span className="text-sm text-muted-foreground">ou escreva no campo acima</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Texto padrão: "Autorizo a captação e utilização da minha imagem em fotografias e vídeos durante o evento para fins promocionais e de divulgação."
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="liability_waiver">Termo de Responsabilidade</Label>
                <div className="space-y-3">
                  <Textarea
                    id="liability_waiver"
                    value={eventData.liability_waiver}
                    onChange={(e) => handleInputChange('liability_waiver', e.target.value)}
                    placeholder="Participo no evento por minha conta e risco, isentando os organizadores..."
                    rows={3}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      id="liability_waiver_file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          console.log('File selected:', file.name);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('liability_waiver_file')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Carregar ficheiro
                    </Button>
                    <span className="text-sm text-muted-foreground">ou escreva no campo acima</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Texto padrão: "Participo no evento por minha conta e risco, isentando a Inscrix e os organizadores de qualquer responsabilidade por eventuais acidentes ou danos."
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">
                      Importante
                    </h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>
                        Os termos definidos aqui serão obrigatórios durante a inscrição. 
                        Certifique-se de que estão completos e em conformidade com a legislação aplicável.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => handleTabChange("registration")}>
              Anterior: Inscrições
            </Button>
            <Button onClick={() => handleTabChange("review")}>
              Próximo: Revisão
            </Button>
          </div>


        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Revisão Final
              </CardTitle>
              <CardDescription>
                Reveja todos os detalhes antes de publicar o evento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Título do Evento</h3>
                  <p className="text-muted-foreground">{eventData.title || "Não definido"}</p>
                </div>

                <div>
                  <h3 className="font-medium">Categoria</h3>
                  <p className="text-muted-foreground">
                    {eventData.category || "Não definido"}
                    {eventData.subcategory && ` - ${eventData.subcategory}`}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Imagens</h3>
                  <p className="text-muted-foreground">
                    {eventData.images.length > 0 
                      ? `${eventData.images.length} imagens carregadas`
                      : "Nenhuma imagem carregada"
                    }
                  </p>
                  {eventData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {eventData.images.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                      ))}
                      {eventData.images.length > 3 && (
                        <div className="flex items-center justify-center bg-muted rounded h-20 text-sm text-muted-foreground">
                          +{eventData.images.length - 3} mais
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-medium">Data e Hora</h3>
                  <p className="text-muted-foreground">
                    {eventData.start_date 
                      ? new Date(eventData.start_date).toLocaleString('pt-PT')
                      : "Não definido"
                    }
                    {eventData.end_date && (
                      ` até ${new Date(eventData.end_date).toLocaleString('pt-PT')}`
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Localização</h3>
                  <p className="text-muted-foreground">{eventData.location || "Não definido"}</p>
                  <p className="text-sm text-muted-foreground">{eventData.address}</p>
                </div>

                {eventData.event_type === 'sports' && (
                  <div>
                    <h3 className="font-medium">Escalões Etários</h3>
                    <p className="text-muted-foreground">
                      {selectedAgeGroups.length > 0 
                        ? `${selectedAgeGroups.length} escalões configurados`
                        : "Nenhum escalão específico"
                      }
                    </p>
                    {selectedAgeGroups.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {selectedAgeGroups.map((group) => (
                          <div key={group.id} className="text-sm text-muted-foreground">
                            • {group.name} ({group.minAge || "0"}-{group.maxAge || "∞"} anos)
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="font-medium">Tipos de Bilhetes ({ticketTypes.length})</h3>
                  <div className="space-y-2">
                    {ticketTypes.map((ticket, index) => (
                      <div key={index} className="p-3 bg-accent text-accent-foreground rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{ticket.name}</span>
                          <span className="text-primary font-medium">€{ticket.price}</span>
                        </div>
                        {ticket.description && (
                          <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                        )}
                        {ticket.has_seating && (
                          <p className="text-xs text-blue-600 mt-1">✓ Com lugares marcados</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => handleTabChange("terms")}>
              Anterior: Termos
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => saveEvent('draft')}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Rascunho
              </Button>
              <Button
                onClick={() => saveEvent('published')}
                disabled={loading}
              >
                {loading ? "A publicar..." : "Publicar Evento"}
              </Button>
            </div>
          </div>
        </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}