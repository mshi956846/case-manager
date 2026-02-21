import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const court = searchParams.get("court");
  const county = searchParams.get("county");
  const outcome = searchParams.get("outcome");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const search = searchParams.get("search");
  const offenseCategory = searchParams.get("offenseCategory");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "25", 10), 100);

  const where: Record<string, unknown> = {};
  if (court) where.court = court;
  if (county) where.county = { contains: county, mode: "insensitive" };
  if (outcome) where.outcome = outcome;
  if (offenseCategory) where.offenseCategory = offenseCategory;
  if (from || to) {
    where.dateFiled = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }
  if (search) {
    where.OR = [
      { caseName: { contains: search, mode: "insensitive" } },
      { docketNumber: { contains: search, mode: "insensitive" } },
      { authors: { contains: search, mode: "insensitive" } },
    ];
  }

  const [opinions, total] = await Promise.all([
    prisma.appellateOpinion.findMany({
      where,
      orderBy: { dateFiled: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.appellateOpinion.count({ where }),
  ]);

  return NextResponse.json({
    opinions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
