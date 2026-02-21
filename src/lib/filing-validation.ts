import { INDIANA_APPROVED_FONTS } from "@/lib/court-filing-config";

export interface ValidationResult {
  valid: boolean;
  errors: ValidationItem[];
  warnings: ValidationItem[];
}

export interface ValidationItem {
  rule: string;
  message: string;
  citation?: string;
}

interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  attrs?: Record<string, unknown>;
}

function extractText(node: TipTapNode): string {
  if (node.text) return node.text;
  if (!node.content) return "";
  return node.content.map(extractText).join("");
}

function findNodes(node: TipTapNode, type: string): TipTapNode[] {
  const results: TipTapNode[] = [];
  if (node.type === type) results.push(node);
  if (node.content) {
    for (const child of node.content) {
      results.push(...findNodes(child, type));
    }
  }
  return results;
}

function getFontsUsed(node: TipTapNode): Set<string> {
  const fonts = new Set<string>();
  if (node.marks) {
    for (const mark of node.marks) {
      if (mark.type === "textStyle" && mark.attrs?.fontFamily) {
        fonts.add(mark.attrs.fontFamily as string);
      }
    }
  }
  if (node.content) {
    for (const child of node.content) {
      for (const font of getFontsUsed(child)) {
        fonts.add(font);
      }
    }
  }
  return fonts;
}

export function validateDocument(content: TipTapNode): ValidationResult {
  const errors: ValidationItem[] = [];
  const warnings: ValidationItem[] = [];
  const fullText = extractText(content);

  // Check minimum length
  const wordCount = fullText.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 10) {
    errors.push({
      rule: "minimum-length",
      message: "Document appears too short for a court filing (less than 10 words)",
      citation: "Indiana Trial Rule 10",
    });
  }

  // Check for caption
  const tables = findNodes(content, "table");
  const hasCaption =
    tables.length > 0 ||
    /IN THE .* COURT/i.test(fullText) ||
    /STATE OF INDIANA/i.test(fullText) ||
    /CAUSE NO/i.test(fullText);
  if (!hasCaption) {
    errors.push({
      rule: "caption-required",
      message: "Document is missing a caption block (case header)",
      citation: "Indiana Trial Rule 10(A)",
    });
  }

  // Check for signature block
  const hasSignature =
    /respectfully submitted/i.test(fullText) ||
    /attorney for/i.test(fullText) ||
    /\/s\//i.test(fullText);
  if (!hasSignature) {
    errors.push({
      rule: "signature-required",
      message: "Document is missing a signature block",
      citation: "Indiana Trial Rule 11(A)",
    });
  }

  // Check for certificate of service
  const hasCertificate =
    /certificate of service/i.test(fullText) ||
    /certif(?:y|ies) that/i.test(fullText) ||
    /hereby certif/i.test(fullText);
  if (!hasCertificate) {
    warnings.push({
      rule: "certificate-of-service",
      message: "Document may be missing a Certificate of Service",
      citation: "Indiana Trial Rule 5(B)(2)",
    });
  }

  // Check fonts
  const fontsUsed = getFontsUsed(content);
  const approvedSet = new Set(INDIANA_APPROVED_FONTS as readonly string[]);
  for (const font of fontsUsed) {
    if (!approvedSet.has(font)) {
      errors.push({
        rule: "approved-fonts",
        message: `Font "${font}" is not on the Indiana approved fonts list`,
        citation: "Indiana Trial Rule 10(B)",
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
