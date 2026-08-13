import React from 'react';

interface HeaderProps {
  isRunning: boolean;
  isLoading: boolean;
  hasMoved: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onTick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isRunning,
  isLoading,
  hasMoved,
  onStart,
  onStop,
  onReset,
  onTick
}) => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <h1 className="brand-title">Wildlife Simulation Engine</h1>
          <span className="brand-tagline">Jim Corbett National Park • Telemetry Control</span>
        </div>
      </div>

      {/* Professional Navbar Simulation Controls */}
      <div className="sim-navbar-controls">
        {/* ▶ Start Simulation Button */}
        <button
          className={`control-btn btn-start ${isRunning ? 'active-pulse' : ''}`}
          onClick={onStart}
          disabled={isRunning || isLoading}
          title={isRunning ? "Simulation is currently running" : "Start 2-second simulation engine"}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          <span>Start Simulation</span>
        </button>

        {/* ⏸ Pause Simulation Button */}
        <button
          className="control-btn btn-pause"
          onClick={onStop}
          disabled={!isRunning || isLoading}
          title={!isRunning ? "Simulation is currently paused" : "Pause simulation tick loop"}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
          <span>Pause Simulation</span>
        </button>

        {/* ↺ Reset Simulation Button */}
        <button
          className={`control-btn btn-reset ${isLoading ? 'is-loading' : ''}`}
          onClick={onReset}
          disabled={(!hasMoved && !isRunning) || isLoading}
          title={!hasMoved && !isRunning ? "Already at initial coordinates" : "Reset coordinates and clear movement history"}
        >
          {isLoading ? (
            <svg className="spinner-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : (
            <svg className="reset-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          )}
          <span>{isLoading ? 'Resetting...' : 'Reset Simulation'}</span>
        </button>

        <div className="divider-line"></div>

        {/* Manual Tick Button */}
        <button
          className="control-btn btn-tick"
          onClick={onTick}
          disabled={isRunning || isLoading}
          title="Execute single manual tick step"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="13 17 18 12 13 7"/>
            <polyline points="6 17 11 12 6 7"/>
          </svg>
          <span>Single Tick</span>
        </button>
      </div>

      <div className="header-meta">
        <div className="meta-badge">
          <span className="meta-label">Tick Interval</span>
          <span className="meta-value">2000 ms</span>
        </div>
        <div className="status-chip" style={{ borderColor: isRunning ? 'rgba(16, 185, 129, 0.4)' : 'rgba(148, 163, 184, 0.25)' }}>
          <span className={`status-indicator ${isRunning ? 'running' : 'idle'}`}></span>
          {isLoading ? 'Resetting...' : isRunning ? 'Engine Active' : 'Engine Idle'}
        </div>
      </div>
    </header>
  );
};
