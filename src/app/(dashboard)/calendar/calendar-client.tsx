"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarEvent, EventType, Matter } from "@prisma/client";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EventForm } from "./event-form";

type EventWithMatter = CalendarEvent & {
  matter: { id: string; title: string } | null;
};

const typeColors: Record<EventType, string> = {
  HEARING: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  DEADLINE: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  MEETING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  REMINDER: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export function CalendarClient({ events }: { events: EventWithMatter[] }) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  function getEventsForDay(day: Date) {
    return events.filter((e) => isSameDay(new Date(e.startDate), day));
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Event deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete event");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[180px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setSelectedDate(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Event
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="grid grid-cols-7">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="border-b p-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[100px] border-b border-r p-1 cursor-pointer hover:bg-muted/50 transition-colors ${
                  !isCurrentMonth ? "bg-muted/30 text-muted-foreground" : ""
                }`}
                onClick={() => {
                  setSelectedDate(day);
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <div
                  className={`text-sm p-1 ${
                    isToday
                      ? "bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center"
                      : ""
                  }`}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={`rounded px-1 py-0.5 text-xs truncate cursor-pointer ${typeColors[event.type]}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(event);
                        setFormOpen(true);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {formOpen && (
        <EventForm
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) {
              setEditing(null);
              setSelectedDate(null);
            }
          }}
          event={editing}
          defaultDate={selectedDate}
          onDelete={(id) => {
            setFormOpen(false);
            setDeleteId(id);
          }}
        />
      )}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Event"
        description="This will permanently delete this event."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
