import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons (Leaflet issue with Webpack/Vite)
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const OpenStreetMap = ({ pharmacies = [], onMarkerClick }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  const defaultCenter = [40.7128, -74.0060]; // New York coordinates
  const activeCenter = pharmacies.length > 0 ? 
    [pharmacies[0].coordinates[1], pharmacies[0].coordinates[0]] : 
    defaultCenter;

  useEffect(() => {
    // Initialize map
    if (!mapInstance.current && mapRef.current) {
      mapInstance.current = L.map(mapRef.current).setView(activeCenter, 13);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    if (mapInstance.current) {
      pharmacies.forEach(pharmacy => {
        const marker = L.marker(
          [pharmacy.coordinates[1], pharmacy.coordinates[0]], 
          { icon: defaultIcon }
        )
          .addTo(mapInstance.current)
          .bindTooltip(pharmacy.name, { permanent: false, direction: 'top' })
          .on('click', () => onMarkerClick(pharmacy));

        // Custom marker styling
        const customDiv = L.DomUtil.create('div');
        customDiv.style.background = pharmacy.status === 'open' ? '#10B981' : '#EF4444';
        customDiv.style.padding = '4px 8px';
        customDiv.style.borderRadius = '4px';
        customDiv.style.color = 'white';
        customDiv.style.fontSize = '12px';
        customDiv.style.fontWeight = 'bold';
        customDiv.textContent = pharmacy.name;

        marker.bindPopup(customDiv);
        markersRef.current.push(marker);
      });

      // Adjust map view to fit markers
      if (pharmacies.length > 0) {
        const markerLocations = pharmacies.map(p => [p.coordinates[1], p.coordinates[0]]);
        mapInstance.current.fitBounds(markerLocations);
      }
    }

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [pharmacies, activeCenter, onMarkerClick]);

  return (
    <div 
      ref={mapRef} 
      style={{ height: '500px', width: '100%', borderRadius: '8px' }}
    />
  );
};

export default OpenStreetMap;