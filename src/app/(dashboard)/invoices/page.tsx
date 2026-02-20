export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { FileText } from "lucide-react";
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
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Invoices</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage client invoices
            </p>
          </div>
        </div>
      </div>
      <InvoicesClient invoices={invoices} />
    </div>
  );
}
