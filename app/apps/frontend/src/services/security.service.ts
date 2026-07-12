import api from "@/lib/api";

export interface SecurityInfo {
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  sessions: SessionInfo[];
}

export interface SessionInfo {
  id: string;
  device: string;
  ip: string;
  lastSeenAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export const securityService = {
  getSecurityInfo: async () => {
    const res = await api.get("/user/security");
    return res.data;
  },

  getSessions: async () => {
    const res = await api.get("/user/sessions");
    return res.data;
  },

  revokeSession: async (id: string) => {
    const res = await api.delete(`/user/sessions/${id}`);
    return res.data;
  },

  revokeAllSessions: async () => {
    const res = await api.delete("/user/sessions");
    return res.data;
  },

  changePassword: async (data: any) => {
    const res = await api.post("/user/change-password", data);
    return res.data;
  },
};
