import api from "@/lib/api";

export const authService = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),

  register: (data: {
    email: string;
    password: string;
    displayName?: string;
    phone?: string;
    city?: string;
  }) => api.post("/auth/register", data),

  logout: () => api.post("/auth/logout"),

  me: () => api.get("/auth/me"),

  refresh: () => api.post("/auth/refresh"),
};
