import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const filing = await prisma.filing.findUnique({
    where: { id },
    include: { documents: true, serviceRecords: true },
  });

  if (!filing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (filing.status !== "READY") {
    return NextResponse.json(
      { error: "Filing must be in READY status to submit" },
      { status: 400 }
    );
  }

  const updated = await prisma.filing.update({
    where: { id },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      envelopeNumber: body.envelopeNumber || null,
    },
    include: {
      matter: { select: { id: true, title: true, caseNumber: true } },
    },
  });

  return NextResponse.json(updated);
}
