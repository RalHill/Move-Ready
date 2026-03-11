export type JobStatus = 'unassigned' | 'assigned' | 'en-route' | 'on-site' | 'complete';
export type CrewStatus = 'available' | 'assigned' | 'offline';

export interface Job {
  id: string;
  client: string;
  address: string;
  date: string;
  time: string;
  status: JobStatus;
  crew?: string;
  risk?: boolean;
}

export interface Crew {
  id: string;
  name: string;
  status: CrewStatus;
  icon: string;
  lat: string;
  lng: string;
  activeJob?: string;
  activeAddress?: string;
  utilization: number;
  warning?: string;
}

export const JOBS: Job[] = [
  { id: 'd5962697', client: 'Emma Davis',    address: '321 Yonge St, Toronto ON', date: 'Feb 21', time: '13:40', status: 'en-route',   crew: 'Crew Alpha', risk: true },
  { id: '87d059ed', client: 'John Smith',    address: '123 King St, Toronto ON',  date: 'Feb 21', time: '16:40', status: 'assigned',   crew: 'Crew Bravo' },
  { id: 'a1b2c301', client: 'David Lee',     address: '654 Bloor St, Toronto ON', date: 'Feb 21', time: '17:40', status: 'unassigned' },
  { id: 'd4e5f602', client: 'Sarah Johnson', address: '456 Queen St, Toronto ON', date: 'Feb 21', time: '18:40', status: 'unassigned' },
  { id: 'g7h8i903', client: 'Mike Wilson',   address: '789 Bay St, Toronto ON',   date: 'Feb 22', time: '14:40', status: 'unassigned' },
];

export const CREWS: Crew[] = [
  { id: 'alpha',   name: 'Crew Alpha',   status: 'available', icon: '🚛', lat: '43.6532', lng: '-79.3832', activeJob: 'Emma Davis',    activeAddress: '321 Yonge St, Toronto ON', utilization: 42,  warning: 'At Risk: Running late' },
  { id: 'bravo',   name: 'Crew Bravo',   status: 'assigned',  icon: '🚚', lat: '43.7000', lng: '-79.4163', activeJob: 'John Smith',    activeAddress: '123 King St, Toronto ON',  utilization: 75 },
  { id: 'charlie', name: 'Crew Charlie', status: 'offline',   icon: '🚐', lat: '43.6426', lng: '-79.3871', utilization: 0 },
  { id: 'delta',   name: 'Crew Delta',   status: 'available', icon: '🚛', lat: '43.6629', lng: '-79.3957', utilization: 0 },
];

export const STATUS_META: Record<JobStatus, { label: string; color: string; bg: string; border: string }> = {
  'unassigned': { label: 'Unassigned', color: 'var(--text-secondary)', bg: 'var(--bg-elevated)',  border: 'var(--border-bright)' },
  'assigned':   { label: 'Assigned',   color: 'var(--accent-bright)',  bg: 'var(--accent-subtle)', border: 'rgba(59,130,246,0.2)' },
  'en-route':   { label: 'En Route',   color: 'var(--amber)',          bg: 'var(--amber-dim)',     border: 'rgba(245,158,11,0.25)' },
  'on-site':    { label: 'On Site',    color: 'var(--purple)',         bg: 'var(--purple-dim)',    border: 'rgba(124,58,237,0.25)' },
  'complete':   { label: 'Complete',   color: 'var(--green)',          bg: 'var(--green-dim)',     border: 'rgba(16,185,129,0.25)' },
};
