import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { timeEntrySchema } from "@/lib/validations/time-entry";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = timeEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const entry = await prisma.timeEntry.update({
    where: { id },
    data: {
      description: data.description,
      date: new Date(data.date),
      durationMinutes: data.durationMinutes,
      hourlyRate: data.hourlyRate,
      billable: data.billable,
      matterId: data.matterId || null,
    },
  });

  return NextResponse.json(entry);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.timeEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
