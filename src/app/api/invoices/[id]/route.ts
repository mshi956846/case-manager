import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/validations/invoice";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      contact: true,
      matter: { select: { id: true, title: true } },
      lineItems: true,
      timeEntries: true,
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(invoice);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = invoiceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      invoiceNumber: data.invoiceNumber,
      status: data.status,
      issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes || null,
      contactId: data.contactId || null,
      matterId: data.matterId || null,
    },
  });

  return NextResponse.json(invoice);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.invoice.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
