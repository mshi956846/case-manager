import { readFile } from "fs/promises";
import { extractText } from "unpdf";

interface TipTapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

// Column width for left side of caption (before the parenthesis)
const CAPTION_COL = 36;

interface CaptionData {
  state: string;
  county: string;
  court: string;
  division: string;
  causeNumber: string;
  ss: boolean;
  parties: { name: string; role: string }[];
}

/**
 * Extract text from a PDF file and convert it into TipTap-compatible JSON
 * with standard Indiana pleading formatting.
 */
export async function pdfToTiptap(filePath: string): Promise<TipTapNode> {
  const buffer = await readFile(filePath);
  const result = await extractText(new Uint8Array(buffer));

  const pages = result.text as string[];
  const allLines: string[] = [];

  for (const pageText of pages) {
    for (const line of pageText.split(/\n/)) {
      allLines.push(line);
    }
  }

  // Separate caption lines from body lines
  const { captionData, bodyStartIndex } = parseCaption(allLines);
  const content: TipTapNode[] = [];

  // Build formatted caption as a single code block (preserves whitespace alignment)
  if (captionData) {
    content.push(buildCaptionCodeBlock(captionData));
    // Blank line after caption
    content.push({ type: "paragraph" });
  }

  // Process body text (after caption)
  let currentParagraph = "";
  const bodyLines = allLines.slice(bodyStartIndex);

  for (const line of bodyLines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (currentParagraph.trim()) {
        content.push(makeParagraph(currentParagraph.trim()));
        currentParagraph = "";
      }
      continue;
    }

    // Skip filing stamps and court clerk lines
    if (/^Filed:/i.test(trimmed)) continue;
    if (/^Clerk$/i.test(trimmed)) continue;
    if (/County,\s*Indiana$/i.test(trimmed)) continue;

    // Detect headings
    if (isLikelyHeading(trimmed)) {
      if (currentParagraph.trim()) {
        content.push(makeParagraph(currentParagraph.trim()));
        currentParagraph = "";
      }
      content.push(makeHeading(trimmed));
      continue;
    }

    // Detect signature lines
    if (/^\/s\//.test(trimmed) || /^_{5,}/.test(trimmed)) {
      if (currentParagraph.trim()) {
        content.push(makeParagraph(currentParagraph.trim()));
        currentParagraph = "";
      }
      content.push(makeParagraph(trimmed));
      continue;
    }

    // Strip line numbers from left margin
    const stripped = trimmed.replace(/^\d{1,2}\s{2,}/, "");

    if (currentParagraph) {
      currentParagraph += " " + stripped;
    } else {
      currentParagraph = stripped;
    }
  }

  if (currentParagraph.trim()) {
    content.push(makeParagraph(currentParagraph.trim()));
  }

  if (content.length === 0) {
    content.push({ type: "paragraph" });
  }

  return { type: "doc", content };
}

/**
 * Strip ) characters and surrounding whitespace from a line.
 */
function stripParens(s: string): string {
  return s.replace(/\)/g, "").trim();
}

/**
 * Check if a line is a standalone paren or empty caption connector.
 */
function isEmptyParenLine(line: string): boolean {
  const s = line.trim();
  return s === ")" || s === "" || s === "vvvvvv";
}

/**
 * Parse caption data from the first lines of the document.
 */
