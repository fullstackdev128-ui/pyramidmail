export type UserRole = "admin" | "user";
export type UserStatus = "actif" | "inactif" | "suspendu";
export type UserPlan = "free" | "premium";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  plan: UserPlan;
  joinedAt: string; // ISO date "YYYY-MM-DD"
  lastLogin: string; // ISO date "YYYY-MM-DD"
  storageUsed: number; // en Go
  emailsSent: number;
  department: string;
}
