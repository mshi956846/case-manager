import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tiptapToDocx } from "@/lib/tiptap-to-docx";

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

  const buffer = await tiptapToDocx(document.content as Record<string, unknown>, document.name);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(document.name)}.docx"`,
    },
  });
}
