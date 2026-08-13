import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Tiger } from '../data/tigers';
import { TigerMarker } from './TigerMarker';

interface MapViewProps {
  tigers: Tiger[];
  selectedTiger: Tiger | null;
  onSelectTiger: (tiger: Tiger) => void;
}

// Map center around Jim Corbett National Park Core Zone
const JIM_CORBETT_CENTER: [number, number] = [29.5360, 78.8820];
const DEFAULT_ZOOM = 13;

// Boundary polygon defining Jim Corbett National Park Core Zone (approximate polygon)
const CORE_ZONE_BOUNDARY: [number, number][] = [
  [29.5600, 78.8300],
  [29.5750, 78.8900],
  [29.5600, 78.9350],
  [29.5150, 78.9400],
  [29.4950, 78.8850],
  [29.5050, 78.8350]
];

// Helper subcomponent to handle programmatic map pan/zoom when a tiger is selected
const MapViewController: React.FC<{ selectedTiger: Tiger | null }> = ({ selectedTiger }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedTiger) {
      map.flyTo([selectedTiger.lat, selectedTiger.lng], 14, {
        duration: 1.2
      });
    }
  }, [selectedTiger, map]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({ tigers, selectedTiger, onSelectTiger }) => {
  return (
    <div className="map-view-wrapper">
      <MapContainer
        center={JIM_CORBETT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="leaflet-map-container"
        zoomControl={false}
      >
        {/* Dark theme GIS basemap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* Core Zone Boundary Overlay */}
        <Polygon
          positions={CORE_ZONE_BOUNDARY}
          pathOptions={{
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.08,
            weight: 2,
            dashArray: '6, 6'
          }}
        />

        {/* Static Path History Lines for each Tiger */}
        {tigers.map((tiger) => {
          if (tiger.pathHistory.length < 2) return null;
          const polylineCoords: [number, number][] = tiger.pathHistory.map((p) => [p.lat, p.lng]);

          return (
            <Polyline
              key={`path-${tiger.id}`}
              positions={polylineCoords}
              pathOptions={{
                color: tiger.color,
                weight: 3,
                opacity: 0.7,
                dashArray: '4, 8'
              }}
            />
          );
        })}

        {/* Render Tiger Markers using TigerMarker component */}
        {tigers.map((tiger) => (
          <TigerMarker
            key={tiger.id}
            tiger={tiger}
            isSelected={selectedTiger?.id === tiger.id}
            onSelect={onSelectTiger}
          />
        ))}

        <MapViewController selectedTiger={selectedTiger} />
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="map-legend">
        <div className="legend-header">
          <span className="legend-dot green"></span>
          <span>Jim Corbett Core Zone</span>
        </div>
        <div className="legend-items">
          {tigers.map((tiger) => (
            <div
              key={tiger.id}
              className={`legend-item ${selectedTiger?.id === tiger.id ? 'active' : ''}`}
              onClick={() => onSelectTiger(tiger)}
            >
              <span className="tiger-dot" style={{ backgroundColor: tiger.color }}></span>
              <span className="tiger-name-label">{tiger.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
