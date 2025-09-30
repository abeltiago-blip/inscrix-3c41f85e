import { Calendar, MapPin, Users, Clock, Activity, Palette, Music, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslateContent } from "@/hooks/useTranslateContent";
import LazyImage from "@/components/LazyImage";

interface EventCardProps {
  id: string;
  slug?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  type: "sports" | "cultural" | "recreational" | "educational";
  participants: number;
  maxParticipants: number;
  price: number;
  image?: string;
  ageRestrictions?: {
    minAge?: number;
    maxAge?: number;
  };
}

const EventCard = ({
  id,
  slug,
  title,
  description,
  date,
  time,
  location,
  category,
  type,
  participants,
  maxParticipants,
  price,
  image,
  ageRestrictions
}: EventCardProps) => {
  const { t } = useTranslation();
  const { translatedText: translatedTitle, isTranslating: titleTranslating } = useTranslateContent(title);
  const { translatedText: translatedDescription, isTranslating: descTranslating } = useTranslateContent(description || '');
  
  // Generate a simple slug from title if not provided (fallback for existing code)
  const eventSlug = slug || title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <Link to={`/event/${eventSlug}`} className="block flex-1 flex flex-col">
        <div className="aspect-video bg-muted relative">
          {image ? (
            <LazyImage
              src={image}
              alt={translatedTitle}
              className="w-full h-full"
              width={800}
              height={450}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="text-center">
                <div className="text-4xl mb-2 flex justify-center">
                  {type === "sports" ? <Activity className="h-12 w-12 text-primary" /> : 
                   type === "cultural" ? <Palette className="h-12 w-12 text-primary" /> : 
                   type === "recreational" ? <Music className="h-12 w-12 text-primary" /> : <BookOpen className="h-12 w-12 text-primary" />}
                </div>
                <p className="text-sm text-muted-foreground">{category}</p>
              </div>
            </div>
          )}
          <Badge
            className="absolute top-2 right-2"
            variant={type === "sports" ? "default" : "secondary"}
          >
            {t(`events.${type}`)}
          </Badge>
        </div>
        
        <CardHeader className="pb-3">
          <CardTitle className="line-clamp-2">
            {titleTranslating ? (
              <span className="opacity-75 animate-pulse">{title}</span>
            ) : (
              translatedTitle
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {descTranslating ? (
              <span className="opacity-75 animate-pulse">{description}</span>
            ) : (
              translatedDescription
            )}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-3 flex-1 flex flex-col justify-end">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              {date}
              <Clock className="h-4 w-4 ml-4 mr-2" />
              {time}
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="line-clamp-1">{location}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{participants}/{maxParticipants}</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  {price === 0 ? t('common.free') : `€${price}`}
                </div>
              </div>
            </div>
            
            {/* Age Restrictions */}
            {ageRestrictions && (ageRestrictions.minAge || ageRestrictions.maxAge) && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  {ageRestrictions.minAge && ageRestrictions.maxAge 
                    ? `${ageRestrictions.minAge}-${ageRestrictions.maxAge} anos`
                    : ageRestrictions.minAge 
                    ? `Mín. ${ageRestrictions.minAge} anos`
                    : `Máx. ${ageRestrictions.maxAge} anos`
                  }
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
      
      <CardContent className="pt-0 mt-auto">
        <Link to={`/event/${eventSlug}`}>
          <Button className="w-full" disabled={maxParticipants > 0 && participants >= maxParticipants}>
            {maxParticipants > 0 && participants >= maxParticipants ? t('events.soldOut') : t('events.details')}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default EventCard;