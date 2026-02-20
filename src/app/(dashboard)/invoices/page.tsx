export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { InvoicesClient } from "./invoices-client";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      contact: { select: { id: true, name: true } },
      matter: { select: { id: true, title: true } },
      _count: { select: { lineItems: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Invoices</h1>
      <InvoicesClient invoices={invoices} />
    </div>
  );
}
