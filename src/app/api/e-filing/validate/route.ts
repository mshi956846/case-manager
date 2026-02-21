import { NextRequest, NextResponse } from "next/server";
import { validateDocument } from "@/lib/filing-validation";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.content) {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 }
    );
  }

  const result = validateDocument(body.content);
  return NextResponse.json(result);
}
