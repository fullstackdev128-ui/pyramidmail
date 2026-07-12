import api from "@/lib/api";

export interface TaskData {
  id?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string | null;
}

export const taskService = {
  getTasks: async (filters?: any) => {
    const params = new URLSearchParams(filters);
    const res = await api.get(`/tasks?${params.toString()}`);
    return res.data;
  },

  createTask: async (data: TaskData) => {
    const res = await api.post("/tasks", data);
    return res.data;
  },

  updateTask: async (id: string, data: Partial<TaskData>) => {
    const res = await api.patch(`/tasks/${id}`, data);
    return res.data;
  },

  deleteTask: async (id: string) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  },

  completeTask: async (id: string) => {
    const res = await api.patch(`/tasks/${id}/complete`);
    return res.data;
  },
};
