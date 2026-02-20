import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validations/event";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const event = await prisma.calendarEvent.update({
    where: { id },
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

  return NextResponse.json(event);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.calendarEvent.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
