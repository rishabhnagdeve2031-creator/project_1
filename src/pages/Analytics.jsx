import React from 'react';
import { useAppContext } from '../context/AppContext';
import {
  DETECTION_CHART_DATA,
  ZONE_DISTRIBUTION
} from '../data/demoData';

export default function Analytics() {
  const { isRealMode, analytics, observations, tigerProfiles, quarantine } = useAppContext();

  // Zone counts for Real Mode
  const zoneCounts = isRealMode
    ? [
        { zone: 'Core Zone', count: observations.filter(o => (o.zone || '').includes('Core')).length, color: '#10b981' },
        { zone: 'Buffer Zone', count: observations.filter(o => (o.zone || '').includes('Buffer')).length, color: '#f59e0b' },
        { zone: 'Boundary Zone', count: observations.filter(o => (o.zone || '').includes('Boundary')).length, color: '#ef4444' },
      ]
    : ZONE_DISTRIBUTION;

  const totalZoneObs = zoneCounts.reduce((acc, z) => acc + z.count, 0) || 1;

  // Real vs Demo Detections
  const tigerList = isRealMode
    ? tigerProfiles.map(t => ({
        id: t.id,
        name: t.display_name || t.name,
        count: observations.filter(o => (o.tiger_id || o.tigerId) === t.id).length
      }))
    : [];

  return (
    <div className="pg-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Analytics & Spatial Intelligence</h2>
          <p className="page-subtitle">
            {isRealMode ? 'Real SQLite Analytics & Detection Distributions' : 'Demo Spatial Trends & Sample Statistics'}
          </p>
        </div>
        <div className={`proto-badge ${isRealMode ? 'real' : 'demo'}`}>
          {isRealMode ? 'REAL SQLITE DATA' : 'SAMPLE DEMO DATA'}
        </div>
      </div>

      <div className="analytics-grid">
        {/* Zone Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h4>Observations by Protected Zone</h4>
          </div>
          <div className="zone-dist-list">
            {zoneCounts.map((item, idx) => (
              <div key={idx} className="zone-bar-item">
                <div className="zone-bar-label-row">
                  <span className="z-name">{item.zone}</span>
                  <span className="z-val font-mono" style={{ color: item.color }}>{item.count} Sighting(s)</span>
                </div>
                <div className="z-bar-bg">
                  <div className="z-bar-fill" style={{ width: `${(item.count / totalZoneObs) * 100}%`, background: item.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real Mode: Individual Tiger Observations or Demo Bar Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h4>{isRealMode ? 'Individual Tiger Sighting Frequency' : 'Tiger Detections (7 Days)'}</h4>
          </div>
          {isRealMode ? (
            <div className="zone-dist-list">
              {tigerList.map((t, idx) => (
                <div key={idx} className="zone-bar-item">
                  <div className="zone-bar-label-row">
                    <span className="z-name font-mono">{t.id} - {t.name}</span>
                    <span className="z-val font-mono" style={{ color: '#10b981' }}>{t.count} Sighting(s)</span>
                  </div>
                  <div className="z-bar-bg">
                    <div className="z-bar-fill" style={{ width: `${Math.min(100, (t.count / Math.max(1, observations.length)) * 100)}%`, background: '#10b981' }}></div>
                  </div>
                </div>
              ))}
              {tigerList.length === 0 && (
                <div style={{ textAlign: 'center', color: '#64748b', padding: 24, fontSize: 12 }}>
                  No individual tiger profiles enrolled in database yet.
                </div>
              )}
            </div>
          ) : (
            <div className="bar-chart-container">
              {DETECTION_CHART_DATA.map((item, idx) => (
                <div key={idx} className="bar-col">
                  <div className="bar-val font-mono">{item.count}</div>
                  <div className="bar-fill-wrapper">
                    <div className="bar-fill" style={{ height: `${(item.count / 20) * 100}%` }}></div>
                  </div>
                  <div className="bar-label">{item.day}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Efficiency & Blank Quarantine Ratio */}
        <div className="chart-card span-2">
          <div className="chart-header">
            <h4>📊 Automated Ingestion Throughput & Storage Reduction</h4>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Total Scanned</div>
              <div className="font-mono" style={{ fontSize: 20, fontWeight: 'bold', color: '#60a5fa', marginTop: 4 }}>
                {isRealMode ? (analytics?.total_images || observations.length + quarantine.length) : 320}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Blank Frames Quarantined</div>
              <div className="font-mono" style={{ fontSize: 20, fontWeight: 'bold', color: '#9ca3af', marginTop: 4 }}>
                {isRealMode ? (analytics?.blank_images || quarantine.length) : 248}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Real Tiger Detections</div>
              <div className="font-mono" style={{ fontSize: 20, fontWeight: 'bold', color: '#10b981', marginTop: 4 }}>
                {isRealMode ? (analytics?.tiger_detections || observations.length) : 36}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Estimated Storage Saved</div>
              <div className="font-mono" style={{ fontSize: 20, fontWeight: 'bold', color: '#8b5cf6', marginTop: 4 }}>
                {isRealMode ? `${analytics?.storage_saved_mb || 0} MB` : '0.62 GB'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .pg-page { padding: 20px 24px; overflow-y: auto; height: 100%; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .page-title { font-size: 20px; font-weight: 700; color: var(--text-bright); margin: 0 0 4px 0; }
        .page-subtitle { font-size: 12px; color: var(--text-dim); margin: 0; }

        .proto-badge { font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 4px; }
        .proto-badge.real { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #34d399; }
        .proto-badge.demo { background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); color: #fbbf24; }

        .analytics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }

        .chart-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 18px; display: flex; flex-direction: column; }
        .chart-card.span-2 { grid-column: span 2; }

        .chart-header { margin-bottom: 16px; }
        .chart-header h4 { font-size: 14px; font-weight: 700; color: var(--text-bright); margin: 0; }

        .bar-chart-container { display: flex; justify-content: space-between; align-items: flex-end; height: 180px; padding-top: 20px; }
        .bar-col { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; height: 100%; justify-content: flex-end; }
        .bar-val { font-size: 11px; color: #10b981; font-weight: 700; }
        .bar-fill-wrapper { width: 28px; height: 120px; background: rgba(255,255,255,0.03); border-radius: 4px; overflow: hidden; display: flex; align-items: flex-end; }
        .bar-fill { width: 100%; background: linear-gradient(180deg, #10b981, #059669); border-radius: 4px; }
        .bar-label { font-size: 11px; color: var(--text-dim); }

        .zone-dist-list { display: flex; flex-direction: column; gap: 16px; justify-content: center; height: 100%; }
        .zone-bar-item { display: flex; flex-direction: column; gap: 6px; }
        .zone-bar-label-row { display: flex; justify-content: space-between; font-size: 12px; }
        .z-name { color: var(--text-main); font-weight: 600; }
        .z-val { font-weight: 700; }
        .z-bar-bg { width: 100%; height: 8px; background: rgba(255,255,255,0.04); border-radius: 4px; overflow: hidden; }
        .z-bar-fill { height: 100%; border-radius: 4px; }

        @media (max-width: 900px) {
          .analytics-grid { grid-template-columns: 1fr; }
          .chart-card.span-2 { grid-column: span 1; }
        }
      `}</style>
    </div>
  );
}
