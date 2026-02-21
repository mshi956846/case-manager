import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateFilingSchema } from "@/lib/validations/filing";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const filing = await prisma.filing.findUnique({
    where: { id },
    include: {
      matter: { select: { id: true, title: true, caseNumber: true } },
      documents: {
        include: {
          document: { select: { id: true, name: true, documentType: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
      serviceRecords: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!filing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(filing);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = updateFilingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const existing = await prisma.filing.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  const d = parsed.data;

  if (d.status !== undefined) data.status = d.status;
  if (d.filingType !== undefined) data.filingType = d.filingType;
  if (d.county !== undefined) data.county = d.county;
  if (d.court !== undefined) data.court = d.court;
  if (d.division !== undefined) data.division = d.division || null;
  if (d.judge !== undefined) data.judge = d.judge || null;
  if (d.causeNumber !== undefined) data.causeNumber = d.causeNumber || null;
  if (d.filingParty !== undefined) data.filingParty = d.filingParty;
  if (d.envelopeNumber !== undefined) data.envelopeNumber = d.envelopeNumber || null;
  if (d.filingCode !== undefined) data.filingCode = d.filingCode || null;
  if (d.feeAmount !== undefined) data.feeAmount = d.feeAmount;
  if (d.feeWaived !== undefined) data.feeWaived = d.feeWaived;
  if (d.notes !== undefined) data.notes = d.notes || null;
  if (d.matterId !== undefined) data.matterId = d.matterId || null;
  if (d.submittedAt !== undefined) data.submittedAt = d.submittedAt ? new Date(d.submittedAt) : null;
  if (d.acceptedAt !== undefined) data.acceptedAt = d.acceptedAt ? new Date(d.acceptedAt) : null;
  if (d.rejectedAt !== undefined) data.rejectedAt = d.rejectedAt ? new Date(d.rejectedAt) : null;
  if (d.rejectionReason !== undefined) data.rejectionReason = d.rejectionReason || null;
  if (d.returnReason !== undefined) data.returnReason = d.returnReason || null;

  const filing = await prisma.filing.update({
    where: { id },
    data,
    include: {
      matter: { select: { id: true, title: true, caseNumber: true } },
      documents: {
        include: {
          document: { select: { id: true, name: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
      serviceRecords: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json(filing);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await prisma.filing.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.filing.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
