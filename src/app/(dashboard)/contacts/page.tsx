export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ContactsClient } from "./contacts-client";

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { matters: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Contacts</h1>
      <ContactsClient contacts={contacts} />
    </div>
  );
}
