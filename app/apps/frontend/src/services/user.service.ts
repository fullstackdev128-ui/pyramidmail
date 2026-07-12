import api from "@/lib/api";

export const userService = {
  getProfile: () => api.get("/user/profile"),

  updateProfile: (data: {
    displayName?: string | null;
    phone?: string | null;
    city?: string | null;
    bio?: string | null;
  }) => api.patch("/user/profile", data),

  getSettings: () => api.get("/user/settings"),

  updateSettings: (data: Record<string, unknown>) => api.patch("/user/settings", data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/user/avatar", formData);
  },
};
