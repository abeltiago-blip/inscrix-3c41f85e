import { useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export const useGoogleMaps = (apiKey: string | null) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setLoadError('Google Maps API key is required');
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });

    loader
      .importLibrary('maps')
      .then(() => {
        setIsLoaded(true);
        setLoadError(null);
      })
      .catch((error) => {
        setLoadError(`Failed to load Google Maps: ${error.message}`);
      });
  }, [apiKey]);

  return { isLoaded, loadError };
};

export const useGeocode = (apiKey: string | null) => {
  const { isLoaded } = useGoogleMaps(apiKey);

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    if (!isLoaded || !apiKey) return null;

    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ address });
      
      if (response.results && response.results.length > 0) {
        const location = response.results[0].geometry.location;
        return {
          lat: location.lat(),
          lng: location.lng()
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  return { geocodeAddress, isLoaded };
};