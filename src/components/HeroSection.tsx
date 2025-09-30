import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  subtitle?: string;
  location: string;
  start_date: string;
  image_url?: string;
  slug?: string;
}

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchFeaturedEvents();

    // Set up real-time subscription for events updates
    const channel = supabase
      .channel('hero-events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        () => {
          console.log('Featured events updated, refreshing...');
          fetchFeaturedEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFeaturedEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, description, location, start_date, image_url, category, slug')
        .eq('status', 'published')
        .eq('approval_status', 'approved')
        .order('start_date', { ascending: true })
        .limit(6);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const formattedEvents = data.map(event => ({
          id: event.id,
          title: event.title.toUpperCase(),
          subtitle: event.description || `Evento de ${event.category}`,
          location: event.location + " - PT",
          start_date: event.start_date,
          image_url: event.image_url || getDefaultImage(event.category),
          slug: event.slug,
        }));
        setFeaturedEvents(formattedEvents);
      } else {
        setFallbackEvents();
      }
    } catch (error) {
      console.error('Error fetching featured events:', error);
      setFallbackEvents();
    }
  };

  const getDefaultImage = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ciclismo':
        return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop";
      case 'música':
        return "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop";
      case 'atletismo':
        return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=500&fit=crop";
      case 'teatro':
        return "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800&h=500&fit=crop";
      case 'gastronomia':
        return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop";
      default:
        return "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=500&fit=crop";
    }
  };

  const setFallbackEvents = () => {
    const fallbackEvents = [
      {
        id: "fallback-1",
        title: "EVENTOS EM DESTAQUE",
        subtitle: "Descubra experiências incríveis",
        location: "Portugal",
        start_date: new Date().toISOString(),
        image_url: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=500&fit=crop"
      }
    ];
    setFeaturedEvents(fallbackEvents);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [featuredEvents.length]);
  
  return (
    <section className="relative bg-background overflow-hidden">
      {/* Desktop Layout - Grid 4x4 */}
      <div className="hidden md:block">
        <div 
          className="relative w-full min-h-[400px] lg:min-h-[500px]"
          style={{
            backgroundImage: `url('/lovable-uploads/30e2e28b-6f2a-4b96-b990-3543a93f3b8b.png')`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top'
          }}
        >
          <div className="flex justify-center items-center min-h-[400px] lg:min-h-[500px] p-4 pt-[62px]">
            <div className="relative w-full max-w-4xl h-[400px] lg:h-[500px] grid grid-cols-4 grid-rows-4 gap-4">
              {/* Subtle overlay to blend icons with content */}
              <div className="absolute inset-0 bg-background/20 pointer-events-none" style={{ zIndex: 1 }}></div>

              {/* A1-A2: Outro evento */}
              <div 
                className="col-start-1 col-end-2 row-start-1 row-end-3 relative rounded-xl overflow-hidden group cursor-pointer"
                style={{
                  backgroundImage: featuredEvents[1]?.image_url ? `url(${featuredEvents[1].image_url})` : `url(${getDefaultImage('')})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  zIndex: 2
                }}
                onClick={() => featuredEvents[1] && navigate(`/event/${featuredEvents[1].slug || featuredEvents[1].title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}`)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-sm font-bold mb-1">{featuredEvents[1]?.title || "OUTRO EVENTO"}</h3>
                  <p className="text-xs opacity-90">{featuredEvents[1]?.location || "Portugal"}</p>
                </div>
              </div>

            {/* C1: Evento */}
            <div 
              className="col-start-3 col-end-4 row-start-1 row-end-2 relative rounded-xl overflow-hidden group cursor-pointer"
              style={{
                backgroundImage: featuredEvents[2]?.image_url ? `url(${featuredEvents[2].image_url})` : `url(${getDefaultImage('')})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 2
              }}
              onClick={() => featuredEvents[2] && navigate(`/event/${featuredEvents[2].slug || featuredEvents[2].title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}`)}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <h3 className="text-xs font-bold mb-1">{featuredEvents[2]?.title || "EVENTO"}</h3>
                <p className="text-xs opacity-90">{featuredEvents[2]?.location || "Portugal"}</p>
              </div>
            </div>

            {/* B2-B3 | C2-C3: Evento em destaque */}
            <div 
              className="col-start-2 col-end-4 row-start-2 row-end-4 relative rounded-xl overflow-hidden group cursor-pointer"
              style={{
                backgroundImage: featuredEvents[0]?.image_url ? `url(${featuredEvents[0].image_url})` : `url(${getDefaultImage('')})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 2
              }}
              onClick={() => featuredEvents[0] && navigate(`/event/${featuredEvents[0].slug || featuredEvents[0].title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}`)}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 flex items-end">
                <div className="p-6 text-white space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm opacity-90">
                      <Calendar className="h-3 w-3" />
                      <span>{featuredEvents[0] ? new Date(featuredEvents[0].start_date).toLocaleDateString('pt-PT', { 
                        day: 'numeric', 
                        month: 'short' 
                      }) : ""}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-90">
                      <MapPin className="h-3 w-3" />
                      <span>{featuredEvents[0]?.location || "Portugal"}</span>
                    </div>
                  </div>
                  
                  <h2 className="text-lg lg:text-xl font-bold leading-tight">
                    {featuredEvents[0]?.title || "EVENTO EM DESTAQUE"}
                  </h2>
                  
                  <p className="text-sm opacity-95 line-clamp-2">
                    {featuredEvents[0]?.subtitle || "Descubra experiências incríveis"}
                  </p>
                </div>
              </div>
            </div>

            {/* D2-D3: Search */}
            <div className="col-start-4 col-end-5 row-start-2 row-end-4 relative rounded-xl bg-white/95 backdrop-blur-xl shadow-xl flex items-center justify-center p-4" style={{ zIndex: 2 }}>
              <div className="w-full space-y-4">
                <div className="text-center mb-4">
                  <Search className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-foreground">Procurar Eventos</h3>
                </div>
                <div className="space-y-3">
                  <Input
                    placeholder="Onde..."
                    className="h-10 text-sm border-muted"
                  />
                  <Input
                    placeholder="O quê..."
                    className="h-10 text-sm border-muted"
                  />
                  <Button 
                    className="w-full h-10 text-sm font-semibold"
                    onClick={() => navigate('/eventos')}
                  >
                    Procurar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden">
        <div 
          className="relative h-[500px] p-4 flex flex-col items-center"
          style={{
            backgroundImage: `url('/lovable-uploads/30e2e28b-6f2a-4b96-b990-3543a93f3b8b.png')`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top'
          }}
        >
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-background/20 pointer-events-none"></div>

          {/* Featured Event - Rotating - Same width as search */}
          <div className="flex-1 relative z-10 mb-4 w-full max-w-xs mx-auto">
            {featuredEvents.length > 0 && (
               <div 
                 className="w-full h-60 rounded-xl overflow-hidden group cursor-pointer relative"
                 style={{
                   backgroundImage: `url(${featuredEvents[currentSlide]?.image_url || getDefaultImage('')})`,
                   backgroundSize: 'cover',
                   backgroundPosition: 'center'
                 }}
                onClick={() => {
                  const event = featuredEvents[currentSlide];
                  if (event && !event.id.startsWith('fallback-')) {
                    navigate(`/event/${event.slug || event.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}`);
                  } else {
                    navigate('/eventos');
                  }
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div className="absolute inset-0 flex items-end p-4">
                  <div className="text-white space-y-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs opacity-90">
                        <Calendar className="h-3 w-3" />
                        <span>{featuredEvents[currentSlide] ? new Date(featuredEvents[currentSlide].start_date).toLocaleDateString('pt-PT', { 
                          day: 'numeric', 
                          month: 'short' 
                        }) : ""}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs opacity-90">
                        <MapPin className="h-3 w-3" />
                        <span>{featuredEvents[currentSlide]?.location || "Portugal"}</span>
                      </div>
                    </div>
                    
                    <h2 className="text-lg font-bold leading-tight">
                      {featuredEvents[currentSlide]?.title || "EVENTO EM DESTAQUE"}
                    </h2>
                  </div>
                </div>

                {/* Dots Indicator */}
                {featuredEvents.length > 1 && (
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    {featuredEvents.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentSlide(index);
                        }}
                        className={`transition-all duration-300 ${
                          index === currentSlide 
                            ? 'w-6 h-2 bg-white shadow-lg' 
                            : 'w-2 h-2 bg-white/60 hover:bg-white/80'
                        }`}
                        style={{ borderRadius: '4px' }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Section - Small width */}
          <div className="relative z-10 w-full max-w-xs mx-auto rounded-xl bg-white/95 backdrop-blur-xl shadow-xl p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Search className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Procurar</h3>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Onde..."
                  className="h-10 text-sm border-muted"
                />
                <Input
                  placeholder="O quê..."
                  className="h-10 text-sm border-muted"
                />
              </div>
              <Button 
                className="w-full h-10 text-sm font-semibold"
                onClick={() => navigate('/eventos')}
              >
                Procurar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;