import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Tooltip, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ANIMALS, SPECIES_LABELS } from '../data/animals';
import { useSimulationEngine } from '../hooks/useSimulationEngine';
import { useAppContext } from '../context/AppContext';

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

function AnimalMarkerComponent({ animal, isSelected, onSelect }) {
  const map = useMap();

  useEffect(() => {
    if (isSelected) {
      map.flyTo([animal.lat, animal.lng], 14, { duration: 1.2 });
    }
  }, [isSelected, animal.lat, animal.lng, map]);

  const ring = isSelected ? `0 0 0 3px ${animal.color}, 0 0 16px ${animal.color}88` : `0 0 8px ${animal.color}66`;

  const icon = L.divIcon({
    className: 'animal-marker-leaflet',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: none;">
        <div style="
          background: linear-gradient(135deg, ${animal.color}ee, ${animal.color}99);
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; border: 2.5px solid rgba(255,255,255,0.85);
          box-shadow: ${ring}; transition: box-shadow 0.3s;
        ">${animal.emoji}</div>
        <div style="
          background: rgba(10,14,20,0.88); backdrop-filter: blur(6px);
          border: 1px solid ${animal.color}88; border-radius: 5px;
          padding: 2px 7px; margin-top: 4px; display: flex; align-items: center; gap: 5px; white-space: nowrap;
        ">
          <span style="font-size:11px; font-weight:700; color:#fff; font-family:monospace;">${animal.name} (${animal.id})</span>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: `2px solid ${animal.color}66`, paddingBottom: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '28px' }}>{animal.emoji}</span>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: animal.color }}>{animal.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Tiger ID: {animal.id}</div>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
            <div>Lat: <strong>{animal.lat.toFixed(4)}°N</strong></div>
            <div>Lng: <strong>{animal.lng.toFixed(4)}°E</strong></div>
            <div>Current Zone: <strong>{animal.currentZone}</strong></div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default function LiveMap() {
  const { tigerProfiles, runs, cameras } = useAppContext();
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'history-runs'
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
  const liveSelected = animals.find(a => a.id === selectedAnimal?.id) || animals[0];

  return (
    <div className="live-map-container-with-telemetry">
      <div className="sim-controls-header">
        <div className="control-group">
          <button className={`control-btn btn-start ${isRunning ? 'active' : ''}`} onClick={startSimulation} disabled={isRunning || isLoading}>▶ Start Sim</button>
          <button className="control-btn btn-pause" onClick={stopSimulation} disabled={!isRunning || isLoading}>⏸ Pause</button>
          <button className="control-btn btn-reset" onClick={resetSimulation} disabled={(!hasMoved && !isRunning) || isLoading}>↺ Reset</button>
          <button className="control-btn btn-tick" onClick={stepSingleTick} disabled={isRunning || isLoading}>⟩ Single Tick</button>
        </div>

        <div className="mode-tabs">
          <button className={`mode-btn ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
            🗺 Occupancy Map & Range Overlap
          </button>
          <button className={`mode-btn ${activeTab === 'history-runs' ? 'active' : ''}`} onClick={() => setActiveTab('history-runs')}>
            📈 Historical Run Comparison ({runs.length} Runs)
          </button>
        </div>

        <div className="status-display">
          <span className="status-badge count">{animals.length} Tigers Tracked</span>
          <span className="status-badge proto">PROTOTYPE GEOSPATIAL MAP</span>
        </div>
      </div>

      {activeTab === 'map' && (
        <div className="live-map-wrapper">
          {/* Legend Overlay */}
          <div className="map-legend font-mono">
            <div className="legend-header">PENCH TIGER RESERVE ZONES</div>
            <div className="legend-items">
              <div className="legend-item"><span className="dot">🟢</span><span>Core Zone Boundary</span></div>
              <div className="legend-item"><span className="dot">🟡</span><span>Buffer Zone</span></div>
              <div className="legend-item"><span className="dot">🔴</span><span>Sensitive Boundary Zone</span></div>
            </div>
            <div className="overlap-warning-box">
              ⚠️ <strong>Territorial Overlap Detected:</strong> TGR-01 & TGR-02 ranges overlap in Buffer Zone (Centroid distance: 3.4 km).
            </div>
          </div>

          <MapContainer center={initialCenter} zoom={initialZoom} scrollWheelZoom={true} className="leaflet-map-frame">
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Zone Polygons */}
            <Polygon positions={TRANSITION_ZONE_COORDS} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.08, weight: 2, dashArray: '5, 5' }}>
              <Tooltip sticky>Sensitive Boundary Zone</Tooltip>
            </Polygon>
            <Polygon positions={BUFFER_ZONE_COORDS} pathOptions={{ color: '#eab308', fillColor: '#eab308', fillOpacity: 0.15, weight: 2, dashArray: '4, 4' }}>
              <Tooltip sticky>Buffer Zone</Tooltip>
            </Polygon>
            <Polygon positions={CORE_ZONE_COORDS} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.25, weight: 2.5 }}>
              <Tooltip sticky>Pench Core Protected Area</Tooltip>
            </Polygon>

            {/* Addition 10: Tiger Home Range Polygons & Centroid Markers */}
            {tigerProfiles.map(tiger => (
              <React.Fragment key={`hr-${tiger.id}`}>
                {tiger.homeRangePoly && (
                  <Polygon
                    positions={tiger.homeRangePoly}
                    pathOptions={{ color: tiger.color, fillColor: tiger.color, fillOpacity: 0.18, weight: 2, dashArray: '6, 6' }}
                  >
                    <Tooltip sticky>Home Range: {tiger.name} ({tiger.id}) — Est: {tiger.estimatedAreaKm2} km²</Tooltip>
                  </Polygon>
                )}
                {/* Centroid Marker */}
                {tiger.centroid && (
                  <Marker
                    position={[tiger.centroid.lat, tiger.centroid.lng]}
                    icon={L.divIcon({
                      className: 'centroid-icon',
                      html: `<div style="background:${tiger.color}; width:12px; height:12px; border-radius:50%; border:2px solid #fff; box-shadow:0 0 8px ${tiger.color};"></div>`,
                      iconSize: [12, 12]
                    })}
                  >
                    <Tooltip>Activity Centroid: {tiger.name} ({tiger.centroid.lat.toFixed(3)}°N)</Tooltip>
                  </Marker>
                )}
              </React.Fragment>
            ))}

            {/* Camera Station Markers */}
            {cameras.map(cam => (
              <Marker
                key={cam.id}
                position={[cam.lat, cam.lng]}
                icon={L.divIcon({
                  className: 'cam-marker',
                  html: `<div style="background:${cam.status === 'online' ? '#10b981' : '#ef4444'}; color:#fff; font-size:9px; font-weight:700; padding:1px 4px; border-radius:3px; border:1px solid #000;">📷 ${cam.id}</div>`,
                  iconSize: [40, 16]
                })}
              >
                <Popup>Station {cam.id} ({cam.location}) — Installed: {cam.installationDate}</Popup>
              </Marker>
            ))}

            {/* Tigers */}
            {animals.map((animal) => (
              <React.Fragment key={animal.id}>
                {animal.pathHistory.length > 1 && (
                  <Polyline positions={animal.pathHistory.map(p => [p.lat, p.lng])} pathOptions={{ color: animal.color, weight: 3, opacity: 0.8 }} />
                )}
                <AnimalMarkerComponent animal={animal} isSelected={liveSelected?.id === animal.id} onSelect={setSelectedAnimal} />
              </React.Fragment>
            ))}
          </MapContainer>

          {/* Telemetry Sidebar */}
          <div className="telemetry-sidebar">
            <div className="sidebar-header">
              <h3 className="sidebar-title">🐅 Occupancy & Centroids</h3>
            </div>
            {tigerProfiles.map(tiger => (
              <div key={tiger.id} className="occupancy-side-card" style={{ borderLeftColor: tiger.color }} onClick={() => {
                const anim = animals.find(a => a.id === tiger.id);
                if (anim) setSelectedAnimal(anim);
              }}>
                <div className="occ-header">
                  <span className="occ-name">{tiger.name} ({tiger.id})</span>
                  <span className="occ-area font-mono" style={{ color: tiger.color }}>{tiger.estimatedAreaKm2} km²</span>
                </div>
                <div className="occ-meta font-mono">
                  <div>Centroid: {tiger.centroid?.lat.toFixed(3)}°N, {tiger.centroid?.lng.toFixed(3)}°E</div>
                  <div>Zone: {tiger.zone}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Addition 11: HISTORICAL RUN COMPARISON */}
      {activeTab === 'history-runs' && (
        <div className="runs-container">
          <div className="runs-header-card">
            <h3>📈 Historical Survey Run Comparison</h3>
            <p>Compares tiger home range occupancy, centroid shifts, and camera station capture frequency across consecutive survey runs.</p>
          </div>

          <div className="runs-grid">
            {runs.map(run => (
              <div key={run.id} className="run-card">
                <div className="run-card-header">
                  <span className="run-id font-mono">{run.id}</span>
                  <span className="run-date">{run.date}</span>
                </div>

                <div className="run-kpis">
                  <div>Images: <strong>{run.imagesProcessed}</strong></div>
                  <div>Blanks: <strong>{run.blankImages}</strong></div>
                  <div>Useful: <strong className="green">{run.usefulImages}</strong></div>
                  <div>Tigers: <strong className="orange">{run.tigerDetections}</strong></div>
                </div>

                <div className="run-occupancy-table-wrapper">
                  <table className="run-table">
                    <thead>
                      <tr>
                        <th>Tiger ID</th>
                        <th>Occupancy</th>
                        <th>Centroid</th>
                        <th>Status Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {run.occupancySummary.map((occ, i) => (
                        <tr key={i}>
                          <td className="font-mono">{occ.tigerId}</td>
                          <td className="font-mono">{occ.areaKm2} km²</td>
                          <td className="font-mono">{occ.centroid}</td>
                          <td>
                            <span className={`trend-pill ${occ.status.toLowerCase().includes('shift') || occ.status.toLowerCase().includes('absence') ? 'warn' : 'stable'}`}>
                              {occ.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .live-map-container-with-telemetry { position: relative; width: 100%; height: 100%; min-height: calc(100vh - 60px); overflow: hidden; background: #0e141b; display: flex; flex-direction: column; }
        .sim-controls-header { background: rgba(14,20,27,0.97); border-bottom: 1px solid rgba(255,255,255,0.07); padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; gap: 12px; z-index: 100; }
        .control-group { display: flex; gap: 6px; }
        .control-btn { padding: 4px 10px; background: rgba(79,172,254,0.08); border: 1px solid rgba(79,172,254,0.25); color: #4facfe; font-size: 11px; border-radius: 4px; cursor: pointer; }
        .control-btn.active { background: #4facfe; color: #000; font-weight: 700; }

        .mode-tabs { display: flex; gap: 6px; }
        .mode-btn { padding: 4px 12px; border-radius: 4px; border: 1px solid var(--border-subtle); background: rgba(255,255,255,0.03); color: var(--text-muted); font-size: 11px; cursor: pointer; font-weight: 600; }
        .mode-btn.active { background: rgba(16,185,129,0.15); border-color: #10b981; color: #34d399; }

        .status-display { display: flex; gap: 6px; }
        .status-badge { padding: 3px 8px; font-size: 10px; font-weight: 700; border-radius: 4px; }
        .status-badge.count { background: rgba(255,255,255,0.06); color: #94a3b8; }
        .status-badge.proto { background: rgba(245,158,11,0.15); color: #fbbf24; }

        .live-map-wrapper { display: flex; flex: 1; height: calc(100vh - 120px); overflow: hidden; position: relative; }
        .leaflet-map-frame { width: 100%; height: 100%; z-index: 1; }

        .map-legend { position: absolute; top: 14px; left: 14px; z-index: 1000; background: rgba(10,15,22,0.92); border: 1px solid rgba(255,255,255,0.09); border-radius: 8px; padding: 10px; min-width: 200px; }
        .legend-header { font-size: 10px; color: #64748b; font-weight: 700; margin-bottom: 4px; }
        .legend-items { display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #cbd5e1; }
        .overlap-warning-box { margin-top: 8px; padding: 6px; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); border-radius: 4px; font-size: 10px; color: #fbbf24; }

        .telemetry-sidebar { width: 280px; background: rgba(10,15,22,0.97); border-left: 1px solid rgba(255,255,255,0.07); padding: 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; z-index: 50; }
        .sidebar-title { font-size: 13px; color: #e2e8f0; margin: 0; }
        .occupancy-side-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-left: 3px solid; border-radius: 6px; padding: 8px; cursor: pointer; }
        .occ-header { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: var(--text-bright); }
        .occ-meta { font-size: 10px; color: var(--text-dim); margin-top: 4px; }

        /* Historical Runs */
        .runs-container { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
        .runs-header-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 16px; }
        .runs-header-card h3 { margin: 0 0 4px 0; font-size: 16px; color: var(--text-bright); }
        .runs-header-card p { margin: 0; font-size: 12px; color: var(--text-dim); }

        .runs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .run-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 12px; }
        .run-card-header { display: flex; justify-content: space-between; font-size: 13px; }
        .run-id { font-weight: 700; color: #10b981; }
        .run-date { color: var(--text-dim); }

        .run-kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; background: rgba(255,255,255,0.02); padding: 8px; border-radius: 6px; }
        .green { color: #10b981; } .orange { color: #f97316; }

        .run-table { width: 100%; border-collapse: collapse; font-size: 11px; }
        .run-table th, .run-table td { padding: 6px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .run-table th { color: var(--text-dim); }

        .trend-pill { font-size: 9px; font-weight: 700; padding: 2px 4px; border-radius: 3px; }
        .trend-pill.stable { background: rgba(16,185,129,0.15); color: #34d399; }
        .trend-pill.warn { background: rgba(239,68,68,0.15); color: #f87171; }

        @media (max-width: 900px) { .runs-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
