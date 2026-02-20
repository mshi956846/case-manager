import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matterSchema } from "@/lib/validations/matter";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const matters = await prisma.matter.findMany({
    where: status ? { status: status as "OPEN" | "PENDING" | "CLOSED" } : undefined,
    orderBy: { updatedAt: "desc" },
    include: {
      contacts: { include: { contact: true } },
      _count: { select: { tasks: true, timeEntries: true, documents: true } },
    },
  });
  return NextResponse.json(matters);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = matterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const matter = await prisma.matter.create({
    data: {
      title: data.title,
      caseNumber: data.caseNumber || null,
      status: data.status,
      practiceArea: data.practiceArea || null,
      description: data.description || null,
      openDate: data.openDate ? new Date(data.openDate) : new Date(),
      closeDate: data.closeDate ? new Date(data.closeDate) : null,
      statuteOfLimitations: data.statuteOfLimitations
        ? new Date(data.statuteOfLimitations)
        : null,
    },
  });

  return NextResponse.json(matter, { status: 201 });
}
