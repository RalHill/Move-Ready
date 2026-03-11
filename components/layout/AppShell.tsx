'use client';
import { ReactNode, useState } from 'react';
import Sidebar from './sidebar';

export default function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .app-shell {
            display: flex;
            flex-direction: column;
            height: 100vh;
            overflow: hidden;
          }
          .app-shell-sidebar {
            position: fixed;
            left: 0;
            top: 56px;
            bottom: 0;
            width: 220px;
            z-index: 999;
            transform: ${sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'};
            transition: transform 0.3s ease-in-out;
          }
          .app-shell-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 998;
            display: ${sidebarOpen ? 'block' : 'none'};
          }
          .app-shell-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: var(--bg-base);
            width: 100%;
          }
          .app-shell-header {
            display: flex;
            align-items: center;
            height: 56px;
            padding: 0 16px;
            border-bottom: 1px solid var(--border);
            background: var(--bg-surface);
            gap: 12px;
          }
        }
        @media (min-width: 768px) {
          .app-shell {
            display: flex;
            height: 100vh;
            overflow: hidden;
          }
          .app-shell-sidebar {
            position: static;
            width: 220px;
            transform: translateX(0);
          }
          .app-shell-overlay {
            display: none !important;
          }
          .app-shell-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: var(--bg-base);
          }
          .app-shell-header {
            display: none;
          }
        }
      `}</style>

      <div className="app-shell">
        {/* Sidebar */}
        <div className="app-shell-sidebar">
          <Sidebar />
        </div>

        {/* Mobile overlay */}
        <div 
          className="app-shell-overlay"
          onClick={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <div className="app-shell-content">
          {/* Mobile header with hamburger */}
          <div className="app-shell-header">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: 18,
              }}
            >
              ☰
            </button>
            <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'Syne, sans-serif' }}>
              Move Ready
            </span>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}
