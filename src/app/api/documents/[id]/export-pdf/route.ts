import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tiptapToPdf } from "@/lib/tiptap-to-pdf";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const document = await prisma.document.findUnique({ where: { id } });

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!document.content) {
    return NextResponse.json({ error: "Document has no content" }, { status: 400 });
  }

  try {
    const buffer = await tiptapToPdf(document.content as Record<string, unknown>, document.name);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(document.name)}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF export error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: String(err) },
      { status: 500 }
    );
  }
}
