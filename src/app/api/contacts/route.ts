import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations/contact";

export async function GET() {
  const contacts = await prisma.contact.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { matters: true } } },
  });
  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const contact = await prisma.contact.create({
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      type: data.type,
      company: data.company || null,
      notes: data.notes || null,
    },
  });

  return NextResponse.json(contact, { status: 201 });
}
