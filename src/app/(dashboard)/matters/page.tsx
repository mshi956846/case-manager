export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Briefcase } from "lucide-react";
import { MattersClient } from "./matters-client";

export default async function MattersPage() {
  const matters = await prisma.matter.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      contacts: { include: { contact: true } },
      _count: { select: { tasks: true, timeEntries: true, documents: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cases</h1>
            <p className="text-sm text-muted-foreground">
              Manage your active cases and legal matters
            </p>
          </div>
        </div>
      </div>
      <MattersClient matters={matters} />
    </div>
  );
}