function parseCaption(lines: string[]): {
  captionData: CaptionData | null;
  bodyStartIndex: number;
} {
  const caption: CaptionData = {
    state: "INDIANA",
    county: "",
    court: "",
    division: "",
    causeNumber: "",
    ss: false,
    parties: [],
  };

  let i = 0;

  // Skip filing stamp / clerk lines at top
  while (
    i < lines.length &&
    /^(Filed:|Clerk$|Page \d)/i.test(lines[i].trim())
  ) {
    i++;
  }
  while (i < lines.length && !lines[i].trim()) i++;

  // Skip county/court header stamps (e.g. "Marion County, Indiana", "Whitley Superior Court")
  while (
    i < lines.length &&
    (/County,\s*Indiana/i.test(lines[i].trim()) ||
      /^\w+\s+(Superior|Circuit|Supreme)\s+Court/i.test(lines[i].trim()))
  ) {
    i++;
  }
  while (i < lines.length && !lines[i].trim()) i++;

  // Find "STATE OF" to start caption
  const searchLimit = Math.min(i + 15, lines.length);
  let foundCaption = false;
  for (; i < searchLimit; i++) {
    const line = lines[i].trim();
    if (/^STATE OF/i.test(line)) {
      foundCaption = true;
      break;
    }
    if (line.length > 0 && !isEmptyParenLine(line)) {
      // Non-empty, non-caption line means no standard caption
      break;
    }
  }

  if (!foundCaption) {
    return { captionData: null, bodyStartIndex: 0 };
  }

  // === Parse header block: STATE OF / SS / COUNTY OF / CAUSE NO ===

  // Collect header lines (STATE/COUNTY/SS/CAUSE NO block only)
  const headerLines: string[] = [];
  const headerStart = i;
  let sawCounty = false;

  while (i < lines.length && i < headerStart + 10) {
    const line = lines[i].trim();
    const clean = stripParens(line);

    // Stop at party roles or document titles
    if (
      /^(Plaintiffs?|Defendants?|Respondents?|Petitioners?|Appellees?|Appellants?)[s,.\s]*$/i.test(clean) ||
      isDocumentTitle(clean)
    ) {
      break;
    }

    // Stop at "v." or "vs."
    if (/^v[s]?\.?\s*$/i.test(clean)) {
      break;
    }

    // A second "STATE OF" (after the first) indicates party section
    if (headerLines.length > 0 && /^STATE OF/i.test(clean) && sawCounty) {
      break;
    }

    // Track if we've seen COUNTY OF
    if (/^COUNTY OF/i.test(clean)) {
      sawCounty = true;
    }

    // After seeing both STATE and COUNTY + CAUSE, any non-header line is a party
    if (sawCounty && clean && !/^(COUNTY|STATE|CAUSE|SS|IN THE|\))/i.test(clean) &&
        !/SUPERIOR COURT|CIRCUIT COURT|SUPREME COURT/i.test(clean)) {
      break;
    }

    headerLines.push(line);
    i++;
  }

  // Parse structured info from header lines
  for (const hl of headerLines) {
    const clean = stripParens(hl);
    if (!clean) continue;

    // STATE OF [STATE] ... IN THE [COURT]
    const stateCourtMatch = clean.match(
      /^STATE OF\s+(\w+)\s+IN THE\s+(.+)/i
    );
    if (stateCourtMatch) {
      caption.state = stateCourtMatch[1].toUpperCase();
      caption.court = stateCourtMatch[2].trim();
      continue;
    }

    // STATE OF [STATE] (without court, e.g. "STATE OF INDIANA IN THE MARION COUNTY")
    const stateOnly = clean.match(/^STATE OF\s+(\w+)\s*(.*)/i);
    if (stateOnly && !caption.court) {
      caption.state = stateOnly[1].toUpperCase();
      const rest = stateOnly[2].trim();
      if (/IN THE/i.test(rest)) {
        caption.court = rest.replace(/^IN THE\s*/i, "").trim();
      } else if (rest) {
        caption.court = rest;
      }
      continue;
    }

    // SS line
    if (/SS:?/i.test(clean) && clean.length < 50) {
      caption.ss = true;
      const divMatch = clean.match(/SS:?\s*(.*)/i);
      if (divMatch && divMatch[1].trim()) {
        caption.division = divMatch[1].trim();
      }
      continue;
    }

    // COUNTY OF [COUNTY] ... CAUSE NO
    if (/^COUNTY OF/i.test(clean)) {
      // Extract county name - may be followed by CAUSE NO
      const countyFull = clean.match(
        /^COUNTY OF\s+(\w+)\s*(.*)/i
      );
      if (countyFull) {
        caption.county = countyFull[1].toUpperCase();
        const rest = countyFull[2].trim();
        if (/CAUSE\s*NO/i.test(rest)) {
          const cn = rest.match(/CAUSE\s*NO\.?:?\s*(.*)/i);
          if (cn) caption.causeNumber = cn[1].trim();
        } else if (/SS/i.test(rest)) {
          caption.ss = true;
          const dm = rest.match(/SS:?\s*(.*)/i);
          if (dm) caption.division = dm[1].trim();
        }
      }
      continue;
    }

    // Standalone CAUSE NO line
    if (/CAUSE\s*NO/i.test(clean)) {
      const cn = clean.match(/CAUSE\s*NO\.?:?\s*(.*)/i);
      if (cn) caption.causeNumber = cn[1].trim();
      continue;
    }

    // Court name on continuation line (e.g. "SUPERIOR COURT NO. 07")
    if (/SUPERIOR COURT|CIRCUIT COURT|SUPREME COURT/i.test(clean) && !caption.court) {
      caption.court = clean;
      continue;
    }
  }

  // If court was split across lines (e.g. "IN THE MARION COUNTY" + "SUPERIOR COURT NO. 07")
  // Try to combine them
  if (caption.court && /^(MARION|WAYNE|WHITLEY|LAKE|ALLEN|HAMILTON)\s+COUNTY$/i.test(caption.court)) {
    // Court name is incomplete, look in header lines for continuation
    for (const hl of headerLines) {
      const clean = stripParens(hl);
      if (/SUPERIOR COURT|CIRCUIT COURT/i.test(clean) && !/^COUNTY/i.test(clean) && !/^STATE/i.test(clean)) {
        caption.court = caption.court + " " + clean;
        break;
      }
    }
  }

  // === Parse party block ===
  let currentPartyLines: string[] = [];
  let lastRole = "";
  let plaintiff: { name: string; role: string } | null = null;
  let defendants: { name: string; role: string }[] = [];
  let seenV = false;

  while (i < lines.length) {
    const line = lines[i].trim();
    const clean = stripParens(line);

    // Skip empty/paren-only lines
    if (!clean || clean === "vvvvvv") {
      i++;
      continue;
    }

    // Check if we've reached the document title (end of caption)
    if (isDocumentTitle(clean)) {
      break;
    }

    // "v." or "vs." separator
    if (/^v[s]?\.?\s*$/i.test(clean)) {
      // Flush current party as plaintiff
      if (currentPartyLines.length > 0) {
        const name = currentPartyLines.join(" ").replace(/,\s*$/, "");
        const role = lastRole || "Plaintiff";
        plaintiff = { name, role };
        currentPartyLines = [];
        lastRole = "";
      }
      seenV = true;
      i++;
      continue;
    }

    // Party role line
    if (
      /^(Plaintiffs?|Defendants?|Respondents?|Petitioners?|Appellees?|Appellants?)[,.\s]*$/i.test(
        clean
      )
    ) {
      // Normalize role to singular
      const role = clean
        .replace(/[,.\s]+$/i, "")
        .replace(/s$/i, "")
        .trim();
      const isPlural = /s[,.\s]*$/i.test(clean.replace(/[.\s]+$/, ""));

      if (currentPartyLines.length > 0) {
        if (isPlural && currentPartyLines.length > 1) {
          // Multiple parties on separate lines — each is a distinct party
          for (const pLine of currentPartyLines) {
            const pName = pLine.replace(/,\s*$/, "").trim();
            if (!pName) continue;
            if (!seenV) {
              // Multiple plaintiffs (rare but possible)
              if (!plaintiff) {
                plaintiff = { name: pName, role };
              } else {
                defendants.push({ name: pName, role });
              }
            } else {
              defendants.push({ name: pName, role });
            }
          }
        } else {
          // Single party (possibly multi-line name)
          const name = currentPartyLines.join(" ").replace(/,\s*$/, "");
          if (!seenV) {
            plaintiff = { name, role };
          } else {
            defendants.push({ name, role });
          }
        }
        currentPartyLines = [];
      }
      lastRole = role;
      i++;
      continue;
    }

    // Party name line - accumulate (handles multi-line names)
    if (clean.length < 80) {
      currentPartyLines.push(clean.replace(/,\s*$/, ""));
      i++;
      continue;
    }

    // Long line = probably body text
    break;
  }

  // Flush any remaining party
  if (currentPartyLines.length > 0) {
    const name = currentPartyLines.join(" ").replace(/,\s*$/, "");
    const role = lastRole || (seenV ? "Defendant" : "Plaintiff");
    if (!seenV && !plaintiff) {
      plaintiff = { name, role };
    } else {
      defendants.push({ name, role });
    }
  }

  if (plaintiff) caption.parties.push(plaintiff);
  for (const d of defendants) caption.parties.push(d);

  return { captionData: caption, bodyStartIndex: i };
}

