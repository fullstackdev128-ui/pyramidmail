import { create } from "zustand";
import { Task, TaskStatus } from "@/types/task";
import tasksData from "@/mock/tasks.json";

interface TasksState {
  selectedTaskId: string | null;
  filter: TaskStatus | "all";
  setFilter: (filter: TaskStatus | "all") => void;
  selectTask: (id: string | null) => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  selectedTaskId: null,
  filter: "all",

  setFilter: (filter) => set({ filter }),

  selectTask: (id) => set({ selectedTaskId: id }),
}));
