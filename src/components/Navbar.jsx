import React from 'react';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon-wrapper">
          <span className="wildlife-emoji" role="img" aria-label="wildlife">🐾</span>
        </div>
        <div className="brand-title-group">
          <h1 className="brand-title">Wildlife Sentinel</h1>
          <span className="brand-subtitle font-mono">EARLY WARNING & GEOFENCING SYSTEM</span>
        </div>
      </div>

      <div className="navbar-actions">
        <div className="system-status-pill font-mono">
          <span className="pulse-dot"></span>
          <span className="status-text">SYSTEM ONLINE</span>
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
          gap: 14px;
        }

        .system-status-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 20px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.3);
          font-size: 11px;
          font-weight: 600;
          color: var(--forest-green-light);
          letter-spacing: 0.5px;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.1);
        }

        .status-text {
          color: var(--forest-green-light);
        }
      `}</style>
    </header>
  );
}

