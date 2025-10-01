import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Users, Clock, Euro, Share2, Heart, ChevronLeft, ChevronRight, Shield, Package, Utensils, User, ShoppingCart, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ParticipantRegistrationModal from "@/components/ParticipantRegistrationModal";
import RegulationModal from "@/components/RegulationModal";
import { supabase } from "@/integrations/supabase/client";
import { getCategoryById } from "@/data/eventCategories";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  address: string;
  category: string;
  subcategory?: string;
  event_type: string;
  registration_start: string;
  registration_end: string;
  max_participants: number;
  min_age?: number;
  max_age?: number;
  requires_medical_certificate: boolean;
  organizer_notes?: string;
  status: string;
  image_url?: string;
  event_regulation?: string;
  terms_and_conditions?: string;
  liability_waiver?: string;
  image_rights_clause?: string;
  regulation_document_url?: string;
}

interface LocalTicketType {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  early_bird_price?: number;
  early_bird_end_date?: string;
  includes_kit: boolean;
  includes_meal: boolean;
  includes_tshirt: boolean;
  includes_insurance: boolean;
  max_quantity?: number;
  is_active: boolean;
  gender_restriction?: string;
  age_group?: string;
  min_age?: number;
  max_age?: number;
}

export default function EventDetail() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem, addParticipantItem } = useCart();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<LocalTicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showRegulationModal, setShowRegulationModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (slug) {
      fetchEventDetails();
    }
  }, [slug]);

  // Scroll to top when component mounts or event changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);

      // Buscar evento na base de dados
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug!)
        .eq('status', 'published')
        .maybeSingle();
      
      if (eventError || !eventData) {
        toast({
          title: "Evento não encontrado",
          description: "O evento que procura não existe ou não está disponível",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setEvent(eventData);

      // Buscar contagem de registrations
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', eventData.id)
        .eq('status', 'active');

      if (!registrationsError && registrationsData) {
        setRegistrationCount(registrationsData.length);
      }

      // Buscar tipos de bilhete
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', eventData.id)
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (!ticketsError && ticketsData) {
        setTicketTypes(ticketsData);
      }

    } catch (error: any) {
      toast({
        title: "Erro ao carregar evento",
        description: error.message || 'Ocorreu um erro inesperado',
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    if (!isRegistrationOpen()) {
      toast({
        title: "Inscrições não disponíveis",
        description: getRegistrationStatus(),
        variant: "destructive"
      });
      return;
    }
    setShowRegistrationModal(true);
  };

  const handleAddParticipantToCart = (participantData: any, ticketType: LocalTicketType) => {
    if (!event) return;
    
    const currentPrice = getCurrentPrice(ticketType);
    
    addParticipantItem({
      eventId: event.id,
      eventTitle: event.title,
      ticketTypeId: ticketType.id,
      ticketTypeName: ticketType.name,
      price: currentPrice,
      eventDate: event.start_date,
      eventLocation: event.location,
    }, participantData);
  };

  const handleAddToCart = (ticket: LocalTicketType) => {
    if (!event) return;
    
    const currentPrice = getCurrentPrice(ticket);
    
    addItem({
      eventId: event.id,
      eventTitle: event.title,
      ticketTypeId: ticket.id,
      ticketTypeName: ticket.name,
      price: currentPrice,
      eventDate: event.start_date,
      eventLocation: event.location,
    });

    toast({
      title: "Adicionado ao carrinho!",
      description: `${ticket.name} - ${event.title}`,
    });
  };

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

  const isRegistrationOpen = () => {
    if (!event) return false;
    const now = new Date();
    const registrationStart = new Date(event.registration_start);
    const registrationEnd = new Date(event.registration_end);
    return now >= registrationStart && now <= registrationEnd;
  };

  const getRegistrationStatus = () => {
    if (!event) return '';
    const now = new Date();
    const registrationStart = new Date(event.registration_start);
    const registrationEnd = new Date(event.registration_end);
    
    if (now < registrationStart) {
      return t('eventDetails.status_registration_soon');
    } else if (now > registrationEnd) {
      return t('eventDetails.status_registration_closed');
    } else {
      return t('eventDetails.status_registration_open');
    }
  };

  const nextImage = () => {
    // Para eventos sem imagens, usar imagem padrão
    setCurrentImageIndex(0);
  };

  const prevImage = () => {
    // Para eventos sem imagens, usar imagem padrão
    setCurrentImageIndex(0);
  };

  // URL da imagem padrão baseada no tipo de evento
  const getEventImage = () => {
    if (event?.image_url) {
      return event.image_url;
    }
    if (event?.event_type === 'sports') {
      return '/placeholder.svg'; // Imagem padrão para eventos desportivos
    }
    return '/placeholder.svg'; // Imagem padrão para eventos culturais
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="h-8 bg-muted rounded animate-pulse"></div>
            <div className="h-64 bg-muted rounded animate-pulse"></div>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-4">
                <div className="h-6 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="h-96 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{t('eventDetails.event_not_found_title')}</h1>
            <Button onClick={() => navigate('/')}>{t('eventDetails.back_to_home')}</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => navigate('/')} className="hover:text-primary">
            {t('eventDetails.breadcrumb_home')}
          </button>
          <span>/</span>
          <button onClick={() => navigate('/eventos')} className="hover:text-primary">
            {t('eventDetails.breadcrumb_events')}
          </button>
          <span>/</span>
          <span className="text-foreground">{event.title}</span>
        </div>

        {/* Image Gallery */}
        <div className="relative mb-8">
            {/* Image Gallery */}
            <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden rounded-xl">
            <img
              src={getEventImage()}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Event Type Badge */}
            <div className="absolute top-3 sm:top-6 left-3 sm:left-6">
              <Badge variant="secondary" className="bg-white/90 text-foreground text-xs sm:text-sm">
                {event.event_type === 'sports' ? t('eventDetails.event_type_sports') : t('eventDetails.event_type_cultural')}
              </Badge>
            </div>

            {/* Share Button */}
            <div className="absolute top-3 sm:top-6 right-3 sm:right-6 flex gap-2">
              <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white h-8 w-8 sm:h-10 sm:w-10 p-0">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white h-8 w-8 sm:h-10 sm:w-10 p-0">
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>

            {/* Event Title Overlay */}
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 text-white max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-3rem)]">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 line-clamp-2">{event.title}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  {new Date(event.start_date).toLocaleDateString('pt-PT')}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Event Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{event.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <Badge variant="outline">
                        {getCategoryById(event.category)?.name || event.category}
                      </Badge>
                      {event.subcategory && <Badge variant="outline">{event.subcategory}</Badge>}
                      <span className="text-sm text-muted-foreground">
                        {registrationCount} inscritos
                      </span>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge 
                      variant={isRegistrationOpen() ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {getRegistrationStatus()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {event.description && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('eventDetails.description')}</h3>
                    <MarkdownRenderer 
                      content={event.description} 
                      className="text-muted-foreground leading-relaxed"
                    />
                  </div>
                )}

                <Separator />

                {/* Event Details Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">{t('eventDetails.date_and_time')}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(event.start_date).toLocaleString('pt-PT')}
                          {event.end_date && (
                            <> até {new Date(event.end_date).toLocaleString('pt-PT')}</>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">{t('eventDetails.location')}</div>
                        <div className="text-sm text-muted-foreground">{event.location}</div>
                        <div className="text-xs text-muted-foreground">{event.address}</div>
                      </div>
                    </div>

                    {event.max_participants && (
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">{t('eventDetails.participants')}</div>
                          <div className="text-sm text-muted-foreground">
                            {t('eventDetails.max_participants')}: {event.max_participants}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Inscrições</div>
                        <div className="text-sm text-muted-foreground">
                          Até {new Date(event.registration_end).toLocaleDateString('pt-PT')}
                        </div>
                      </div>
                    </div>

                    {(event.min_age || event.max_age) && (
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">{t('eventDetails.age')}</div>
                          <div className="text-sm text-muted-foreground">
                            {event.min_age && event.max_age 
                              ? `${event.min_age} - ${event.max_age} anos`
                              : event.min_age 
                                ? `Mínimo ${event.min_age} anos`
                                : `Máximo ${event.max_age} anos`
                            }
                          </div>
                        </div>
                      </div>
                    )}

                    {event.requires_medical_certificate && (
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">Requisitos</div>
                          <div className="text-sm text-muted-foreground">
                            Atestado médico obrigatório
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {event.organizer_notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">{t('eventDetails.additional_info')}</h3>
                      <MarkdownRenderer 
                        content={event.organizer_notes} 
                        className="text-sm text-muted-foreground"
                      />
                    </div>
                  </>
                )}

                {event.event_regulation && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold mb-1">{t('eventDetails.regulation')}</h3>
                        <p className="text-sm text-muted-foreground">
                          Consulte o regulamento completo do evento
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowRegulationModal(true)}
                        className="gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        {t('eventDetails.view_regulation')}
                      </Button>
                    </div>
                  </>
                )}

                {event.terms_and_conditions && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">{t('eventDetails.terms_and_conditions')}</h3>
                      <MarkdownRenderer 
                        content={event.terms_and_conditions} 
                        className="text-sm text-muted-foreground"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Tickets */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  {t('eventDetails.tickets_available')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticketTypes.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>{t('eventDetails.no_tickets_available')}</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {ticketTypes.map((ticket) => {
                        const currentPrice = getCurrentPrice(ticket);
                        const earlyBird = isEarlyBird(ticket);
                        
                        return (
                          <div key={ticket.id} className="border border-border/60 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground">{ticket.name}</h4>
                                {ticket.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {ticket.description}
                                  </p>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <div className="font-bold text-xl text-primary">
                                  €{currentPrice.toFixed(2)}
                                </div>
                                {earlyBird && ticket.price > currentPrice && (
                                  <div className="text-xs text-muted-foreground line-through">
                                    €{ticket.price.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {earlyBird && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                                  Early Bird até {new Date(ticket.early_bird_end_date).toLocaleDateString('pt-PT')}
                                </Badge>
                              )}
                              
                              {ticket.gender_restriction && (
                                <Badge variant="outline" className="text-xs">
                                  <User className="h-3 w-3 mr-1" />
                                  {ticket.gender_restriction === 'male' ? 'Masculino' : 
                                   ticket.gender_restriction === 'female' ? 'Feminino' : 
                                   'Misto'}
                                </Badge>
                              )}
                              
                              {(ticket.age_group || ticket.min_age || ticket.max_age) && (
                                <Badge variant="outline" className="text-xs">
                                  <User className="h-3 w-3 mr-1" />
                                  {ticket.age_group || 
                                   (ticket.min_age && ticket.max_age ? `${ticket.min_age}-${ticket.max_age} anos` :
                                    ticket.min_age ? `+${ticket.min_age} anos` :
                                    ticket.max_age ? `-${ticket.max_age} anos` : '')
                                  }
                                </Badge>
                              )}
                            </div>

                            {/* Inclusions */}
                            {(ticket.includes_tshirt || ticket.includes_kit || ticket.includes_meal || ticket.includes_insurance) && (
                              <div className="space-y-2 pt-2 border-t border-border/30">
                                <div className="text-xs font-medium text-foreground">{t('eventDetails.includes')}:</div>
                                <div className="flex flex-wrap gap-2">
                                  {ticket.includes_tshirt && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                                      <Package className="h-3 w-3 text-primary" />
                                      {t('eventDetails.tshirt')}
                                    </div>
                                  )}
                                  {ticket.includes_kit && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                                      <Package className="h-3 w-3 text-primary" />
                                      {t('eventDetails.kit')}
                                    </div>
                                  )}
                                  {ticket.includes_meal && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                                      <Utensils className="h-3 w-3 text-primary" />
                                      {t('eventDetails.meal')}
                                    </div>
                                  )}
                                  {ticket.includes_insurance && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                                      <Shield className="h-3 w-3 text-primary" />
                                      {t('eventDetails.insurance')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2">
                      <Button
                        className="w-full h-12"
                        onClick={handleRegisterClick}
                        disabled={!isRegistrationOpen()}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Inscrever
                      </Button>
                    </div>
                  </>
                )}

                {isRegistrationOpen() && (
                  <div className="text-xs text-muted-foreground text-center mt-4">
                    <p>Inscrições encerram em {new Date(event.registration_end).toLocaleDateString('pt-PT')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Participant Registration Modal */}
      {showRegistrationModal && event && (
        <ParticipantRegistrationModal
          isOpen={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          event={{
            id: event.id,
            title: event.title,
            start_date: event.start_date,
            location: event.location,
            liability_waiver: event.liability_waiver,
          }}
          ticketTypes={ticketTypes}
          onAddToCart={handleAddParticipantToCart}
        />
      )}

      {/* Regulation Modal */}
      {showRegulationModal && event && (
        <RegulationModal
          isOpen={showRegulationModal}
          onClose={() => setShowRegulationModal(false)}
          eventTitle={event.title}
          regulationText={event.event_regulation}
          documentUrl={event.regulation_document_url}
        />
      )}

      <Footer />
    </div>
  );
}
