'use client';
import { useTheme } from '@/lib/theme-provider';

interface TopbarProps {
  title: string;
  sub: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, sub, actions }: TopbarProps) {
  const { theme, toggle } = useTheme();

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .topbar {
            flex-direction: column;
            align-items: flex-start;
            padding: 12px 16px;
            gap: 8px;
            min-height: auto;
            height: auto;
          }
          .topbar-title {
            font-size: 14px;
          }
          .topbar-sub {
            font-size: 10px;
          }
          .topbar-actions {
            width: 100%;
            flex-wrap: wrap;
            gap: 6px;
          }
          .topbar-live {
            display: none !important;
          }
          .topbar-divider {
            display: none !important;
          }
          .topbar-actions > button {
            font-size: 10px !important;
            padding: 5px 8px !important;
          }
        }
        @media (min-width: 768px) {
          .topbar {
            flex-direction: row;
            align-items: center;
            padding: 0 28px;
            gap: 16px;
            height: 56px;
            min-height: 56px;
          }
          .topbar-title {
            font-size: 16px;
          }
          .topbar-sub {
            font-size: 11px;
          }
          .topbar-actions {
            flex-wrap: nowrap;
            gap: 8px;
          }
          .topbar-live {
            display: flex !important;
          }
          .topbar-divider {
            display: block !important;
          }
        }
      `}</style>
      <header className="topbar" style={{
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        background: 'var(--bg-surface)',
        transition: 'background 0.25s',
        width: '100%',
      }}>
        <div>
          <div className="topbar-title" style={{ fontFamily:'Syne,sans-serif', fontWeight:700, letterSpacing:'-0.02em', color:'var(--text-primary)' }}>
            {title}
          </div>
          <div className="topbar-sub" style={{ color:'var(--text-secondary)', fontFamily:'DM Mono,monospace' }}>
            {sub}
          </div>
        </div>

        <div className="topbar-actions" style={{ marginLeft:'auto', display:'flex', alignItems:'center' }}>
          {/* Live badge */}
          <div className="topbar-live" style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'5px 10px', borderRadius:6,
            background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.2)',
            fontSize:11, fontFamily:'DM Mono,monospace', color:'var(--green)', fontWeight:500,
          }}>
            <div style={{ width:6, height:6, background:'var(--green)', borderRadius:'50%' }} className="animate-pulse-dot" />
            LIVE
          </div>

          {actions}

          <div className="topbar-divider" style={{ width:1, height:20, background:'var(--border)', margin:'0 4px' }} />

          {/* Notification */}
          <div style={{
            width:34, height:34, borderRadius:8,
            background:'var(--bg-elevated)', border:'1px solid var(--border)',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', color:'var(--text-secondary)', fontSize:14, position:'relative',
            transition:'all 0.15s',
            flexShrink: 0,
          }}>
            🔔
            <div style={{
              position:'absolute', top:6, right:6, width:6, height:6,
              background:'var(--red)', borderRadius:'50%',
              border:'1.5px solid var(--bg-surface)',
            }} />
          </div>

          {/* Theme toggle */}
          <div
            onClick={toggle}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{
              width:34, height:34, borderRadius:8,
              background:'var(--bg-elevated)', border:'1px solid var(--border)',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', color:'var(--text-secondary)', fontSize:14,
              transition:'all 0.15s',
              flexShrink: 0,
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </div>
        </div>
      </header>
    </>
  );
}
