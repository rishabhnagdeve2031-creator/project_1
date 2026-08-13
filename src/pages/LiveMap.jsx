import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Tooltip, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TIGERS } from '../data/tigers';
import { useSimulationEngine } from '../hooks/useSimulationEngine';

// Official Umred–Karhandla Wildlife Sanctuary Boundary Coordinates (Decimal Degrees)
const CORE_ZONE_COORDS = [
  [20.911556, 79.479558], // A
  [20.890007, 79.463845], // B
  [20.905710, 79.553886], // C
  [20.863076, 79.561719], // D
  [20.843620, 79.623659], // E
  [20.801731, 79.620864], // F
  [20.751294, 79.565881], // G
  [20.764631, 79.539049], // H
  [20.786409, 79.579953], // I
  [20.810088, 79.568598], // J
  [20.836484, 79.560806], // K
  [20.862736, 79.498706], // L
  [20.791864, 79.509774], // M
  [20.808318, 79.475095], // N
  [20.812056, 79.382857], // O
  [20.883484, 79.386471]  // P
];

// Helper to expand polygon outward from centroid for demo buffer and transition zones
function createBufferedPolygon(coords, scaleFactor) {
  const centerLat = coords.reduce((sum, p) => sum + p[0], 0) / coords.length;
  const centerLng = coords.reduce((sum, p) => sum + p[1], 0) / coords.length;

  return coords.map(([lat, lng]) => {
    const dLat = lat - centerLat;
    const dLng = lng - centerLng;
    return [centerLat + dLat * scaleFactor, centerLng + dLng * scaleFactor];
  });
}

const BUFFER_ZONE_COORDS = createBufferedPolygon(CORE_ZONE_COORDS, 1.35);
const TRANSITION_ZONE_COORDS = createBufferedPolygon(CORE_ZONE_COORDS, 1.75);

