'use client';
import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Topbar from '@/components/layout/Topbar';
import { useTheme } from '@/lib/theme-provider';
import { Card, PrimaryBtn, GhostBtn } from '@/components/ui/ui';
import toast from 'react-hot-toast';

type Section = 'profile' | 'appearance' | 'notifications' | 'dispatch' | 'integrations' | 'security';

const SECTIONS: { id: Section; icon: string; label: string; sub: string }[] = [
  { id:'profile',       icon:'◈', label:'Profile',         sub:'Your account & personal info' },
  { id:'appearance',    icon:'◑', label:'Appearance',      sub:'Theme, layout & display' },
  { id:'notifications', icon:'◎', label:'Notifications',   sub:'Alerts and sound settings' },
  { id:'dispatch',      icon:'⊞', label:'Dispatch Rules',  sub:'Auto-assign & routing logic' },
  { id:'integrations',  icon:'⊕', label:'Integrations',    sub:'Connected apps & APIs' },
  { id:'security',      icon:'⊛', label:'Security',        sub:'Password & 2FA settings' },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width:40, height:22, borderRadius:11, cursor:'pointer',
      background: value ? 'var(--accent)' : 'var(--bg-elevated)',
      border: `1px solid ${value ? 'var(--accent)' : 'var(--border-bright)'}`,
      position:'relative', transition:'all 0.2s',
      boxShadow: value ? '0 0 8px var(--accent-glow)' : undefined,
    }}>
      <div style={{
        position:'absolute', top:2, left: value ? 20 : 2,
        width:16, height:16, borderRadius:'50%',
        background:'white', transition:'left 0.2s',
        boxShadow:'0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
  );
}

function FieldLabel({ label, sub }: { label: string; sub?: string }) {
  return (
    <div>
      <div style={{ fontSize:13, fontWeight:500, color:'var(--text-primary)', marginBottom: sub?2:0 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:'var(--text-secondary)', fontFamily:'DM Mono,monospace' }}>{sub}</div>}
    </div>
  );
}

function SettingRow({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 0', borderBottom: last?'none':'1px solid var(--border)' }}>
      {children}
    </div>
  );
}

function Input({ value, placeholder, type='text' }: { value: string; placeholder?: string; type?: string }) {
  const [val, setVal] = useState(value);
  return (
    <input
      type={type} value={val} onChange={e => setVal(e.target.value)}
      placeholder={placeholder}
      style={{
        background:'var(--bg-elevated)', border:'1px solid var(--border)',
        borderRadius:8, padding:'8px 12px', fontSize:12,
        fontFamily:'DM Mono,monospace', color:'var(--text-primary)',
        outline:'none', width:220, transition:'border-color 0.15s',
      }}
      onFocus={e => e.target.style.borderColor='var(--accent)'}
      onBlur={e => e.target.style.borderColor='var(--border)'}
    />
  );
}

