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
    <header style={{
      height: 56, minHeight: 56,
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 28px', gap: 16,
      background: 'var(--bg-surface)',
      transition: 'background 0.25s',
    }}>
      <div>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, letterSpacing:'-0.02em', color:'var(--text-primary)' }}>
          {title}
        </div>
        <div style={{ fontSize:11, color:'var(--text-secondary)', fontFamily:'DM Mono,monospace' }}>
          {sub}
        </div>
      </div>

      <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
        {/* Live badge */}
        <div style={{
          display:'flex', alignItems:'center', gap:6,
          padding:'5px 10px', borderRadius:6,
          background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.2)',
          fontSize:11, fontFamily:'DM Mono,monospace', color:'var(--green)', fontWeight:500,
        }}>
          <div style={{ width:6, height:6, background:'var(--green)', borderRadius:'50%' }} className="animate-pulse-dot" />
          LIVE
        </div>

        {actions}

        <div style={{ width:1, height:20, background:'var(--border)', margin:'0 4px' }} />

        {/* Notification */}
        <div style={{
          width:34, height:34, borderRadius:8,
          background:'var(--bg-elevated)', border:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', color:'var(--text-secondary)', fontSize:14, position:'relative',
          transition:'all 0.15s',
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
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </div>
      </div>
    </header>
  );
}
