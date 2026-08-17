import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Camera, Wifi, WifiOff, AlertTriangle, Clock, Image } from 'lucide-react';

export default function ForestCameras() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState(null);

  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    setLoading(true);
    try {
      const { data: sightings } = await supabase.from('sightings').select('*');
      const sightingList = sightings || [];

      // Build camera data from sightings
      const cameraMap = {};
      sightingList.forEach(s => {
        if (!cameraMap[s.camera_id]) {
          cameraMap[s.camera_id] = {
            id: s.camera_id,
            zone: s.zone,
            lat: s.lat,
            lng: s.lng,
            status: 'ONLINE',
            lastTransmission: s.timestamp,
            detections: 0,
            sightings: []
          };
        }
        cameraMap[s.camera_id].detections++;
        cameraMap[s.camera_id].sightings.push(s);
        // Use latest sighting timestamp
        if (new Date(s.created_at) > new Date(cameraMap[s.camera_id].lastCreatedAt || 0)) {
          cameraMap[s.camera_id].lastTransmission = s.timestamp;
          cameraMap[s.camera_id].lastCreatedAt = s.created_at;
        }
      });

      setCameras(Object.values(cameraMap));
    } catch (err) {
      console.error('Error loading cameras:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    ONLINE: { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.4)' },
    OFFLINE: { bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.4)' },
    WARNING: { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.4)' }
  };

  return (
    <div className="fc-page">
      <div className="fc-header">
        <div>
          <h1 className="fc-title">Camera Trap Monitoring</h1>
          <p className="fc-subtitle font-mono">FIELD STATION NETWORK — PENCH TIGER RESERVE</p>
        </div>
        <div className="fc-summary font-mono">
          <span className="summary-item"><Wifi className="w-3.5 h-3.5 text-emerald-400" /> {cameras.filter(c => c.status === 'ONLINE').length} Online</span>
          <span className="summary-item"><Camera className="w-3.5 h-3.5 text-cyan-400" /> {cameras.length} Total</span>
        </div>
      </div>

      {loading ? (
        <div className="fc-loading font-mono">Scanning station network...</div>
      ) : cameras.length === 0 ? (
        <div className="fc-loading font-mono">No camera stations detected. Process sightings to populate.</div>
      ) : (
        <div className="fc-grid">
          {cameras.map(cam => {
            const style = statusColors[cam.status] || statusColors.ONLINE;
            return (
              <div
                key={cam.id}
                className={`cam-card ${selectedCamera === cam.id ? 'expanded' : ''}`}
                onClick={() => setSelectedCamera(selectedCamera === cam.id ? null : cam.id)}
              >
                <div className="cam-card-header">
                  <div className="cam-icon-wrapper">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="cam-info">
                    <h4 className="cam-id font-mono">{cam.id}</h4>
                    <span className="cam-zone">{cam.zone}</span>
                  </div>
                  <div className="cam-status-badge font-mono" style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}>
                    {cam.status === 'ONLINE' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {cam.status}
                  </div>
                </div>

                <div className="cam-stats">
                  <div className="cam-stat">
                    <span className="cs-label font-mono">DETECTIONS</span>
                    <span className="cs-value font-mono">{cam.detections}</span>
                  </div>
                  <div className="cam-stat">
                    <span className="cs-label font-mono">LAST SIGNAL</span>
                    <span className="cs-value">{cam.lastTransmission}</span>
                  </div>
                  <div className="cam-stat">
                    <span className="cs-label font-mono">LOCATION</span>
                    <span className="cs-value font-mono">{cam.lat?.toFixed(3)}°N, {cam.lng?.toFixed(3)}°E</span>
                  </div>
                </div>

                {/* Expanded: Recent Detections */}
                {selectedCamera === cam.id && cam.sightings && (
                  <div className="cam-detail-panel">
                    <h5 className="cdp-title font-mono">RECENT DETECTIONS</h5>
                    {cam.sightings.slice(0, 5).map(s => (
                      <div key={s.id} className="cdp-item">
                        <span className="cdp-tiger">🐅 {s.tiger_id}</span>
                        <span className="cdp-time">{s.timestamp}</span>
                        <span className="cdp-conf font-mono">{s.confidence}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .fc-page { padding: 0; }
        .fc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .fc-title { font-size: 20px; font-weight: 800; color: var(--text-bright); margin: 0; }
        .fc-subtitle { font-size: 10px; color: var(--forest-green-light); letter-spacing: 2px; margin-top: 4px; }
        .fc-summary { display: flex; gap: 14px; }
        .summary-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text-muted); background: rgba(14,22,17,0.6); border: 1px solid rgba(45,92,66,0.2); padding: 5px 12px; border-radius: 6px; }
        .fc-loading { text-align: center; color: var(--text-dim); font-size: 12px; padding: 40px; }

        .fc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 14px; }

        .cam-card {
          background: rgba(14,22,17,0.6); border: 1px solid rgba(45,92,66,0.2);
          border-radius: 10px; padding: 16px; cursor: pointer;
          transition: all 0.25s ease;
        }
        .cam-card:hover { border-color: rgba(45,92,66,0.5); box-shadow: 0 4px 16px rgba(0,0,0,0.3); }
        .cam-card.expanded { border-color: rgba(16,185,129,0.4); }

        .cam-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .cam-icon-wrapper { width: 36px; height: 36px; border-radius: 8px; background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.3); display: flex; align-items: center; justify-content: center; color: #22d3ee; }
        .cam-info { flex: 1; }
        .cam-id { font-size: 14px; font-weight: 700; color: var(--text-bright); margin: 0; }
        .cam-zone { font-size: 10px; color: var(--text-dim); }
        .cam-status-badge { font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 4px; border: 1px solid; display: flex; align-items: center; gap: 4px; letter-spacing: 0.5px; }

        .cam-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .cam-stat { display: flex; flex-direction: column; gap: 2px; }
        .cs-label { font-size: 8px; color: var(--text-dim); letter-spacing: 1px; font-weight: 600; }
        .cs-value { font-size: 11px; color: var(--text-main); font-weight: 600; }

        .cam-detail-panel { margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.04); }
        .cdp-title { font-size: 9px; color: var(--text-dim); letter-spacing: 1px; font-weight: 700; margin: 0 0 8px 0; }
        .cdp-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 11px; }
        .cdp-tiger { color: var(--text-bright); font-weight: 600; }
        .cdp-time { color: var(--text-muted); }
        .cdp-conf { color: #10b981; font-weight: 700; }
      `}</style>
    </div>
  );
}
