import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { timeEntrySchema } from "@/lib/validations/time-entry";

export async function GET(req: NextRequest) {
  const matterId = req.nextUrl.searchParams.get("matterId");

  const entries = await prisma.timeEntry.findMany({
    where: matterId ? { matterId } : undefined,
    orderBy: { date: "desc" },
    include: { matter: { select: { id: true, title: true } } },
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = timeEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const entry = await prisma.timeEntry.create({
    data: {
      description: data.description,
      date: new Date(data.date),
      durationMinutes: data.durationMinutes,
      hourlyRate: data.hourlyRate,
      billable: data.billable,
      matterId: data.matterId || null,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
