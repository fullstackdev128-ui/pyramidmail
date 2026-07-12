import { useState, useMemo } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  X,
  Trash2,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { panelSideColumnClass } from "@/lib/mail-layout";
import { useIsDesktop } from "@/hooks/useBreakpoint";
import { useCalendarStore } from "@/hooks/useCalendarStore";
import { useCalendar } from "@/hooks/useCalendar";
import { CalendarEvent, EventColor } from "@/types/event";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import calendarImage from "@/assets/calendar.png";

type PanelMode = "empty" | "detail" | "form";

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const EVENT_COLORS: Record<EventColor, { bg: string; text: string; pillBg: string }> = {
  blue: { bg: "#DBEAFE", text: "#1E40AF", pillBg: "#DBEAFE" },
  green: { bg: "#D1FAE5", text: "#065F46", pillBg: "#D1FAE5" },
  red: { bg: "#FEE2E2", text: "#991B1B", pillBg: "#FEE2E2" },
  amber: { bg: "#FEF3C7", text: "#92400E", pillBg: "#FEF3C7" },
  purple: { bg: "#EDE9FE", text: "#5B21B6", pillBg: "#EDE9FE" },
};

const COLOR_OPTIONS: EventColor[] = ["blue", "green", "red", "amber", "purple"];
const HOUR_START = 8;
const HOUR_END = 19;

// ── Calendar helpers ──

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getFirstDayOfMonth(date: Date): number {
  // 0 = Monday, 6 = Sunday
  const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function formatDateISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDisplayDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function isToday(date: Date, year: number, month: number, day: number): boolean {
  const today = new Date();
  return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
}

function getWeekDates(currentDate: Date): Date[] {
  const d = new Date(currentDate);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    return dd;
  });
}

