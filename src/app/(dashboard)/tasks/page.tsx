export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { TasksClient } from "./tasks-client";

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    include: { matter: { select: { id: true, title: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tasks</h1>
      <TasksClient tasks={tasks} />
    </div>
  );
}
