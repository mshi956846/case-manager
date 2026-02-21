export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { FilingDetail } from "./filing-detail";

export default async function FilingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const filing = await prisma.filing.findUnique({
    where: { id },
    include: {
      matter: { select: { id: true, title: true, caseNumber: true } },
      documents: {
        include: {
          document: { select: { id: true, name: true, documentType: true, content: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
      serviceRecords: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!filing) notFound();

  // Get available documents for the matter (for adding more)
  const availableDocuments = filing.matterId
    ? await prisma.document.findMany({
        where: { matterId: filing.matterId },
        select: { id: true, name: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  // Serialize dates for client component
  const serialized = JSON.parse(JSON.stringify(filing));

  return <FilingDetail filing={serialized} availableDocuments={availableDocuments} />;
}
