export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Clock } from "lucide-react";
import { TimeTrackingClient } from "./time-tracking-client";

export default async function TimeTrackingPage() {
  const entries = await prisma.timeEntry.findMany({
    orderBy: { date: "desc" },
    include: { matter: { select: { id: true, title: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Time Tracking</h1>
            <p className="text-sm text-muted-foreground">
              Log billable hours and track time entries
            </p>
          </div>
        </div>
      </div>
      <TimeTrackingClient entries={entries} />
    </div>
  );
}
