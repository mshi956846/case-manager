export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Send } from "lucide-react";
import { EFilingClient } from "./e-filing-client";

export default async function EFilingPage() {
  const filings = await prisma.filing.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      matter: { select: { id: true, title: true, caseNumber: true } },
      documents: {
        include: {
          document: { select: { id: true, name: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { serviceRecords: true } },
    },
  });

  const statusCounts = {
    DRAFT: 0,
    READY: 0,
    SUBMITTED: 0,
    ACCEPTED: 0,
    REJECTED: 0,
    RETURNED: 0,
  };

  for (const f of filings) {
    statusCounts[f.status]++;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">E-Filing</h1>
            <p className="text-sm text-muted-foreground">
              Manage Indiana E-Filing System submissions
            </p>
          </div>
        </div>
      </div>
      <EFilingClient filings={JSON.parse(JSON.stringify(filings))} statusCounts={statusCounts} />
    </div>
  );
}
