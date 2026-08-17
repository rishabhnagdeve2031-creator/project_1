import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ activePage, setActivePage, children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="layout-shell">
      <Navbar isMenuOpen={isMenuOpen} onToggleMenu={toggleMenu} />
      <div className="layout-body">
        {/* Backdrop overlay for closing menu when clicking outside */}
        {isMenuOpen && (
          <div className="menu-backdrop" onClick={closeMenu} title="Click to dismiss menu" />
        )}

        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isOpen={isMenuOpen}
          onClose={closeMenu}
        />
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
          position: relative;
        }

        .menu-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(2px);
          z-index: 40;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .main-content-area {
          flex: 1;
          height: 100%;
          overflow-y: auto;
          background-color: var(--bg-dark);
          position: relative;
          transition: all 0.3s ease;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
