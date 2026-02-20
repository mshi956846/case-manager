import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validations/event";

export async function GET(req: NextRequest) {
  const start = req.nextUrl.searchParams.get("start");
  const end = req.nextUrl.searchParams.get("end");

  const events = await prisma.calendarEvent.findMany({
    where: {
      ...(start && end
        ? {
            startDate: {
              gte: new Date(start),
              lte: new Date(end),
            },
          }
        : {}),
    },
    orderBy: { startDate: "asc" },
    include: { matter: { select: { id: true, title: true } } },
  });

  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const event = await prisma.calendarEvent.create({
    data: {
      title: data.title,
      description: data.description || null,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      allDay: data.allDay,
      type: data.type,
      matterId: data.matterId || null,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
