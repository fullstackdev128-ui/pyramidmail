import api from "@/lib/api";

export const emailService = {
  getThreads: (params?: {
    folder?: string;
    page?: number;
    limit?: number;
    starred?: boolean;
    important?: boolean;
    endpoint?: string;
  }) => {
    const url = params?.endpoint || "/emails/threads";
    const queryParams = { ...params };
    delete queryParams.endpoint;
    return api.get(url, { params: queryParams });
  },

  getThread: (id: string) => api.get(`/emails/threads/${id}`),

  markRead: (id: string, isRead: boolean) => api.post(`/emails/threads/${id}/read`, { isRead }),

  star: (id: string) => api.post(`/emails/threads/${id}/star`),

  markImportant: (id: string) => api.post(`/emails/threads/${id}/important`),

  spam: (id: string) => api.post(`/emails/threads/${id}/spam`),

  move: (id: string, folder: string) => api.post(`/emails/threads/${id}/move`, { folder }),

  delete: (id: string) => api.delete(`/emails/threads/${id}`),

  emptyFolder: (folder: string) => api.delete("/emails/threads", { params: { folder } }),

  search: (params: {
    q?: string;
    from?: string;
    to?: string;
    subject?: string;
    folder?: string;
    hasAttachments?: boolean;
  }) => api.get("/emails/search", { params }),

  uploadAttachment: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/attachments/upload", formData);
  },

  downloadAttachment: (key: string) =>
    api.get("/attachments", { params: { key }, responseType: "blob" }),

  send: (data: {
    threadId?: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    bodyHtml: string;
    bodyText?: string;
    attachments?: Array<{ key: string; name: string; size: number; contentType: string }>;
  }) => api.post("/emails/send", data),

  saveDraft: (data: {
    threadId?: string;
    to?: string[];
    cc?: string[];
    bcc?: string[];
    subject?: string;
    bodyHtml?: string;
  }) => api.post("/emails/draft", data),
};