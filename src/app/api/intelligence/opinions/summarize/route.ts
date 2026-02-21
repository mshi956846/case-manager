import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const { opinionText, caseName } = await req.json();

  if (!opinionText) {
    return NextResponse.json({ error: "No opinion text provided" }, { status: 400 });
  }

  // Truncate to stay within context limits
  const text = opinionText.slice(0, 80000);

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `Read this appellate court opinion and write a concise summary. Include:

1. The law enforcement agency involved (e.g. "Richmond Police Department", "Marion County Sheriff's Office")
2. The officer's name(s) involved
3. A brief factual narrative of what happened — what the officer did, the circumstances of the stop/search/arrest
4. Specifically how the officer erred — what constitutional violation or procedural mistake the court found

Write in a direct, matter-of-fact tone like a practicing attorney would use in a case brief. Keep it to one short paragraph for the facts and one short paragraph for the error. Do not use headers, bullet points, or any formatting. Do not begin with "This case involves" or "In this case." Jump straight into the facts.

Case: ${caseName}

Opinion text:
${text}`,
        },
      ],
    });

    const summary =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ summary });
  } catch (err: any) {
    console.error("Summary generation failed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate summary" },
      { status: 500 }
    );
  }
}
