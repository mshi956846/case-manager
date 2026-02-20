import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDocumentSchema } from "@/lib/validations/document";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const documents = await prisma.document.findMany({
    where: type === "WORD_PROCESSOR" ? { documentType: "WORD_PROCESSOR" } : undefined,
    orderBy: { updatedAt: "desc" },
    include: { matter: { select: { id: true, title: true, caseNumber: true } } },
  });

  return NextResponse.json(documents);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createDocumentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, matterId } = parsed.data;

  const document = await prisma.document.create({
    data: {
      name,
      documentType: "WORD_PROCESSOR",
      content: { type: "doc", content: [{ type: "paragraph" }] },
      matterId: matterId || null,
    },
    include: { matter: { select: { id: true, title: true, caseNumber: true } } },
  });

  return NextResponse.json(document, { status: 201 });
}
