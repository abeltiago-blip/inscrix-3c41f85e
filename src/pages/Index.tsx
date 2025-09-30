import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import HeroSection from "@/components/HeroSection";
import OrganizerSection from "@/components/OrganizerSection";
import QuickSignupForm from "@/components/QuickSignupForm";
import WelcomeModal from "@/components/WelcomeModal";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllCategories, getCategoryById } from "@/data/eventCategories";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFirstTimeUser } from "@/hooks/useFirstTimeUser";

// Performance optimized imports


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
  featured: boolean;
  max_participants: number;
  status: string;
  image_url?: string;
}

interface TicketType {
  id: string;
  event_id: string;
  name: string;
  price: number;
  early_bird_price?: number;
  early_bird_end_date?: string;
}

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  const { showWelcomeModal, triggerWelcomeModal, closeWelcomeModal } = useFirstTimeUser();
  
  useEffect(() => {
    fetchEvents();

    // Set up real-time subscription for events updates
    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',  
          table: 'events',
          filter: 'status=eq.published'
        },
        (payload) => {
          console.log('Events updated, refreshing...', payload);
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Batch queries for better performance
      const [eventsResponse, countsResponse] = await Promise.all([
        supabase
          .from('events')
          .select('*')
          .eq('status', 'published')
          .eq('approval_status', 'approved')
          .order('start_date', { ascending: true }),
        supabase
          .from('events')
          .select('category')
          .eq('status', 'published')
          .eq('approval_status', 'approved')
      ]);

      if (eventsResponse.error) throw eventsResponse.error;
      if (countsResponse.error) throw countsResponse.error;

      setEvents(eventsResponse.data || []);

      // Count events by category
      const counts: Record<string, number> = {};
      countsResponse.data?.forEach((event) => {
        counts[event.category] = (counts[event.category] || 0) + 1;
      });
      setEventCounts(counts);

    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar preço do primeiro tipo de bilhete para cada evento
  const getEventPrice = async (eventId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('ticket_types')
        .select('price, early_bird_price, early_bird_end_date')
        .eq('event_id', eventId)
        .eq('is_active', true)
        .order('price', { ascending: true })
        .limit(1);

      if (error || !data || data.length === 0) return 0;

      const ticket = data[0];
      if (ticket.early_bird_price && ticket.early_bird_end_date) {
        const earlyBirdEnd = new Date(ticket.early_bird_end_date);
        const now = new Date();
        return now <= earlyBirdEnd ? ticket.early_bird_price : ticket.price;
      }
      return ticket.price;
    } catch (error) {
      console.error('Erro ao buscar preço:', error);
      return 0;
    }
  };

  // Converter eventos para formato do EventCard
  const convertedEvents = events.map(event => {
    // Mapear tipos de evento para o formato esperado pelo EventCard
    const getEventType = (eventType: string) => {
      switch (eventType) {
        case 'sports': return 'sports' as const;
        case 'cultural': return 'cultural' as const;
        case 'recreational': return 'recreational' as const;
        case 'educational': return 'educational' as const;
        default: return 'cultural' as const;
      }
    };

    return {
      id: event.id,
      title: event.title,
      description: event.description || 'Sem descrição disponível',
      date: new Date(event.start_date).toLocaleDateString('pt-PT'),
      time: new Date(event.start_date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      location: event.location,
      category: event.category,
      type: getEventType(event.event_type),
      participants: 0,
      maxParticipants: event.max_participants || 100,
      price: 0,
      image: event.image_url || undefined,
    };
  });

  // Separar eventos por tipo
  const allEvents = convertedEvents;
  const sportEvents = convertedEvents.filter(event => event.type === 'sports');
  const cultureEvents = convertedEvents.filter(event => 
    event.type === 'cultural' || event.type === 'recreational' || event.type === 'educational'
  );

  // Principais categorias para mostrar
  const mainCategories = [
    "Atletismo", "Ciclismo", "Futebol", "Natação", "Música", 
    "Teatro", "Artes Visuais", "Gastronomia", "Literatura", "Cinema e Audiovisual"
  ];

  // Debug logs removed for production performance
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">{t("home.categories.title")}</h2>
              <p className="text-muted-foreground">{t("home.categories.subtitle")}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mb-12">
            {mainCategories.map((categoryName) => {
              // Find the category ID by name
              const category = getAllCategories().find(cat => cat.name === categoryName);
              const categoryId = category?.id;
              
              return (
                <div 
                  key={categoryName} 
                  className="text-center p-3 md:p-4 border hover:bg-accent hover:text-accent-foreground transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-105"
                  onClick={() => navigate(categoryId ? `/categorias?category=${categoryId}` : '/categorias')}
                >
                  <h3 className="font-semibold text-xs md:text-sm mb-1 line-clamp-2">{categoryName}</h3>
                  <p className="text-xs text-muted-foreground">{eventCounts[categoryName] || 0} {t("home.categories.events")}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <QuickSignupForm onWelcome={triggerWelcomeModal} />
      
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">{t("home.upcomingEvents.title")}</h2>
            <p className="text-muted-foreground">{t("home.upcomingEvents.subtitle")}</p>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">{t("home.upcomingEvents.all")}</TabsTrigger>
              <TabsTrigger value="sport">{t("home.upcomingEvents.sport")}</TabsTrigger>
              <TabsTrigger value="culture">{t("home.upcomingEvents.culture")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-8">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-80 md:h-96 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {convertedEvents.length > 0 ? (
                    convertedEvents.map((event) => (
                      <EventCard key={event.id} {...event} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground">{t("home.upcomingEvents.noEvents")}</p>
                      <Button 
                        onClick={() => navigate('/eventos')} 
                        className="mt-4"
                      >
                        {t("home.upcomingEvents.viewAll")}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="sport" className="mt-8">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-80 md:h-96 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {sportEvents.map((event) => (
                    <EventCard key={event.id} {...event} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="culture" className="mt-8">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-80 md:h-96 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {cultureEvents.map((event) => (
                    <EventCard key={event.id} {...event} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="text-center mt-12">
            <Button size="lg" onClick={() => navigate('/categorias')}>{t("home.upcomingEvents.viewAll")}</Button>
          </div>
        </div>
      </section>

      
      <OrganizerSection />
      <Footer />
      
      <WelcomeModal 
        isOpen={showWelcomeModal} 
        onClose={closeWelcomeModal}
      />
    </div>
  );
};

export default Index;
