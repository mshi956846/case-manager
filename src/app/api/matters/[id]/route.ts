import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matterSchema } from "@/lib/validations/matter";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const matter = await prisma.matter.findUnique({
    where: { id },
    include: {
      contacts: { include: { contact: true } },
      tasks: { orderBy: { createdAt: "desc" } },
      timeEntries: { orderBy: { date: "desc" } },
      documents: { orderBy: { uploadedAt: "desc" } },
      events: { orderBy: { startDate: "asc" } },
      invoices: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!matter) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(matter);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = matterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const matter = await prisma.matter.update({
    where: { id },
    data: {
      title: data.title,
      caseNumber: data.caseNumber || null,
      status: data.status,
      practiceArea: data.practiceArea || null,
      description: data.description || null,
      openDate: data.openDate ? new Date(data.openDate) : undefined,
      closeDate: data.closeDate ? new Date(data.closeDate) : null,
      statuteOfLimitations: data.statuteOfLimitations
        ? new Date(data.statuteOfLimitations)
        : null,
    },
  });

  return NextResponse.json(matter);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.matter.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
