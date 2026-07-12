import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { calendarService, CalendarEventData } from "@/services/calendar.service";
import { CalendarEvent } from "@/types/event";

function mapToFrontend(event: any): CalendarEvent {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);

  return {
    id: event.id,
    title: event.title,
    date: start.toISOString().split("T")[0],
    startTime: start.toTimeString().slice(0, 5),
    endTime: end.toTimeString().slice(0, 5),
    color: event.color as any,
    description: event.description || "",
    location: event.location || "",
  };
}

function mapToBackend(event: Partial<CalendarEvent>): Partial<CalendarEventData> {
  const dateStr = event.date || new Date().toISOString().split("T")[0];
  const start = new Date(`${dateStr}T${event.startTime || "00:00"}:00`);
  const end = new Date(`${dateStr}T${event.endTime || "23:59"}:00`);

  return {
    title: event.title,
    description: event.description,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    allDay: false, // Default
    color: event.color,
  };
}

export function useCalendar(from?: string, to?: string) {
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ["calendar-events", from, to],
    queryFn: async () => {
      const data = await calendarService.getEvents(from, to);
      return data.map(mapToFrontend);
    },
  });

  const createEventMutation = useMutation({
    mutationFn: (data: Partial<CalendarEvent>) =>
      calendarService.createEvent(mapToBackend(data) as CalendarEventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CalendarEvent> }) =>
      calendarService.updateEvent(id, mapToBackend(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: calendarService.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    isError: eventsQuery.isError,
    createEvent: createEventMutation.mutateAsync,
    updateEvent: updateEventMutation.mutateAsync,
    deleteEvent: deleteEventMutation.mutateAsync,
  };
}
