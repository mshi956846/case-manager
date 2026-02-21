import { NextRequest, NextResponse } from "next/server";
import { calculateFilingFee } from "@/lib/filing-fees";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const result = calculateFilingFee({
    filingType: body.filingType || "SUBSEQUENT",
    category: body.category || "criminal",
    feeWaived: body.feeWaived || false,
  });

  return NextResponse.json(result);
}
