export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditorLoader } from "./editor-loader";

export default async function DocumentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
    include: { matter: { select: { id: true, title: true, caseNumber: true } } },
  });

  if (!document || document.documentType !== "WORD_PROCESSOR") {
    notFound();
  }

  return (
    <EditorLoader
      document={{
        id: document.id,
        name: document.name,
        content: document.content as Record<string, unknown> | null,
        matter: document.matter,
      }}
    />
  );
}
