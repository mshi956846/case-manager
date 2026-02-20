import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addContactSchema = z.object({
  contactId: z.string().min(1),
  role: z.enum(["CLIENT", "OPPOSING_PARTY", "WITNESS", "JUDGE", "EXPERT", "OTHER"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = addContactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const mc = await prisma.matterContact.create({
    data: {
      matterId: id,
      contactId: parsed.data.contactId,
      role: parsed.data.role,
    },
  });

  return NextResponse.json(mc, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { contactId } = await req.json();

  await prisma.matterContact.deleteMany({
    where: { matterId: id, contactId },
  });

  return NextResponse.json({ success: true });
}
