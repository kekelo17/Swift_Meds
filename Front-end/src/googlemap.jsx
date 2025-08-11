import React from 'react';
import { APIProvider, Map, Marker, AdvancedMarker } from '@vis.gl/react-google-maps';

const GoogleMap = ({ pharmacies = [], onMarkerClick }) => {
  const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // New York coordinates
  const activeCenter = pharmacies.length > 0 ? 
    { lat: pharmacies[0].coordinates[1], lng: pharmacies[0].coordinates[0] } : 
    defaultCenter;

  return (
    <APIProvider apiKey={import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY}>
      <div style={{ height: '500px', width: '100%' }}>
        <Map
          zoom={13}
          center={activeCenter}
          
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        >
          {pharmacies.map((pharmacy, index) => (
            <AdvancedMarker
              key={pharmacy.id}
              position={{ 
                lat: pharmacy.coordinates[1], 
                lng: pharmacy.coordinates[0] 
              }}
              onClick={() => onMarkerClick(pharmacy)}
            >
              <div style={{
                background: pharmacy.status === 'open' ? '#10B981' : '#EF4444',
                padding: '4px 8px',
                borderRadius: '4px',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {pharmacy.name}
              </div>
            </AdvancedMarker>
          ))}
        </Map>
      </div>
    </APIProvider>
  );
};

export default GoogleMap;