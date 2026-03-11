'use client';
import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Topbar from '@/components/layout/Topbar';
import { KpiCard, SectionHeader, ViewAll, ProgressBar, CrewIcon, PrimaryBtn, GhostBtn } from '@/components/ui/ui';
import { JOBS, CREWS } from '@/lib/data';
import toast from 'react-hot-toast';

export default function DispatcherDashboard() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const urgent = JOBS.filter(j => j.status === 'unassigned');

  const handleAssignJob = (jobId: string, client: string) => {
    toast.success(`Job assigned to ${client}`);
    setSelectedJob(null);
  };

  const handleJobDetails = (jobId: string) => {
    setSelectedJob(selectedJob === jobId ? null : jobId);
    toast.success(`View details for job ${jobId}`);
  };
  return (
    <AppShell>
      <Topbar title="Dispatch Board" sub="Assign and manage crew operations in real-time" />
      <div style={{ flex:1, overflowY:'auto', padding:'16px' }} className="animate-fade-in">
        <style>{`
          @media (min-width: 768px) {
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
            .jobs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
            .crews-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
          }
          @media (max-width: 767px) {
            .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
            .jobs-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
            .crews-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
          }
        `}</style>
        <div className="kpi-grid" style={{ marginBottom:20 }}>
          <KpiCard label="Active Jobs" value={5} sub="2 in-progress · 3 pending" delta="↑ 12%" deltaDir="up" accent="green" />
          <KpiCard label="Completion Rate" value="94.2%" sub="7-day rolling average" delta="↑ 2.4%" deltaDir="up" accent="blue" />
          <KpiCard label="At-Risk Jobs" value={1} sub="Requires immediate action" delta="⚠ 1" deltaDir="warn" accent="amber" />
          <KpiCard label="Crew Utilization" value="48%" sub="2 of 4 crews deployed" delta="↓ 3%" deltaDir="down" accent="blue" />
        </div>
        <div style={{ marginBottom:20 }}>
          <SectionHeader title="Unassigned Jobs" badge={`${urgent.length} URGENT`} action={<ViewAll />} />
          <div className="jobs-grid">
            {urgent.map(j => (
              <div key={j.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:16, cursor:'pointer', position:'relative', overflow:'hidden', transition:'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-bright)'; e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 8px 24px var(--shadow)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
                <div style={{ position:'absolute', top:0, left:0, bottom:0, width:3, background:'var(--red)', borderRadius:'12px 0 0 12px' }} />
                <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:'var(--red-dim)', border:'1px solid rgba(239,68,68,0.25)', color:'var(--red)', fontSize:9, fontFamily:'DM Mono,monospace', fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', padding:'2px 7px', borderRadius:4, marginBottom:10 }}>⚠ URGENT</div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, marginBottom:10 }}>{j.client}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  {[['📍', j.address],['📅', j.date],['⏱', j.time]].map(([icon, val]) => (
                    <div key={String(val)} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--text-secondary)', fontFamily:'DM Mono,monospace' }}><span>{icon}</span>{val}</div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:6, marginTop:12 }}>
                  <PrimaryBtn onClick={() => handleAssignJob(j.id, j.client)} style={{ flex:1, justifyContent:'center', padding:'6px 0', fontSize:11 }}>Assign</PrimaryBtn>
                  <GhostBtn onClick={() => handleJobDetails(j.id)} style={{ flex:1, justifyContent:'center', padding:'6px 0' }}>Details</GhostBtn>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionHeader title="Crew Status" action={<ViewAll label="Manage →" />} />
          <div className="crews-grid">
            {CREWS.map(c => (
              <div key={c.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:16, cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-bright)'; e.currentTarget.style.boxShadow='0 4px 16px var(--shadow)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow=''; }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                  <CrewIcon status={c.status} icon={c.icon} />
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, fontFamily:'Syne,sans-serif' }}>{c.name}</div>
                    <div style={{ fontSize:10, fontFamily:'DM Mono,monospace', marginTop:2, textTransform:'uppercase', color: c.status==='available'?'var(--green)':c.status==='assigned'?'var(--accent-bright)':'var(--text-muted)' }}>{c.status}</div>
                  </div>
                </div>
                {c.activeJob ? (
                  <div style={{ background:'var(--bg-elevated)', borderRadius:8, padding:12 }}>
                    {c.warning && <div style={{ display:'flex', alignItems:'center', gap:6, background:'var(--amber-dim)', border:'1px solid rgba(245,158,11,0.25)', color:'var(--amber)', fontSize:10, fontFamily:'DM Mono,monospace', padding:'4px 8px', borderRadius:6, marginBottom:8 }}>⚠ {c.warning}</div>}
                    <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{c.activeJob}</div>
                    <div style={{ fontSize:11, color:'var(--text-secondary)', fontFamily:'DM Mono,monospace', marginBottom:10 }}>{c.activeAddress}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, fontFamily:'DM Mono,monospace', color:'var(--text-secondary)', marginBottom:6 }}>
                      <span>UTILIZATION</span><span style={{ color: c.status==='assigned'?'var(--accent-bright)':'var(--green)' }}>{c.utilization}%</span>
                    </div>
                    <ProgressBar value={c.utilization} color={c.status==='assigned'?'var(--accent-bright)':'var(--green)'} />
                  </div>
                ) : (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:60, color:'var(--text-muted)', fontSize:11, fontFamily:'DM Mono,monospace' }}>
                    {c.status==='offline'?'— Offline —':'— No active jobs —'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
