'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AppShell from '@/components/layout/AppShell';
import Topbar from '@/components/layout/Topbar';
import { CREWS } from '@/lib/data';
import { ProgressBar } from '@/components/ui/ui';
import toast from 'react-hot-toast';

const MapComponent = dynamic(() => import('@/components/tracking/map'), {
  ssr: false,
  loading: () => <div style={{ width:'100%', height:'100%', background:'var(--bg-base)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)' }}>Loading map...</div>
});

export default function TrackingPage() {
  const [mapMode, setMapMode] = useState('Map');
  const [selectedCrew, setSelectedCrew] = useState<string | null>(null);
  const [zoom, setZoom] = useState(13);

  const activeCrew = CREWS.filter(c => c.status !== 'offline');

  const handleZoom = (direction: '+' | '−') => {
    setZoom(prev => direction === '+' ? Math.min(prev + 1, 18) : Math.max(prev - 1, 2));
    toast.success(`Zoom ${direction === '+' ? 'in' : 'out'}`);
  };

  const handleMapModeChange = (mode: string) => {
    setMapMode(mode);
    toast.success(`Map mode: ${mode}`);
  };

  const handleForceRefresh = () => {
    toast.loading('Refreshing crew locations...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('Crew data updated');
    }, 1000);
  };

  return (
    <AppShell>
      <Topbar title="Live Tracking" sub="Real-time crew locations and active routes" />
      <div style={{ flex:1, padding:16, overflow:'hidden' }} className="animate-fade-in">
        <style>{`
          @media (min-width: 768px) {
            .tracking-layout { display: grid; grid-template-columns: 1fr 300px; gap: 16px; height: 100%; }
          }
          @media (max-width: 767px) {
            .tracking-layout { display: flex; flex-direction: column; gap: 8px; height: 100%; }
            .tracking-map { max-height: 40vh; border-radius: 8px; }
            .tracking-panel { max-height: 60vh; }
          }
        `}</style>
        <div className="tracking-layout">

        {/* Map */}
        <div className="tracking-map" style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', position:'relative' }}>
          <MapComponent crews={CREWS} zoom={zoom} mapMode={mapMode} />

          {/* Map overlay */}
          <div style={{ position:'absolute', top:16, left:16, background:'var(--bg-elevated)', border:'1px solid var(--border-bright)', borderRadius:10, padding:'12px 16px', zIndex:400 }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, marginBottom:2, color:'var(--text-primary)' }}>Live Tracking</div>
            <div style={{ fontSize:10, fontFamily:'DM Mono,monospace', color:'var(--text-secondary)' }}>Real-time crew locations & routes</div>
          </div>

          {/* Map mode toggles */}
          <div style={{ position:'absolute', bottom:16, left:16, display:'flex', gap:6, zIndex:400 }}>
            {['Map','Satellite','Hybrid'].map(m => (
              <button key={m} onClick={() => handleMapModeChange(m)} style={{
                background: mapMode===m?'var(--accent)':'var(--bg-elevated)',
                border:`1px solid ${mapMode===m?'var(--accent)':'var(--border-bright)'}`,
                color: mapMode===m?'white':'var(--text-secondary)',
                fontSize:11, fontFamily:'DM Mono,monospace',
                padding:'6px 12px', borderRadius:6, cursor:'pointer', transition:'all 0.15s',
              }}>{m}</button>
            ))}
          </div>

          {/* Zoom */}
          <div style={{ position:'absolute', bottom:16, right:16, display:'flex', flexDirection:'column', gap:4, zIndex:400 }}>
            {['+','−'].map(b => (
              <button key={b} onClick={() => handleZoom(b as '+' | '−')} style={{ width:32, height:32, background:'var(--bg-elevated)', border:'1px solid var(--border-bright)', color:'var(--text-secondary)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:16, transition:'all 0.15s' }}>{b}</button>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="tracking-panel" style={{ display:'flex', flexDirection:'column', gap:10, overflowY:'auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700 }}>Active Crews</div>
            <span style={{ background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.2)', color:'var(--green)', fontSize:10, fontFamily:'DM Mono,monospace', padding:'3px 8px', borderRadius:99 }}>
              {activeCrew.length} ONLINE
            </span>
          </div>

          {/* Search */}
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px' }}>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>🔍</span>
            <input placeholder="Search crews or jobs..." style={{ background:'none', border:'none', outline:'none', color:'var(--text-primary)', fontSize:12, fontFamily:'DM Mono,monospace', flex:1 }} />
          </div>

          {/* Crew tracking cards */}
          {[
            { id:'alpha', name:'Crew Alpha', status:'available', colorClass:'green', color:'var(--green)', job:'#d5962697 · 321 Yonge St', eta:'12 MINS', dist:'1.2 km', alert:'Traffic delay reported near Bloor St', util:42 },
            { id:'delta', name:'Crew Delta', status:'available', colorClass:'green', color:'var(--green)', job:null, eta:null, dist:null, alert:null, util:0 },
            { id:'bravo', name:'Crew Bravo', status:'assigned',  colorClass:'blue',  color:'var(--accent-bright)', job:'#87d059ed · 123 King St', eta:'12 MINS', dist:'1.2 km', alert:null, util:75 },
          ].map(c => (
            <div key={c.id}
              onClick={() => setSelectedCrew(c.id === selectedCrew ? null : c.id)}
              style={{ background:'var(--bg-card)', border:`1px solid ${selectedCrew===c.id?'var(--accent)':'var(--border)'}`, borderRadius:10, padding:14, cursor:'pointer', transition:'all 0.15s' }}
              onMouseEnter={e => { if(selectedCrew!==c.id) e.currentTarget.style.borderColor='var(--border-bright)'; }}
              onMouseLeave={e => { if(selectedCrew!==c.id) e.currentTarget.style.borderColor='var(--border)'; }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <div style={{ width:32, height:32, borderRadius:8, background: c.colorClass==='green'?'var(--green-dim)':'var(--blue-dim)', border:`1px solid ${c.colorClass==='green'?'rgba(16,185,129,0.2)':'rgba(59,130,246,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🚛</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, fontFamily:'Syne,sans-serif' }}>{c.name}</div>
                  <div style={{ fontSize:10, fontFamily:'DM Mono,monospace', color:c.color, marginTop:1 }}>● {c.status.charAt(0).toUpperCase()+c.status.slice(1)}</div>
                </div>
              </div>
              {c.alert && (
                <div style={{ background:'var(--amber-dim)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:6, padding:'6px 10px', fontSize:10, fontFamily:'DM Mono,monospace', color:'var(--amber)', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                  ⚡ {c.alert}
                </div>
              )}
              {c.job && <div style={{ fontSize:11, fontFamily:'DM Mono,monospace', color:'var(--text-secondary)', marginBottom:8 }}>{c.job}</div>}
              {c.eta && (
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontFamily:'DM Mono,monospace', color:'var(--accent-bright)', marginBottom:8 }}>
                  ⏱ ETA {c.eta} <span style={{ color:'var(--text-secondary)' }}>{c.dist} away</span>
                </div>
              )}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, fontFamily:'DM Mono,monospace', color:'var(--text-muted)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                <span>Utilization</span><span style={{ color:'var(--text-primary)' }}>{c.util}%</span>
              </div>
              <ProgressBar value={c.util} color={c.colorClass==='blue'?'var(--accent-bright)':'var(--green)'} />
            </div>
          ))}

          <div style={{ textAlign:'center', fontSize:10, fontFamily:'DM Mono,monospace', color:'var(--text-muted)', padding:8 }}>
            Updated 02:51:11 · <span style={{ color:'var(--accent-bright)', cursor:'pointer' }} onClick={handleForceRefresh}>↻ Force Refresh</span>
          </div>
        </div>
        </div>
      </div>
    </AppShell>
  );
}