function SelectInput({ options, value }: { options: string[]; value: string }) {
  const [val, setVal] = useState(value);
  return (
    <select value={val} onChange={e => setVal(e.target.value)} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', fontSize:12, fontFamily:'DM Mono,monospace', color:'var(--text-primary)', outline:'none', width:220, cursor:'pointer' }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState<Section>('profile');
  const { theme, toggle } = useTheme();
  const [notifs, setNotifs] = useState({ jobAlert:true, crewUpdate:true, atRisk:true, sound:false, email:true, sms:false });
  const [dispatch, setDispatch] = useState({ autoAssign:false, geoRoute:true, urgentFirst:true, maxJobs:3 });
  const [saved, setSaved] = useState(false);

  const save = () => { 
    setSaved(true);
    toast.success('Settings saved successfully!');
    setTimeout(() => setSaved(false), 2000); 
  };

  return (
    <AppShell>
      <Topbar title="Settings" sub="Manage your account and platform preferences" />
      <div style={{ flex:1, overflow:'hidden', display:'flex' }}>

        {/* Settings nav */}
        <div style={{ width:220, minWidth:220, borderRight:'1px solid var(--border)', background:'var(--bg-surface)', padding:'16px 10px', overflowY:'auto', transition:'background 0.25s' }}>
          {SECTIONS.map(s => (
            <div key={s.id} onClick={() => setActive(s.id)} style={{
              display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
              borderRadius:8, cursor:'pointer', marginBottom:2,
              background: active===s.id?'var(--accent-subtle)':'transparent',
              border:`1px solid ${active===s.id?'rgba(59,130,246,0.2)':'transparent'}`,
              transition:'all 0.15s', position:'relative',
            }}>
              {active===s.id && <div style={{ position:'absolute', left:-1, top:'25%', bottom:'25%', width:2, background:'var(--accent-bright)', borderRadius:'0 2px 2px 0' }} />}
              <span style={{ fontSize:14, width:18, textAlign:'center', opacity:0.8 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color: active===s.id?'var(--accent-bright)':'var(--text-primary)' }}>{s.label}</div>
                <div style={{ fontSize:10, fontFamily:'DM Mono,monospace', color:'var(--text-secondary)', marginTop:1 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:'auto', padding:'28px 32px' }} className="animate-fade-in" key={active}>

          {/* ── PROFILE ── */}
          {active === 'profile' && (
            <div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, marginBottom:4 }}>Profile</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)', fontFamily:'DM Mono,monospace', marginBottom:24 }}>Manage your personal information and account details</div>

              <Card style={{ padding:'24px 28px', marginBottom:16 }}>
                {/* Avatar */}
                <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:28, paddingBottom:24, borderBottom:'1px solid var(--border)' }}>
                  <div style={{ width:64, height:64, borderRadius:16, background:'linear-gradient(135deg,var(--accent),#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:700, color:'white', boxShadow:'0 0 20px var(--accent-glow)' }}>D</div>
                  <div>
                    <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, marginBottom:4 }}>Dispatcher</div>
                    <div style={{ fontSize:11, fontFamily:'DM Mono,monospace', color:'var(--text-secondary)', marginBottom:10 }}>dispatcher@moveready.ca</div>
                    <GhostBtn style={{ fontSize:10, padding:'5px 12px' }}>Change Avatar</GhostBtn>
                  </div>
                </div>

                <SettingRow><FieldLabel label="Full Name" sub="Your display name" /><Input value="Dispatcher" /></SettingRow>
                <SettingRow><FieldLabel label="Email" sub="Login email address" /><Input value="dispatcher@moveready.ca" type="email" /></SettingRow>
                <SettingRow><FieldLabel label="Phone" sub="For SMS alerts" /><Input value="+1 (416) 555-0192" /></SettingRow>
                <SettingRow last><FieldLabel label="Role" sub="System-assigned" /><SelectInput options={['Senior Dispatcher','Dispatcher','Manager','Driver']} value="Senior Dispatcher" /></SettingRow>
              </Card>

              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <GhostBtn>Cancel</GhostBtn>
                <PrimaryBtn onClick={save}>{saved ? '✓ Saved!' : 'Save Changes'}</PrimaryBtn>
              </div>
            </div>
          )}

          {/* ── APPEARANCE ── */}
          {active === 'appearance' && (
            <div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, marginBottom:4 }}>Appearance</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)', fontFamily:'DM Mono,monospace', marginBottom:24 }}>Customize how Move Ready looks and feels</div>

              <Card style={{ padding:'24px 28px', marginBottom:16 }}>
                <SettingRow>
                  <FieldLabel label="Color Theme" sub="Dark or light mode" />
                  <div style={{ display:'flex', gap:10 }}>
                    {(['dark','light'] as const).map(t => (
                      <div key={t} onClick={() => { if(theme!==t) toggle(); }} style={{
                        width:80, height:52, borderRadius:10, cursor:'pointer', overflow:'hidden', position:'relative',
                        border:`2px solid ${theme===t?'var(--accent)':'var(--border)'}`,
                        transition:'all 0.15s',
                        boxShadow: theme===t?'0 0 12px var(--accent-glow)':undefined,
                      }}>
                        <div style={{ width:'100%', height:'100%', background: t==='dark'?'#060810':'#eef1f8', display:'flex', flexDirection:'column', gap:3, padding:8 }}>
                          <div style={{ height:8, borderRadius:3, background: t==='dark'?'#1a1f35':'#ffffff', width:'60%' }} />
                          <div style={{ height:4, borderRadius:2, background: t==='dark'?'#111527':'#f0f2f8', width:'80%' }} />
                          <div style={{ height:4, borderRadius:2, background: t==='dark'?'#111527':'#f0f2f8', width:'50%' }} />
                        </div>
                        <div style={{ position:'absolute', bottom:4, right:6, fontSize:8, fontFamily:'DM Mono,monospace', color: t==='dark'?'#64748b':'#94a3b8', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                          {t}
                        </div>
                        {theme===t && <div style={{ position:'absolute', top:4, right:4, width:8, height:8, borderRadius:'50%', background:'var(--accent)' }} />}
                      </div>
                    ))}
                  </div>
                </SettingRow>

                <SettingRow><FieldLabel label="Sidebar Width" sub="Compact or expanded" /><SelectInput options={['Compact (180px)','Default (220px)','Wide (260px)']} value="Default (220px)" /></SettingRow>
                <SettingRow><FieldLabel label="Density" sub="Interface spacing" /><SelectInput options={['Comfortable','Compact','Cozy']} value="Comfortable" /></SettingRow>
                <SettingRow><FieldLabel label="Font Size" sub="UI text size" /><SelectInput options={['Small (12px)','Default (13px)','Large (14px)']} value="Default (13px)" /></SettingRow>
                <SettingRow last><FieldLabel label="Reduce Motion" sub="Disable animations" /><Toggle value={false} onChange={() => {}} /></SettingRow>
              </Card>

              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <GhostBtn>Reset to Default</GhostBtn>
                <PrimaryBtn onClick={save}>{saved ? '✓ Saved!' : 'Save Changes'}</PrimaryBtn>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {active === 'notifications' && (
            <div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, marginBottom:4 }}>Notifications</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)', fontFamily:'DM Mono,monospace', marginBottom:24 }}>Control what alerts and updates you receive</div>

              <Card style={{ padding:'24px 28px', marginBottom:16 }}>
                <div style={{ fontSize:10, fontFamily:'DM Mono,monospace', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14 }}>In-App Alerts</div>
                <SettingRow><FieldLabel label="Job Assignment Alerts" sub="When a job is assigned to a crew" /><Toggle value={notifs.jobAlert} onChange={v => setNotifs(p=>({...p,jobAlert:v}))} /></SettingRow>
                <SettingRow><FieldLabel label="Crew Status Updates" sub="When crew status changes" /><Toggle value={notifs.crewUpdate} onChange={v => setNotifs(p=>({...p,crewUpdate:v}))} /></SettingRow>
                <SettingRow><FieldLabel label="At-Risk Job Alerts" sub="When a job is flagged at risk" /><Toggle value={notifs.atRisk} onChange={v => setNotifs(p=>({...p,atRisk:v}))} /></SettingRow>
                <SettingRow last><FieldLabel label="Sound Alerts" sub="Play audio on critical events" /><Toggle value={notifs.sound} onChange={v => setNotifs(p=>({...p,sound:v}))} /></SettingRow>
              </Card>

              <Card style={{ padding:'24px 28px', marginBottom:16 }}>
                <div style={{ fontSize:10, fontFamily:'DM Mono,monospace', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14 }}>External Channels</div>
                <SettingRow><FieldLabel label="Email Notifications" sub="Receive alerts via email" /><Toggle value={notifs.email} onChange={v => setNotifs(p=>({...p,email:v}))} /></SettingRow>
                <SettingRow last><FieldLabel label="SMS Notifications" sub="Receive critical alerts by SMS" /><Toggle value={notifs.sms} onChange={v => setNotifs(p=>({...p,sms:v}))} /></SettingRow>
              </Card>

              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <GhostBtn>Reset to Default</GhostBtn>
                <PrimaryBtn onClick={save}>{saved ? '✓ Saved!' : 'Save Changes'}</PrimaryBtn>
              </div>
            </div>
          )}

          {/* ── DISPATCH RULES ── */}
          {active === 'dispatch' && (
            <div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, marginBottom:4 }}>Dispatch Rules</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)', fontFamily:'DM Mono,monospace', marginBottom:24 }}>Configure auto-assignment and routing logic</div>

              <Card style={{ padding:'24px 28px', marginBottom:16 }}>
                <SettingRow>
                  <FieldLabel label="Auto-Assign Jobs" sub="Automatically assign unassigned jobs to available crews" />
                  <Toggle value={dispatch.autoAssign} onChange={v => setDispatch(p=>({...p,autoAssign:v}))} />
                </SettingRow>
                <SettingRow>
                  <FieldLabel label="Geo-Based Routing" sub="Route jobs to nearest available crew" />
                  <Toggle value={dispatch.geoRoute} onChange={v => setDispatch(p=>({...p,geoRoute:v}))} />
                </SettingRow>
                <SettingRow>
                  <FieldLabel label="Prioritize Urgent Jobs" sub="Flag URGENT jobs first in assignment queue" />
                  <Toggle value={dispatch.urgentFirst} onChange={v => setDispatch(p=>({...p,urgentFirst:v}))} />
                </SettingRow>
                <SettingRow last>
                  <FieldLabel label="Max Jobs Per Crew" sub="Limit simultaneous jobs per crew" />
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <button onClick={() => setDispatch(p=>({...p,maxJobs:Math.max(1,p.maxJobs-1)}))} style={{ width:28, height:28, borderRadius:6, background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-primary)', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                    <span style={{ fontFamily:'DM Mono,monospace', fontSize:15, fontWeight:600, width:24, textAlign:'center' }}>{dispatch.maxJobs}</span>
                    <button onClick={() => setDispatch(p=>({...p,maxJobs:Math.min(10,p.maxJobs+1)}))} style={{ width:28, height:28, borderRadius:6, background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-primary)', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                  </div>
                </SettingRow>
              </Card>

              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <GhostBtn>Reset to Default</GhostBtn>
                <PrimaryBtn onClick={save}>{saved ? '✓ Saved!' : 'Save Changes'}</PrimaryBtn>
              </div>
            </div>
          )}

          {/* ── INTEGRATIONS ── */}
          {active === 'integrations' && (
            <div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, marginBottom:4 }}>Integrations</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)', fontFamily:'DM Mono,monospace', marginBottom:24 }}>Connect Move Ready to external tools and services</div>

              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {[
                  { name:'Google Maps', sub:'Real-time routing and geocoding', icon:'🗺', status:'connected' },
                  { name:'Stripe',      sub:'Payment processing for invoices',  icon:'💳', status:'connected' },
                  { name:'Slack',       sub:'Team notifications and alerts',     icon:'💬', status:'disconnected' },
                  { name:'Zapier',      sub:'Workflow automation triggers',      icon:'⚡', status:'disconnected' },
                  { name:'QuickBooks',  sub:'Accounting and payroll sync',       icon:'📊', status:'disconnected' },
                  { name:'Twilio',      sub:'SMS notifications to clients',      icon:'📱', status:'connected' },
                ].map(i => (
                  <Card key={i.name} style={{ padding:'18px 24px', display:'flex', alignItems:'center', gap:16 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:'var(--bg-elevated)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{i.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:600, fontFamily:'Syne,sans-serif', marginBottom:2 }}>{i.name}</div>
                      <div style={{ fontSize:11, fontFamily:'DM Mono,monospace', color:'var(--text-secondary)' }}>{i.sub}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{
                        fontSize:9, fontFamily:'DM Mono,monospace', fontWeight:600, padding:'3px 9px', borderRadius:99, textTransform:'uppercase', letterSpacing:'0.08em',
                        color: i.status==='connected'?'var(--green)':'var(--text-muted)',
                        background: i.status==='connected'?'var(--green-dim)':'var(--bg-elevated)',
                        border:`1px solid ${i.status==='connected'?'rgba(16,185,129,0.2)':'var(--border)'}`,
                      }}>
                        {i.status==='connected'?'● Connected':'○ Disconnected'}
                      </span>
                      <button 
                        onClick={() => {
                          const action = i.status==='connected'?'Disconnected':'Connected';
                          toast.success(`${i.name} ${action}`);
                        }}
                        style={{ padding:'6px 14px', borderRadius:7, cursor:'pointer', fontSize:11, fontFamily:'DM Mono,monospace', fontWeight:500, border:`1px solid ${i.status==='connected'?'var(--red)':'var(--accent)'}`, background: i.status==='connected'?'var(--red-dim)':'var(--accent-subtle)', color: i.status==='connected'?'var(--red)':'var(--accent-bright)', transition:'all 0.15s' }}>
                        {i.status==='connected'?'Disconnect':'Connect'}
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ── SECURITY ── */}
          {active === 'security' && (
            <div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, marginBottom:4 }}>Security</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)', fontFamily:'DM Mono,monospace', marginBottom:24 }}>Manage authentication and access controls</div>

              <Card style={{ padding:'24px 28px', marginBottom:16 }}>
                <div style={{ fontSize:10, fontFamily:'DM Mono,monospace', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14 }}>Password</div>
                <SettingRow><FieldLabel label="Current Password" /><Input value="" placeholder="••••••••" type="password" /></SettingRow>
                <SettingRow><FieldLabel label="New Password" /><Input value="" placeholder="••••••••" type="password" /></SettingRow>
                <SettingRow last><FieldLabel label="Confirm Password" /><Input value="" placeholder="••••••••" type="password" /></SettingRow>
              </Card>

              <Card style={{ padding:'24px 28px', marginBottom:16 }}>
                <div style={{ fontSize:10, fontFamily:'DM Mono,monospace', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14 }}>Two-Factor Authentication</div>
                <SettingRow>
                  <FieldLabel label="Enable 2FA" sub="Require a code on every sign-in" />
                  <Toggle value={true} onChange={() => {}} />
                </SettingRow>
                <SettingRow last>
                  <FieldLabel label="Authenticator App" sub="Google Authenticator or Authy" />
                  <GhostBtn style={{ fontSize:10 }}>Configure</GhostBtn>
                </SettingRow>
              </Card>

              <Card style={{ padding:'24px 28px', marginBottom:16 }}>
                <div style={{ fontSize:10, fontFamily:'DM Mono,monospace', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14 }}>Sessions</div>
                {[
                  { device:'Chrome on macOS', location:'Toronto, ON', time:'Active now', current:true },
                  { device:'Safari on iPhone', location:'Toronto, ON', time:'2 hours ago', current:false },
                  { device:'Firefox on Windows', location:'Ottawa, ON', time:'3 days ago', current:false },
                ].map((s,i,arr) => (
                  <div key={s.device} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:i<arr.length-1?'1px solid var(--border)':'none' }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:500, display:'flex', alignItems:'center', gap:8 }}>
                        {s.device}
                        {s.current && <span style={{ fontSize:9, fontFamily:'DM Mono,monospace', background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.2)', color:'var(--green)', padding:'2px 6px', borderRadius:99 }}>current</span>}
                      </div>
                      <div style={{ fontSize:11, fontFamily:'DM Mono,monospace', color:'var(--text-secondary)', marginTop:2 }}>{s.location} · {s.time}</div>
                    </div>
                    {!s.current && <button onClick={() => toast.success(`Session revoked: ${s.device}`)} style={{ padding:'5px 12px', borderRadius:6, border:'1px solid var(--red)', background:'var(--red-dim)', color:'var(--red)', fontSize:10, fontFamily:'DM Mono,monospace', cursor:'pointer' }}>Revoke</button>}
                  </div>
                ))}
              </Card>

              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <GhostBtn>Cancel</GhostBtn>
                <PrimaryBtn onClick={save}>{saved ? '✓ Saved!' : 'Save Changes'}</PrimaryBtn>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
