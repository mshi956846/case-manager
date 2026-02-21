export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  ArrowLeft,
  ExternalLink,
  Scale,
  Users,
  Download,
} from "lucide-react";

import { CaseSummary } from "./case-summary";

const COURTLISTENER_SEARCH = "https://www.courtlistener.com/api/rest/v4/search/";
const COURTLISTENER_API = "https://www.courtlistener.com/api/rest/v4";
const COURTLISTENER_TOKEN = process.env.COURTLISTENER_TOKEN;

function hasToken(): boolean {
  return !!COURTLISTENER_TOKEN && COURTLISTENER_TOKEN !== "your_token_here";
}

function clHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (hasToken()) {
    headers.Authorization = `Token ${COURTLISTENER_TOKEN}`;
  }
  return headers;
}

// Search API result shape (works without auth)
interface SearchResult {
  cluster_id: number;
  caseName: string;
  docketNumber: string;
  dateFiled: string;
  court: string;
  court_id: string;
  judge: string;
  absolute_url: string;
  snippet: string;
  citeCount: number;
  opinions: {
    id: number;
    snippet: string;
    download_url: string | null;
  }[];
}

// REST API opinion shape (requires auth)
interface OpinionData {
  id: number;
  html_with_citations: string;
  plain_text: string;
  download_url: string | null;
  type: string;
}

async function getClusterViaSearch(clusterId: string): Promise<SearchResult | null> {
  const url = new URL(COURTLISTENER_SEARCH);
  url.searchParams.set("type", "o");
  url.searchParams.set("q", `cluster_id:${clusterId}`);

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const data = await res.json();
  return data.results?.[0] || null;
}

async function getOpinionText(clusterId: string): Promise<OpinionData[]> {
  if (!hasToken()) return [];
  const headers = clHeaders();
  try {
    const res = await fetch(
      `${COURTLISTENER_API}/opinions/?cluster=${clusterId}`,
      { headers, next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

function courtLabel(courtId: string): string {
  const map: Record<string, string> = {
    ind: "Indiana Supreme Court",
    indctapp: "Indiana Court of Appeals",
  };
  return map[courtId] || courtId;
}

export default async function CLOpinionDetailPage({
  params,
}: {
  params: Promise<{ clusterId: string }>;
}) {
  const { clusterId } = await params;
  const [searchResult, opinions] = await Promise.all([
    getClusterViaSearch(clusterId),
    getOpinionText(clusterId),
  ]);

  if (!searchResult) notFound();

  // Full opinion text from REST API (if token available)
  const leadOpinion =
    opinions.find((o) => o.html_with_citations || o.plain_text) ||
    opinions[0];
  const opinionHtml = leadOpinion?.html_with_citations || "";
  const opinionText = leadOpinion?.plain_text || "";

  // PDF from REST API opinion or search result
  const pdfUrl =
    leadOpinion?.download_url ||
    searchResult.opinions?.[0]?.download_url ||
    null;

  const sourceUrl = `https://www.courtlistener.com${searchResult.absolute_url}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/intelligence/opinions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-700">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold truncate">
            {searchResult.caseName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {searchResult.docketNumber && (
              <>{searchResult.docketNumber} &middot; </>
            )}
            {courtLabel(searchResult.court_id)}
          </p>
        </div>
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
                  <div className="text-xs text-muted-foreground">
                    Date Filed
                  </div>
                  <div className="font-medium">
                    {searchResult.dateFiled
                      ? format(
                          new Date(searchResult.dateFiled),
                          "MMMM d, yyyy"
                        )
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Court</div>
                  <div className="font-medium">
                    {courtLabel(searchResult.court_id)}
                  </div>
                </div>
                {searchResult.docketNumber && (
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Docket Number
                    </div>
                    <div className="font-medium">
                      {searchResult.docketNumber}
                    </div>
                  </div>
                )}
                {searchResult.judge && (
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Judge(s)
                    </div>
                    <div className="font-medium">{searchResult.judge}</div>
                  </div>
                )}
                {searchResult.citeCount > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Citation Count
                    </div>
                    <div className="font-medium">{searchResult.citeCount}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <CaseSummary
            opinionText={opinionText || opinionHtml.replace(/<[^>]*>/g, " ")}
            caseName={searchResult.caseName}
            pdfUrl={pdfUrl}
          />

          {clusterId === "10794478" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Motion Practice</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <a href="/docs/sample-motions/motion-to-suppress.pdf" download>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Motion to Suppress
                  </Button>
                </a>
                <a href="/docs/sample-motions/states-response.pdf" download>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    State&apos;s Response
                  </Button>
                </a>
                <a href="/docs/sample-motions/ruling.pdf" download>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Ruling
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}

        </div>

        <div className="space-y-6">
          {searchResult.judge && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> Judge(s)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-medium">{searchResult.judge}</div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Source</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                View on CourtListener <ExternalLink className="h-3 w-3" />
              </a>
              {pdfUrl && (
                <div>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Download PDF <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
