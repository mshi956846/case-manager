export const dynamic = "force-dynamic";

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
import {
  Scale,
  Gavel,
  UserCheck,
  FileSearch,
  BarChart3,
  BookOpen,
  ArrowRight,
} from "lucide-react";

async function getIntelligenceData() {
  const [
    totalJudges,
    totalProsecutors,
    totalMotions,
    totalSentences,
    totalOpinions,
    reversalCount,
    topCounties,
    recentMotions,
    recentSentencing,
    allSuppressionMotions,
    allOutcomes,
  ] = await Promise.all([
    prisma.judge.count(),
    prisma.prosecutor.count(),
    prisma.motionOutcome.count(),
    prisma.sentencingRecord.count(),
    prisma.appellateOpinion.count(),
    prisma.appellateOpinion.count({
      where: {
        outcome: { in: ["REVERSED", "REVERSED_AND_REMANDED", "VACATED"] },
      },
    }),
    prisma.judge.groupBy({
      by: ["county"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 8,
    }),
    prisma.motionOutcome.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { judge: { select: { name: true, county: true } } },
    }),
    prisma.sentencingRecord.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { judge: { select: { name: true, county: true } } },
    }),
    prisma.motionOutcome.findMany({
      where: {
        motionType: { in: ["SUPPRESS_EVIDENCE", "SUPPRESS_STATEMENT", "SUPPRESS_IDENTIFICATION"] },
      },
      select: { result: true },
    }),
    prisma.prosecutorCaseOutcome.findMany({
      select: { disposition: true },
    }),
  ]);

  const suppressionGranted = allSuppressionMotions.filter(
    (m) => m.result === "GRANTED" || m.result === "PARTIALLY_GRANTED"
  ).length;
  const overallSuppressionGrantRate =
    allSuppressionMotions.length > 0
      ? Math.round((suppressionGranted / allSuppressionMotions.length) * 100)
      : 0;

  const pleaCount = allOutcomes.filter(
    (o) => o.disposition === "PLEA_AGREEMENT" || o.disposition === "PLEA_OPEN"
  ).length;
  const overallPleaRate =
    allOutcomes.length > 0 ? Math.round((pleaCount / allOutcomes.length) * 100) : 0;

  const overallReversalRate =
    totalOpinions > 0 ? Math.round((reversalCount / totalOpinions) * 100) : 0;

  return {
    totalJudges,
    totalProsecutors,
    totalMotions,
    totalSentences,
    totalOpinions,
    overallReversalRate,
    topCounties: topCounties.map((c) => ({
      county: c.county,
      judgeCount: c._count.id,
    })),
    overallSuppressionGrantRate,
    overallPleaRate,
    recentActivity: [
      ...recentMotions.map((m) => ({
        type: "motion" as const,
        description: `${m.judge.name} — ${m.motionType.replace(/_/g, " ").toLowerCase()} ${m.result.toLowerCase()}`,
        county: m.judge.county,
        date: m.createdAt,
      })),
      ...recentSentencing.map((s) => ({
        type: "sentencing" as const,
        description: `${s.judge.name} — ${s.offenseLevel.replace(/_/g, " ").toLowerCase()} ${s.disposition.replace(/_/g, " ").toLowerCase()}`,
        county: s.judge.county,
        date: s.createdAt,
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 8),
  };
}

export default async function IntelligencePage() {
  const data = await getIntelligenceData();

  const statCards = [
    {
      title: "Judges Tracked",
      value: data.totalJudges,
      icon: Gavel,
      iconColor: "bg-indigo-100 text-indigo-700",
      borderColor: "border-l-indigo-500",
      valueColor: "text-indigo-700",
      href: "/intelligence/judges",
    },
    {
      title: "Prosecutors",
      value: data.totalProsecutors,
      icon: UserCheck,
      iconColor: "bg-violet-100 text-violet-700",
      borderColor: "border-l-violet-500",
      valueColor: "text-violet-700",
      href: "/intelligence/prosecutors",
    },
    {
      title: "Motion Records",
      value: data.totalMotions.toLocaleString(),
      icon: FileSearch,
      iconColor: "bg-amber-100 text-amber-700",
      borderColor: "border-l-amber-500",
      valueColor: "text-amber-700",
    },
    {
      title: "Sentencing Records",
      value: data.totalSentences.toLocaleString(),
      icon: BarChart3,
      iconColor: "bg-emerald-100 text-emerald-700",
      borderColor: "border-l-emerald-500",
      valueColor: "text-emerald-700",
    },
    {
      title: "Appellate Opinions",
      value: data.totalOpinions.toLocaleString(),
      icon: BookOpen,
      iconColor: "bg-rose-100 text-rose-700",
      borderColor: "border-l-rose-500",
      valueColor: "text-rose-700",
      href: "/intelligence/opinions",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
          <Scale className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Court Intelligence</h1>
          <p className="text-sm text-muted-foreground">
            Indiana court analytics & judicial intelligence
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => {
          const content = (
            <Card key={card.title} className={`border-l-4 ${card.borderColor} transition-colors ${card.href ? "hover:bg-muted/50" : ""}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconColor}`}>
                  <card.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${card.valueColor}`}>
                  {card.value}
                </div>
              </CardContent>
            </Card>
          );
          return card.href ? (
            <Link key={card.title} href={card.href}>{content}</Link>
          ) : (
            <div key={card.title}>{content}</div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-t-2 border-t-indigo-500/40">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm font-medium">Suppression Motion Grant Rate</span>
              <Badge
                variant="outline"
                className={
                  data.overallSuppressionGrantRate > 35
                    ? "border-green-200 bg-green-50 text-green-700"
                    : data.overallSuppressionGrantRate > 20
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-red-200 bg-red-50 text-red-700"
                }
              >
                {data.overallSuppressionGrantRate}%
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm font-medium">Overall Plea Rate</span>
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                {data.overallPleaRate}%
              </Badge>
            </div>
            {data.totalOpinions > 0 && (
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm font-medium">Criminal Appeal Reversal Rate</span>
                <Badge
                  variant="outline"
                  className={
                    data.overallReversalRate > 30
                      ? "border-red-200 bg-red-50 text-red-700"
                      : data.overallReversalRate > 15
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-green-200 bg-green-50 text-green-700"
                  }
                >
                  {data.overallReversalRate}%
                </Badge>
              </div>
            )}
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm font-medium">Counties with Data</span>
              <Badge variant="outline">
                {data.topCounties.length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-violet-500/40">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Top Counties by Data
              <Link
                href="/intelligence/search"
                className="group flex items-center gap-1 text-sm font-normal text-muted-foreground hover:text-primary"
              >
                Search
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topCounties.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet. Add judges to get started.</p>
            ) : (
              <div className="space-y-2">
                {data.topCounties.map((county) => (
                  <div
                    key={county.county}
                    className="flex items-center justify-between rounded-md border p-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                      <span className="text-sm font-medium">{county.county} County</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {county.judgeCount} judge{county.judgeCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-amber-500/40 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Activity
              <div className="flex gap-2">
                <Link
                  href="/intelligence/judges"
                  className="group flex items-center gap-1 text-sm font-normal text-muted-foreground hover:text-primary"
                >
                  Judges
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/intelligence/prosecutors"
                  className="group flex items-center gap-1 text-sm font-normal text-muted-foreground hover:text-primary"
                >
                  Prosecutors
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/intelligence/opinions"
                  className="group flex items-center gap-1 text-sm font-normal text-muted-foreground hover:text-primary"
                >
                  Opinions
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No activity yet. Seed data or add records to get started.
              </p>
            ) : (
              <div className="space-y-2">
                {data.recentActivity.map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          activity.type === "motion" ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                      />
                      <div>
                        <div className="text-sm">{activity.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {activity.county} County
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(activity.date), "MMM d, yyyy")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
