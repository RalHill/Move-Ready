export type UserRole = "dispatcher" | "manager" | "driver";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export type CrewStatus = "available" | "assigned" | "offline";

export interface Crew {
  id: string;
  name: string;
  status: CrewStatus;
  current_lat: number;
  current_lng: number;
  updated_at?: string;
}

export type JobStatus =
  | "unassigned"
  | "assigned"
  | "en_route"
  | "on_site"
  | "completed";

export interface Job {
  id: string;
  customer_name: string;
  address: string;
  scheduled_time: string;
  status: JobStatus;
  crew_id: string | null;
  risk_flag: boolean;
  created_at: string;
}

export interface AssignmentEvent {
  id: string;
  job_id: string;
  crew_id: string;
  assigned_by: string;
  timestamp: string;
}

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}
