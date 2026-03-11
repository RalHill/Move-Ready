'use client';
import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Topbar from '@/components/layout/Topbar';
import { SectionHeader, ProgressBar, PrimaryBtn, Card } from '@/components/ui/ui';
import { CREWS } from '@/lib/data';
import toast from 'react-hot-toast';

export default function CrewPage() {
  const [selectedCrew, setSelectedCrew] = useState<string | null>(null);

  const handleAddCrew = () => {
    toast.success('Add Crew modal would open here');
  };

  const handleDetails = (crewId: string) => {
    setSelectedCrew(selectedCrew === crewId ? null : crewId);
    toast.success(`Viewing ${crewId} details`);
  };

  const handleAssign = (crewId: string) => {
    toast.success(`Assign job to ${crewId}`);
  };

  return (
    <AppShell>
      <Topbar
        title="Crew Management"
        sub="Manage crew details and assignments"
        actions={<PrimaryBtn onClick={handleAddCrew}>+ Add Crew</PrimaryBtn>}
      />
      <div style={{ flex:1, overflowY:'auto', padding:'16px' }} className="animate-fade-in">
        <style>{`
          @media (min-width: 1024px) {
            .crew-grid { grid-template-columns: repeat(3, 1fr); }
          }
          @media (max-width: 1023px) and (min-width: 768px) {
            .crew-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 767px) {
            .crew-grid { grid-template-columns: 1fr; }
          }
        `}</style>
        <div className="crew-grid" style={{ display:'grid', gap:12 }}>
          {CREWS.map(c => {
            const dotColor = c.status==='available'?'var(--green)':c.status==='assigned'?'var(--accent-bright)':'#475569';
            const iconBg   = c.status==='available'?'var(--green-dim)':c.status==='assigned'?'var(--blue-dim)':'var(--bg-elevated)';
            const iconBorder = c.status==='available'?'rgba(16,185,129,0.2)':c.status==='assigned'?'rgba(59,130,246,0.2)':'var(--border)';
            const statusColor = c.status==='available'?'var(--green)':c.status==='assigned'?'var(--accent-bright)':'var(--text-muted)';
            const barColor = c.status==='assigned'?'var(--accent-bright)':c.status==='offline'?'#475569':'var(--green)';

            return (
              <Card key={c.id} style={{ padding:20, cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={(e: any) => { e.currentTarget.style.borderColor='var(--border-bright)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px var(--shadow)'; }}
                onMouseLeave={(e: any) => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
              >
                {/* Header */}
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:18 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:iconBg, border:`1px solid ${iconBorder}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                    {c.icon}
                  </div>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:dotColor, boxShadow: c.status!=='offline'?`0 0 8px ${dotColor}`:undefined }} />
                </div>

                <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, marginBottom:3 }}>{c.name}</div>
                <div style={{ fontSize:11, fontFamily:'DM Mono,monospace', color:statusColor, marginBottom:14, textTransform:'capitalize' }}>{c.status}</div>

                {/* Location */}
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontFamily:'DM Mono,monospace', color:'var(--text-secondary)', marginBottom:4 }}>
                  📍 Current Location
                </div>
                <div style={{ fontSize:12, fontFamily:'DM Mono,monospace', color:'var(--text-primary)', marginBottom:16, letterSpacing:'-0.01em' }}>
                  {c.lat}, {c.lng}
                </div>

                {/* Active job */}
                {c.activeJob && (
                  <>
                    <div style={{ fontSize:10, fontFamily:'DM Mono,monospace', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Active Job</div>
                    <div style={{ background:'var(--bg-elevated)', borderRadius:8, padding:'10px 12px', marginBottom:14 }}>
                      <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{c.activeJob}</div>
                      <div style={{ fontSize:11, fontFamily:'DM Mono,monospace', color:'var(--text-secondary)' }}>{c.activeAddress}</div>
                    </div>
                  </>
                )}

                {/* Utilization */}
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, fontFamily:'DM Mono,monospace', color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  <span>Utilization</span>
                  <span style={{ color:'var(--text-primary)', fontWeight:500 }}>{c.utilization}%</span>
                </div>
                <ProgressBar value={c.utilization} color={barColor} />

                {/* Actions */}
                <div style={{ display:'flex', gap:8, marginTop:16 }}>
                  <button onClick={() => handleDetails(c.id)} style={{ flex:1, padding:'7px 0', borderRadius:7, border:'1px solid var(--border)', background:'var(--bg-elevated)', color:'var(--text-secondary)', fontSize:11, fontFamily:'DM Mono,monospace', cursor:'pointer', transition:'all 0.15s' }}>Details</button>
                  {c.status !== 'offline' && (
                    <button onClick={() => handleAssign(c.id)} style={{ flex:1, padding:'7px 0', borderRadius:7, border:'1px solid rgba(59,130,246,0.2)', background:'var(--accent-subtle)', color:'var(--accent-bright)', fontSize:11, fontFamily:'DM Mono,monospace', cursor:'pointer', transition:'all 0.15s' }}>Assign</button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