function getEventsForDate(events: CalendarEvent[], isoDate: string): CalendarEvent[] {
  return events.filter((e) => e.date === isoDate);
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// ── Month View ──

function MonthView({
  events,
  selectedDate,
  onSelectDate,
  onSelectEvent,
  onEventSelect,
}: {
  events: CalendarEvent[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  onSelectEvent: (id: string | null) => void;
  onEventSelect: (id: string) => void;
}) {
  const storeCurrentDate = useCalendarStore((s) => s.currentDate);
  const year = storeCurrentDate.getFullYear();
  const month = storeCurrentDate.getMonth();
  const daysInMonth = getDaysInMonth(storeCurrentDate);
  const firstDay = getFirstDayOfMonth(storeCurrentDate);
  const prevMonthDays = getDaysInMonth(new Date(year, month - 1));

  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const cells: { day: number; currentMonth: boolean; iso: string }[] = [];

  for (let i = 0; i < totalCells; i++) {
    if (i < firstDay) {
      const day = prevMonthDays - firstDay + i + 1;
      const m = month - 1;
      const d = new Date(year, m, day);
      cells.push({
        day,
        currentMonth: false,
        iso: formatDateISO(d.getFullYear(), d.getMonth(), d.getDate()),
      });
    } else if (i >= firstDay + daysInMonth) {
      const day = i - firstDay - daysInMonth + 1;
      const m = month + 1;
      const d = new Date(year, m, day);
      cells.push({
        day,
        currentMonth: false,
        iso: formatDateISO(d.getFullYear(), d.getMonth(), d.getDate()),
      });
    } else {
      const day = i - firstDay + 1;
      const d = new Date(year, month, day);
      cells.push({
        day,
        currentMonth: true,
        iso: formatDateISO(d.getFullYear(), d.getMonth(), d.getDate()),
      });
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-[#DFE5E7]">
        {DAYS_FR.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[#162A42]"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 overflow-y-auto">
        {cells.map((cell, i) => {
          const dayEvents = getEventsForDate(events, cell.iso);
          const todayFlag = isToday(storeCurrentDate, year, month, cell.day);
          const isSelected = cell.iso === selectedDate;
          const visibleEvents = dayEvents.slice(0, 3);
          const extraCount = dayEvents.length - 3;

          return (
            <div
              key={i}
              onClick={() => onSelectDate(cell.iso)}
              className={cn(
                "min-h-[100px] border-r border-b border-[#DFE5E7] p-1 cursor-pointer transition-colors relative group",
                !cell.currentMonth && "bg-[#F8FAFB]",
                isSelected && !todayFlag && "ring-2 ring-inset ring-[#0087CA]",
                todayFlag && "bg-[#EDF3F6]"
              )}
            >
              {/* Day number */}
              <div className="flex justify-end mb-1">
                <span
                  className={cn(
                    "text-[10px] font-medium w-5 h-5 flex items-center justify-center rounded-full",
                    todayFlag
                      ? "bg-[#0087CA] text-white font-semibold"
                      : cell.currentMonth
                        ? "text-[#162A42]"
                        : "text-slate-300"
                  )}
                >
                  {cell.day}
                </span>
              </div>

              {/* Event pills */}
              <div className="space-y-0.5">
                {visibleEvents.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventSelect(evt.id);
                    }}
                    className="w-full text-left truncate px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer hover:opacity-80"
                    style={{
                      backgroundColor: EVENT_COLORS[evt.color].pillBg,
                      color: EVENT_COLORS[evt.color].text,
                    }}
                  >
                    {evt.title}
                  </button>
                ))}
                {extraCount > 0 && (
                  <div className="text-[10px] font-semibold text-[#0087CA] px-1">
                    +{extraCount} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Week View ──

function WeekView({
  events,
  onSelectDate,
  onEventSelect,
}: {
  events: CalendarEvent[];
  onSelectDate: (date: string | null) => void;
  onEventSelect: (id: string) => void;
}) {
  const storeCurrentDate = useCalendarStore((s) => s.currentDate);
  const weekDates = useMemo(() => getWeekDates(storeCurrentDate), [storeCurrentDate]);

  const hours = useMemo(
    () => Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i),
    []
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-[48px_1fr] border-b border-[#DFE5E7]">
        <div />
        <div className="grid grid-cols-7">
          {weekDates.map((d, i) => {
            const today = isToday(storeCurrentDate, d.getFullYear(), d.getMonth(), d.getDate());
            return (
              <div
                key={i}
                className={cn(
                  "py-2 text-center text-xs font-semibold border-l border-[#DFE5E7]",
                  today ? "text-[#0087CA]" : "text-[#162A42]"
                )}
              >
                {DAYS_FR[i]} {d.getDate()}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hours grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[48px_1fr]">
          {/* Time labels */}
          <div className="space-y-0">
            {hours.map((h) => (
              <div
                key={h}
                className="h-12 flex items-start justify-end pr-2 text-[10px] text-slate-300 font-medium"
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="grid grid-cols-7">
            {weekDates.map((d, i) => {
              const iso = formatDateISO(d.getFullYear(), d.getMonth(), d.getDate());
              const dayEvents = getEventsForDate(events, iso);

              return (
                <div key={i} className="relative border-l border-[#DFE5E7]">
                  {/* Hour cells */}
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="h-12 border-b border-[#DFE5E7] cursor-pointer hover:bg-[#EDF3F6]/50"
                      onClick={() => onSelectDate(iso)}
                    />
                  ))}

                  {/* Events positioned absolutely */}
                  {dayEvents.map((evt) => {
                    const startMin = timeToMinutes(evt.startTime);
                    const endMin = timeToMinutes(evt.endTime);
                    const topPx = ((startMin - HOUR_START * 60) / 60) * 48;
                    const heightPx = ((endMin - startMin) / 60) * 48;

                    return (
                      <button
                        key={evt.id}
                        onClick={() => onEventSelect(evt.id)}
                        className="absolute left-0.5 right-0.5 rounded px-1 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity z-10"
                        style={{
                          top: `${topPx}px`,
                          height: `${Math.max(heightPx, 20)}px`,
                          backgroundColor: EVENT_COLORS[evt.color].pillBg,
                          color: EVENT_COLORS[evt.color].text,
                        }}
                      >
                        <div className="text-[10px] font-semibold truncate leading-tight">
                          {evt.title}
                        </div>
                        <div className="text-[9px] opacity-75 leading-tight">
                          {evt.startTime}–{evt.endTime}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Day View ──

function DayView({
  events,
  onSelectDate,
  onEventSelect,
}: {
  events: CalendarEvent[];
  onSelectDate: (date: string | null) => void;
  onEventSelect: (id: string) => void;
}) {
  const storeCurrentDate = useCalendarStore((s) => s.currentDate);
  const iso = formatDateISO(
    storeCurrentDate.getFullYear(),
    storeCurrentDate.getMonth(),
    storeCurrentDate.getDate()
  );
  const dayEvents = getEventsForDate(events, iso);

  const hours = useMemo(
    () => Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i),
    []
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[48px_1fr]">
          {/* Time labels */}
          <div className="space-y-0">
            {hours.map((h) => (
              <div
                key={h}
                className="h-12 flex items-start justify-end pr-2 text-[10px] text-slate-300 font-medium"
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="relative">
            {hours.map((h) => (
              <div
                key={h}
                className="h-12 border-b border-[#DFE5E7] cursor-pointer hover:bg-[#EDF3F6]/50"
                onClick={() => onSelectDate(iso)}
              />
            ))}

            {dayEvents.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-slate-400 font-medium text-center">
                  Aucun événement ce jour.
                  <br />
                  Cliquez sur <span className="text-[#0087CA] font-semibold">+ Événement</span> pour en
                  créer un.
                </p>
              </div>
            ) : (
              dayEvents.map((evt) => {
                const startMin = timeToMinutes(evt.startTime);
                const endMin = timeToMinutes(evt.endTime);
                const topPx = ((startMin - HOUR_START * 60) / 60) * 48;
                const heightPx = ((endMin - startMin) / 60) * 48;

                return (
                  <button
                    key={evt.id}
                    onClick={() => onEventSelect(evt.id)}
                    className="absolute left-2 right-2 rounded px-2 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity z-10"
                    style={{
                      top: `${topPx}px`,
                      height: `${Math.max(heightPx, 24)}px`,
                      backgroundColor: EVENT_COLORS[evt.color].pillBg,
                      color: EVENT_COLORS[evt.color].text,
                    }}
                  >
                    <div className="text-xs font-semibold truncate leading-tight">{evt.title}</div>
                    <div className="text-[10px] opacity-75 leading-tight">
                      {evt.startTime} → {evt.endTime}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──

export function CalendarPage() {
  const isMobileOrTablet = !useIsDesktop();
  const view = useCalendarStore((s) => s.view);
  const currentDate = useCalendarStore((s) => s.currentDate);
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const selectedEventId = useCalendarStore((s) => s.selectedEventId);
  const setView = useCalendarStore((s) => s.setView);
  const navigate = useCalendarStore((s) => s.navigate);
  const selectDate = useCalendarStore((s) => s.selectDate);
  const selectEvent = useCalendarStore((s) => s.selectEvent);

  const { events, isLoading, createEvent, deleteEvent } = useCalendar();

  const [panelMode, setPanelMode] = useState<PanelMode>("empty");
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    color: "blue" as EventColor,
    description: "",
    location: "",
  });

  const selectedEvent = useMemo(
    () => events.find((e: any) => e.id === selectedEventId) ?? null,
    [events, selectedEventId]
  );

  // ── Header title ──
  const headerTitle = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();

    if (view === "month") {
      return `${MONTHS_FR[m]} ${y}`;
    }
    if (view === "week") {
      const weekDates = getWeekDates(currentDate);
      const first = weekDates[0];
      const last = weekDates[6];
      return `${first.getDate()} – ${last.getDate()} ${MONTHS_FR[m]} ${y}`;
    }
    // day
    const dayIdx = currentDate.getDay();
    const dayName = dayIdx === 0 ? "Dimanche" : DAYS_FR[dayIdx - 1];
    return `${dayName} ${currentDate.getDate()} ${MONTHS_FR[m]} ${y}`;
  }, [currentDate, view]);

  // ── Handlers ──
  const handleNewEvent = () => {
    const prefillDate =
      selectedDate ??
      formatDateISO(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    setFormData({
      title: "",
      date: prefillDate,
      startTime: "09:00",
      endTime: "10:00",
      color: "blue",
      description: "",
      location: "",
    });
    setPanelMode("form");
  };

  const handleDayClick = (date: string | null) => {
    if (!date) return;
    selectDate(date);
    setFormData({
      title: "",
      date,
      startTime: "09:00",
      endTime: "10:00",
      color: "blue",
      description: "",
      location: "",
    });
    setPanelMode("form");
  };

  const handleEventSelect = (id: string) => {
    selectEvent(id);
    setPanelMode("detail");
  };

  const handleDelete = async () => {
    if (!selectedEventId) return;
    if (window.confirm("Supprimer cet événement ?")) {
      await deleteEvent(selectedEventId);
      selectEvent(null);
      setPanelMode("empty");
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.date) return;
    await createEvent({
      title: formData.title.trim(),
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      color: formData.color,
      description: formData.description.trim(),
      location: formData.location.trim(),
    });
    setFormData({
      title: "",
      date: "",
      startTime: "09:00",
      endTime: "10:00",
      color: "blue",
      description: "",
      location: "",
    });
    selectEvent(null);
    setPanelMode("empty");
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      date: "",
      startTime: "09:00",
      endTime: "10:00",
      color: "blue",
      description: "",
      location: "",
    });
    setPanelMode("empty");
  };

  // ── View selector ──
  const views: { label: string; value: "month" | "week" | "day" }[] = [
    { label: "Mois", value: "month" },
    { label: "Semaine", value: "week" },
    { label: "Jour", value: "day" },
  ];

  const showCalendar = !isMobileOrTablet || panelMode === "empty";
  const showSidePanel = !isMobileOrTablet || panelMode !== "empty";

  return (
    <div className="flex flex-col h-full gap-3 animate-in fade-in duration-500 min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate("prev")}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#DFE5E7] transition-colors text-[#162A42]"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => navigate("today")}
              className="px-3 h-8 text-xs font-semibold rounded-md border border-[#DFE5E7] text-[#162A42] hover:bg-[#DFE5E7] transition-colors"
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => navigate("next")}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#DFE5E7] transition-colors text-[#162A42]"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <h2 className="text-lg font-semibold text-[#162A42]">{headerTitle}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View selector */}
          <div className="flex gap-1 flex-1 sm:flex-none">
            {views.map((v) => (
              <button
                key={v.value}
                onClick={() => setView(v.value)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                  view === v.value
                    ? "bg-[#0087CA] text-white"
                    : "text-[#162A42] border border-[#DFE5E7] hover:bg-[#DFE5E7]"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            onClick={handleNewEvent}
            className="bg-[#0087CA] hover:bg-[#0087CA]/90 text-white h-8 rounded-md gap-1 font-semibold text-xs"
          >
            <Plus size={14} />
            Événement
          </Button>
        </div>
      </div>

      {/* Body: calendar + panel */}
      <div className="flex flex-1 flex-col lg:flex-row gap-3 min-h-0">
        {/* Calendar area */}
        <div
          className={cn(
            "flex-1 flex flex-col bg-white rounded-2xl border border-[#DFE5E7] overflow-hidden relative min-h-0",
            !showCalendar && "hidden lg:flex"
          )}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#0087CA] animate-spin" />
            </div>
          )}
          {view === "month" && (
            <MonthView
              events={events}
              selectedDate={selectedDate}
              onSelectDate={handleDayClick}
              onSelectEvent={selectEvent}
              onEventSelect={handleEventSelect}
            />
          )}
          {view === "week" && (
            <WeekView
              events={events}
              onSelectDate={handleDayClick}
              onEventSelect={handleEventSelect}
            />
          )}
          {view === "day" && (
            <DayView
              events={events}
              onSelectDate={handleDayClick}
              onEventSelect={handleEventSelect}
            />
          )}
        </div>

        {/* Right panel */}
        <div className={panelSideColumnClass(!showSidePanel)}>
          {isMobileOrTablet && panelMode !== "empty" && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1 px-4 py-3 text-sm font-semibold text-[#0087CA] border-b border-[#DFE5E7] shrink-0"
            >
              <ArrowLeft size={18} />
              Calendrier
            </button>
          )}
          {/* ── Empty state ── */}
          {panelMode === "empty" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <img src={calendarImage} alt="Calendrier" className="w-48 h-auto object-contain" />
              <p className="text-sm text-slate-400 font-medium">
                Cliquez sur un jour ou un événement
              </p>
              <Button
                onClick={handleNewEvent}
                size="sm"
                className="bg-[#0087CA] hover:bg-[#0087CA]/90 text-white rounded-md gap-1 font-semibold text-xs"
              >
                <Plus size={14} />
                Créer un événement
              </Button>
            </div>
          )}

          {/* ── Event detail ── */}
          {panelMode === "detail" && selectedEvent && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-[#162A42] flex-1">{selectedEvent.title}</h3>
                <button
                  onClick={handleCancel}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Color badge */}
              <span
                className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: EVENT_COLORS[selectedEvent.color as EventColor].pillBg,
                  color: EVENT_COLORS[selectedEvent.color as EventColor].text,
                }}
              >
                {selectedEvent.color.charAt(0).toUpperCase() + selectedEvent.color.slice(1)}
              </span>

              <Separator className="bg-[#DFE5E7]" />

              {/* Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Date
                </label>
                <p className="text-sm font-medium text-[#162A42]">
                  {formatDisplayDate(selectedEvent.date)}
                </p>
              </div>

              {/* Time */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Horaire
                </label>
                <p className="text-sm font-medium text-[#162A42]">
                  {selectedEvent.startTime} → {selectedEvent.endTime}
                </p>
              </div>

              {/* Description */}
              {selectedEvent.description && (
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Description
                  </label>
                  <p className="text-sm text-[#091D35] leading-relaxed whitespace-pre-wrap">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              {/* Location */}
              {selectedEvent.location && (
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Lieu
                  </label>
                  <div className="flex items-center gap-2 text-sm text-[#162A42]">
                    <MapPin size={14} className="text-[#0087CA] shrink-0" />
                    <span>{selectedEvent.location}</span>
                  </div>
                </div>
              )}

              <Separator className="bg-[#DFE5E7]" />

              {/* Delete */}
              <Button
                onClick={handleDelete}
                variant="outline"
                className="w-full rounded h-11 font-semibold text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 gap-2"
              >
                <Trash2 size={16} />
                Supprimer
              </Button>
            </div>
          )}

          {/* ── Create form ── */}
          {panelMode === "form" && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#162A42]">Nouvel événement</h3>
                <button
                  onClick={handleCancel}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <Separator className="bg-[#DFE5E7]" />

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Titre *
                </label>
                <Input
                  placeholder="Titre de l'événement"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="h-10 bg-[#EDF3F6] border-none rounded-xl"
                />
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Date
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className="h-10 bg-[#EDF3F6] border-none rounded-xl"
                />
              </div>

              {/* Time range */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Début
                  </label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                    className="h-10 bg-[#EDF3F6] border-none rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Fin
                  </label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                    className="h-10 bg-[#EDF3F6] border-none rounded-xl"
                  />
                </div>
              </div>

              {/* Color picker */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Couleur
                </label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setFormData((prev) => ({ ...prev, color: c }))}
                      className={cn(
                        "w-7 h-7 rounded-full transition-all",
                        formData.color === c ? "ring-2 ring-offset-2 ring-black" : ""
                      )}
                      style={{ backgroundColor: EVENT_COLORS[c].pillBg }}
                    />
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Description
                </label>
                <Textarea
                  placeholder="Description (optionnelle)"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full p-3 bg-[#EDF3F6] border-none rounded-xl text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#0087CA]/20"
                />
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Lieu
                </label>
                <Input
                  placeholder="Lieu (optionnel)"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  className="h-10 bg-[#EDF3F6] border-none rounded-xl"
                />
              </div>

              <Separator className="bg-[#DFE5E7]" />

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 rounded h-11 font-semibold"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!formData.title.trim() || !formData.date}
                  className={cn(
                    "flex-1 rounded h-11 font-semibold",
                    "bg-[#0087CA] hover:bg-[#0087CA]/90 text-white",
                    (!formData.title.trim() || !formData.date) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Créer l'événement
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