/**
 * Build the caption as a single codeBlock node.
 * Code blocks use monospace font and white-space:pre by default,
 * so the ) characters will align vertically.
 */
function buildCaptionCodeBlock(c: CaptionData): TipTapNode {
  const PAD = CAPTION_COL;
  const lines: string[] = [];

  // Header: STATE / SS / COUNTY
  lines.push(captionLine(`STATE OF ${c.state}`, `IN THE ${c.court.toUpperCase()}`, PAD));
  if (c.ss) {
    lines.push(captionLine("", `SS:${c.division ? "   " + c.division : ""}`, PAD));
  }
  lines.push(captionLine(`COUNTY OF ${c.county}`, c.causeNumber ? `CAUSE NO.: ${c.causeNumber}` : "", PAD));

  // Blank line before parties
  lines.push("");

  // Parties
  if (c.parties.length > 0) {
    const pl = c.parties[0];
    lines.push(captionLine(`${pl.name},`, "", PAD));
    lines.push(captionLine(`     ${pl.role},`, "", PAD));
    lines.push(captionLine("", "", PAD));
    lines.push(captionLine("v.", "", PAD));
    lines.push(captionLine("", "", PAD));

    const defParties = c.parties.slice(1);
    for (let d = 0; d < defParties.length; d++) {
      const def = defParties[d];
      lines.push(captionLine(`${def.name},`, "", PAD));
      if (d === defParties.length - 1) {
        const roleLabel = defParties.length > 1
          ? `     ${def.role}s.`
          : `     ${def.role}.`;
        lines.push(captionLine(roleLabel, "", PAD));
      }
    }
  }

  return {
    type: "codeBlock",
    content: [
      {
        type: "text",
        text: lines.join("\n"),
      },
    ],
  };
}

