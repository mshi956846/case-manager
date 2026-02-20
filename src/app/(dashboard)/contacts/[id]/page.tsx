export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, MapPin, Building } from "lucide-react";

const typeLabels: Record<string, string> = {
  CLIENT: "Client",
  OPPOSING_PARTY: "Opposing Party",
  WITNESS: "Witness",
  JUDGE: "Judge",
  OTHER: "Other",
};

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      matters: { include: { matter: true } },
      invoices: true,
    },
  });

  if (!contact) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/contacts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{contact.name}</h1>
          <Badge variant="secondary">{typeLabels[contact.type]}</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contact.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {contact.email}
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {contact.phone}
              </div>
            )}
            {contact.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {contact.address}
              </div>
            )}
            {contact.company && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                {contact.company}
              </div>
            )}
            {contact.notes && (
              <div className="pt-2 text-sm text-muted-foreground">
                {contact.notes}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related Matters</CardTitle>
          </CardHeader>
          <CardContent>
            {contact.matters.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matters linked.</p>
            ) : (
              <div className="space-y-2">
                {contact.matters.map((mc) => (
                  <Link
                    key={mc.id}
                    href={`/matters/${mc.matter.id}`}
                    className="block rounded-md border p-3 text-sm hover:bg-muted transition-colors"
                  >
                    <div className="font-medium">{mc.matter.title}</div>
                    <div className="text-muted-foreground">
                      {mc.matter.caseNumber && `#${mc.matter.caseNumber} - `}
                      {mc.matter.status}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
