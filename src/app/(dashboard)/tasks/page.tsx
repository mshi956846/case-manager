export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { CheckSquare } from "lucide-react";
import { TasksClient } from "./tasks-client";

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    include: { matter: { select: { id: true, title: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Tasks</h1>
            <p className="text-sm text-muted-foreground">
              Track and manage your to-dos and deadlines
            </p>
          </div>
        </div>
      </div>
      <TasksClient tasks={tasks} />
    </div>
  );
}
