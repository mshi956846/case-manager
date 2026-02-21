export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { OpinionsClient } from "./opinions-client";

async function getOpinionsData() {
  const [opinions, total, reversalCount, courtCounts, topAuthors] =
    await Promise.all([
      prisma.appellateOpinion.findMany({
        orderBy: { dateFiled: "desc" },
        take: 100,
      }),
      prisma.appellateOpinion.count(),
      prisma.appellateOpinion.count({
        where: {
          outcome: {
            in: ["REVERSED", "REVERSED_AND_REMANDED", "VACATED"],
          },
        },
      }),
      prisma.appellateOpinion.groupBy({
        by: ["court"],
        _count: { id: true },
      }),
      prisma.$queryRaw<{ authors: string; count: bigint }[]>`
        SELECT authors, COUNT(*) as count
        FROM "AppellateOpinion"
        WHERE authors != ''
        GROUP BY authors
        ORDER BY count DESC
        LIMIT 5
      `,
    ]);

  const reversalRate = total > 0 ? Math.round((reversalCount / total) * 100) : 0;

  const counties = [
    ...new Set(opinions.map((o) => o.county).filter(Boolean) as string[]),
  ].sort();

  return {
    opinions,
    total,
    reversalRate,
    courtCounts: courtCounts.map((c) => ({
      court: c.court,
      count: c._count.id,
    })),
    topAuthors: topAuthors.map((a) => ({
      name: a.authors,
      count: Number(a.count),
    })),
    counties,
  };
}

export default async function OpinionsPage() {
  const data = await getOpinionsData();
  return <OpinionsClient data={data} />;
}
