'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem { href: string; icon: string; label: string; badge?: number }

const DISPATCHER_NAV: NavItem[] = [
  { href: '/dashboard',  icon: '⊞', label: 'Dashboard' },
  { href: '/tracking',   icon: '◉', label: 'Live Tracking' },
  { href: '/analytics',  icon: '↗', label: 'Analytics' },
  { href: '/crews',      icon: '◈', label: 'Crew Management' },
];

const MANAGER_NAV: NavItem[] = [
  { href: '/dashboard',  icon: '⊞', label: 'Dashboard' },
  { href: '/tracking',   icon: '◉', label: 'Live Tracking' },
  { href: '/analytics',  icon: '↗', label: 'Analytics' },
  { href: '/crews',      icon: '◈', label: 'Crew Management' },
];

const DRIVER_NAV: NavItem[] = [
  { href: '/driver/jobs', icon: '⊞', label: 'My Jobs' },
];

interface SidebarProps {
  role?: string;
  name?: string;
}

export default function Sidebar({ role = 'dispatcher', name = 'User' }: SidebarProps) {
  const pathname = usePathname();

  const navMap = { dispatcher: DISPATCHER_NAV, manager: MANAGER_NAV, driver: DRIVER_NAV };
  const nav = navMap[role as keyof typeof navMap] || DISPATCHER_NAV;

  const roleInitial = name[0].toUpperCase();
  const roleLabel = role === 'dispatcher' ? 'Senior Dispatcher' : role === 'manager' ? 'Administrator' : 'Driver';

  return (
    <aside style={{
      width: 220, minWidth: 220,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      transition: 'background 0.25s',
    }}>
      {/* Top accent line */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:1,
        background:'linear-gradient(90deg, transparent, var(--accent), transparent)',
        opacity: 0.6,
      }} />

      {/* Brand */}
      <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:2 }}>
          <div style={{
            width:32, height:32, background:'var(--accent)', borderRadius:8,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:14,
            boxShadow:'0 0 16px var(--accent-glow)',
          }}>🚛</div>
          <span style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, letterSpacing:'-0.02em', color:'var(--text-primary)' }}>
            Move Ready
          </span>
        </div>
        <div style={{ fontSize:9, fontFamily:'DM Mono,monospace', color:'var(--text-secondary)', letterSpacing:'0.12em', textTransform:'uppercase', marginLeft:42 }}>
          Operations Center
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:2 }}>
        <div style={{ fontSize:9, fontFamily:'DM Mono,monospace', color:'var(--text-muted)', letterSpacing:'0.15em', textTransform:'uppercase', padding:'8px 10px 4px' }}>
          {role === 'driver' ? 'Assignments' : 'Operations'}
        </div>

        {nav.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration:'none' }}>
              <div style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'9px 12px', borderRadius:8, cursor:'pointer',
                fontSize:13, fontWeight:500,
                color: active ? 'var(--accent-bright)' : 'var(--text-secondary)',
                background: active ? 'var(--accent-subtle)' : 'transparent',
                border: `1px solid ${active ? 'rgba(59,130,246,0.2)' : 'transparent'}`,
                position:'relative', transition:'all 0.15s',
              }}>
                {active && (
                  <div style={{
                    position:'absolute', left:-1, top:'25%', bottom:'25%',
                    width:2, background:'var(--accent-bright)', borderRadius:'0 2px 2px 0',
                  }} />
                )}
                <span style={{ width:15, textAlign:'center', opacity:0.8 }}>{item.icon}</span>
                {item.label}
                {item.badge ? (
                  <span style={{
                    marginLeft:'auto', background:'var(--red)', color:'white',
                    fontSize:9, fontFamily:'DM Mono,monospace', padding:'1px 5px', borderRadius:99,
                  }}>{item.badge}</span>
                ) : null}
              </div>
            </Link>
          );
        })}

        <div style={{ fontSize:9, fontFamily:'DM Mono,monospace', color:'var(--text-muted)', letterSpacing:'0.15em', textTransform:'uppercase', padding:'12px 10px 4px', marginTop:4 }}>
          System
        </div>
        <Link href="/settings" style={{ textDecoration:'none' }}>
          <div style={{
            display:'flex', alignItems:'center', gap:10,
            padding:'9px 12px', borderRadius:8, cursor:'pointer',
            fontSize:13, fontWeight:500,
            color: pathname === '/settings' ? 'var(--accent-bright)' : 'var(--text-secondary)',
            background: pathname === '/settings' ? 'var(--accent-subtle)' : 'transparent',
            border: `1px solid ${pathname === '/settings' ? 'rgba(59,130,246,0.2)' : 'transparent'}`,
            position:'relative', transition:'all 0.15s',
          }}>
            {pathname === '/settings' && (
              <div style={{ position:'absolute', left:-1, top:'25%', bottom:'25%', width:2, background:'var(--accent-bright)', borderRadius:'0 2px 2px 0' }} />
            )}
            <span style={{ width:15, textAlign:'center', opacity:0.8 }}>⚙</span>
            Settings
          </div>
        </Link>
      </nav>

      {/* Footer user card */}
      <div style={{ padding:'12px 10px', borderTop:'1px solid var(--border)' }}>
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'10px 12px', borderRadius:8,
          background:'var(--bg-elevated)', border:'1px solid var(--border)',
        }}>
          <div style={{
            width:30, height:30, borderRadius:8,
            background:'linear-gradient(135deg, var(--accent), #7c3aed)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, color:'white',
          }}>{roleInitial}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>{name}</div>
            <div style={{ fontSize:10, color:'var(--text-secondary)', fontFamily:'DM Mono,monospace' }}>{roleLabel}</div>
          </div>
          <div style={{
            width:7, height:7, borderRadius:'50%',
            background:'var(--green)', boxShadow:'0 0 6px var(--green)',
          }} className="animate-pulse-dot" />
        </div>
      </div>
    </aside>
  );
}
