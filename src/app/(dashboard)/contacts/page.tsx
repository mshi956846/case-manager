export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import { ContactsClient } from "./contacts-client";

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { matters: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Contacts</h1>
            <p className="text-sm text-muted-foreground">
              Clients, opposing parties, and other contacts
            </p>
          </div>
        </div>
      </div>
      <ContactsClient contacts={contacts} />
    </div>
  );
}
