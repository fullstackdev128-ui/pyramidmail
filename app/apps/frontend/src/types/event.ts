export type EventColor = "blue" | "green" | "red" | "amber" | "purple";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  color: EventColor;
  description: string;
  location: string;
}
