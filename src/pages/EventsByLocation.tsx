import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Users, Search, Euro, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { mockEvents, type MockEvent } from "@/data/mockEvents";

const EventsByLocation = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState("");
  const [events, setEvents] = useState<MockEvent[]>([]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load events
  useEffect(() => {
    setEvents(mockEvents);
  }, []);

  // Get unique locations from events and add counts
  const getLocationsWithCounts = () => {
    const locationCounts: Record<string, { name: string; region: string; count: number }> = {};
    
    events.forEach(event => {
      const locationKey = event.location.toLowerCase().replace(/\s+/g, '-');
      if (!locationCounts[locationKey]) {
        // Determine region based on location
        let region = "Centro";
        const location = event.location.toLowerCase();
        if (location.includes('lisboa')) region = "Lisboa";
        else if (location.includes('porto') || location.includes('braga') || location.includes('viana')) region = "Norte";
        else if (location.includes('faro') || location.includes('évora') || location.includes('beja')) region = "Sul";
        else if (location.includes('funchal') || location.includes('madeira')) region = "Madeira";
        else if (location.includes('açores') || location.includes('angra')) region = "Açores";
        else if (location.includes('évora') || location.includes('beja') || location.includes('portalegre')) region = "Alentejo";
        
        locationCounts[locationKey] = {
          name: event.location,
          region: region,
          count: 0
        };
      }
      locationCounts[locationKey].count++;
    });

    return Object.entries(locationCounts).map(([id, data]) => ({
      id,
      name: data.name,
      region: data.region,
      count: data.count
    })).sort((a, b) => b.count - a.count);
  };

  const locations = getLocationsWithCounts();

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchLocation.toLowerCase())
  );

  const filteredEvents = selectedLocation 
    ? events.filter(event => event.location.toLowerCase().replace(/\s+/g, '-') === selectedLocation)
    : events.slice(0, 12); // Show first 12 events when no location selected

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Onde?</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descobre eventos perto de ti ou em qualquer cidade de Portugal
            </p>
          </div>

          {/* Location Search */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar cidade..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Locations Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredLocations.map((location) => {
              const isSelected = selectedLocation === location.id;
              
              return (
                <Card 
                  key={location.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                  }`}
                  onClick={() => setSelectedLocation(isSelected ? null : location.id)}
                >
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{location.name}</h3>
                      <p className="text-sm text-muted-foreground">{location.region}</p>
                      <Badge variant="secondary" className="mt-1">
                        {location.count} eventos
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Clear filter button */}
          {selectedLocation && (
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => setSelectedLocation(null)}
              >
                Limpar filtro
              </Button>
            </div>
          )}

          {/* Events List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">
              {selectedLocation 
                ? `Eventos em ${locations.find(l => l.id === selectedLocation)?.name}`
                : 'Eventos em Destaque'
              }
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  description={event.description}
                  date={event.start_date}
                  time={new Date(event.start_date).toLocaleTimeString('pt-PT', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                  location={event.location}
                  category={event.category}
                  type={event.event_type === 'sports' ? 'sports' : 
                        event.event_type === 'cultural' ? 'cultural' :
                        event.event_type === 'recreational' ? 'recreational' :
                        event.event_type === 'educational' ? 'educational' : 'cultural'}
                  participants={event.participants}
                  maxParticipants={event.max_participants}
                  price={event.price}
                  image={event.images[0]}
                />
              ))}
            </div>

            {filteredEvents.length === 0 && selectedLocation && (
              <Card className="p-8 text-center">
                <CardContent>
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Não há eventos disponíveis para esta localização no momento.
                  </p>
                  <Button onClick={() => setSelectedLocation(null)}>
                    Ver todos os eventos
                  </Button>
                </CardContent>
              </Card>
            )}

            {!selectedLocation && events.length > 12 && (
              <div className="text-center mt-8">
                <Button onClick={() => navigate('/eventos')} size="lg">
                  Ver todos os eventos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventsByLocation;