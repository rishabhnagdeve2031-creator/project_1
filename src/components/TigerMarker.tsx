import React, { useMemo } from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { Tiger } from '../data/tigers';

interface TigerMarkerProps {
  tiger: Tiger;
  isSelected?: boolean;
  onSelect?: (tiger: Tiger) => void;
}

/**
 * Creates a custom HTML Leaflet DivIcon for the Tiger.
 * Displays: Tiger Icon, Name, and Current GPS Coordinates.
 */
const createTigerIcon = (tiger: Tiger, isSelected: boolean) => {
  const iconHtml = `
    <div class="tiger-marker-wrapper ${isSelected ? 'is-selected' : ''}">
      <div class="pulse-ring" style="--marker-color: ${tiger.color}"></div>
      <div class="tiger-badge" style="background-color: ${tiger.color}">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3c0 1.66 1.34 3 3 3s3-1.34 3-3a3 3 0 0 0-3-3z"/>
          <path d="M6 5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/>
          <path d="M18 5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/>
          <path d="M5.5 12a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/>
          <path d="M18.5 12a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/>
          <path d="M12 13c-2.48 0-4.5 2.02-4.5 4.5S9.52 22 12 22s4.5-2.02 4.5-4.5S14.48 13 12 13z"/>
        </svg>
      </div>
      <div class="tiger-inline-label">
        <span class="tiger-label-name">${tiger.name}</span>
        <span class="tiger-label-coords">${tiger.lat.toFixed(4)}° N, ${tiger.lng.toFixed(4)}° E</span>
      </div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-tiger-marker-node',
    iconSize: [140, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -28]
  });
};

export const TigerMarker: React.FC<TigerMarkerProps> = ({ tiger, isSelected = false, onSelect }) => {
  const customIcon = useMemo(() => createTigerIcon(tiger, isSelected), [tiger, isSelected]);

  return (
    <Marker
      position={[tiger.lat, tiger.lng]}
      icon={customIcon}
      eventHandlers={{
        click: () => {
          if (onSelect) onSelect(tiger);
        }
      }}
    >
      <Tooltip direction="top" offset={[0, -26]} opacity={0.95} sticky>
        <div className="tooltip-content">
          <strong>🐅 {tiger.name}</strong>
          <div>{tiger.lat.toFixed(4)}° N, {tiger.lng.toFixed(4)}° E</div>
          <div className="tooltip-zone">{tiger.currentZone}</div>
        </div>
      </Tooltip>

      <Popup className="tiger-glass-popup">
        <div className="popup-container">
          <div className="popup-header" style={{ borderLeftColor: tiger.color }}>
            <div className="popup-title-row">
              <span className="popup-icon" style={{ backgroundColor: tiger.color }}>🐅</span>
              <div>
                <h3 className="popup-title">{tiger.name}</h3>
                <span className="popup-id">ID: {tiger.id}</span>
              </div>
            </div>
          </div>

          <div className="popup-body">
            <div className="popup-grid">
              <div className="popup-data-item">
                <span className="data-label">Latitude</span>
                <span className="data-value">{tiger.lat.toFixed(6)}° N</span>
              </div>
              <div className="popup-data-item">
                <span className="data-label">Longitude</span>
                <span className="data-value">{tiger.lng.toFixed(6)}° E</span>
              </div>
              <div className="popup-data-item">
                <span className="data-label">Current Zone</span>
                <span className="data-value zone-badge">{tiger.currentZone}</span>
              </div>
              <div className="popup-data-item">
                <span className="data-label">Previous Zone</span>
                <span className="data-value">{tiger.previousZone}</span>
              </div>
              <div className="popup-data-item">
                <span className="data-label">Current Speed</span>
                <span className="data-value">{tiger.speed} km/h</span>
              </div>
              <div className="popup-data-item">
                <span className="data-label">Telemetry Points</span>
                <span className="data-value">{tiger.pathHistory.length} logs</span>
              </div>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};
