import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COURTLISTENER_API = "https://www.courtlistener.com/api/rest/v4/search/";
const COURTLISTENER_TOKEN = process.env.COURTLISTENER_TOKEN;

function sanitizeInput(input: string): string {
  return input.replace(/["\\\\/]/g, "").trim();
}

function buildAgencyQuery(agencyType: string, agencyName?: string): string {
  const name = agencyName ? sanitizeInput(agencyName) : "";
  switch (agencyType) {
    case "city_pd":
      return `("${name} Police" OR "${name} Police Department")`;
    case "sheriff":
      return `("${name} County Sheriff" OR "${name} County Sheriff's")`;
    case "state_police":
      return `("Indiana State Police" OR "State Police")`;
    case "town_marshal":
      return `("${name}" AND ("town marshal" OR "marshal"))`;
    case "excise_police":
      return `("excise police" OR "alcohol and tobacco commission")`;
    case "conservation":
      return `("conservation officer" OR "DNR officer" OR "Department of Natural Resources")`;
    default:
      return "";
  }
}

// Search queries targeting police error reversals
const POLICE_ERROR_QUERIES = [
  '"Fourth Amendment" suppress',
  '"search and seizure" reversed',
  '"Miranda" suppress reversed',
  '"probable cause" reversed',
  '"unlawful stop" OR "illegal stop" reversed',
  '"warrantless search" reversed',
  '"consent to search" reversed',
  '"excessive force" reversed',
  '"motion to suppress" granted reversed',
  '"Terry stop" reversed',
  '"Fifth Amendment" suppress',
  '"unreasonable search"',
  '"fruit of the poisonous tree"',
  '"exclusionary rule"',
];

interface CLResult {
  cluster_id: number;
  caseName: string;
  docketNumber: string;
  dateFiled: string;
  court_id: string;
  court: string;
  judge: string;
  absolute_url: string;
  snippet: string;
  citeCount: number;
  opinions: { download_url: string | null; snippet: string }[];
}

async function searchCourtListener(query: string, page = 1): Promise<{
  count: number;
  results: CLResult[];
}> {
  const url = new URL(COURTLISTENER_API);
  url.searchParams.set("type", "o");
  url.searchParams.append("court", "ind");
  url.searchParams.append("court", "indctapp");
  url.searchParams.set("q", query);
  url.searchParams.set("order_by", "dateFiled desc");

  const headers: Record<string, string> = {};
  if (COURTLISTENER_TOKEN && COURTLISTENER_TOKEN !== "your_token_here") {
    headers.Authorization = `Token ${COURTLISTENER_TOKEN}`;
  }

  const res = await fetch(url.toString(), { headers, next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`CourtListener error: ${res.status}`);
  return res.json();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const qi = searchParams.get("qi") || "0";
  const county = searchParams.get("county");
  const agencyType = searchParams.get("agencyType");
  const agencyName = searchParams.get("agencyName") || undefined;

  // Build agency query fragment if specified
  const agencyFragment = agencyType ? buildAgencyQuery(agencyType, agencyName) : "";

  try {
    let criminal: CLResult[];
    let totalCount: number;
    let activeQuery: string;

    if (agencyFragment && qi === "all") {
      // Agency + All Topics: just search the agency fragment alone (1 API call)
      const data = await searchCourtListener(agencyFragment);
      totalCount = data.count;
      criminal = data.results.filter((r) => /\bCR\b/i.test(r.docketNumber));
      activeQuery = "All Topics";
    } else if (agencyFragment) {
      // Agency + specific topic: combine them
      const queryIndex = parseInt(qi, 10);
      const topicQuery = POLICE_ERROR_QUERIES[queryIndex] || POLICE_ERROR_QUERIES[0];
      const combinedQuery = `${agencyFragment} AND (${topicQuery})`;
      const data = await searchCourtListener(combinedQuery);
      totalCount = data.count;
      criminal = data.results.filter((r) => /\bCR\b/i.test(r.docketNumber));
      activeQuery = topicQuery;
    } else if (qi === "all") {
      // No agency, all topics: existing behavior
      const allData = await Promise.all(
        POLICE_ERROR_QUERIES.map((q) => searchCourtListener(q))
      );
      const seen = new Set<number>();
      criminal = [];
      totalCount = 0;
      for (const data of allData) {
        totalCount += data.count;
        for (const r of data.results) {
          if (/\bCR\b/i.test(r.docketNumber) && !seen.has(r.cluster_id)) {
            seen.add(r.cluster_id);
            criminal.push(r);
          }
        }
      }
      // Sort combined results by date descending
      criminal.sort((a, b) => new Date(b.dateFiled).getTime() - new Date(a.dateFiled).getTime());
      activeQuery = "All Topics";
    } else {
      // No agency, specific topic: existing behavior
      const queryIndex = parseInt(qi, 10);
      activeQuery = POLICE_ERROR_QUERIES[queryIndex] || POLICE_ERROR_QUERIES[0];
      const data = await searchCourtListener(activeQuery);
      totalCount = data.count;
      criminal = data.results.filter((r) =>
        /\bCR\b/i.test(r.docketNumber)
      );
    }

    // Cross-reference with our DB for local data (outcome, etc.)
    const docketNumbers = criminal.map((r) => r.docketNumber);
    const localOpinions = await prisma.appellateOpinion.findMany({
      where: { docketNumber: { in: docketNumbers } },
      select: { docketNumber: true, outcome: true, county: true, offenseCategory: true, id: true },
    });
    const localMap = new Map(localOpinions.map((o) => [o.docketNumber, o]));

    // Build enriched results
    let results = criminal.map((r) => {
      const local = localMap.get(r.docketNumber);
      const opinionSnippet = r.opinions?.[0]?.snippet || "";
      // Clean up snippet — strip excessive whitespace
      const cleanSnippet = opinionSnippet.replace(/\s+/g, " ").trim();

      return {
        id: local?.id || null,
        clusterId: r.cluster_id,
        caseName: r.caseName,
        docketNumber: r.docketNumber,
        dateFiled: r.dateFiled,
        court: r.court,
        courtId: r.court_id,
        judge: r.judge,
        outcome: local?.outcome || null,
        county: local?.county || null,
        offenseCategory: local?.offenseCategory || null,
        snippet: cleanSnippet,
        pdfUrl: r.opinions?.[0]?.download_url || null,
        sourceUrl: `https://www.courtlistener.com${r.absolute_url}`,
        citeCount: r.citeCount || 0,
      };
    });

    // Optionally filter by county
    if (county) {
      results = results.filter(
        (r) => r.county?.toLowerCase() === county.toLowerCase()
      );
    }

    return NextResponse.json({
      results,
      total: totalCount,
      query: activeQuery,
      queries: POLICE_ERROR_QUERIES,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, results: [], total: 0 },
      { status: 502 }
    );
  }
}
