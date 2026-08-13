import React from 'react';

export default function VillagerPanel() {
  return (
    <div className="page-container">
      <div className="placeholder-card">
        <h1 className="page-title">Villager Panel</h1>
        <p className="placeholder-text">Villager dashboard will be added later.</p>
      </div>

      <style>{`
        .page-container {
          padding: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 60px);
          width: 100%;
        }

        .placeholder-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 48px 64px;
          background-color: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          box-shadow: var(--shadow-md);
          max-width: 500px;
          width: 100%;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-bright);
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }

        .placeholder-text {
          font-size: 16px;
          color: var(--text-muted);
          margin: 0;
        }
      `}</style>
    </div>
  );
}

