import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/validations/invoice";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");

  const invoices = await prisma.invoice.findMany({
    where: status
      ? { status: status as "DRAFT" | "SENT" | "PAID" | "OVERDUE" }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      contact: { select: { id: true, name: true } },
      matter: { select: { id: true, title: true } },
      _count: { select: { lineItems: true } },
    },
  });

  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = invoiceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: data.invoiceNumber,
      status: data.status,
      issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes || null,
      contactId: data.contactId || null,
      matterId: data.matterId || null,
    },
  });

  return NextResponse.json(invoice, { status: 201 });
}
