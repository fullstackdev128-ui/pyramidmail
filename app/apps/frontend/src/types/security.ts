export type LogSeverity = "info" | "warning" | "danger";
export type LogCategory = "auth" | "team" | "billing" | "system";

export interface SecurityLog {
  id: string;
  timestamp: string; // ISO date
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  action: string;
  ip: string;
  location: string;
  device: string;
  severity: LogSeverity;
  category: LogCategory;
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}
