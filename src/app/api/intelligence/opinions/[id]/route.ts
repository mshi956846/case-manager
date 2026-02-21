import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const opinion = await prisma.appellateOpinion.findUnique({
    where: { id },
  });

  if (!opinion) {
    return NextResponse.json({ error: "Opinion not found" }, { status: 404 });
  }

  // Find related opinions (same county or same authors)
  const related = await prisma.appellateOpinion.findMany({
    where: {
      id: { not: opinion.id },
      OR: [
        ...(opinion.county ? [{ county: opinion.county }] : []),
        { authors: { contains: opinion.authors.split(",")[0]?.trim() || "" } },
      ],
    },
    take: 5,
    orderBy: { dateFiled: "desc" },
    select: {
      id: true,
      caseName: true,
      docketNumber: true,
      dateFiled: true,
      outcome: true,
      court: true,
    },
  });

  return NextResponse.json({ ...opinion, related });
}
