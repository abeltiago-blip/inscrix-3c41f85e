import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Search, Filter, SlidersHorizontal, Star, TrendingUp, Users2, Heart, Activity, Palette } from "lucide-react";
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
  end_date: string;
  location: string;
  address: string;
  category: string;
  subcategory?: string;
  event_type: string;
  max_participants: number;
  status: string;
  image_url?: string;
}

const Eventos = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});

  // Carregar eventos da base de dados
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando eventos...');
      
      // Buscar eventos publicados (forçar atualização da cache)
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('start_date', { ascending: true });

      if (eventsError) {
        console.error('❌ Erro ao buscar eventos:', eventsError);
        throw eventsError;
      }

      console.log('✅ Eventos carregados:', eventsData?.length || 0, 'eventos');
      console.log('📋 Lista de eventos:', eventsData?.map(e => e.title));
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
        }
      }

    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // SEO Meta tags
  useEffect(() => {
    document.title = "Eventos em Portugal | Desporto e Cultura | INSCRIX";
    
    // Create or update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Descobre os melhores eventos desportivos e culturais em Portugal. Maratonas, festivais, workshops e muito mais. Inscreve-te já nos eventos perto de ti!');

    // Create or update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'eventos Portugal, inscrições eventos, maratona Lisboa, festival fado, eventos desportivos, eventos culturais, BTT, natação, teatro, gastronomia');

    // Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', 'Eventos em Portugal | Desporto e Cultura | INSCRIX');

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', 'Encontra e inscreve-te nos melhores eventos de Portugal. Desde corridas e ciclismo a festivais e workshops culturais.');

    return () => {
      document.title = "INSCRIX";
    };
  }, []);

  // Obter todas as categorias
  const allCategories = getAllCategories();
  
  // Obter locais únicos dos eventos
  const uniqueLocations = Array.from(new Set(events.map(event => event.location)));

  // Estatísticas para mostrar
  const totalEvents = events.length;
  const totalParticipants = Object.values(registrationCounts).reduce((sum, count) => sum + count, 0);
  const availableSpots = events.reduce((sum, event) => sum + (event.max_participants - (registrationCounts[event.id] || 0)), 0);

  // Filtrar eventos
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    const matchesLocation = selectedLocation === "all" || event.location === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Ordenar eventos
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      case "participants":
        return (registrationCounts[b.id] || 0) - (registrationCounts[a.id] || 0);
      default:
        return 0;
    }
  });

  // Converter eventos para formato do EventCard
  const convertedEvents = sortedEvents.map(event => {
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
      participants: registrationCounts[event.id] || 0,
      maxParticipants: event.max_participants || 100,
      price: 0,
      image: event.image_url || undefined,
    };
  });

  // Eventos por tipo
  const sportEvents = convertedEvents.filter(event => event.type === 'sports');
  const cultureEvents = convertedEvents.filter(event => 
    event.type === 'cultural' || event.type === 'recreational' || event.type === 'educational'
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* SEO optimized content structure */}
        <article>
          {/* Hero Section with SEO optimized content */}
          <header className="text-center space-y-6 mb-12">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                 {t("eventosPage.header.title")}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                {t("eventosPage.header.subtitlePart1")}{" "}
                <strong>{t("eventosPage.header.subtitlePart2")}</strong>{" "}
                {t("eventosPage.header.subtitlePart3")}{" "}
                <strong>{t("eventosPage.header.subtitlePart4")}</strong>{" "}
                {t("eventosPage.header.subtitlePart5")}
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 rounded-xl border">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalEvents}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">{t("eventosPage.statistics.totalEvents")}</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-6 rounded-xl border">
                <div className="flex items-center justify-center mb-2">
                  <Users2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">{totalParticipants.toLocaleString()}</div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">{t("eventosPage.statistics.totalParticipants")}</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-6 rounded-xl border">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">{availableSpots.toLocaleString()}</div>
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">{t("eventosPage.statistics.availableSpots")}</div>
              </div>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button size="lg" className="text-lg px-8 py-6" onClick={() => navigate('/create-event')}>
                <Star className="mr-2 h-5 w-5" />
                {t("eventosPage.buttons.createEvent")}
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" onClick={() => navigate('/categorias')}>
                <Heart className="mr-2 h-5 w-5" />
                {t("eventosPage.buttons.exploreCategory")}
              </Button>
              <Button variant="secondary" size="lg" className="text-lg px-8 py-6" onClick={fetchEvents}>
                🔄 {t("eventosPage.buttons.refreshEvents")}
              </Button>
            </div>
          </header>

          {/* Advanced Search and Filters Section with Inscrix Icons */}
          <section 
            className="bg-card p-4 sm:p-6 lg:p-8 rounded-2xl border shadow-sm space-y-6 relative"
            style={{
              backgroundImage: `url('/lovable-uploads/30e2e28b-6f2a-4b96-b990-3543a93f3b8b.png')`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundBlendMode: 'soft-light'
            }}
          >
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-card/90 rounded-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <SlidersHorizontal className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{t("eventosPage.filtersSection.heading")}</h2>
                  <p className="text-muted-foreground">{t("eventosPage.filtersSection.subheading")}</p>
                </div>
              </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Enhanced Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t("eventosPage.filtersSection.searchLabel")}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("eventosPage.filtersSection.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              {/* Enhanced Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t("eventosPage.filtersSection.categoryLabel")}</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={t("eventosPage.filtersSection.categoryPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        <span>{t("eventosPage.filtersSection.allCategories")}</span>
                      </div>
                    </SelectItem>
                    {allCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          {category.type === 'sport' ? <Activity className="h-4 w-4" /> : <Palette className="h-4 w-4" />}
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Enhanced Location Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t("eventosPage.filtersSection.locationLabel")}</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={t("eventosPage.filtersSection.locationPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">📍 {t("eventosPage.filtersSection.allLocations")}</SelectItem>
                    {uniqueLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        📍 {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Enhanced Sort */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t("eventosPage.filtersSection.sortLabel")}</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={t("eventosPage.filtersSection.sortPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">📅 {t("eventosPage.filtersSection.sortDate")}</SelectItem>
                    <SelectItem value="participants">👥 {t("eventosPage.filtersSection.sortParticipants")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Enhanced Active filters */}
            {(searchTerm || selectedCategory !== "all" || selectedLocation !== "all") && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{t("eventosPage.filtersSection.activeFilters")}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
                      🔍 "{searchTerm}"
                      <button 
                        onClick={() => setSearchTerm("")} 
                        className="ml-1 hover:text-destructive transition-colors"
                        aria-label={t("eventosPage.filtersSection.removeSearchFilter")}
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {selectedCategory !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        <span>{getCategoryById(selectedCategory)?.name}</span>
                      </div>
                      <button 
                        onClick={() => setSelectedCategory("all")} 
                        className="ml-1 hover:text-destructive transition-colors"
                        aria-label={t("eventosPage.filtersSection.removeCategoryFilter")}
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {selectedLocation !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
                      📍 {selectedLocation}
                      <button 
                        onClick={() => setSelectedLocation("all")} 
                        className="ml-1 hover:text-destructive transition-colors"
                        aria-label={t("eventosPage.filtersSection.removeLocationFilter")}
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setSelectedLocation("all");
                    }}
                    className="text-sm"
                  >
                    🗑️ {t("eventosPage.filtersSection.clearAllFilters")}
                  </Button>
                </div>
              </div>
            )}
            </div>
          </section>

          {/* Results section with enhanced CTAs */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-muted/50 to-muted/30 p-6 rounded-xl">
              <div>
                <h3 className="text-xl font-bold">
                  {convertedEvents.length === 1
                    ? t("eventosPage.resultsSection.foundSingleEvent")
                    : t("eventosPage.resultsSection.foundMultipleEvents", { count: convertedEvents.length })
                  }
                </h3>
                <p className="text-muted-foreground">
                  {convertedEvents.length === 0
                    ? t("eventosPage.resultsSection.noEventsMessage")
                    : t("eventosPage.resultsSection.eventsOverviewMessage")
                  }
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate('/create-event')} className="whitespace-nowrap">
                  <Star className="mr-2 h-4 w-4" />
                  {t("eventosPage.buttons.createEvent2")}
                </Button>
                <Button onClick={() => navigate('/categorias')} className="whitespace-nowrap">
                  <Heart className="mr-2 h-4 w-4" />
                  {t("eventosPage.buttons.exploreCategory2")}
                </Button>
              </div>
            </div>

            {/* Enhanced Events Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-14 p-1">
                <TabsTrigger value="all" className="text-base py-3">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <span>{t("events.all")} ({convertedEvents.length})</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="sport" className="text-base py-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span>{t("events.sports")} ({sportEvents.length})</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="culture" className="text-base py-3">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <span>{t("events.culture")} ({cultureEvents.length})</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            
            <TabsContent value="all" className="mt-8">
              {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-96 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : convertedEvents.length === 0 ? (
                <div className="text-center py-16 space-y-6">
                  <div className="w-24 h-24 mx-auto bg-accent text-accent-foreground rounded-full flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold">{t("events.noEventsTitle")} 😔</h3>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                      {t("events.noEventsText")}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("all");
                        setSelectedLocation("all");
                      }}
                      className="text-lg px-8"
                    >
                      🔄 {t("events.viewAll")}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      onClick={() => navigate('/create-event')}
                      className="text-lg px-8"
                    >
                      ✨ {t("events.createMyEvent")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {convertedEvents.map((event) => (
                      <EventCard key={event.id} {...event} />
                    ))}
                  </div>
                  
                  {/* Pagination CTA */}
                  {convertedEvents.length >= 6 && (
                    <div className="text-center py-8 bg-gradient-to-t from-muted/30 to-transparent rounded-xl">
                      <h4 className="text-lg font-semibold mb-2">{t("events.paginationTitle")} 🎉</h4>
                      <p className="text-muted-foreground mb-4">{t("events.paginationText")}</p>
                      <div className="flex gap-3 justify-center">
                        <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                          ⬆️ {t("events.backToTop")}
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/create-event')}>
                          ➕ {t("events.createEvent")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="sport" className="mt-8">
              {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-96 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : sportEvents.length === 0 ? (
                <div className="text-center py-16 space-y-6">
                  <div className="w-24 h-24 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold">{t("eventsSection.noSportEventsTitle")}</h3>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                      {t("eventsSection.noSportEventsText")}
                    </p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button size="lg" onClick={() => navigate("/create-event")}>
                      🏆 {t("eventsSection.createSportEventButton")}
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => setSelectedCategory("all")}>
                      👀 {t("eventsSection.viewAllEventsButton")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-6 rounded-xl border">
                    <h3 className="text-xl font-bold mb-2">💪 {t("eventsSection.sportEventsTitle")}</h3>
                    <p className="text-muted-foreground">
                      {t("eventsSection.sportEventsText")}
                    </p>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sportEvents.map((event) => (
                      <EventCard key={event.id} {...event} />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="culture" className="mt-8">
              {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-96 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : cultureEvents.length === 0 ? (
                <div className="text-center py-16 space-y-6">
                  <div className="w-24 h-24 mx-auto bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <Heart className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold">{t("eventsSection.noCultureEventsTitle")}</h3>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                     {t("eventsSection.noCultureEventsText")}
                    </p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button size="lg" onClick={() => navigate("/create-event")}>
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        <span>{t("eventsSection.createCultureEventButton")}</span>
                      </div>
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => setSelectedCategory("all")}>
                      👀 {t("eventsSection.viewAllEventsButton")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      <span>{t("eventsSection.cultureEventsTitle")}</span>
                    </h3>
                    <p className="text-muted-foreground">
                      {t("eventsSection.cultureEventsText")}
                    </p>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {cultureEvents.map((event) => (
                      <EventCard key={event.id} {...event} />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            </Tabs>
          </section>

          {/* Enhanced Call to Action Section with Inscrix Icons */}
          <section 
            className="bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 p-6 sm:p-8 lg:p-12 rounded-3xl text-center space-y-8 border relative"
          >
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 rounded-3xl"></div>
            
            <div className="relative z-10 space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">
                  {t("eventsSection.ctaTitle")} 🤔
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  {t("ctaText.ctatextp1")} <strong>{t("ctaText.ctatextp2")}</strong>, <strong>{t("ctaText.ctatextp3")}</strong> {t("ctaText.ctatextp4")}
                </p>
              </div>
            
            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
              <div className="bg-background/80 p-6 rounded-xl border">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-semibold mb-2">{t("eventsSection.ctaBenefit1Title")}</h4>
                <p className="text-sm text-muted-foreground">{t("eventsSection.ctaBenefit1Text")}</p>
              </div>
              <div className="bg-background/80 p-6 rounded-xl border">
                <div className="text-2xl mb-2">🌟</div>
                <h4 className="font-semibold mb-2">{t("eventsSection.ctaBenefit2Title")}</h4>
                <p className="text-sm text-muted-foreground">{t("eventsSection.ctaBenefit2Text")}</p>
              </div>
              <div className="bg-background/80 p-6 rounded-xl border">
                <div className="text-2xl mb-2">💰</div>
                <h4 className="font-semibold mb-2">{t("eventsSection.ctaBenefit3Title")}</h4>
                <p className="text-sm text-muted-foreground">{t("eventsSection.ctaBenefit3Text")}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="text-lg px-12 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                  onClick={() => navigate('/create-event')}
                >
                  <Star className="mr-3 h-6 w-6" />
                  {t("eventsSection.ctaCreateEvent")}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-12 py-6 border-2"
                  onClick={() => navigate('/categorias')}
                >
                  <Heart className="mr-3 h-6 w-6" />
                  {t("eventsSection.ctaExploreCategories")}
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Já tens uma ideia? <button 
                  onClick={() => navigate('/create-event')} 
                  className="underline hover:text-primary transition-colors font-medium"
                >
                  {t("eventsSection.ctaStartHere")}
                </button>
              </p>
            </div>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default Eventos;
