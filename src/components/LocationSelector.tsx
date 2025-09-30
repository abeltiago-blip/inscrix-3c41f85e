import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search } from "lucide-react";
import GoogleMap from './GoogleMap';
import { useGeocode } from '@/hooks/useGoogleMaps';

interface LocationSelectorProps {
  location: string;
  address: string;
  latitude?: number;
  longitude?: number;
  onLocationChange: (location: string) => void;
  onAddressChange: (address: string) => void;
  onCoordinatesChange?: (lat: number, lng: number) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  location,
  address,
  latitude,
  longitude,
  onLocationChange,
  onAddressChange,
  onCoordinatesChange
}) => {
  const [coordinates, setCoordinates] = useState({ 
    lat: latitude || 38.7169, 
    lng: longitude || -9.1395 
  }); // Default to Lisbon or use provided coordinates
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const { geocodeAddress } = useGeocode(apiKey);

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

  // Update coordinates when latitude/longitude props change
  useEffect(() => {
    if (latitude && longitude) {
      setCoordinates({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]);

  const handleSearchAddress = async () => {
    if (!address) return;

    const result = await geocodeAddress(address);
    if (result) {
      setCoordinates(result);
      setShowMap(true);
      if (onCoordinatesChange) {
        onCoordinatesChange(result.lat, result.lng);
      }
    }
  };

  const handleMapLocationChange = (lat: number, lng: number, newAddress: string) => {
    setCoordinates({ lat, lng });
    if (onCoordinatesChange) {
      onCoordinatesChange(lat, lng);
    }
    if (newAddress && newAddress !== address) {
      onAddressChange(newAddress);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Localização do Evento
        </CardTitle>
        <CardDescription>
          Defina o local onde o evento irá decorrer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Nome do Local</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="Ex: Estádio da Luz, Centro Cultural"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço Completo</Label>
            <div className="flex gap-2">
              <Input
                id="address"
                value={address}
                onChange={(e) => onAddressChange(e.target.value)}
                placeholder="Rua, número, cidade, código postal"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSearchAddress}
                disabled={!address || !apiKey}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {(latitude && longitude) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  value={latitude}
                  onChange={(e) => {
                    const lat = parseFloat(e.target.value);
                    if (!isNaN(lat) && onCoordinatesChange) {
                      onCoordinatesChange(lat, longitude);
                    }
                  }}
                  placeholder="38.7169"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  value={longitude}
                  onChange={(e) => {
                    const lng = parseFloat(e.target.value);
                    if (!isNaN(lng) && onCoordinatesChange) {
                      onCoordinatesChange(latitude, lng);
                    }
                  }}
                  placeholder="-9.1395"
                />
              </div>
            </div>
          )}
        </div>

        {(showMap || (latitude && longitude)) && apiKey && (
          <div className="mt-4">
            <GoogleMap
              latitude={coordinates.lat}
              longitude={coordinates.lng}
              locationName={location}
              address={address}
              apiKey={apiKey}
              onLocationChange={handleMapLocationChange}
              interactive={true}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationSelector;