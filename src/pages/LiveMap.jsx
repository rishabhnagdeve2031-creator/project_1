import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Tooltip, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ANIMALS, SPECIES_LABELS } from '../data/animals';
import { useSimulationEngine } from '../hooks/useSimulationEngine';

// Official Pench Tiger Reserve Boundary Coordinates (Decimal Degrees)
const CORE_ZONE_COORDS = [
  [21.7800, 79.3100],
  [21.7700, 79.3600],
  [21.7400, 79.3800],
  [21.7100, 79.3600],
  [21.7000, 79.3000],
  [21.7200, 79.2700],
  [21.7600, 79.2750]
];

function createBufferedPolygon(coords, scaleFactor) {
  const centerLat = coords.reduce((sum, p) => sum + p[0], 0) / coords.length;
  const centerLng = coords.reduce((sum, p) => sum + p[1], 0) / coords.length;
  return coords.map(([lat, lng]) => {
    const dLat = lat - centerLat;
    const dLng = lng - centerLng;
    return [centerLat + dLat * scaleFactor, centerLng + dLng * scaleFactor];
  });
}

const BUFFER_ZONE_COORDS = createBufferedPolygon(CORE_ZONE_COORDS, 1.4);
const TRANSITION_ZONE_COORDS = createBufferedPolygon(CORE_ZONE_COORDS, 1.8);

// ── Speed Classification ──────────────────────────────────────────────────────
function getSpeedLabel(speed, maxSpeed) {
  const ratio = speed / maxSpeed;
  if (ratio < 0.15) return { label: 'Resting', color: '#64748b' };
  if (ratio < 0.35) return { label: 'Walking', color: '#22c55e' };
  if (ratio < 0.60) return { label: 'Trotting', color: '#f59e0b' };
  if (ratio < 0.80) return { label: 'Running', color: '#f97316' };
  return { label: 'Sprinting', color: '#ef4444' };
}

// ── Animal Map Marker ─────────────────────────────────────────────────────────
function AnimalMarkerComponent({ animal, isSelected, onSelect }) {
  const map = useMap();

  useEffect(() => {
    if (isSelected) {
      map.flyTo([animal.lat, animal.lng], 14, { duration: 1.2 });
    }
  }, [isSelected, animal.lat, animal.lng, map]);

  const speedInfo = getSpeedLabel(animal.speed, animal.maxSpeed || 50);
  const ring = isSelected ? `0 0 0 3px ${animal.color}, 0 0 16px ${animal.color}88` : `0 0 8px ${animal.color}66`;

  const icon = L.divIcon({
    className: 'animal-marker-leaflet',
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: none;
      ">
        <div style="
          background: linear-gradient(135deg, ${animal.color}ee, ${animal.color}99);
          width: 36px; height: 36px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          border: 2.5px solid rgba(255,255,255,0.85);
          box-shadow: ${ring};
          transition: box-shadow 0.3s;
        ">${animal.emoji}</div>
        <div style="
          background: rgba(10,14,20,0.88);
          backdrop-filter: blur(6px);
          border: 1px solid ${animal.color}88;
          border-radius: 5px;
          padding: 2px 7px;
          margin-top: 4px;
          display: flex; align-items: center; gap: 5px;
          white-space: nowrap;
        ">
          <span style="font-size:11px; font-weight:700; color:#fff; font-family:monospace;">${animal.name}</span>
          <span style="
            font-size:10px; font-weight:600;
            color:${speedInfo.color};
            background: ${speedInfo.color}22;
            border-radius:3px; padding: 1px 4px;
            font-family:monospace;
          ">${animal.speed.toFixed(1)} km/h</span>
        </div>
      </div>
    `,
    iconSize: [120, 56],
    iconAnchor: [18, 18],
    popupAnchor: [42, -22]
  });

  return (
    <Marker
      position={[animal.lat, animal.lng]}
      icon={icon}
      eventHandlers={{ click: () => onSelect(animal) }}
    >
      <Popup className="animal-glass-popup">
        <div style={{ padding: '6px', minWidth: '200px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            borderBottom: `2px solid ${animal.color}66`, paddingBottom: '8px', marginBottom: '10px'
          }}>
            <span style={{ fontSize: '28px' }}>{animal.emoji}</span>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: animal.color }}>{animal.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{SPECIES_LABELS[animal.species]} · {animal.id}</div>
            </div>
          </div>

          {/* Speed Gauge */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Speed</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: speedInfo.color }}>
                {animal.speed.toFixed(2)} km/h · {speedInfo.label}
              </span>
            </div>
            <div style={{ background: '#1e293b', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, (animal.speed / (animal.maxSpeed || 50)) * 100)}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${speedInfo.color}99, ${speedInfo.color})`,
                borderRadius: '6px',
                transition: 'width 0.5s ease'
              }} />
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', textAlign: 'right' }}>
              Max: {animal.maxSpeed} km/h
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
            <div>
              <div style={{ color: '#64748b' }}>Latitude</div>
              <div style={{ color: '#e2e8f0', fontWeight: '600', fontFamily: 'monospace' }}>{animal.lat.toFixed(5)}° N</div>
            </div>
            <div>
              <div style={{ color: '#64748b' }}>Longitude</div>
              <div style={{ color: '#e2e8f0', fontWeight: '600', fontFamily: 'monospace' }}>{animal.lng.toFixed(5)}° E</div>
            </div>
            <div>
              <div style={{ color: '#64748b' }}>Current Zone</div>
              <div style={{ color: '#e2e8f0', fontWeight: '600' }}>{animal.currentZone}</div>
            </div>
            <div>
              <div style={{ color: '#64748b' }}>Telemetry Pts</div>
              <div style={{ color: '#e2e8f0', fontWeight: '600' }}>{animal.pathHistory.length} logs</div>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// ── Speed Gauge Bar (sidebar) ─────────────────────────────────────────────────
function SpeedGauge({ speed, maxSpeed, color }) {
  const pct = Math.min(100, (speed / maxSpeed) * 100);
  const info = getSpeedLabel(speed, maxSpeed);
  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '10px' }}>
        <span style={{ color: info.color, fontWeight: '700' }}>{info.label}</span>
        <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{speed.toFixed(2)} / {maxSpeed} km/h</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${info.color}88, ${info.color})`,
          borderRadius: '99px',
          transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)'
        }} />
      </div>
    </div>
  );
}

// ── Species filter pills ──────────────────────────────────────────────────────
const ALL_SPECIES = ['all', 'tiger', 'elephant', 'leopard', 'deer', 'wild_dog', 'sloth_bear'];
const SPECIES_EMOJI = {
  all: '🌿', tiger: '🐅', elephant: '🐘', leopard: '🐆',
  deer: '🦌', wild_dog: '🐕', sloth_bear: '🐻'
};

export default function LiveMap() {
  const initialCenter = [21.73, 79.31];
  const initialZoom = 11;

  const {
    tigers: animals,
    isRunning,
    isLoading,
    hasMoved,
    startSimulation,
    stopSimulation,
    resetSimulation,
    stepSingleTick
  } = useSimulationEngine(ANIMALS);

  const [selectedAnimal, setSelectedAnimal] = useState(ANIMALS[0]);
  const [speciesFilter, setSpeciesFilter] = useState('all');

  const filteredAnimals = speciesFilter === 'all'
    ? animals
    : animals.filter(a => a.species === speciesFilter);

  // Keep selectedAnimal in sync with live data
  const liveSelected = animals.find(a => a.id === selectedAnimal?.id) || animals[0];

  return (
    <div className="live-map-container-with-telemetry">
      {/* ── Simulation Controls Header ── */}
      <div className="sim-controls-header">
        <div className="control-group">
          <button
            className={`control-btn btn-start ${isRunning ? 'active' : ''}`}
            onClick={startSimulation}
            disabled={isRunning || isLoading}
            title="Start simulation"
          >▶ Start</button>
          <button
            className="control-btn btn-pause"
            onClick={stopSimulation}
            disabled={!isRunning || isLoading}
            title="Pause simulation"
          >⏸ Pause</button>
          <button
            className="control-btn btn-reset"
            onClick={resetSimulation}
            disabled={(!hasMoved && !isRunning) || isLoading}
            title="Reset to initial positions"
          >↺ Reset</button>
          <span className="divider">|</span>
          <button
            className="control-btn btn-tick"
            onClick={stepSingleTick}
            disabled={isRunning || isLoading}
            title="Execute single tick"
          >⟩ Tick</button>
        </div>

        {/* Species Filter Pills */}
        <div className="species-filter-group">
          {ALL_SPECIES.map(sp => (
            <button
              key={sp}
              className={`species-pill ${speciesFilter === sp ? 'active' : ''}`}
              onClick={() => setSpeciesFilter(sp)}
              title={sp === 'all' ? 'All Animals' : SPECIES_LABELS[sp]}
            >
              {SPECIES_EMOJI[sp]} {sp === 'all' ? 'All' : SPECIES_LABELS[sp]}
            </button>
          ))}
        </div>

        <div className="status-display">
          {isRunning && <span className="status-badge running">🔴 LIVE</span>}
          {!isRunning && <span className="status-badge stopped">⚪ PAUSED</span>}
          {isLoading && <span className="status-badge loading">⌛ LOADING</span>}
          <span className="status-badge count">{filteredAnimals.length} animals</span>
        </div>
      </div>

      <div className="live-map-wrapper">
        {/* Map Legend Overlay */}
        <div className="map-legend font-mono">
          <div className="legend-header">NAGPUR REGION ZONES</div>
          <div className="legend-items">
            <div className="legend-item"><span className="dot">🟢</span><span>Core / Protected Area</span></div>
            <div className="legend-item"><span className="dot">🟡</span><span>Buffer Zone</span></div>
            <div className="legend-item"><span className="dot">🟠</span><span>Transition Zone</span></div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '8px', paddingTop: '8px' }}>
            <div className="legend-header" style={{ marginBottom: '4px' }}>SPEED STATES</div>
            {[
              { label: 'Resting', color: '#64748b' },
              { label: 'Walking', color: '#22c55e' },
              { label: 'Trotting', color: '#f59e0b' },
              { label: 'Running', color: '#f97316' },
              { label: 'Sprinting', color: '#ef4444' },
            ].map(s => (
              <div key={s.label} className="legend-item" style={{ marginBottom: '2px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                <span style={{ fontSize: '11px' }}>{s.label}</span>
              </div>
            ))}
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

          {/* Zone Polygons */}
          <Polygon positions={TRANSITION_ZONE_COORDS} pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.12, weight: 2, dashArray: '5, 5' }}>
            <Tooltip sticky>Transition Zone</Tooltip>
          </Polygon>
          <Polygon positions={BUFFER_ZONE_COORDS} pathOptions={{ color: '#eab308', fillColor: '#eab308', fillOpacity: 0.20, weight: 2, dashArray: '4, 4' }}>
            <Tooltip sticky>Buffer Zone</Tooltip>
          </Polygon>
          <Polygon positions={CORE_ZONE_COORDS} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.35, weight: 2.5 }}>
            <Tooltip sticky>Core / Protected Area</Tooltip>
          </Polygon>

          {/* Animal Paths & Markers */}
          {filteredAnimals.map((animal) => (
            <React.Fragment key={animal.id}>
              {animal.pathHistory.length > 1 && (
                <Polyline
                  positions={animal.pathHistory.map(p => [p.lat, p.lng])}
                  pathOptions={{ color: animal.color, weight: 2, opacity: 0.45, dashArray: '3, 4' }}
                />
              )}
              <AnimalMarkerComponent
                animal={animal}
                isSelected={liveSelected?.id === animal.id}
                onSelect={setSelectedAnimal}
              />
            </React.Fragment>
          ))}
        </MapContainer>

        {/* ── Telemetry Sidebar ── */}
        <div className="telemetry-sidebar">
          <div className="sidebar-header">
            <h3 className="sidebar-title">🌿 Wildlife Telemetry</h3>
            <span className="live-indicator">
              <span className="pulse-dot"></span> LIVE
            </span>
          </div>
          <p className="sidebar-subtitle">Umred-Karhandla Wildlife Sanctuary</p>

          {/* Selected Animal Speed Panel */}
          {liveSelected && (
            <div className="selected-animal-panel" style={{ borderColor: liveSelected.color }}>
              <div className="selected-animal-header">
                <span style={{ fontSize: '24px' }}>{liveSelected.emoji}</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: liveSelected.color }}>{liveSelected.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{SPECIES_LABELS[liveSelected.species]}</div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{
                    fontSize: '18px', fontWeight: '800', fontFamily: 'monospace',
                    color: getSpeedLabel(liveSelected.speed, liveSelected.maxSpeed).color
                  }}>
                    {liveSelected.speed.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>km/h</div>
                </div>
              </div>
              <SpeedGauge speed={liveSelected.speed} maxSpeed={liveSelected.maxSpeed} color={liveSelected.color} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '8px', fontSize: '10px' }}>
                <div style={{ color: '#64748b' }}>Lat: <span style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>{liveSelected.lat.toFixed(5)}°</span></div>
                <div style={{ color: '#64748b' }}>Lng: <span style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>{liveSelected.lng.toFixed(5)}°</span></div>
                <div style={{ color: '#64748b', gridColumn: '1/-1' }}>Zone: <span style={{ color: '#e2e8f0' }}>{liveSelected.currentZone}</span></div>
              </div>
            </div>
          )}

          {/* All animals list */}
          <div className="animal-list">
            {filteredAnimals.map((animal) => {
              const isSelected = liveSelected?.id === animal.id;
              const speedInfo = getSpeedLabel(animal.speed, animal.maxSpeed);
              return (
                <div
                  key={animal.id}
                  className={`animal-card ${isSelected ? 'selected' : ''}`}
                  style={{ borderLeftColor: animal.color }}
                  onClick={() => setSelectedAnimal(animal)}
                >
                  <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px' }}>{animal.emoji}</span>
                      <div>
                        <div className="animal-name">{animal.name}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>{SPECIES_LABELS[animal.species]}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: speedInfo.color, fontFamily: 'monospace' }}>
                        {animal.speed.toFixed(1)}<span style={{ fontSize: '9px', fontWeight: '400' }}> km/h</span>
                      </div>
                      <div style={{
                        fontSize: '9px', color: speedInfo.color,
                        background: `${speedInfo.color}22`, padding: '1px 5px',
                        borderRadius: '3px', fontWeight: '600'
                      }}>
                        {speedInfo.label}
                      </div>
                    </div>
                  </div>
                  <SpeedGauge speed={animal.speed} maxSpeed={animal.maxSpeed} color={animal.color} />
                  <div className="animal-stats" style={{ marginTop: '6px' }}>
                    <div className="stat">
                      <span className="label">Lat:</span>
                      <span className="value">{animal.lat.toFixed(4)}°</span>
                    </div>
                    <div className="stat">
                      <span className="label">Lng:</span>
                      <span className="value">{animal.lng.toFixed(4)}°</span>
                    </div>
                    <div className="stat" style={{ gridColumn: '1/-1' }}>
                      <span className="label">Zone:</span>
                      <span className="value">{animal.currentZone}</span>
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
          background-color: var(--bg-dark, #0e141b);
          display: flex;
          flex-direction: column;
        }

        .sim-controls-header {
          background-color: rgba(14, 20, 27, 0.97);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 10px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          z-index: 100;
          flex-wrap: wrap;
        }

        .control-group {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .control-btn {
          padding: 5px 12px;
          background-color: rgba(79, 172, 254, 0.08);
          border: 1px solid rgba(79, 172, 254, 0.25);
          color: #4facfe;
          font-size: 12px;
          font-weight: 500;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .control-btn:hover:not(:disabled) {
          background-color: rgba(79, 172, 254, 0.18);
          border-color: rgba(79, 172, 254, 0.5);
        }
        .control-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .control-btn.active { background-color: #4facfe; color: #0e141b; }

        .divider { color: rgba(255,255,255,0.15); margin: 0 2px; }

        /* Species Filter Pills */
        .species-filter-group {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          align-items: center;
        }
        .species-pill {
          padding: 4px 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8;
          border-radius: 99px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .species-pill:hover {
          background: rgba(255,255,255,0.09);
          color: #e2e8f0;
        }
        .species-pill.active {
          background: rgba(79,172,254,0.18);
          border-color: #4facfe88;
          color: #4facfe;
          font-weight: 600;
        }

        .status-display {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .status-badge {
          padding: 3px 9px;
          font-size: 11px;
          font-weight: 600;
          border-radius: 4px;
          letter-spacing: 0.4px;
        }
        .status-badge.running { background: rgba(34,197,94,0.15); color: #22c55e; }
        .status-badge.stopped { background: rgba(107,114,128,0.15); color: #9ca3af; }
        .status-badge.loading { background: rgba(59,130,246,0.15); color: #3b82f6; }
        .status-badge.count   { background: rgba(255,255,255,0.06); color: #94a3b8; }

        .live-map-wrapper {
          display: flex;
          flex: 1;
          height: calc(100vh - 140px);
          overflow: hidden;
          position: relative;
        }

        .leaflet-map-frame {
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .map-legend {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 1000;
          background: rgba(10, 15, 22, 0.92);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          padding: 12px 14px;
          box-shadow: 0 6px 24px rgba(0,0,0,0.5);
          user-select: none;
          min-width: 160px;
        }
        .legend-header {
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.8px;
          margin-bottom: 6px;
        }
        .legend-items { display: flex; flex-direction: column; gap: 5px; }
        .legend-item { display: flex; align-items: center; gap: 7px; font-size: 12px; color: #cbd5e1; }
        .dot { font-size: 11px; }

        /* Telemetry Sidebar */
        .telemetry-sidebar {
          width: 310px;
          min-width: 280px;
          background-color: rgba(10, 15, 22, 0.97);
          backdrop-filter: blur(10px);
          border-left: 1px solid rgba(255,255,255,0.07);
          overflow-y: auto;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 50;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .sidebar-title {
          font-size: 14px;
          font-weight: 700;
          color: #e2e8f0;
          margin: 0;
        }
        .live-indicator {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          color: #22c55e;
        }
        .pulse-dot {
          width: 7px; height: 7px;
          background: #22c55e;
          border-radius: 50%;
          animation: blink 1.4s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        .sidebar-subtitle {
          font-size: 10px;
          color: #475569;
          margin: 0;
          padding-top: 4px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        /* Selected animal panel */
        .selected-animal-panel {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-left: 3px solid;
          border-radius: 8px;
          padding: 12px;
        }
        .selected-animal-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        /* Animal list */
        .animal-list {
          display: flex;
          flex-direction: column;
          gap: 7px;
          flex: 1;
          overflow-y: auto;
        }

        .animal-card {
          padding: 10px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-left: 3px solid;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .animal-card:hover {
          background: rgba(255,255,255,0.055);
          border-color: rgba(255,255,255,0.14);
        }
        .animal-card.selected {
          background: rgba(79,172,254,0.08);
          box-shadow: 0 0 0 1px rgba(79,172,254,0.25);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2px;
        }
        .animal-name {
          font-size: 13px;
          font-weight: 600;
          color: #e2e8f0;
        }
        .animal-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
          font-size: 10px;
        }
        .stat { display: flex; justify-content: space-between; align-items: center; }
        .stat .label { color: #475569; }
        .stat .value { color: #94a3b8; font-weight: 500; font-family: monospace; }

        /* Leaflet popup overrides */
        .animal-glass-popup .leaflet-popup-content-wrapper {
          background: rgba(10, 15, 22, 0.97) !important;
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.6);
          color: #e2e8f0;
        }
        .animal-glass-popup .leaflet-popup-tip {
          background: rgba(10, 15, 22, 0.97) !important;
        }
        .animal-glass-popup .leaflet-popup-content {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
