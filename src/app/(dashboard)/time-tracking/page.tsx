export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { TimeTrackingClient } from "./time-tracking-client";

export default async function TimeTrackingPage() {
  const entries = await prisma.timeEntry.findMany({
    orderBy: { date: "desc" },
    include: { matter: { select: { id: true, title: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Time Tracking</h1>
      <TimeTrackingClient entries={entries} />
    </div>
  );
}
