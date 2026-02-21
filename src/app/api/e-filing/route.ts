import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createFilingSchema } from "@/lib/validations/filing";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const matterId = req.nextUrl.searchParams.get("matterId");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (matterId) where.matterId = matterId;

  const filings = await prisma.filing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      matter: { select: { id: true, title: true, caseNumber: true } },
      documents: {
        include: {
          document: { select: { id: true, name: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { serviceRecords: true } },
    },
  });

  return NextResponse.json(filings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createFilingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const filing = await prisma.filing.create({
    data: {
      filingType: data.filingType,
      county: data.county,
      court: data.court,
      division: data.division || null,
      judge: data.judge || null,
      causeNumber: data.causeNumber || null,
      filingParty: data.filingParty,
      filingCode: data.filingCode || null,
      feeAmount: data.feeAmount ?? 0,
      feeWaived: data.feeWaived ?? false,
      notes: data.notes || null,
      matterId: data.matterId || null,
    },
    include: {
      matter: { select: { id: true, title: true, caseNumber: true } },
    },
  });

  return NextResponse.json(filing, { status: 201 });
}
