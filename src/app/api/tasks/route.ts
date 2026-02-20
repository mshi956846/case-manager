import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/validations/task";

export async function GET(req: NextRequest) {
  const matterId = req.nextUrl.searchParams.get("matterId");
  const status = req.nextUrl.searchParams.get("status");

  const tasks = await prisma.task.findMany({
    where: {
      ...(matterId ? { matterId } : {}),
      ...(status ? { status: status as "TODO" | "IN_PROGRESS" | "DONE" } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { matter: { select: { id: true, title: true } } },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = taskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      priority: data.priority,
      status: data.status,
      matterId: data.matterId || null,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
