import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function CameraTraps() {
  const { cameras, isRealMode } = useAppContext();
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? cameras :
    filter === 'online' ? cameras.filter(c => (c.status || 'online') === 'online') :
    filter === 'offline' ? cameras.filter(c => c.status === 'offline') :
    cameras.filter(c => c.zone === filter);

  return (
    <div className="pg-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Camera Trap Stations</h2>
          <p className="page-subtitle">
            {isRealMode ? 'Persistent Camera Stations (SQLite)' : 'Demo Station Network'} ({cameras.length} stations active)
          </p>
        </div>
        <div className="filter-group">
          {['all', 'online', 'offline', 'Core Zone', 'Buffer Zone', 'Boundary Zone'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'online' ? '🟢 Online' : f === 'offline' ? '🔴 Offline' : f}
            </button>
          ))}
        </div>
      </div>

      {selectedCamera ? (
        <div className="cam-detail-view">
          <button className="back-btn" onClick={() => setSelectedCamera(null)}>← Back to Grid</button>
          <CameraDetail camera={selectedCamera} />
        </div>
      ) : (
        <div className="cam-grid">
          {filtered.map(cam => {
            const camId = cam.camera_id || cam.id;
            const camName = cam.name || cam.location || `Station ${camId}`;
            const camZone = cam.zone || 'Core Zone';
            const camStatus = cam.status || 'online';
            const camLast = cam.last_seen || cam.lastCapture || 'Recent';
            const camImgs = cam.image_count !== undefined ? cam.image_count : cam.imagesProcessed || 0;
            const camTigers = cam.tiger_count !== undefined ? cam.tiger_count : cam.animalsDetected || 0;
            const lat = cam.latitude || cam.lat;
            const lng = cam.longitude || cam.lng;

            return (
              <div key={camId} className={`cam-card ${camStatus}`} onClick={() => setSelectedCamera(cam)}>
                <div className="cam-header">
                  <div className="cam-id-group">
                    <span className={`status-dot ${camStatus}`}></span>
                    <span className="cam-id">{camId}</span>
                  </div>
                  <span className={`cam-tag ${camStatus}`}>{camStatus.toUpperCase()}</span>
                </div>
                <div className="cam-location">{camName}</div>
                <div className="cam-zone-tag">{camZone}</div>
                <div className="cam-stats">
                  <div className="cam-stat"><span className="stat-label">Last Sighting</span><span className="stat-value">🕐 {camLast}</span></div>
                  <div className="cam-stat"><span className="stat-label">Images Scanned</span><span className="stat-value">{camImgs}</span></div>
                  <div className="cam-stat"><span className="stat-label">Tiger Sightings</span><span className="stat-value" style={{ color: '#10b981', fontWeight: 'bold' }}>{camTigers}</span></div>
                  <div className="cam-stat"><span className="stat-label">GPS Coords</span>
                    <span className="stat-value font-mono" style={{ fontSize: 10 }}>
                      {lat && lng ? `${Number(lat).toFixed(3)}°N, ${Number(lng).toFixed(3)}°E` : 'Manual Set'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: '#64748b', background: 'var(--bg-card)', borderRadius: 10 }}>
              No camera trap stations found in database.
            </div>
          )}
        </div>
      )}

      <style>{`
        .pg-page { padding: 20px 24px; overflow-y: auto; height: 100%; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .page-title { font-size: 20px; font-weight: 700; color: var(--text-bright); margin: 0 0 4px 0; }
        .page-subtitle { font-size: 12px; color: var(--text-dim); margin: 0; }

        .filter-group { display: flex; gap: 6px; flex-wrap: wrap; }
        .filter-btn { padding: 5px 12px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: var(--text-muted); font-size: 11px; cursor: pointer; font-weight: 500; }
        .filter-btn.active { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.4); color: #34d399; font-weight: 600; }

        .cam-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
        .cam-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 16px; cursor: pointer; transition: all 0.2s; }
        .cam-card:hover { border-color: rgba(16,185,129,0.3); transform: translateY(-1px); }

        .cam-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .cam-id-group { display: flex; align-items: center; gap: 8px; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-dot.online { background: #10b981; }
        .status-dot.offline { background: #ef4444; }
        .cam-id { font-size: 15px; font-weight: 700; color: var(--text-bright); font-family: var(--font-mono); }
        .cam-tag { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.05); }

        .cam-location { font-size: 13px; color: var(--text-bright); font-weight: 600; margin-bottom: 4px; }
        .cam-zone-tag { font-size: 10px; color: var(--text-muted); margin-bottom: 12px; }
        .cam-stats { display: flex; flex-direction: column; gap: 4px; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 8px; }
        .cam-stat { display: flex; justify-content: space-between; font-size: 11px; }
        .stat-label { color: var(--text-dim); }
        .stat-value { color: var(--text-main); font-weight: 500; }

        .back-btn { padding: 8px 16px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 6px; color: var(--text-bright); font-size: 12px; cursor: pointer; margin-bottom: 16px; font-weight: 600; }
      `}</style>
    </div>
  );
}

function CameraDetail({ camera }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 24 }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Station Details: {camera.camera_id || camera.id}</h3>
      <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>Location: {camera.name || camera.location || 'Station'}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
        <div>Zone: <strong>{camera.zone || 'Core Zone'}</strong></div>
        <div>Status: <strong style={{ color: '#10b981' }}>{camera.status || 'online'}</strong></div>
        <div>Total Images Scanned: <strong>{camera.image_count || camera.imagesProcessed || 0}</strong></div>
        <div>Tiger Detections: <strong style={{ color: '#10b981' }}>{camera.tiger_count || camera.animalsDetected || 0}</strong></div>
      </div>
    </div>
  );
}
