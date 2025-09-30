import React, { useEffect, useState } from 'react';
import GoogleMap from './GoogleMap';

interface EventMapProps {
  longitude: number;
  latitude: number;
  locationName: string;
  address: string;
  onLocationChange?: (lat: number, lng: number, address: string) => void;
  interactive?: boolean;
}

const EventMap: React.FC<EventMapProps> = ({ 
  longitude, 
  latitude, 
  locationName, 
  address,
  onLocationChange,
  interactive = false
}) => {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Get Google Maps API key from Supabase Edge Function
    const fetchApiKey = async () => {
      try {
        const response = await fetch(`https://wbshfbodqsuvyjtugygj.supabase.co/functions/v1/google-maps-config`, {
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indic2hmYm9kcXN1dnlqdHVneWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjUyNjYsImV4cCI6MjA3MTkwMTI2Nn0.9VjvkWkRaSI-MvCc7h2LHL5sCIdMo5wOqrt9Pfhb0hc`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setApiKey(data.apiKey);
        }
      } catch (error) {
        console.error('Failed to fetch Google Maps API key:', error);
      }
    };

    fetchApiKey();
  }, []);

  return (
    <GoogleMap
      latitude={latitude}
      longitude={longitude}
      locationName={locationName}
      address={address}
      apiKey={apiKey}
      onLocationChange={onLocationChange}
      interactive={interactive}
    />
  );
};

export default EventMap;