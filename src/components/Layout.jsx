import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ activePage, setActivePage, children }) {
  return (
    <div className="layout-shell">
      <Navbar />
      <div className="layout-body">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        <main className="main-content-area">
          {children}
        </main>
      </div>

      <style>{`
        .layout-shell {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background-color: var(--bg-dark);
        }

        .layout-body {
          display: flex;
          flex: 1;
          height: calc(100vh - 60px);
          overflow: hidden;
        }

        .main-content-area {
          flex: 1;
          height: 100%;
          overflow-y: auto;
          background-color: var(--bg-dark);
          position: relative;
        }
      `}</style>
    </div>
  );
}
