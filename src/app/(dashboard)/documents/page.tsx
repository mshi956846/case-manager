export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { DocumentsClient } from "./documents-client";

export default async function DocumentsPage() {
  const documents = await prisma.document.findMany({
    orderBy: { updatedAt: "desc" },
    include: { matter: { select: { id: true, title: true, caseNumber: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Documents</h1>
        <p className="text-muted-foreground">
          Draft and manage legal documents
        </p>
      </div>
      <DocumentsClient documents={documents} />
    </div>
  );
}
