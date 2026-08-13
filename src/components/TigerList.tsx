import React from 'react';
import type { Tiger } from '../data/tigers';

interface TigerListProps {
  tigers: Tiger[];
  selectedTiger: Tiger | null;
  onSelectTiger: (tiger: Tiger) => void;
}

export const TigerList: React.FC<TigerListProps> = ({ tigers, selectedTiger, onSelectTiger }) => {
  return (
    <aside className="sidebar-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <h2>Active Telemetry</h2>
          <span className="live-pill">
            <span className="pulse-dot"></span> LIVE
          </span>
        </div>
        <p className="panel-subtitle">Jim Corbett National Park - Core Zone Monitoring</p>
      </div>

      <div className="tiger-cards-list">
        {tigers.map((tiger) => {
          const isSelected = selectedTiger?.id === tiger.id;

          return (
            <div
              key={tiger.id}
              className={`tiger-card ${isSelected ? 'selected' : ''}`}
              style={{ borderLeftColor: tiger.color }}
              onClick={() => onSelectTiger(tiger)}
            >
              <div className="card-header">
                <div className="card-identity">
                  <div className="avatar-circle" style={{ backgroundColor: `${tiger.color}22`, color: tiger.color }}>
                    🐅
                  </div>
                  <div>
                    <h3 className="tiger-title">{tiger.name}</h3>
                    <span className="tiger-id-code">ID: {tiger.id}</span>
                  </div>
                </div>
                <span className="zone-tag">{tiger.currentZone}</span>
              </div>

              <div className="card-stats-grid">
                <div className="stat-box">
                  <span className="stat-label">Latitude</span>
                  <span className="stat-value">{tiger.lat.toFixed(4)}° N</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Longitude</span>
                  <span className="stat-value">{tiger.lng.toFixed(4)}° E</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Speed</span>
                  <span className="stat-value">{tiger.speed} km/h</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Prev. Zone</span>
                  <span className="stat-value">{tiger.previousZone}</span>
                </div>
              </div>

              <div className="card-action-bar">
                <button
                  className={`locate-btn ${isSelected ? 'active' : ''}`}
                  style={{ '--btn-color': tiger.color } as React.CSSProperties}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTiger(tiger);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  {isSelected ? 'Focused on Map' : 'Locate Tiger'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel-footer">
        <div className="summary-stat">
          <span className="summary-number">{tigers.length}</span>
          <span className="summary-desc">Monitored Tigers</span>
        </div>
        <div className="summary-stat">
          <span className="summary-number">100%</span>
          <span className="summary-desc">Core Zone Active</span>
        </div>
      </div>
    </aside>
  );
};
