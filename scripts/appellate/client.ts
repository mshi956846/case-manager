import {
  COURTLISTENER_API_BASE,
  COURTLISTENER_TOKEN,
  REQUEST_DELAY_MS,
} from "./config";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface SearchParams {
  court?: string;
  q?: string;
  filed_after?: string;
  filed_before?: string;
  order_by?: string;
  cursor?: string;
}

export interface CourtListenerResult {
  id: number;
  caseName: string;
  docketNumber: string;
  dateFiled: string;
  court_id: string;
  judge: string;
  status: string;
  absolute_url: string;
  snippet: string;
  opinions: {
    download_url: string | null;
    snippet: string;
  }[];
  citation_count?: number;
}

interface SearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CourtListenerResult[];
}

async function fetchWithRetry(
  url: string,
  retries = 3,
  backoff = 2000
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Token ${COURTLISTENER_TOKEN}`,
      },
    });

    if (response.ok) return response;

    if (response.status === 429 || response.status >= 500) {
      if (attempt < retries) {
        const delay = backoff * Math.pow(2, attempt);
        console.warn(
          `  Request failed (${response.status}), retrying in ${delay}ms...`
        );
        await sleep(delay);
        continue;
      }
    }

    throw new Error(
      `CourtListener API error: ${response.status} ${response.statusText}`
    );
  }

  throw new Error("Max retries exceeded");
}

export async function searchOpinions(
  params: SearchParams
): Promise<SearchResponse> {
  if (!COURTLISTENER_TOKEN || COURTLISTENER_TOKEN === "your_token_here") {
    throw new Error(
      "COURTLISTENER_TOKEN not set. Get a free token at https://www.courtlistener.com/sign-in/"
    );
  }

  const url = new URL(`${COURTLISTENER_API_BASE}/search/`);
  url.searchParams.set("type", "o");

  if (params.court) url.searchParams.set("court", params.court);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.filed_after)
    url.searchParams.set("filed_after", params.filed_after);
  if (params.filed_before)
    url.searchParams.set("filed_before", params.filed_before);
  if (params.order_by) url.searchParams.set("order_by", params.order_by);
  if (params.cursor) url.searchParams.set("cursor", params.cursor);

  await sleep(REQUEST_DELAY_MS);
  const response = await fetchWithRetry(url.toString());
  return response.json();
}

export async function fetchAllPages(
  params: SearchParams,
  maxPages: number
): Promise<CourtListenerResult[]> {
  const allResults: CourtListenerResult[] = [];
  let page = 0;
  let nextCursor: string | undefined;

  while (page < maxPages) {
    const searchParams = { ...params };
    if (nextCursor) searchParams.cursor = nextCursor;

    console.log(`  Fetching page ${page + 1}...`);
    const response = await searchOpinions(searchParams);
    allResults.push(...response.results);

    if (!response.next) break;

    // Extract cursor from next URL
    const nextUrl = new URL(response.next);
    nextCursor = nextUrl.searchParams.get("cursor") || undefined;
    if (!nextCursor) break;

    page++;
  }

  return allResults;
}
