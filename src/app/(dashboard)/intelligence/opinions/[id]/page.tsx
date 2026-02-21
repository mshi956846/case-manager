export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ArrowLeft,
  ExternalLink,
  FileText,
  Users,
  Scale,
} from "lucide-react";
import {
  APPELLATE_COURT_LABELS,
  APPELLATE_OUTCOME_LABELS,
  APPELLATE_OUTCOME_COLORS,
  OFFENSE_CATEGORY_LABELS,
} from "@/lib/intelligence-constants";
import { AppellateSummary } from "./appellate-summary";

async function getOpinion(id: string) {
  const opinion = await prisma.appellateOpinion.findUnique({
    where: { id },
  });

  if (!opinion) return null;

  const related = await prisma.appellateOpinion.findMany({
    where: {
      id: { not: opinion.id },
      OR: [
        ...(opinion.county ? [{ county: opinion.county }] : []),
        ...(opinion.authors
          ? [
              {
                authors: {
                  contains: opinion.authors.split(",")[0]?.trim() || "",
                },
              },
            ]
          : []),
      ],
    },
    take: 5,
    orderBy: { dateFiled: "desc" },
    select: {
      id: true,
      caseName: true,
      docketNumber: true,
      dateFiled: true,
      outcome: true,
      court: true,
    },
  });

  return { ...opinion, related };
}

export default async function OpinionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const opinion = await getOpinion(id);
  if (!opinion) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/intelligence/opinions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold truncate">{opinion.caseName}</h1>
          <p className="text-sm text-muted-foreground">
            {opinion.docketNumber} &middot;{" "}
            {APPELLATE_COURT_LABELS[opinion.court] || opinion.court}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`text-base px-3 py-1 ${APPELLATE_OUTCOME_COLORS[opinion.outcome] || ""}`}
        >
          {APPELLATE_OUTCOME_LABELS[opinion.outcome] || opinion.outcome}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-4 w-4" /> Opinion Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-muted-foreground">Date Filed</div>
                  <div className="font-medium">
                    {format(new Date(opinion.dateFiled), "MMMM d, yyyy")}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Court</div>
                  <div className="font-medium">
                    {APPELLATE_COURT_LABELS[opinion.court] || opinion.court}
                  </div>
                </div>
                {opinion.county && (
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Originating County
                    </div>
                    <div className="font-medium">{opinion.county} County</div>
                  </div>
                )}
                {opinion.offenseCategory && (
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Offense Category
                    </div>
                    <div className="font-medium">
                      {OFFENSE_CATEGORY_LABELS[opinion.offenseCategory] ||
                        opinion.offenseCategory}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-muted-foreground">
                    Citation Count
                  </div>
                  <div className="font-medium">{opinion.citeCount}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    Docket Number
                  </div>
                  <div className="font-medium">{opinion.docketNumber}</div>
                </div>
              </div>

            </CardContent>
          </Card>

          <AppellateSummary
            courtListenerId={opinion.courtListenerId}
            caseName={opinion.caseName}
          />

          {opinion.pdfUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Opinion PDF
                </CardTitle>
              </CardHeader>
              <CardContent>
                <iframe
                  src={opinion.pdfUrl}
                  className="w-full h-[600px] rounded-md border"
                  title="Opinion PDF"
                />
                <div className="mt-2">
                  <a
                    href={opinion.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Download PDF <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Author(s)
                </div>
                <div className="font-medium">{opinion.authors || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Full Panel
                </div>
                <div className="font-medium">{opinion.panel || "—"}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Source</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={opinion.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                View on CourtListener <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>

          {opinion.related.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Opinions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {opinion.related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/intelligence/opinions/${r.id}`}
                    className="block rounded-md border p-2.5 transition-colors hover:bg-muted/50"
                  >
                    <div className="text-sm font-medium truncate">
                      {r.caseName}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {r.docketNumber}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${APPELLATE_OUTCOME_COLORS[r.outcome] || ""}`}
                      >
                        {APPELLATE_OUTCOME_LABELS[r.outcome] || r.outcome}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
