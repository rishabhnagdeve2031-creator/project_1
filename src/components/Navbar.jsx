import React from 'react';
import { useAppContext } from '../context/AppContext';

export default function Navbar() {
  const { appMode, toggleAppMode, isRealMode, backendStatus } = useAppContext();

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon-wrapper">
          <span className="wildlife-emoji" role="img" aria-label="wildlife">🐾</span>
        </div>
        <div className="brand-title-group">
          <h1 className="brand-title">PenchGuard AI</h1>
          <span className="brand-subtitle font-mono">AUTOMATED CAMERA TRAP & TIGER MOVEMENT INTELLIGENCE</span>
        </div>
      </div>

      <div className="navbar-actions">
        {/* Mode Selector Toggle Pill */}
        <button
          className={`mode-toggle-pill ${isRealMode ? 'mode-real' : 'mode-demo'}`}
          onClick={toggleAppMode}
          title="Click to switch between Real Data Mode and Demo Mode"
        >
          <span className="mode-dot"></span>
          <span className="mode-label font-mono">
            {isRealMode ? '🟢 REAL DATA MODE (PRIMARY)' : '🟡 DEMO MODE (PRESENTATION)'}
          </span>
        </button>

        {/* Real Backend Connection Status */}
        <div className={`backend-status-chip ${backendStatus.connected ? 'online' : 'warning'}`}>
          <span className="status-dot"></span>
          <span className="status-text font-mono">
            {backendStatus.connected
              ? `YOLO ONLINE (${backendStatus.model_path?.split('\\').pop().split('/').pop() || 'best.pt'})`
              : 'YOLO BACKEND OFFLINE'}
          </span>
        </div>
      </div>

      <style>{`
        .navbar {
          height: 60px;
          background-color: var(--bg-navbar);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          user-select: none;
          z-index: 100;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon-wrapper {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(4, 120, 87, 0.3));
          border: 1px solid rgba(16, 185, 129, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.15);
        }

        .wildlife-emoji {
          font-size: 20px;
          line-height: 1;
        }

        .brand-title-group {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-bright);
          letter-spacing: -0.3px;
          margin: 0;
          line-height: 1.2;
        }

        .brand-subtitle {
          font-size: 9px;
          color: var(--forest-green-light);
          letter-spacing: 1px;
          opacity: 0.85;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mode-toggle-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 11px;
          font-weight: 700;
          border: 1px solid;
        }

        .mode-toggle-pill.mode-real {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.5);
          color: #34d399;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.2);
        }

        .mode-toggle-pill.mode-demo {
          background: rgba(245, 158, 11, 0.15);
          border-color: rgba(245, 158, 11, 0.5);
          color: #fbbf24;
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.2);
        }

        .mode-toggle-pill:hover {
          transform: translateY(-1px);
        }

        .mode-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
          box-shadow: 0 0 8px currentColor;
        }

        .backend-status-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .backend-status-chip.online {
          border-color: rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .backend-status-chip.warning {
          border-color: rgba(239, 68, 68, 0.3);
          color: #f87171;
        }

        .backend-status-chip .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }
      `}</style>
    </header>
  );
}
