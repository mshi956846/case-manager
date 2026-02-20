import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateDocumentSchema } from "@/lib/validations/document";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
    include: { matter: { select: { id: true, title: true, caseNumber: true } } },
  });

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(document);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = updateDocumentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const existing = await prisma.document.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.content !== undefined) data.content = parsed.data.content;
  if (parsed.data.matterId !== undefined) {
    data.matterId = parsed.data.matterId || null;
  }

  const document = await prisma.document.update({
    where: { id },
    data,
    include: { matter: { select: { id: true, title: true, caseNumber: true } } },
  });

  return NextResponse.json(document);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await prisma.document.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
