import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lineItemSchema } from "@/lib/validations/invoice";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = lineItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const lineItem = await prisma.invoiceLineItem.create({
    data: {
      description: data.description,
      quantity: data.quantity,
      rate: data.rate,
      amount: data.amount,
      invoiceId: id,
      timeEntryId: data.timeEntryId || null,
    },
  });

  // Recalculate totals
  const items = await prisma.invoiceLineItem.findMany({
    where: { invoiceId: id },
  });
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  await prisma.invoice.update({
    where: { id },
    data: { subtotal, total: subtotal },
  });

  return NextResponse.json(lineItem, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { lineItemId } = await req.json();

  await prisma.invoiceLineItem.delete({ where: { id: lineItemId } });

  // Recalculate totals
  const items = await prisma.invoiceLineItem.findMany({
    where: { invoiceId: id },
  });
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  await prisma.invoice.update({
    where: { id },
    data: { subtotal, total: subtotal },
  });

  return NextResponse.json({ success: true });
}
