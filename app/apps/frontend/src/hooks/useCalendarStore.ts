import { create } from "zustand";
import { CalendarEvent } from "@/types/event";
import eventsData from "@/mock/events.json";

type CalendarView = "month" | "week" | "day";

interface CalendarState {
  view: CalendarView;
  currentDate: Date;
  selectedDate: string | null;
  selectedEventId: string | null;
  setView: (view: CalendarView) => void;
  navigate: (direction: "prev" | "next" | "today") => void;
  selectDate: (date: string | null) => void;
  selectEvent: (id: string | null) => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  view: "month",
  currentDate: new Date(),
  selectedDate: null,
  selectedEventId: null,

  setView: (view) => set({ view }),

  navigate: (direction) => {
    const { view, currentDate } = get();
    const now = new Date(currentDate);

    if (direction === "today") {
      set({ currentDate: new Date(), selectedDate: null, selectedEventId: null });
      return;
    }

    const delta = direction === "next" ? 1 : -1;

    if (view === "month") {
      now.setMonth(now.getMonth() + delta);
    } else if (view === "week") {
      now.setDate(now.getDate() + delta * 7);
    } else {
      now.setDate(now.getDate() + delta);
    }

    set({ currentDate: now, selectedDate: null, selectedEventId: null });
  },

  selectDate: (date) => set({ selectedDate: date, selectedEventId: null }),

  selectEvent: (id) => set({ selectedEventId: id }),
}));
