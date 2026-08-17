import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function CameraTraps() {
  const { cameras } = useAppContext();
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? cameras :
    filter === 'online' ? cameras.filter(c => c.status === 'online') :
    filter === 'offline' ? cameras.filter(c => c.status === 'offline') :
    cameras.filter(c => c.zone === filter);

  return (
    <div className="pg-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Camera Traps</h2>
          <p className="page-subtitle">{cameras.length} cameras deployed</p>
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
          {filtered.map(cam => (
            <div key={cam.id} className={`cam-card ${cam.status}`} onClick={() => setSelectedCamera(cam)}>
              <div className="cam-header">
                <div className="cam-id-group">
                  <span className={`status-dot ${cam.status}`}></span>
                  <span className="cam-id">{cam.id}</span>
                </div>
                <span className={`cam-tag ${cam.status}`}>{cam.status.toUpperCase()}</span>
              </div>
              <div className="cam-location">{cam.location}</div>
              <div className="cam-zone-tag">{cam.zone}</div>
              <div className="cam-stats">
                <div className="cam-stat"><span className="stat-label">Last Capture</span><span className="stat-value">🕐 {cam.lastCapture}</span></div>
                <div className="cam-stat"><span className="stat-label">Images</span><span className="stat-value">{cam.imagesProcessed}</span></div>
                <div className="cam-stat"><span className="stat-label">Detections</span><span className="stat-value">{cam.animalsDetected}</span></div>
                <div className="cam-stat"><span className="stat-label">Battery</span>
                  <span className="stat-value" style={{ color: cam.battery < 20 ? '#ef4444' : cam.battery < 50 ? '#f59e0b' : '#10b981' }}>
                    🔋 {cam.battery}%
                  </span>
                </div>
                <div className="cam-stat"><span className="stat-label">Signal</span>
                  <div className="signal-bar-container">
                    <div className="signal-bar" style={{ width: `${cam.signal}%`, background: cam.signal < 30 ? '#ef4444' : cam.signal < 60 ? '#f59e0b' : '#10b981' }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .pg-page { padding: 20px 24px; overflow-y: auto; height: 100%; }

        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .page-title { font-size: 20px; font-weight: 700; color: var(--text-bright); margin: 0 0 4px 0; }
        .page-subtitle { font-size: 12px; color: var(--text-dim); margin: 0; }

        .filter-group { display: flex; gap: 6px; flex-wrap: wrap; }
        .filter-btn {
          padding: 5px 12px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03); color: var(--text-muted); font-size: 11px; cursor: pointer;
          transition: all 0.2s; font-weight: 500;
        }
        .filter-btn:hover { background: rgba(255,255,255,0.07); color: var(--text-main); }
        .filter-btn.active { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.4); color: #34d399; font-weight: 600; }

        .cam-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }

        .cam-card {
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: 10px; padding: 16px; cursor: pointer; transition: all 0.2s;
        }
        .cam-card:hover { border-color: rgba(16,185,129,0.3); box-shadow: 0 4px 16px rgba(0,0,0,0.3); transform: translateY(-1px); }
        .cam-card.offline { opacity: 0.6; }

        .cam-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .cam-id-group { display: flex; align-items: center; gap: 8px; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-dot.online { background: #10b981; box-shadow: 0 0 8px #10b98188; }
        .status-dot.offline { background: #ef4444; }
        .cam-id { font-size: 15px; font-weight: 700; color: var(--text-bright); font-family: var(--font-mono); }
        .cam-tag { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px; }
        .cam-tag.online { background: rgba(16,185,129,0.12); color: #34d399; }
        .cam-tag.offline { background: rgba(239,68,68,0.12); color: #f87171; }

        .cam-location { font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
        .cam-zone-tag { font-size: 10px; color: var(--text-dim); background: rgba(255,255,255,0.04); padding: 2px 8px; border-radius: 4px; display: inline-block; margin-bottom: 10px; }

        .cam-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        .cam-stat { display: flex; justify-content: space-between; align-items: center; font-size: 11px; }
        .stat-label { color: var(--text-dim); }
        .stat-value { color: var(--text-main); font-weight: 500; font-family: var(--font-mono); font-size: 11px; }

        .signal-bar-container { width: 50px; height: 5px; background: rgba(255,255,255,0.07); border-radius: 3px; overflow: hidden; }
        .signal-bar { height: 100%; border-radius: 3px; transition: width 0.4s; }

        .back-btn {
          padding: 6px 14px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04); color: var(--text-muted); font-size: 12px; cursor: pointer;
          transition: all 0.2s; margin-bottom: 16px;
        }
        .back-btn:hover { background: rgba(255,255,255,0.08); color: var(--text-bright); }

        .cam-detail-card {
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: 12px; padding: 24px;
        }
        .detail-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-subtle); }
        .detail-id { font-size: 22px; font-weight: 700; font-family: var(--font-mono); color: var(--text-bright); }
        .detail-loc { font-size: 13px; color: var(--text-muted); }
        .detail-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .detail-stat {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px; padding: 14px; text-align: center;
        }
        .detail-stat-value { font-size: 20px; font-weight: 700; font-family: var(--font-mono); color: var(--text-bright); }
        .detail-stat-label { font-size: 11px; color: var(--text-dim); margin-top: 4px; }
      `}</style>
    </div>
  );
}

function CameraDetail({ camera }) {
  return (
    <div className="cam-detail-card">
      <div className="detail-header">
        <span className={`status-dot ${camera.status}`} style={{ width: 12, height: 12 }}></span>
        <div>
          <div className="detail-id">{camera.id}</div>
          <div className="detail-loc">{camera.location} — {camera.zone}</div>
        </div>
        <span className={`cam-tag ${camera.status}`} style={{ marginLeft: 'auto', fontSize: 12 }}>{camera.status.toUpperCase()}</span>
      </div>
      <div className="detail-stats">
        <div className="detail-stat">
          <div className="detail-stat-value">{camera.imagesProcessed}</div>
          <div className="detail-stat-label">Images Processed</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-value">{camera.animalsDetected}</div>
          <div className="detail-stat-label">Animals Detected</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-value" style={{ color: camera.battery < 20 ? '#ef4444' : '#10b981' }}>{camera.battery}%</div>
          <div className="detail-stat-label">Battery Level</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-value">{camera.signal}%</div>
          <div className="detail-stat-label">Signal Strength</div>
        </div>
      </div>
      <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, fontSize: 11, color: '#fbbf24' }}>
        ⚡ Prototype — Real camera feed integration requires backend connection.
      </div>
    </div>
  );
}
