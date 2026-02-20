export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { CalendarClient } from "./calendar-client";

export default async function CalendarPage() {
  const events = await prisma.calendarEvent.findMany({
    orderBy: { startDate: "asc" },
    include: { matter: { select: { id: true, title: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Calendar</h1>
      <CalendarClient events={events} />
    </div>
  );
}
