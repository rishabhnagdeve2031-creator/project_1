import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, MapPin, Activity, Eye, Clock, Shield } from 'lucide-react';

export default function ForestTigerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const [tiger, setTiger] = useState(null);
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTigerData();
  }, [id]);

  const loadTigerData = async () => {
    setLoading(true);
    try {
      const { data: tigerData } = await supabase.from('tigers').select('*').eq('id', id).single();
      const { data: sightingData } = await supabase.from('sightings').select('*').eq('tiger_id', id).order('created_at', { ascending: false });

      setTiger(tigerData);
      setSightings(sightingData || []);
    } catch (err) {
      console.error('Error loading tiger detail:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!tiger || !mapRef.current || mapInstanceRef.current) return;

    // Use Leaflet (already available)
    import('leaflet').then(L => {
      const map = L.map(mapRef.current, { zoomControl: true }).setView([tiger.lat || 21.73, tiger.lng || 79.31], 13);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        maxZoom: 19
      }).addTo(map);

      // Tiger marker
      const tigerIcon = L.divIcon({
        html: `<div style="background:${tiger.color || '#f97316'};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px ${tiger.color || '#f97316'}80;display:flex;align-items:center;justify-content:center;font-size:12px;">🐅</div>`,
        className: 'custom-tiger-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([tiger.lat, tiger.lng], { icon: tigerIcon })
        .addTo(map)
        .bindPopup(`<b>${tiger.name}</b><br/>${tiger.id}<br/>${tiger.current_zone}`);

      // Draw path history if available
      const pathHistory = tiger.path_history;
      if (pathHistory && Array.isArray(pathHistory) && pathHistory.length > 1) {
        const coords = pathHistory.map(p => [p.lat, p.lng]);
        L.polyline(coords, {
          color: tiger.color || '#f97316',
          weight: 3,
          opacity: 0.7,
          dashArray: '6 8'
        }).addTo(map);
      }

      // Add sighting markers
      sightings.forEach(s => {
        if (s.lat && s.lng) {
          L.circleMarker([s.lat, s.lng], {
            radius: 5,
            fillColor: '#22d3ee',
            color: '#0e7490',
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.6
          }).addTo(map).bindPopup(`<b>${s.camera_id}</b><br/>${s.timestamp}<br/>Confidence: ${s.confidence}%`);
        }
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [tiger, sightings]);

  if (loading) {
    return <div className="td-loading font-mono">Loading tiger telemetry...</div>;
  }

  if (!tiger) {
    return <div className="td-loading font-mono">Tiger profile not found.</div>;
  }

  const riskLevel = tiger.current_zone === 'Boundary Zone' ? 'HIGH' : tiger.current_zone === 'Buffer Zone' ? 'MEDIUM' : 'LOW';
  const riskColors = { HIGH: '#f87171', MEDIUM: '#fbbf24', LOW: '#34d399' };

  return (
    <div className="td-page">
      {/* Back Button */}
      <button className="td-back font-mono" onClick={() => navigate('/forest-tigers')}>
        <ArrowLeft className="w-4 h-4" /> BACK TO CATALOG
      </button>

      {/* Hero Profile Card */}
      <div className="td-hero" style={{ borderColor: tiger.color + '60' }}>
        <div className="hero-avatar" style={{ backgroundColor: (tiger.color || '#10b981') + '20', color: tiger.color }}>
          {tiger.emoji || '🐅'}
        </div>
        <div className="hero-info">
          <div className="hero-name-row">
            <h1 className="hero-name">{tiger.name}</h1>
            <span className="hero-id-badge font-mono" style={{ backgroundColor: tiger.color }}>{tiger.id}</span>
            <span className="hero-risk font-mono" style={{ color: riskColors[riskLevel] }}>{riskLevel} RISK</span>
          </div>
          <p className="hero-meta font-mono">
            {tiger.species?.toUpperCase() || 'TIGER'} · Zone: {tiger.current_zone} · Speed: {tiger.speed} km/h
          </p>
        </div>

        <div className="hero-stats">
          <div className="hs-item">
            <span className="hs-label font-mono">COORDINATES</span>
            <span className="hs-value font-mono">{tiger.lat?.toFixed(4)}°N, {tiger.lng?.toFixed(4)}°E</span>
          </div>
          <div className="hs-item">
            <span className="hs-label font-mono">SIGHTINGS</span>
            <span className="hs-value font-mono">{sightings.length}</span>
          </div>
          <div className="hs-item">
            <span className="hs-label font-mono">PREV ZONE</span>
            <span className="hs-value">{tiger.previous_zone}</span>
          </div>
          <div className="hs-item">
            <span className="hs-label font-mono">MAX SPEED</span>
            <span className="hs-value font-mono">{tiger.max_speed} km/h</span>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="td-map-section">
        <h3 className="section-title font-mono">
          <MapPin className="w-4 h-4 text-emerald-400" /> LOCATION & MOVEMENT TRAIL
        </h3>
        <div ref={mapRef} className="td-map-container" />
      </div>

      {/* Sighting History */}
      <div className="td-sightings-section">
        <h3 className="section-title font-mono">
          <Eye className="w-4 h-4 text-cyan-400" /> SIGHTING HISTORY ({sightings.length})
        </h3>
        {sightings.length === 0 ? (
          <div className="empty-state font-mono">No sightings recorded for this individual.</div>
        ) : (
          <div className="sightings-table-wrapper">
            <table className="sightings-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Timestamp</th>
                  <th>Camera</th>
                  <th>Zone</th>
                  <th>Confidence</th>
                  <th>Source</th>
                  <th>Coordinates</th>
                </tr>
              </thead>
              <tbody>
                {sightings.map(s => (
                  <tr key={s.id}>
                    <td className="font-mono">{s.id}</td>
                    <td>{s.timestamp}</td>
                    <td className="font-mono">{s.camera_id}</td>
                    <td><span className="zone-tag">{s.zone}</span></td>
                    <td className="font-mono conf-cell">{s.confidence}%</td>
                    <td className="font-mono">{s.detection_type || 'Automated'}</td>
                    <td className="font-mono">{s.lat?.toFixed(4)}, {s.lng?.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .td-page { padding: 0; }
        .td-loading { text-align: center; padding: 60px; color: var(--text-dim); font-size: 12px; }

        .td-back {
          display: inline-flex; align-items: center; gap: 6px; font-size: 11px;
          color: var(--text-dim); background: none; border: none; cursor: pointer;
          margin-bottom: 16px; transition: color 0.2s; letter-spacing: 1px;
        }
        .td-back:hover { color: var(--forest-green-light); }

        .td-hero {
          background: rgba(14,22,17,0.6); border: 1px solid; border-radius: 12px;
          padding: 20px; display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start;
          margin-bottom: 20px;
        }
        .hero-avatar { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }
        .hero-info { flex: 1; min-width: 200px; }
        .hero-name-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .hero-name { font-size: 22px; font-weight: 800; color: var(--text-bright); margin: 0; }
        .hero-id-badge { font-size: 10px; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 700; }
        .hero-risk { font-size: 10px; font-weight: 700; letter-spacing: 0.5px; }
        .hero-meta { font-size: 10px; color: var(--text-dim); margin-top: 6px; letter-spacing: 0.5px; }
        .hero-stats { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 4px; }
        .hs-item { display: flex; flex-direction: column; gap: 2px; }
        .hs-label { font-size: 8px; color: var(--text-dim); letter-spacing: 1px; font-weight: 600; }
        .hs-value { font-size: 13px; color: var(--text-main); font-weight: 600; }

        .td-map-section, .td-sightings-section {
          background: rgba(14,22,17,0.5); border: 1px solid rgba(45,92,66,0.2);
          border-radius: 10px; padding: 16px; margin-bottom: 20px;
        }
        .section-title { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; color: var(--text-bright); letter-spacing: 1px; margin: 0 0 12px 0; }
        .td-map-container { width: 100%; height: 400px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(45,92,66,0.2); }
        .custom-tiger-icon { background: none !important; border: none !important; }

        .empty-state { text-align: center; color: var(--text-dim); font-size: 11px; padding: 30px; }

        .sightings-table-wrapper { overflow-x: auto; }
        .sightings-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .sightings-table th { text-align: left; padding: 8px 12px; font-size: 9px; color: var(--text-dim); letter-spacing: 1px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06); text-transform: uppercase; }
        .sightings-table td { padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.03); color: var(--text-main); }
        .sightings-table tr:hover td { background: rgba(255,255,255,0.02); }
        .zone-tag { font-size: 10px; padding: 2px 6px; border-radius: 3px; background: rgba(16,185,129,0.1); color: #34d399; border: 1px solid rgba(16,185,129,0.2); }
        .conf-cell { color: #10b981; font-weight: 700; }
      `}</style>
    </div>
  );
}
