export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Scale,
  BookOpen,
  ArrowRight,
} from "lucide-react";

async function getIntelligenceData() {
  const [totalOpinions, reversalCount] = await Promise.all([
    prisma.appellateOpinion.count(),
    prisma.appellateOpinion.count({
      where: {
        outcome: { in: ["REVERSED", "REVERSED_AND_REMANDED", "VACATED"] },
      },
    }),
  ]);

  const overallReversalRate =
    totalOpinions > 0 ? Math.round((reversalCount / totalOpinions) * 100) : 0;

  return { totalOpinions, overallReversalRate };
}

export default async function IntelligencePage() {
  const data = await getIntelligenceData();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
          <Scale className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Indiana Criminal Appellate Opinions</h1>
          <p className="text-sm text-muted-foreground">
            Indiana court analytics & judicial intelligence
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/intelligence/opinions">
          <Card className="border-l-4 border-l-rose-500 transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Appellate Opinions
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                <BookOpen className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-700">
                {data.totalOpinions.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Criminal Appeal Reversal Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant="outline"
              className={
                data.overallReversalRate > 30
                  ? "border-red-200 bg-red-50 text-red-700 text-lg px-3 py-1"
                  : data.overallReversalRate > 15
                    ? "border-amber-200 bg-amber-50 text-amber-700 text-lg px-3 py-1"
                    : "border-green-200 bg-green-50 text-green-700 text-lg px-3 py-1"
              }
            >
              {data.overallReversalRate}%
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="border-t-2 border-t-rose-500/40">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Appellate Decisions
            <Link
              href="/intelligence/opinions"
              className="group flex items-center gap-1 text-sm font-normal text-muted-foreground hover:text-primary"
            >
              View All
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Browse and search Indiana appellate opinions with case summaries and police error analysis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
