import api from "@/lib/api";

export interface CalendarEventData {
  id?: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  color: string;
}

export const calendarService = {
  getEvents: async (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const res = await api.get(`/calendar/events?${params.toString()}`);
    return res.data;
  },

  createEvent: async (data: CalendarEventData) => {
    const res = await api.post("/calendar/events", data);
    return res.data;
  },

  updateEvent: async (id: string, data: Partial<CalendarEventData>) => {
    const res = await api.patch(`/calendar/events/${id}`, data);
    return res.data;
  },

  deleteEvent: async (id: string) => {
    const res = await api.delete(`/calendar/events/${id}`);
    return res.data;
  },
};
