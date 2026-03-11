'use client';
import { ReactNode } from 'react';
import Sidebar from './sidebar';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <Sidebar />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg-base)', transition:'background 0.25s' }}>
        {children}
      </div>
    </div>
  );
}
