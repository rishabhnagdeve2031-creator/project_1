import React from 'react';
import {
  DETECTION_CHART_DATA,
  ZONE_DISTRIBUTION,
  CAMERA_ACTIVITY_DATA
} from '../data/demoData';

export default function Analytics() {
  return (
    <div className="pg-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Analytics</h2>
          <p className="page-subtitle">Spatial trends and detection statistics</p>
        </div>
        <div className="proto-badge">Sample Data</div>
      </div>

      <div className="analytics-grid">
        {/* Weekly Detections Bar Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h4>Tiger Detections (7 Days)</h4>
          </div>
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
        </div>

        {/* Zone Distribution Donut Visualizer */}
        <div className="chart-card">
          <div className="chart-header">
            <h4>Observations by Zone</h4>
          </div>
          <div className="zone-dist-list">
            {ZONE_DISTRIBUTION.map((item, idx) => (
              <div key={idx} className="zone-bar-item">
                <div className="zone-bar-label-row">
                  <span className="z-name">{item.zone}</span>
                  <span className="z-val font-mono" style={{ color: item.color }}>{item.count} Sightings</span>
                </div>
                <div className="z-bar-bg">
                  <div className="z-bar-fill" style={{ width: `${(item.count / 88) * 100}%`, background: item.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Camera Diurnal Activity */}
        <div className="chart-card span-2">
          <div className="chart-header">
            <h4>📷 Camera Trap Capture Activity by Hour</h4>
          </div>
          <div className="line-chart-sim">
            {CAMERA_ACTIVITY_DATA.map((item, idx) => (
              <div key={idx} className="line-col">
                <div className="line-val font-mono">{item.captures}</div>
                <div className="line-bar" style={{ height: `${(item.captures / 50) * 100}%` }}></div>
                <div className="line-label">{item.hour}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .pg-page { padding: 20px 24px; overflow-y: auto; height: 100%; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .page-title { font-size: 20px; font-weight: 700; color: var(--text-bright); margin: 0 0 4px 0; }
        .page-subtitle { font-size: 12px; color: var(--text-dim); margin: 0; }

        .proto-badge {
          background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3);
          color: #fbbf24; padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: 700;
        }

        .analytics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }

        .chart-card {
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: 12px; padding: 18px; display: flex; flex-direction: column;
        }
        .chart-card.span-2 { grid-column: span 2; }

        .chart-header { margin-bottom: 16px; }
        .chart-header h4 { font-size: 14px; font-weight: 700; color: var(--text-bright); margin: 0; }

        /* Bar Chart */
        .bar-chart-container { display: flex; justify-content: space-between; align-items: flex-end; height: 180px; padding-top: 20px; }
        .bar-col { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; height: 100%; justify-content: flex-end; }
        .bar-val { font-size: 11px; color: #10b981; font-weight: 700; }
        .bar-fill-wrapper { width: 28px; height: 120px; background: rgba(255,255,255,0.03); border-radius: 4px; overflow: hidden; display: flex; align-items: flex-end; }
        .bar-fill { width: 100%; background: linear-gradient(180deg, #10b981, #059669); border-radius: 4px; transition: height 0.5s; }
        .bar-label { font-size: 11px; color: var(--text-dim); }

        /* Zone Dist */
        .zone-dist-list { display: flex; flex-direction: column; gap: 16px; justify-content: center; height: 100%; }
        .zone-bar-item { display: flex; flex-direction: column; gap: 6px; }
        .zone-bar-label-row { display: flex; justify-content: space-between; font-size: 12px; }
        .z-name { color: var(--text-main); font-weight: 600; }
        .z-val { font-weight: 700; }
        .z-bar-bg { width: 100%; height: 8px; background: rgba(255,255,255,0.04); border-radius: 4px; overflow: hidden; }
        .z-bar-fill { height: 100%; border-radius: 4px; }

        /* Line Sim */
        .line-chart-sim { display: flex; justify-content: space-between; align-items: flex-end; height: 160px; padding-top: 20px; }
        .line-col { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; height: 100%; justify-content: flex-end; }
        .line-val { font-size: 10px; color: var(--text-muted); }
        .line-bar { width: 14px; background: rgba(59, 130, 246, 0.5); border-radius: 3px; }
        .line-label { font-size: 10px; color: var(--text-dim); }

        @media (max-width: 900px) {
          .analytics-grid { grid-template-columns: 1fr; }
          .chart-card.span-2 { grid-column: span 1; }
        }
      `}</style>
    </div>
  );
}
