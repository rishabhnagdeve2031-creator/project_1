import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, Filter, Layers } from 'lucide-react';

export default function ForestMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [tigers, setTigers] = useState([]);
  const [sightings, setSightings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterTiger, setFilterTiger] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [showAlerts, setShowAlerts] = useState(true);
  const [showCameras, setShowCameras] = useState(true);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    setLoading(true);
    try {
      const { data: tigerData } = await supabase.from('tigers').select('*');
      const { data: sightingData } = await supabase.from('sightings').select('*');
      const { data: alertData } = await supabase.from('alerts').select('*');
      setTigers(tigerData || []);
      setSightings(sightingData || []);
      setAlerts(alertData || []);
    } catch (err) {
      console.error('Error loading map data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize and render Leaflet map
  useEffect(() => {
    if (!mapRef.current || loading) return;

    import('leaflet').then(L => {
      // Cleanup previous instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current, { zoomControl: true }).setView([21.73, 79.31], 12);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        maxZoom: 19
      }).addTo(map);

      // Core Zone boundary (approximate)
      const coreZone = [
        [21.760, 79.270], [21.775, 79.310], [21.770, 79.350],
        [21.750, 79.360], [21.720, 79.340], [21.710, 79.300],
        [21.720, 79.270]
      ];
      L.polygon(coreZone, {
        color: '#10b981', fillColor: '#10b981', fillOpacity: 0.05,
        weight: 2, dashArray: '6 6'
      }).addTo(map).bindPopup('Core Zone');

      // Buffer Zone
      const bufferZone = [
        [21.780, 79.250], [21.800, 79.320], [21.790, 79.380],
        [21.750, 79.400], [21.700, 79.370], [21.680, 79.310],
        [21.690, 79.250], [21.730, 79.240]
      ];
      L.polygon(bufferZone, {
        color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.03,
        weight: 1.5, dashArray: '8 8'
      }).addTo(map).bindPopup('Buffer Zone');

      // Filtered tigers
      const filteredTigers = filterTiger === 'all' ? tigers : tigers.filter(t => t.id === filterTiger);

      // Draw tiger markers and paths
      filteredTigers.forEach(tiger => {
        if (!tiger.lat || !tiger.lng) return;

        const tigerIcon = L.divIcon({
          html: `<div style="background:${tiger.color || '#f97316'};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px ${tiger.color || '#f97316'}80;display:flex;align-items:center;justify-content:center;font-size:14px;">🐅</div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        L.marker([tiger.lat, tiger.lng], { icon: tigerIcon })
          .addTo(map)
          .bindPopup(`<b>${tiger.name}</b><br/>${tiger.id}<br/>${tiger.current_zone}<br/>${tiger.lat.toFixed(4)}°N, ${tiger.lng.toFixed(4)}°E`);

        // Path history polyline
        const pathHistory = tiger.path_history;
        if (pathHistory && Array.isArray(pathHistory) && pathHistory.length > 1) {
          const coords = pathHistory.map(p => [p.lat, p.lng]);
          L.polyline(coords, {
            color: tiger.color || '#f97316',
            weight: 3,
            opacity: 0.6,
            dashArray: '5 8'
          }).addTo(map);
        }

        // Sighting markers for this tiger
        const tigerSightings = sightings.filter(s => s.tiger_id === tiger.id);
        tigerSightings.forEach(s => {
          if (s.lat && s.lng) {
            L.circleMarker([s.lat, s.lng], {
              radius: 4,
              fillColor: tiger.color || '#22d3ee',
              color: 'white',
              weight: 1,
              fillOpacity: 0.7
            }).addTo(map).bindPopup(`<b>Sighting</b><br/>${s.camera_id}<br/>${s.timestamp}<br/>Confidence: ${s.confidence}%`);
          }
        });
      });

      // Alert markers
      if (showAlerts) {
        alerts.forEach(alert => {
          if (!alert.latitude || !alert.longitude) return;
          const alertColor = alert.severity === 'CRITICAL' ? '#ef4444' :
            alert.severity === 'HIGH' ? '#f59e0b' :
            alert.severity === 'MEDIUM' ? '#3b82f6' : '#10b981';

          L.circleMarker([parseFloat(alert.latitude), parseFloat(alert.longitude)], {
            radius: 8,
            fillColor: alertColor,
            color: alertColor,
            weight: 2,
            fillOpacity: 0.4
          }).addTo(map).bindPopup(`<b>⚠ ${alert.severity} ALERT</b><br/>${alert.alert_type}<br/>${alert.zone}<br/>${alert.description?.slice(0, 60)}...`);
        });
      }

      // Camera sighting locations (unique camera IDs)
      if (showCameras) {
        const cameraLocations = {};
        sightings.forEach(s => {
          if (s.camera_id && s.lat && s.lng && !cameraLocations[s.camera_id]) {
            cameraLocations[s.camera_id] = { lat: s.lat, lng: s.lng, id: s.camera_id };
          }
        });
        Object.values(cameraLocations).forEach(cam => {
          const camIcon = L.divIcon({
            html: `<div style="background:rgba(14,116,144,0.8);width:18px;height:18px;border-radius:3px;border:1px solid #22d3ee;display:flex;align-items:center;justify-content:center;font-size:10px;">📷</div>`,
            className: '',
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          });
          L.marker([cam.lat, cam.lng], { icon: camIcon })
            .addTo(map)
            .bindPopup(`<b>Camera: ${cam.id}</b>`);
        });
      }

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [tigers, sightings, alerts, filterTiger, showAlerts, showCameras, loading]);

  return (
    <div className="fm-page">
      <div className="fm-header">
        <div>
          <h1 className="fm-title">Tiger Movement Map</h1>
          <p className="fm-subtitle font-mono">SECURE TELEMETRY — EXACT COORDINATE ACCESS</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="fm-controls">
        <div className="fm-control-group">
          <Layers className="w-4 h-4 text-emerald-400" />
          <select className="fm-select font-mono" value={filterTiger} onChange={(e) => setFilterTiger(e.target.value)}>
            <option value="all">All Tigers</option>
            {tigers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.id})</option>)}
          </select>
        </div>

        <label className="fm-checkbox font-mono">
          <input type="checkbox" checked={showAlerts} onChange={(e) => setShowAlerts(e.target.checked)} />
          <span>Alerts</span>
        </label>

        <label className="fm-checkbox font-mono">
          <input type="checkbox" checked={showCameras} onChange={(e) => setShowCameras(e.target.checked)} />
          <span>Camera Traps</span>
        </label>
      </div>

      {/* Map Container */}
      <div className="fm-map-wrapper">
        {loading ? (
          <div className="fm-loading font-mono">Loading telemetry data...</div>
        ) : (
          <div ref={mapRef} className="fm-map-container" />
        )}
      </div>

      {/* Legend */}
      <div className="fm-legend font-mono">
        <span className="legend-item"><span className="legend-dot" style={{ background: '#10b981' }} /> Core Zone</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#f59e0b' }} /> Buffer Zone</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} /> Alert</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#22d3ee' }} /> Camera</span>
        {tigers.map(t => (
          <span key={t.id} className="legend-item"><span className="legend-dot" style={{ background: t.color }} /> {t.name}</span>
        ))}
      </div>

      <style>{`
        .fm-page { padding: 0; display: flex; flex-direction: column; height: 100%; }
        .fm-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .fm-title { font-size: 20px; font-weight: 800; color: var(--text-bright); margin: 0; }
        .fm-subtitle { font-size: 10px; color: var(--forest-green-light); letter-spacing: 2px; margin-top: 4px; }

        .fm-controls {
          display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
          margin-bottom: 14px; padding: 10px 14px; background: rgba(14,22,17,0.6);
          border: 1px solid rgba(45,92,66,0.2); border-radius: 8px;
        }
        .fm-control-group { display: flex; align-items: center; gap: 8px; }
        .fm-select { font-size: 11px; padding: 5px 10px; background: rgba(14,22,17,0.8); border: 1px solid rgba(45,92,66,0.3); color: var(--text-bright); border-radius: 5px; outline: none; cursor: pointer; }
        .fm-checkbox { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-muted); cursor: pointer; }
        .fm-checkbox input { accent-color: #10b981; }

        .fm-map-wrapper { flex: 1; min-height: 500px; border-radius: 10px; overflow: hidden; border: 1px solid rgba(45,92,66,0.2); position: relative; }
        .fm-map-container { width: 100%; height: 100%; min-height: 500px; }
        .fm-loading { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-dim); font-size: 12px; }

        .fm-legend {
          display: flex; gap: 16px; flex-wrap: wrap; padding: 10px 14px;
          background: rgba(14,22,17,0.4); border: 1px solid rgba(45,92,66,0.15);
          border-radius: 8px; margin-top: 12px; font-size: 10px; color: var(--text-muted);
        }
        .legend-item { display: flex; align-items: center; gap: 5px; }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
      `}</style>
    </div>
  );
}
