import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { documentWizardSchema } from "@/lib/validations/document-wizard";
import { buildDocumentFromWizard } from "@/lib/document-templates";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = documentWizardSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, content } = buildDocumentFromWizard(parsed.data);

  const document = await prisma.document.create({
    data: {
      name,
      documentType: "WORD_PROCESSOR",
      content: content as unknown as Prisma.InputJsonValue,
      matterId: parsed.data.matterId || null,
    },
    include: { matter: { select: { id: true, title: true, caseNumber: true } } },
  });

  return NextResponse.json({ id: document.id, name: document.name }, { status: 201 });
}
