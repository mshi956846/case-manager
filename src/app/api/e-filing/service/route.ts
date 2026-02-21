import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serviceRecordSchema } from "@/lib/validations/filing";

export async function GET(req: NextRequest) {
  const filingId = req.nextUrl.searchParams.get("filingId");

  if (!filingId) {
    return NextResponse.json({ error: "filingId is required" }, { status: 400 });
  }

  const records = await prisma.serviceRecord.findMany({
    where: { filingId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = serviceRecordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const filing = await prisma.filing.findUnique({
    where: { id: parsed.data.filingId },
  });
  if (!filing) {
    return NextResponse.json({ error: "Filing not found" }, { status: 404 });
  }

  const record = await prisma.serviceRecord.create({
    data: {
      filingId: parsed.data.filingId,
      method: parsed.data.method,
      partyName: parsed.data.partyName,
      partyEmail: parsed.data.partyEmail || null,
      partyAddress: parsed.data.partyAddress || null,
      partyRole: parsed.data.partyRole || null,
      serviceDate: parsed.data.serviceDate ? new Date(parsed.data.serviceDate) : null,
    },
  });

  return NextResponse.json(record, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...rest } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const existing = await prisma.serviceRecord.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (rest.method !== undefined) data.method = rest.method;
  if (rest.status !== undefined) data.status = rest.status;
  if (rest.partyName !== undefined) data.partyName = rest.partyName;
  if (rest.partyEmail !== undefined) data.partyEmail = rest.partyEmail || null;
  if (rest.partyAddress !== undefined) data.partyAddress = rest.partyAddress || null;
  if (rest.partyRole !== undefined) data.partyRole = rest.partyRole || null;
  if (rest.serviceDate !== undefined) data.serviceDate = rest.serviceDate ? new Date(rest.serviceDate) : null;

  const record = await prisma.serviceRecord.update({
    where: { id },
    data,
  });

  return NextResponse.json(record);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const existing = await prisma.serviceRecord.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.serviceRecord.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
