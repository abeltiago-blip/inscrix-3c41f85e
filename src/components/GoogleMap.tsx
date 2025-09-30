import React, { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  locationName: string;
  address: string;
  apiKey: string | null;
  onLocationChange?: (lat: number, lng: number, address: string) => void;
  interactive?: boolean;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ 
  latitude, 
  longitude, 
  locationName, 
  address, 
  apiKey,
  onLocationChange,
  interactive = false
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const { isLoaded, loadError } = useGoogleMaps(apiKey);

  useEffect(() => {
    if (!isLoaded || !mapContainer.current || !apiKey) return;

    // Initialize map
    const map = new google.maps.Map(mapContainer.current, {
      center: { lat: latitude, lng: longitude },
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: !interactive,
      zoomControl: true,
      gestureHandling: interactive ? 'auto' : 'cooperative'
    });

    mapRef.current = map;

    // Add marker
    const marker = new google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: map,
      title: locationName,
      draggable: interactive
    });

    markerRef.current = marker;

    // Add info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; max-width: 200px;">
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${locationName}</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">${address}</p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    // Show info window by default
    infoWindow.open(map, marker);

    // Handle interactive mode
    if (interactive && onLocationChange) {
      const geocoder = new google.maps.Geocoder();

      // Handle marker drag
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          
          // Reverse geocode to get address
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              onLocationChange(lat, lng, results[0].formatted_address);
            } else {
              onLocationChange(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }
          });
        }
      });

      // Handle map click
      map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          
          // Move marker
          marker.setPosition({ lat, lng });
          
          // Reverse geocode to get address
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              onLocationChange(lat, lng, results[0].formatted_address);
              infoWindow.setContent(`
                <div style="padding: 8px; max-width: 200px;">
                  <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${locationName}</h3>
                  <p style="margin: 0; font-size: 12px; color: #666;">${results[0].formatted_address}</p>
                </div>
              `);
            } else {
              onLocationChange(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }
          });
        }
      });
    }

    // Cleanup
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [isLoaded, latitude, longitude, locationName, address, apiKey, interactive, onLocationChange]);

  // Update marker position when coordinates change
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      const newPosition = { lat: latitude, lng: longitude };
      markerRef.current.setPosition(newPosition);
      mapRef.current.setCenter(newPosition);
    }
  }, [latitude, longitude]);

  if (loadError) {
    return (
      <div className="w-full h-64 bg-muted/30 rounded-lg flex items-center justify-center">
        <p className="text-sm text-muted-foreground text-center px-4">
          {loadError}
        </p>
      </div>
    );
  }

  if (!isLoaded || !apiKey) {
    return (
      <div className="w-full h-64 bg-muted/30 rounded-lg flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {!apiKey ? 'Google Maps API key required' : 'Loading map...'}
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      {interactive && (
        <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground">
          Click or drag to set location
        </div>
      )}
    </div>
  );
};

export default GoogleMap;