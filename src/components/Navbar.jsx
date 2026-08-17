import React from 'react';
import { useAppContext } from '../context/AppContext';

export default function Navbar({ isMenuOpen, onToggleMenu }) {
  const { toggleAppMode, isRealMode, backendStatus } = useAppContext();

  return (
    <header className="navbar">
      <div className="navbar-left">
        {/* 3-Line Navigation Menu Button (☰) */}
        <button
          className={`hamburger-btn ${isMenuOpen ? 'active' : ''}`}
          onClick={onToggleMenu}
          title="Click to open navigation menu (☰)"
          aria-label="Open Navigation Menu"
        >
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>

        <div className="navbar-brand">
          <div className="brand-icon-wrapper">
            <span className="wildlife-emoji" role="img" aria-label="wildlife">🐾</span>
          </div>
          <div className="brand-title-group">
            <h1 className="brand-title">TigerMarg</h1>
          </div>
        </div>
      </div>

      <div className="navbar-actions">
        {/* Real / Demo Mode Hardware Segmented Switch */}
        <div className="mode-segmented-switch" title="Toggle system mode between Real Data & Demo Mode">
          <button
            className={`segment-btn ${isRealMode ? 'active-real' : ''}`}
            onClick={() => !isRealMode && toggleAppMode()}
            type="button"
          >
            <span className="segment-dot"></span>
            <span>Real Data</span>
          </button>
          <button
            className={`segment-btn ${!isRealMode ? 'active-demo' : ''}`}
            onClick={() => isRealMode && toggleAppMode()}
            type="button"
          >
            <span className="segment-dot"></span>
            <span>Demo Mode</span>
          </button>
        </div>

        {/* Real Backend Connection Status */}
        <div className={`backend-status-chip ${backendStatus.connected ? 'online' : 'warning'}`}>
          <span className="status-dot"></span>
          <span className="status-text font-mono">
            {backendStatus.connected
              ? `Model Online (${backendStatus.model_path?.split('\\').pop().split('/').pop() || 'best.pt'})`
              : 'Model Offline'}
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

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .hamburger-btn {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.25s ease;
          padding: 0;
        }

        .hamburger-btn:hover {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.4);
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.2);
        }

        .hamburger-bar {
          width: 18px;
          height: 2px;
          background-color: var(--text-bright);
          border-radius: 2px;
          transition: all 0.25s ease;
        }

        .hamburger-btn:hover .hamburger-bar {
          background-color: #34d399;
        }

        .hamburger-btn.active {
          background: rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.5);
        }

        .hamburger-btn.active .hamburger-bar:nth-child(1) {
          transform: translateY(6px) rotate(45deg);
        }

        .hamburger-btn.active .hamburger-bar:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }

        .hamburger-btn.active .hamburger-bar:nth-child(3) {
          transform: translateY(-6px) rotate(-45deg);
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

        .mode-segmented-switch {
          display: flex;
          align-items: center;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 3px;
          gap: 2px;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .segment-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 16px;
          border: none;
          background: transparent;
          color: var(--text-dim);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .segment-btn .segment-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.5;
          transition: all 0.2s ease;
        }

        .segment-btn:hover {
          color: var(--text-bright);
        }

        .segment-btn.active-real {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(4, 120, 87, 0.35));
          border: 1px solid rgba(16, 185, 129, 0.5);
          color: #34d399;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
        }

        .segment-btn.active-real .segment-dot {
          opacity: 1;
          box-shadow: 0 0 6px #34d399;
        }

        .segment-btn.active-demo {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(180, 83, 9, 0.35));
          border: 1px solid rgba(245, 158, 11, 0.5);
          color: #fbbf24;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.2);
        }

        .segment-btn.active-demo .segment-dot {
          opacity: 1;
          box-shadow: 0 0 6px #fbbf24;
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
