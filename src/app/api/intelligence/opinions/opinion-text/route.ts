import { NextRequest, NextResponse } from "next/server";

const COURTLISTENER_API = "https://www.courtlistener.com/api/rest/v4";
const COURTLISTENER_TOKEN = process.env.COURTLISTENER_TOKEN;

function hasToken(): boolean {
  return !!COURTLISTENER_TOKEN && COURTLISTENER_TOKEN !== "your_token_here";
}

export async function GET(req: NextRequest) {
  const courtListenerId = req.nextUrl.searchParams.get("courtListenerId");

  if (!courtListenerId) {
    return NextResponse.json(
      { error: "courtListenerId is required" },
      { status: 400 }
    );
  }

  if (!hasToken()) {
    return NextResponse.json(
      { error: "CourtListener API token not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `${COURTLISTENER_API}/opinions/?cluster=${courtListenerId}`,
      {
        headers: { Authorization: `Token ${COURTLISTENER_TOKEN}` },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from CourtListener" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const opinions = data.results || [];
    const lead = opinions.find(
      (o: any) => o.plain_text || o.html_with_citations
    ) || opinions[0];

    if (!lead) {
      return NextResponse.json(
        { error: "No opinion text found" },
        { status: 404 }
      );
    }

    const text =
      lead.plain_text ||
      (lead.html_with_citations
        ? lead.html_with_citations.replace(/<[^>]*>/g, " ")
        : "");

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("Failed to fetch opinion text:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch opinion text" },
      { status: 500 }
    );
  }
}
