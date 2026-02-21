import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { filingDocumentSchema } from "@/lib/validations/filing";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: filingId } = await params;
  const body = await req.json();
  const parsed = filingDocumentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const filing = await prisma.filing.findUnique({ where: { id: filingId } });
  if (!filing) {
    return NextResponse.json({ error: "Filing not found" }, { status: 404 });
  }

  const document = await prisma.document.findUnique({
    where: { id: parsed.data.documentId },
  });
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const filingDoc = await prisma.filingDocument.create({
    data: {
      filingId,
      documentId: parsed.data.documentId,
      role: parsed.data.role,
      filingCode: parsed.data.filingCode || null,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
    include: {
      document: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(filingDoc, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: filingId } = await params;
  const { documentId } = await req.json();

  if (!documentId) {
    return NextResponse.json({ error: "documentId is required" }, { status: 400 });
  }

  const existing = await prisma.filingDocument.findUnique({
    where: { filingId_documentId: { filingId, documentId } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.filingDocument.delete({
    where: { filingId_documentId: { filingId, documentId } },
  });

  return NextResponse.json({ success: true });
}
