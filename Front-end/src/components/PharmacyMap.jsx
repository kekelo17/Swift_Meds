import React, { useState, useCallback, useMemo } from 'react';
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
import * as icons from 'lucide-react';

const PharmacyMap = ({ 
  pharmacies = [], 
  userLocation, 
  onPharmacyClick, 
  selectedPharmacy 
}) => {
  const [activeMarker, setActiveMarker] = useState(null);

  // Default center (Lolodorf, Cameroon)
  const defaultCenter = useMemo(() => ({
    lat: 3.2317,
    lng: 10.7364
  }), []);

  // Determine map center based on user location or pharmacies
  const mapCenter = useMemo(() => {
    if (userLocation) {
      return userLocation;
    }
    
    if (pharmacies.length > 0) {
      // Calculate center of all pharmacies
      const validCoords = pharmacies
        .filter(p => p.coordinates && p.coordinates.lat && p.coordinates.lng)
        .map(p => p.coordinates);
      
      if (validCoords.length > 0) {
        const avgLat = validCoords.reduce((sum, coord) => sum + coord.lat, 0) / validCoords.length;
        const avgLng = validCoords.reduce((sum, coord) => sum + coord.lng, 0) / validCoords.length;
        return { lat: avgLat, lng: avgLng };
      }
    }
    
    return defaultCenter;
  }, [userLocation, pharmacies, defaultCenter]);

  // Calculate appropriate zoom level
  const mapZoom = useMemo(() => {
    if (pharmacies.length === 0) return 12;
    if (pharmacies.length === 1) return 15;
    
    // Calculate bounds and adjust zoom accordingly
    const validCoords = pharmacies
      .filter(p => p.coordinates && p.coordinates.lat && p.coordinates.lng)
      .map(p => p.coordinates);
    
    if (validCoords.length < 2) return 15;
    
    const latDiff = Math.max(...validCoords.map(c => c.lat)) - Math.min(...validCoords.map(c => c.lat));
    const lngDiff = Math.max(...validCoords.map(c => c.lng)) - Math.min(...validCoords.map(c => c.lng));
    const maxDiff = Math.max(latDiff, lngDiff);
    
    if (maxDiff > 0.1) return 10;
    if (maxDiff > 0.05) return 12;
    if (maxDiff > 0.01) return 14;
    return 15;
  }, [pharmacies]);

  const handleMarkerClick = useCallback((pharmacy) => {
    setActiveMarker(pharmacy.id);
    if (onPharmacyClick) {
      onPharmacyClick(pharmacy);
    }
  }, [onPharmacyClick]);

  const handleInfoWindowClose = useCallback(() => {
    setActiveMarker(null);
  }, []);

  // Custom marker icon for pharmacies
  const pharmacyMarkerIcon = useMemo(() => ({
    url: 'data:image/svg+xml,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
        <circle cx="12" cy="12" r="10" fill="#16a34a" stroke="#ffffff" stroke-width="2"/>
        <path d="M12 2L13.41 8.59L20 10L13.41 11.41L12 18L10.59 11.41L4 10L10.59 8.59L12 2Z" fill="white"/>
        <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-family="Arial">+</text>
      </svg>
    `),
    scaledSize: { width: 32, height: 32 },
    anchor: { x: 16, y: 16 }
  }), []);

  // Custom marker icon for user location
  const userMarkerIcon = useMemo(() => ({
    url: 'data:image/svg+xml,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
        <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
        <circle cx="12" cy="12" r="4" fill="white"/>
      </svg>
    `),
    scaledSize: { width: 28, height: 28 },
    anchor: { x: 14, y: 14 }
  }), []);

  return (
    <APIProvider apiKey="AIzaSyA8MZVEtCVJrzAQe7JV08UVeNDLMpQDuxA">
      <Map
        center={mapCenter}
        zoom={mapZoom}
        style={{ width: '100%', height: '100%' }}
        mapId="pharmacy_map"
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
          gestureHandling: 'cooperative'
        }}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={userMarkerIcon}
            title="Your Location"
          />
        )}

        {/* Pharmacy Markers */}
        {pharmacies.map((pharmacy) => {
          if (!pharmacy.coordinates || !pharmacy.coordinates.lat || !pharmacy.coordinates.lng) {
            return null;
          }

          return (
            <Marker
              key={pharmacy.id}
              position={pharmacy.coordinates}
              icon={pharmacyMarkerIcon}
              title={pharmacy.name}
              onClick={() => handleMarkerClick(pharmacy)}
            />
          );
        })}

        {/* Info Window for Active Pharmacy */}
        {activeMarker && (
          (() => {
            const pharmacy = pharmacies.find(p => p.id === activeMarker);
            if (!pharmacy || !pharmacy.coordinates) return null;

            return (
              <InfoWindow
                position={pharmacy.coordinates}
                onCloseClick={handleInfoWindowClose}
                options={{
                  pixelOffset: { width: 0, height: -40 }
                }}
              >
                <div className="p-3 max-w-xs">
                  <h4 className="font-semibold text-gray-900 mb-2">{pharmacy.name}</h4>
                  <p className="text-sm text-gray-600 mb-1">{pharmacy.address}</p>
                  {pharmacy.phone && (
                    <p className="text-sm text-gray-600 mb-2">{pharmacy.phone}</p>
                  )}
                  
                  {pharmacy.medications && pharmacy.medications.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Available:</p>
                      <div className="flex flex-wrap gap-1">
                        {pharmacy.medications.slice(0, 3).map((med, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                          >
                            {med.name}
                          </span>
                        ))}
                        {pharmacy.medications.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{pharmacy.medications.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMarkerClick(pharmacy)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      Select
                    </button>
                    {pharmacy.coordinates && userLocation && (
                      <span className="text-xs text-gray-500 py-1">
                        {calculateDistance(userLocation, pharmacy.coordinates).toFixed(1)} km
                      </span>
                    )}
                  </div>
                </div>
              </InfoWindow>
            );
          })()
        )}
      </Map>
    </APIProvider>
  );
};

// Helper function to calculate distance between two coordinates
const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default PharmacyMap;