/**
 * Format a single caption line with ) at a fixed column.
 */
function captionLine(left: string, right: string, col: number): string {
  const padded = left.padEnd(col);
  return right ? `${padded})    ${right}` : `${padded})`;
}

function isDocumentTitle(text: string): boolean {
  // Normalize curly apostrophes to straight
  const t = text.replace(/[\u2018\u2019]/g, "'");
  const patterns = [
    /^(MOTION|ORDER|PETITION|BRIEF|MEMORANDUM|AFFIDAVIT|DEMAND|OBJECTION)/i,
    /^(CITY'S|STATE'S|DEFENDANT'S|PLAINTIFF'S)\s+(MOTION|BRIEF|MEMORANDUM|RESPONSE|OBJECTION)/i,
    /^MEMORANDUM OF LAW/i,
    /^AND CERTAIN/i,
  ];
  return patterns.some((p) => p.test(t));
}

function isLikelyHeading(trimmed: string): boolean {
  if (trimmed.includes(")")) return false;

  // Normalize curly apostrophes
  const t = trimmed.replace(/[\u2018\u2019]/g, "'");

  const titlePatterns = [
    /^(MOTION|ORDER|PETITION|BRIEF|MEMORANDUM|AFFIDAVIT|DEMAND|OBJECTION)\b/,
    /^(CITY'S|STATE'S|DEFENDANT'S|PLAINTIFF'S)\s+(MOTION|BRIEF|MEMORANDUM|RESPONSE|OBJECTION)/i,
    /^CERTIFICATE OF SERVICE$/i,
    /^MEMORANDUM OF LAW/i,
    /^(I|II|III|IV|V|VI|VII|VIII|IX|X)\.\s/,
    /^Respectfully submitted/i,
    /^AND CERTAIN/i,
  ];
  if (titlePatterns.some((p) => p.test(t))) return true;

  // All-caps section heading
  if (
    t === t.toUpperCase() &&
    t.length > 10 &&
    t.length < 80 &&
    /[A-Z]/.test(t) &&
    !t.includes(":") &&
    !/^(STATE OF|COUNTY OF|IN THE|CAUSE)/.test(t)
  ) {
    return true;
  }

  return false;
}

function makeParagraph(text: string): TipTapNode {
  return {
    type: "paragraph",
    content: [
      {
        type: "text",
        text,
        marks: [
          {
            type: "textStyle",
            attrs: { fontFamily: "'Times New Roman', Times, serif" },
          },
        ],
      },
    ],
  };
}

function makeHeading(text: string): TipTapNode {
  const isDocTitle =
    text === text.toUpperCase() &&
    (text.includes("MOTION") ||
      text.includes("BRIEF") ||
      text.includes("ORDER") ||
      text.includes("PETITION") ||
      text.includes("MEMORANDUM") ||
      text.includes("AFFIDAVIT") ||
      text.includes("DEMAND") ||
      text.includes("OBJECTION"));

  return {
    type: "heading",
    attrs: {
      level: isDocTitle ? 1 : 2,
      textAlign: "center",
    },
    content: [
      {
        type: "text",
        text,
        marks: [
          { type: "bold" },
          {
            type: "textStyle",
            attrs: { fontFamily: "'Times New Roman', Times, serif" },
          },
        ],
      },
    ],
  };
}
