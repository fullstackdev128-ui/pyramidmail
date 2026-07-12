import api from "@/lib/api";

export interface ApiKeyData {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export const developerService = {
  getApiKeys: async () => {
    const res = await api.get("/developers/keys");
    return res.data;
  },

  createApiKey: async (data: any) => {
    const res = await api.post("/developers/keys", data);
    return res.data;
  },

  deleteApiKey: async (id: string) => {
    const res = await api.delete(`/developers/keys/${id}`);
    return res.data;
  },

  revokeApiKey: async (id: string) => {
    const res = await api.patch(`/developers/keys/${id}/revoke`);
    return res.data;
  },

  getDeveloperStats: async () => {
    const res = await api.get("/developers/stats");
    return res.data;
  },
};
