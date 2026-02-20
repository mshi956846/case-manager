export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
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
      <h1 className="text-2xl font-bold">Matters</h1>
      <MattersClient matters={matters} />
    </div>
  );
}
