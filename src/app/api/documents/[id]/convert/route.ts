import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { existsSync } from "fs";
import { Prisma } from "@prisma/client";
import { pdfToTiptap } from "@/lib/pdf-to-tiptap";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
    include: { matter: { select: { id: true, title: true } } },
  });

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (document.documentType !== "UPLOADED") {
    return NextResponse.json(
      { error: "Only uploaded documents can be converted" },
      { status: 400 }
    );
  }

  if (!document.filePath || !existsSync(document.filePath)) {
    return NextResponse.json(
      { error: "Source file not found on disk" },
      { status: 404 }
    );
  }

  const isPdf = document.mimeType === "application/pdf" || document.filePath.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return NextResponse.json(
      { error: "Only PDF files can be converted at this time" },
      { status: 400 }
    );
  }

  try {
    // Extract text from PDF and create TipTap JSON
    const tiptapContent = await pdfToTiptap(document.filePath);

    // Create a new WORD_PROCESSOR document with the extracted content
    const baseName = document.name.replace(/\.pdf$/i, "");
    const newDoc = await prisma.document.create({
      data: {
        name: `${baseName} (Editable)`,
        documentType: "WORD_PROCESSOR",
        content: tiptapContent as unknown as Prisma.InputJsonValue,
        matterId: document.matterId,
      },
    });

    return NextResponse.json({
      id: newDoc.id,
      name: newDoc.name,
      message: "Document converted successfully",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("PDF conversion error:", message, err);
    return NextResponse.json(
      { error: `Failed to convert PDF: ${message}` },
      { status: 500 }
    );
  }
}
