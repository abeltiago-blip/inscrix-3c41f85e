import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, Trophy, Music, Theater, Coffee, Gamepad2, Heart, Book, Briefcase, Palette, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { getAllCategories, getCategoryById } from "@/data/eventCategories";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  location: string;
  category: string;
  event_type: string;
  max_participants: number;
  image_url: string;
}

const EventsByCategory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category') || null
  );
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});
  
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update selected category when URL params change
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    setSelectedCategory(categoryFromUrl);
  }, [searchParams]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('🔍 EventsByCategory: Fetching events...');
      
      // Buscar eventos publicados
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('start_date', { ascending: true });

      if (eventsError) {
        console.error('❌ EventsByCategory: Error fetching events:', eventsError);
        throw eventsError;
      }

      console.log('✅ EventsByCategory: Events fetched:', eventsData?.length || 0);
      setEvents(eventsData || []);

      // Buscar contagem de registrations para cada evento
      if (eventsData && eventsData.length > 0) {
        const eventIds = eventsData.map(e => e.id);
        const { data: registrationsData, error: registrationsError } = await supabase
          .from('registrations')
          .select('event_id')
          .in('event_id', eventIds)
          .eq('status', 'active');

        if (!registrationsError && registrationsData) {
          const counts: Record<string, number> = {};
          registrationsData.forEach((reg) => {
            counts[reg.event_id] = (counts[reg.event_id] || 0) + 1;
          });
          setRegistrationCounts(counts);
          console.log('✅ EventsByCategory: Registration counts loaded:', counts);
        }
      }

    } catch (error) {
      console.error('❌ EventsByCategory: Error in fetchEvents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obter todas as categorias ordenadas por quantidade de eventos
  const allCategories = getAllCategories();
  console.log('📋 EventsByCategory: All categories:', allCategories.length);
  
  // Calcular contagens de eventos por categoria baseado nos eventos reais
  const eventCounts = events.reduce((acc, event) => {
    const category = getCategoryById(event.category);
    const categoryName = category?.name || event.category;
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📊 EventsByCategory: Event counts per category:', eventCounts);
  console.log('🎯 EventsByCategory: Events found:', events.map(e => ({ title: e.title, category: e.category, mapped: getCategoryById(e.category)?.name })));

  // Ordenar categorias por quantidade de eventos (decrescente) - inclui todas as categorias mesmo sem eventos
  const sortedCategories = allCategories
    .sort((a, b) => (eventCounts[b.name] || 0) - (eventCounts[a.name] || 0))
    .filter(category => eventCounts[category.name] > 0); // Show only categories with events
    
  console.log('🎯 EventsByCategory: Sorted categories with events:', sortedCategories.length);
  
  // Mapear ícones para categorias
  const getCategoryIcon = (categoryId: string) => {
    const iconMap: { [key: string]: any } = {
      // Desporto
      'atletismo': Trophy,
      'futebol': Trophy,
      'natacao': Trophy, 
      'ciclismo': Trophy,
      'basquetebol': Trophy,
      'andebol': Trophy,
      'voleibol': Trophy,
      'tenis': Trophy,
      'artes-marciais': Trophy,
      'ginastica': Trophy,
      'rugby': Trophy,
      'hoquei': Trophy,
      'golfe': Trophy,
      'padel': Trophy,
      'surf': Trophy,
      'vela': Trophy,
      'desportos-motorizados': Trophy,
      'desportos-radicais': Trophy,
      'desportos-inverno': Trophy,
      'outros-desportos': Trophy,
      
      // Cultura
      'musica': Music,
      'teatro': Theater,
      'danca': Music,
      'artes-visuais': Palette,
      'literatura': Book,
      'cinema': Palette,
      'fotografia': Palette,
      'artesanato': Palette,
      'gastronomia': Coffee,
      'patrimonio': Book,
      'workshops-formacao': Briefcase,
      'conferencias-palestras': Briefcase,
      'exposicoes': Palette,
      'festivais': Music,
      'outros-culturais': Palette
    };
    return iconMap[categoryId] || Trophy;
  };

  // Filtrar eventos pela categoria selecionada
  const filteredEvents = selectedCategory 
    ? events.filter(event => {
        const category = getCategoryById(event.category);
        return event.category === selectedCategory || category?.id === selectedCategory;
      })
    : events;

  // Converter eventos para formato do EventCard
  const convertedEvents = filteredEvents.map(event => {
    const category = getCategoryById(event.category);
    const participantCount = registrationCounts[event.id] || 0;
    
    return {
      id: event.id,
      title: event.title,
      description: event.description || '',
      date: new Date(event.start_date).toLocaleDateString('pt-PT'),
      time: new Date(event.start_date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      location: event.location,
      category: category?.name || event.category,
      type: event.event_type === 'sports' ? 'sports' as const : 
            event.event_type === 'cultural' ? 'cultural' as const :
            event.event_type === 'recreational' ? 'recreational' as const :
            event.event_type === 'educational' ? 'educational' as const : 'cultural' as const,
      participants: participantCount,
      maxParticipants: event.max_participants || 0,
      price: 0, // Price will come from ticket_types
      image: event.image_url,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">O que procuras?</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explora eventos por categoria e encontra experiências que combinam contigo
              </p>
            </div>

            {/* Categories - Compact at top when filtered, full grid when not filtered */}
            {selectedCategory ? (
              <div className="relative bg-gradient-to-r from-primary/5 to-secondary/5 border rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollLeft}
                    className="shrink-0 hover-scale shadow-md bg-white hover:bg-primary hover:text-white transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <div 
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden scroll-smooth"
                    style={{ 
                      scrollbarWidth: 'none', 
                      msOverflowStyle: 'none'
                    }}
                  >
                    {sortedCategories.map((category) => {
                      const IconComponent = getCategoryIcon(category.id);
                      const isSelected = selectedCategory === category.id;
                      const count = eventCounts[category.name] || 0;
                      
                      return (
                        <Card 
                          key={category.id}
                          className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 min-w-[140px] hover-scale ${
                            isSelected 
                              ? 'ring-2 ring-primary shadow-lg border-primary bg-primary text-primary-foreground animate-scale-in' 
                              : 'hover:border-primary/50 bg-white/80 backdrop-blur-sm'
                          }`}
                          onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                        >
                          <CardContent className="p-4 text-center space-y-3">
                            <div className={`w-12 h-12 flex items-center justify-center mx-auto rounded-lg transition-all duration-300 ${
                              isSelected 
                                ? 'bg-white/20 text-white' 
                                : category.type === 'sport' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-purple-100 text-purple-700'
                            }`}>
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-foreground'}`}>
                                {category.name}
                              </h3>
                              <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                                {count} {count === 1 ? 'evento' : 'eventos'}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollRight}
                    className="shrink-0 hover-scale shadow-md bg-white hover:bg-primary hover:text-white transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="relative bg-white/90 backdrop-blur-sm shadow-lg p-4 sm:p-6 lg:p-8 border rounded-xl"
                style={{
                  backgroundImage: `url('/lovable-uploads/30e2e28b-6f2a-4b96-b990-3543a93f3b8b.png')`,
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundBlendMode: 'soft-light'
                }}
              >
                {/* Overlay for readability */}
                <div className="absolute inset-0 bg-white/80 rounded-xl"></div>
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-center mb-6">Todas as Categorias</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sortedCategories.map((category) => {
                      const IconComponent = getCategoryIcon(category.id);
                      const isSelected = selectedCategory === category.id;
                      const count = eventCounts[category.name] || 0;
                      
                      return (
                        <Card 
                          key={category.id}
                          className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 bg-white hover-scale animate-fade-in ${
                            isSelected ? 'ring-2 ring-primary shadow-xl border-primary bg-primary text-primary-foreground' : 'hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                        >
                          <CardContent className="p-6 text-center space-y-3">
                            <div className={`w-16 h-16 flex items-center justify-center mx-auto rounded-xl transition-all duration-300 ${
                              isSelected 
                                ? 'bg-white/20 text-white'
                                : category.type === 'sport' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-purple-100 text-purple-700'
                            }`}>
                              <IconComponent className="h-8 w-8" />
                            </div>
                            <div>
                              <h3 className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-foreground'}`}>
                                {category.name}
                              </h3>
                              <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                                {count} {count === 1 ? 'evento' : 'eventos'}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          {/* Clear filter button */}
          {selectedCategory && (
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => setSelectedCategory(null)}
              >
                Limpar filtro
              </Button>
            </div>
          )}

          {/* Events List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">
              {selectedCategory 
                ? `Eventos de ${getCategoryById(selectedCategory)?.name}`
                : 'Todos os Eventos'
              }
            </h2>
            
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : convertedEvents.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {convertedEvents.map((event) => (
                  <EventCard key={event.id} {...event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {selectedCategory 
                    ? `Não foram encontrados eventos na categoria ${getCategoryById(selectedCategory)?.name}` 
                    : 'Não foram encontrados eventos'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventsByCategory;