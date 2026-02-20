export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { FileEdit } from "lucide-react";
import { DocumentsClient } from "./documents-client";

export default async function DocumentsPage() {
  const documents = await prisma.document.findMany({
    orderBy: { updatedAt: "desc" },
    include: { matter: { select: { id: true, title: true, caseNumber: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <FileEdit className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Documents</h1>
            <p className="text-sm text-muted-foreground">
              Draft and manage legal documents
            </p>
          </div>
        </div>
      </div>
      <DocumentsClient documents={documents} />
    </div>
  );
}
