'use client';
import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Topbar from '@/components/layout/Topbar';
import { KpiCard, Card, PrimaryBtn, ProgressBar } from '@/components/ui/ui';
import { JOBS, CREWS } from '@/lib/data';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const COMPLETED = [72,84,62,90,88,78,65];
const TARGETS   = [85,90,85,90,90,88,80];

export default function AnalyticsPage() {
  const [range, setRange] = useState('Last 7 Days');
  const atRisk = JOBS.filter(j => j.risk);

  return (
    <AppShell>
      <Topbar
        title="Analytics"
        sub="Performance metrics and operational insights"
        actions={
          <div style={{ display:'flex', gap:8 }}>
            <select value={range} onChange={e => setRange(e.target.value)} style={{ padding:'6px 12px', borderRadius:8, background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-secondary)', fontSize:11, fontFamily:'DM Mono,monospace', cursor:'pointer', outline:'none' }}>
              {['Last 7 Days','Last 30 Days','Last Quarter','YTD'].map(r => <option key={r}>{r}</option>)}
            </select>
            <PrimaryBtn onClick={() => { window.alert('Export Report - Feature coming soon'); }} style={{ fontSize:11, padding:'7px 14px' }}>Export Report</PrimaryBtn>
          </div>
        }
      />
      <div style={{ flex:1, overflowY:'auto', padding:'16px' }} className="animate-fade-in">
        <style>{`
          @media (min-width: 768px) {
            .analytics-kpi { grid-template-columns: repeat(4, 1fr); }
            .analytics-layout { display: grid; grid-template-columns: 1fr 280px; gap: 16px; }
          }
          @media (max-width: 767px) {
            .analytics-kpi { grid-template-columns: repeat(2, 1fr); }
            .analytics-layout { display: flex; flex-direction: column; gap: 16px; }
          }
        `}</style>

        {/* KPIs */}
        <div className="analytics-kpi" style={{ display:'grid', gap:8, marginBottom:20 }}>
          <KpiCard label="Total Jobs" value={5} sub="vs 4 last week" delta="↑ 12%" deltaDir="up" accent="blue" />
          <KpiCard label="Completion Rate" value="94.2%" sub="7-day rolling" delta="↑ 2.4%" deltaDir="up" accent="green" />
          <KpiCard label="At-Risk Jobs" value={atRisk.length} sub="Overdue · Needs action" delta="⚠ 1" deltaDir="warn" accent="amber" />
          <KpiCard label="Crew Utilization" value="25.0%" sub="Below 40% target" delta="↓ 3%" deltaDir="down" accent="red" />
        </div>

        <div className="analytics-layout">
          <div>
            {/* Bar chart */}
            <Card style={{ padding:20, marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700 }}>Daily Job Performance</div>
                <div style={{ display:'flex', gap:14, fontSize:10, fontFamily:'DM Mono,monospace', color:'var(--text-secondary)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:8, height:8, borderRadius:2, background:'var(--accent-bright)' }}/> Completed</div>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:8, height:8, borderRadius:2, background:'var(--bg-elevated)', border:'1px solid var(--border-bright)' }}/> Target</div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:130, backgroundColor:'transparent' }}>
                {DAYS.map((d, i) => (
                  <div key={d} style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'flex-end', gap:3, height:'100%' }}>
                    <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:'100%' }}>
                      <div style={{ flex:1, height:`${(COMPLETED[i]/100)*100}%`, background:'var(--accent-bright)', borderRadius:'4px 4px 0 0', transition:'opacity 0.2s', cursor:'pointer', minHeight:'4px' }}
                        onMouseEnter={e => e.currentTarget.style.opacity='0.7'}
                        onMouseLeave={e => e.currentTarget.style.opacity='1'}
                        title={`Completed: ${COMPLETED[i]}`}
                      />
                      <div style={{ flex:1, height:`${(TARGETS[i]/100)*100}%`, background:'var(--bg-elevated)', border:'1px solid var(--border-bright)', borderRadius:'4px 4px 0 0', cursor:'pointer', minHeight:'4px' }} title={`Target: ${TARGETS[i]}`} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                {DAYS.map(d => <div key={d} style={{ flex:1, textAlign:'center', fontSize:9, fontFamily:'DM Mono,monospace', color:'var(--text-muted)' }}>{d}</div>)}
              </div>
            </Card>

            {/* At-risk table */}
            <Card>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
                  ⚠ At-Risk Jobs
                </div>
                <span style={{ fontSize:10, color:'var(--text-accent)', fontFamily:'DM Mono,monospace', cursor:'pointer' }}>View All →</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1.5fr 1fr', gap:12, padding:'8px 20px', borderBottom:'1px solid var(--border)' }}>
                {['Client','Address','Scheduled','Status'].map(h => (
                  <span key={h} style={{ fontSize:9, fontFamily:'DM Mono,monospace', color:'var(--text-muted)', letterSpacing:'0.12em', textTransform:'uppercase' }}>{h}</span>
                ))}
              </div>
              {atRisk.map((j, i) => (
                <div key={j.id} style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1.5fr 1fr', gap:12, padding:'14px 20px', borderBottom: i<atRisk.length-1?'1px solid var(--border)':'none', alignItems:'center', transition:'background 0.15s', cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background=''}
                >
                  <div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{j.client}</div>
                    <div style={{ fontSize:10, fontFamily:'DM Mono,monospace', color:'var(--text-muted)', marginTop:2 }}>ID: #{j.id}</div>
                  </div>
                  <div style={{ fontSize:12, fontFamily:'DM Mono,monospace', color:'var(--text-secondary)' }}>{j.address}</div>
                  <div style={{ fontSize:12, fontFamily:'DM Mono,monospace' }}>{j.date}, {j.time}</div>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:'var(--red-dim)', border:'1px solid rgba(239,68,68,0.25)', color:'var(--red)', fontSize:9, fontFamily:'DM Mono,monospace', fontWeight:600, padding:'3px 8px', borderRadius:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                    ⚠ Overdue
                  </span>
                </div>
              ))}
            </Card>
          </div>

          {/* Crew status sidebar */}
          <Card style={{ padding:20, alignSelf:'start' }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, marginBottom:16 }}>Crew Status</div>
            {CREWS.map((c, i) => (
              <div key={c.id} style={{ borderBottom: i<CREWS.length-1?'1px solid var(--border)':'none', paddingBottom:14, marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:600, fontFamily:'Syne,sans-serif' }}>{c.name}</span>
                  <span style={{ fontSize:10, fontFamily:'DM Mono,monospace', fontWeight:600, textTransform:'uppercase', color: c.status==='available'?'var(--green)':c.status==='assigned'?'var(--accent-bright)':'var(--text-muted)' }}>
                    {c.status}
                  </span>
                </div>
                <div style={{ fontSize:10, fontFamily:'DM Mono,monospace', color:'var(--text-muted)', marginBottom:8 }}>{c.lat}, {c.lng}</div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, fontFamily:'DM Mono,monospace', color:'var(--text-muted)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  <span>Utilization</span><span style={{ color:'var(--text-primary)' }}>{c.utilization}%</span>
                </div>
                <ProgressBar value={c.utilization} color={c.status==='assigned'?'var(--accent-bright)':c.status==='offline'?'#475569':'var(--green)'} />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
