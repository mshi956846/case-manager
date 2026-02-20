export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentPreview } from "./document-preview";

export default async function DocumentDetailPage({
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/documents">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{document.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {document.matter && (
                <Link href={`/matters/${document.matter.id}`}>
                  <Badge variant="outline" className="hover:bg-accent cursor-pointer">
                    {document.matter.title}
                  </Badge>
                </Link>
              )}
              <span className="text-sm text-muted-foreground">
                Last modified {format(new Date(document.updatedAt), "MMM d, yyyy h:mm a")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href={`/documents/${document.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <DocumentPreview
            content={document.content as Record<string, unknown> | null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
