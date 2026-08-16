import React from 'react';

export default function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'batch-processing', label: '📁 Batch Processing' },
    { id: 'camera-traps', label: '📷 Camera Traps' },
    { id: 'ai-triage', label: '🔬 AI Triage' },
    { id: 'tiger-intelligence', label: '🐅 Individual Tigers' },
    { id: 'movement-map', label: '🗺 Movement Intelligence' },
    { id: 'observations', label: '📋 Observations' },
    { id: 'alerts', label: '🚨 Alerts' },
    { id: 'audit-log', label: '📜 Audit Log' },
    { id: 'analytics', label: '📈 Analytics' },
    { id: 'system-health', label: '⚙ System Health' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-section-title font-mono">NAVIGATION MENU</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="nav-item-content">
                <span className="nav-label">{item.label}</span>
              </div>
              {isActive && <div className="active-indicator-bar" />}
            </button>
          );
        })}
      </nav>

      <style>{`
        .sidebar {
          width: 260px;
          height: 100%;
          background-color: var(--bg-sidebar);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          padding: 20px 12px;
          user-select: none;
          flex-shrink: 0;
        }

        .sidebar-header {
          padding: 0 12px 12px 12px;
        }

        .sidebar-section-title {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-dim);
          letter-spacing: 1px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
        }

        .nav-item:hover {
          background-color: rgba(255, 255, 255, 0.03);
          color: var(--text-main);
          border-color: rgba(255, 255, 255, 0.05);
        }

        /* Forest Green Active State */
        .nav-item.active {
          background-color: var(--forest-green-active-bg);
          color: var(--forest-green-light);
          font-weight: 600;
          border: 1px solid rgba(16, 185, 129, 0.35);
          box-shadow: inset 0 0 10px rgba(16, 185, 129, 0.08), 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .nav-label {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .active-indicator-bar {
          position: absolute;
          left: 0;
          top: 8px;
          bottom: 8px;
          width: 4px;
          background-color: var(--forest-green);
          border-radius: 0 4px 4px 0;
          box-shadow: 0 0 8px var(--forest-green);
        }
      `}</style>
    </aside>
  );
}