// Tiger Marker Component
function TigerMarkerComponent({ tiger, isSelected, onSelect }) {
  const map = useMap();
  
  React.useEffect(() => {
    if (isSelected) {
      map.flyTo([tiger.lat, tiger.lng], 14, { duration: 1.2 });
    }
  }, [isSelected, tiger.lat, tiger.lng, map]);

  const icon = L.divIcon({
    className: 'tiger-marker',
    html: `<div style="background-color: ${tiger.color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5); cursor: pointer; ${isSelected ? 'box-shadow: 0 0 12px ' + tiger.color : ''}">🐅</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <Marker position={[tiger.lat, tiger.lng]} icon={icon} eventHandlers={{ click: () => onSelect(tiger) }}>
      <Popup>
        <div style={{ padding: '4px' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', color: tiger.color }}>{tiger.name}</h3>
          <p style={{ margin: '4px 0', fontSize: '12px' }}>ID: {tiger.id}</p>
          <p style={{ margin: '4px 0', fontSize: '12px' }}>Speed: {tiger.speed} km/h</p>
          <p style={{ margin: '4px 0', fontSize: '12px' }}>Zone: {tiger.currentZone}</p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function LiveMap() {
  // Center positioned to encompass Nagpur City (21.1458, 79.0882) and Umred-Karhandla Sanctuary
  const initialCenter = [21.01, 79.28];
  const initialZoom = 10;
  
  const {
    tigers,
    isRunning,
    isLoading,
    hasMoved,
    startSimulation,
    stopSimulation,
    resetSimulation,
    stepSingleTick
  } = useSimulationEngine(TIGERS);
  
  const [selectedTiger, setSelectedTiger] = useState(TIGERS[0]);

  return (
    <div className="live-map-container-with-telemetry">
      {/* Simulation Controls Header */}
      <div className="sim-controls-header">
        <div className="control-group">
          <button
            className={`control-btn btn-start ${isRunning ? 'active' : ''}`}
            onClick={startSimulation}
            disabled={isRunning || isLoading}
            title="Start simulation"
          >
            ▶ Start
          </button>
          <button
            className="control-btn btn-pause"
            onClick={stopSimulation}
            disabled={!isRunning || isLoading}
            title="Pause simulation"
          >
            ⏸ Pause
          </button>
          <button
            className="control-btn btn-reset"
            onClick={resetSimulation}
            disabled={(!hasMoved && !isRunning) || isLoading}
            title="Reset to initial positions"
          >
            ↺ Reset
          </button>
          <span className="divider">|</span>
          <button
            className="control-btn btn-tick"
            onClick={stepSingleTick}
            disabled={isRunning || isLoading}
            title="Execute single tick"
          >
            ⟩ Tick
          </button>
        </div>
        <div className="status-display">
          {isRunning && <span className="status-badge running">🔴 RUNNING</span>}
          {!isRunning && <span className="status-badge stopped">⚪ PAUSED</span>}
          {isLoading && <span className="status-badge loading">⌛ LOADING</span>}
        </div>
      </div>

      <div className="live-map-wrapper">
        {/* Map Legend Overlay */}
        <div className="map-legend font-mono">
          <div className="legend-header">NAGPUR REGION ZONES</div>
          <div className="legend-items">
            <div className="legend-item">
              <span className="dot">🟢</span>
              <span>Core / Protected Area</span>
            </div>
            <div className="legend-item">
              <span className="dot">🟡</span>
              <span>Buffer Zone — Demo</span>
            </div>
            <div className="legend-item">
              <span className="dot">🟠</span>
              <span>Transition Zone — Demo</span>
            </div>
          </div>
        </div>

        {/* Interactive Leaflet Map */}
        <MapContainer
          center={initialCenter}
          zoom={initialZoom}
          scrollWheelZoom={true}
          className="leaflet-map-frame"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

        {/* 1. TRANSITION ZONE (Outer Layer) */}
        <Polygon
          positions={TRANSITION_ZONE_COORDS}
          pathOptions={{
            color: '#f97316',
            fillColor: '#f97316',
            fillOpacity: 0.18,
            weight: 2,
            dashArray: '5, 5'
          }}
        >
          <Tooltip sticky>Transition Zone — Demo</Tooltip>
          <Popup>
            <div className="zone-popup">
              <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#ea580c' }}>
                Transition Zone
              </h3>
              <p style={{ margin: '4px 0', fontSize: '12px', color: '#374151' }}>
                <strong>Type:</strong> Monitoring simulation
              </p>
              <p style={{ margin: '4px 0', fontSize: '12px', color: '#374151' }}>
                <strong>Status:</strong> Demo
              </p>
            </div>
          </Popup>
        </Polygon>

        {/* 2. BUFFER ZONE (Middle Layer) */}
        <Polygon
          positions={BUFFER_ZONE_COORDS}
          pathOptions={{
            color: '#eab308',
            fillColor: '#eab308',
            fillOpacity: 0.25,
            weight: 2,
            dashArray: '4, 4'
          }}
        >
          <Tooltip sticky>Buffer Zone — Demo</Tooltip>
          <Popup>
            <div className="zone-popup">
              <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#ca8a04' }}>
                Buffer Zone
              </h3>
              <p style={{ margin: '4px 0', fontSize: '12px', color: '#374151' }}>
                <strong>Type:</strong> Geofencing simulation
              </p>
              <p style={{ margin: '4px 0', fontSize: '12px', color: '#374151' }}>
                <strong>Status:</strong> Demo
              </p>
            </div>
          </Popup>
        </Polygon>

        {/* 3. CORE ZONE (Inner Protected Area Layer) */}
        <Polygon
          positions={CORE_ZONE_COORDS}
          pathOptions={{
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.4,
            weight: 2.5
          }}
        >
          <Tooltip sticky>Core / Protected Area</Tooltip>
          <Popup>
            <div className="zone-popup">
              <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#047857' }}>
                Core / Protected Area
              </h3>
              <p style={{ margin: '4px 0', fontSize: '12px', color: '#374151' }}>
                <strong>Type:</strong> Wildlife Sanctuary reference
              </p>
              <p style={{ margin: '4px 0', fontSize: '12px', color: '#374151' }}>
                <strong>Status:</strong> Official boundary reference
              </p>
            </div>
          </Popup>
        </Polygon>

        {/* Tiger Path History Lines and Markers */}
        {tigers.map((tiger) => (
          <React.Fragment key={tiger.id}>
            {/* Tiger Movement History Path */}
            {tiger.pathHistory.length > 0 && (
              <Polyline
                positions={tiger.pathHistory.map(p => [p.lat, p.lng])}
                pathOptions={{
                  color: tiger.color,
                  weight: 2,
                  opacity: 0.4,
                  dashArray: '3, 3'
                }}
              />
            )}
            {/* Tiger Current Position Marker */}
            <TigerMarkerComponent
              tiger={tiger}
              isSelected={selectedTiger?.id === tiger.id}
              onSelect={setSelectedTiger}
            />
          </React.Fragment>
        ))}
        </MapContainer>

        {/* Telemetry Sidebar */}
        <div className="telemetry-sidebar">
          <div className="sidebar-header">
            <h3 className="sidebar-title">Active Telemetry</h3>
            <span className="live-indicator">
              <span className="pulse-dot"></span> LIVE
            </span>
          </div>
          <p className="sidebar-subtitle">Umred-Karhandla Wildlife Sanctuary</p>

          <div className="tiger-list">
            {tigers.map((tiger) => {
              const isSelected = selectedTiger?.id === tiger.id;
              return (
                <div
                  key={tiger.id}
                  className={`tiger-card ${isSelected ? 'selected' : ''}`}
                  style={{ borderLeftColor: tiger.color }}
                  onClick={() => setSelectedTiger(tiger)}
                >
                  <div className="card-header">
                    <div className="tiger-name">{tiger.name}</div>
                    <span className="tiger-id">{tiger.id}</span>
                  </div>
                  <div className="tiger-stats">
                    <div className="stat">
                      <span className="label">Lat:</span>
                      <span className="value">{tiger.lat.toFixed(4)}°</span>
                    </div>
                    <div className="stat">
                      <span className="label">Lng:</span>
                      <span className="value">{tiger.lng.toFixed(4)}°</span>
                    </div>
                    <div className="stat">
                      <span className="label">Speed:</span>
                      <span className="value">{tiger.speed.toFixed(1)} km/h</span>
                    </div>
                    <div className="stat">
                      <span className="label">Zone:</span>
                      <span className="value">{tiger.currentZone}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .live-map-container-with-telemetry {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: calc(100vh - 60px);
          overflow: hidden;
          background-color: var(--bg-dark);
          display: flex;
          flex-direction: column;
        }

        .sim-controls-header {
          background-color: rgba(14, 20, 27, 0.95);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--border-subtle);
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 100;
        }

        .control-group {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .control-btn {
          padding: 6px 12px;
          background-color: rgba(79, 172, 254, 0.1);
          border: 1px solid rgba(79, 172, 254, 0.3);
          color: #4facfe;
          font-size: 12px;
          font-weight: 500;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .control-btn:hover:not(:disabled) {
          background-color: rgba(79, 172, 254, 0.2);
          border-color: rgba(79, 172, 254, 0.5);
        }

        .control-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .control-btn.active {
          background-color: #4facfe;
          color: #0e141b;
        }

        .divider {
          color: rgba(255, 255, 255, 0.2);
          margin: 0 4px;
        }

        .status-display {
          display: flex;
          gap: 8px;
        }

        .status-badge {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }

        .status-badge.running {
          background-color: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        .status-badge.stopped {
          background-color: rgba(107, 114, 128, 0.2);
          color: #9ca3af;
        }

        .status-badge.loading {
          background-color: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }

        .live-map-wrapper {
          display: flex;
          flex: 1;
          height: calc(100vh - 130px);
          overflow: hidden;
          position: relative;
        }

        .live-map-container {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: calc(100vh - 60px);
          overflow: hidden;
          background-color: var(--bg-dark);
        }

        .leaflet-map-frame {
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .map-legend {
          position: absolute;
          top: 16px;
          left: 16px;
          z-index: 1000;
          background: rgba(14, 20, 27, 0.88);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          padding: 12px 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
          user-select: none;
        }

        .legend-header {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-dim);
          letter-spacing: 0.8px;
          margin-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 4px;
        }

        .legend-items {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-main);
          font-weight: 500;
        }

        .dot {
          font-size: 12px;
          line-height: 1;
        }

        .zone-popup {
          font-family: var(--font-sans);
          padding: 4px;
        }

        .telemetry-sidebar {
          width: 320px;
          background-color: rgba(14, 20, 27, 0.95);
          backdrop-filter: blur(8px);
          border-left: 1px solid var(--border-subtle);
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 50;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .sidebar-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-bright);
          margin: 0;
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #22c55e;
          letter-spacing: 0.5px;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          background-color: #22c55e;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .sidebar-subtitle {
          font-size: 11px;
          color: var(--text-muted);
          margin: 0;
          padding-top: 4px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .tiger-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
          overflow-y: auto;
        }

        .tiger-card {
          padding: 12px;
          background-color: rgba(79, 172, 254, 0.05);
          border: 1px solid rgba(79, 172, 254, 0.2);
          border-left: 3px solid;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tiger-card:hover {
          background-color: rgba(79, 172, 254, 0.1);
          border-color: rgba(79, 172, 254, 0.3);
        }

        .tiger-card.selected {
          background-color: rgba(79, 172, 254, 0.15);
          border-color: rgba(79, 172, 254, 0.5);
          box-shadow: 0 0 8px rgba(79, 172, 254, 0.3);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .tiger-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-bright);
        }

        .tiger-id {
          font-size: 10px;
          color: var(--text-muted);
        }

        .tiger-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          font-size: 11px;
        }

        .stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat .label {
          color: var(--text-muted);
        }

        .stat .value {
          color: var(--text-main);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}



