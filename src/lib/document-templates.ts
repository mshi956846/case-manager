import { DocumentWizardValues } from "@/lib/validations/document-wizard";
import { findDocumentType } from "@/lib/document-types";

interface TipTapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

function textNode(text: string, marks?: { type: string; attrs?: Record<string, unknown> }[]): TipTapNode {
  const node: TipTapNode = { type: "text", text };
  if (marks) node.marks = marks;
  return node;
}

function paragraph(content?: TipTapNode[], attrs?: Record<string, unknown>): TipTapNode {
  const node: TipTapNode = { type: "paragraph", attrs };
  if (content && content.length > 0) node.content = content;
  return node;
}

function tableCell(content: TipTapNode[], attrs?: Record<string, unknown>): TipTapNode {
  return {
    type: "tableCell",
    attrs: { colspan: 1, rowspan: 1, ...attrs },
    content,
  };
}

function tableRow(cells: TipTapNode[]): TipTapNode {
  return { type: "tableRow", content: cells };
}

function captionRow(leftText: string, rightText: string): TipTapNode {
  return tableRow([
    tableCell([paragraph(leftText ? [textNode(leftText)] : undefined)]),
    tableCell([paragraph([textNode(")")], { textAlign: "center" })]),
    tableCell([paragraph(rightText ? [textNode(rightText)] : undefined)]),
  ]);
}

function buildCaptionTable(data: DocumentWizardValues): TipTapNode {
  const courtUpper = data.court.toUpperCase();
  const countyUpper = data.county.toUpperCase();

  const judgeRow = data.judge
    ? captionRow("", `HONORABLE ${data.judge.toUpperCase()}`)
    : captionRow("", "");

  const rows: TipTapNode[] = [
    captionRow("STATE OF INDIANA", `IN THE ${courtUpper}`),
    captionRow("", ""),
    captionRow(`COUNTY OF ${countyUpper}`, data.causeNumber ? `CAUSE NO. ${data.causeNumber}` : "CAUSE NO. __________"),
    judgeRow,
    captionRow(
      `${data.plaintiffName.toUpperCase()},`,
      ""
    ),
    captionRow(`     ${data.plaintiffRole},`, ""),
    captionRow("", ""),
    captionRow("          v.", ""),
    captionRow("", ""),
    captionRow(
      `${data.defendantName.toUpperCase()},`,
      ""
    ),
    captionRow(`     ${data.defendantRole},`, ""),
  ];

  return {
    type: "table",
    content: rows,
  };
}

function buildTitle(templateTitle: string): TipTapNode {
  return paragraph(
    [textNode(templateTitle, [{ type: "bold" }])],
    { textAlign: "center" }
  );
}

function buildOpeningParagraph(data: DocumentWizardValues): TipTapNode {
  const docType = findDocumentType(data.documentTypeId);
  const label = docType?.parentLabel
    ? `${docType.parentLabel} — ${docType.label}`
    : docType?.label ?? "Motion";

  return paragraph([
    textNode(
      `\t\tCOMES NOW the ${data.defendantRole}, ${data.defendantName}, by counsel, and respectfully files this ${label}, and in support thereof states as follows:`
    ),
  ]);
}

function buildNumberedPlaceholder(): TipTapNode {
  return {
    type: "orderedList",
    attrs: { start: 1 },
    content: [
      {
        type: "listItem",
        content: [paragraph([textNode("\t\t[Enter argument here]")])],
      },
    ],
  };
}

function buildPrayerParagraph(data: DocumentWizardValues): TipTapNode {
  return paragraph([
    textNode(`\t\tWHEREFORE, the ${data.defendantRole}, ${data.defendantName}, respectfully requests that this Court grant the relief requested herein and all other relief that is just and proper.`),
  ]);
}

function buildSignatureBlock(): TipTapNode[] {
  return [
    paragraph([textNode("Respectfully submitted,")], { textAlign: "right" }),
    paragraph(undefined, { textAlign: "right" }),
    paragraph([textNode("_________________________________")], { textAlign: "right" }),
    paragraph([textNode("Attorney for Defendant")], { textAlign: "right" }),
    paragraph([textNode("Indiana Defender")], { textAlign: "right" }),
    paragraph([textNode("[Address]")], { textAlign: "right" }),
    paragraph([textNode("[Phone]")], { textAlign: "right" }),
    paragraph([textNode("[Email]")], { textAlign: "right" }),
  ];
}

function buildCertificateOfService(): TipTapNode[] {
  return [
    paragraph(
      [textNode("CERTIFICATE OF SERVICE", [{ type: "bold" }])],
      { textAlign: "center" }
    ),
    paragraph(),
    paragraph([
      textNode(
        "\t\tI hereby certify that on _________________, I served a copy of the foregoing document on the following counsel of record by electronically filing the foregoing document using the Indiana E-Filing System, which will send notification of such filing to:"
      ),
    ]),
    paragraph(),
    paragraph([textNode("[Opposing Counsel Name]")]),
    paragraph([textNode("[Firm Name]")]),
    paragraph([textNode("[Address]")]),
    paragraph([textNode("[City, State ZIP]")]),
    paragraph([textNode("[Email]")]),
    paragraph(),
    paragraph([textNode("/s/ _________________________________")], { textAlign: "right" }),
    paragraph([textNode("[Attorney Name]")], { textAlign: "right" }),
    paragraph([textNode("Attorney for Defendant")], { textAlign: "right" }),
  ];
}

export interface WizardDocumentResult {
  name: string;
  content: TipTapNode;
}

export function buildDocumentFromWizard(data: DocumentWizardValues): WizardDocumentResult {
  const docType = findDocumentType(data.documentTypeId);
  const templateTitle = docType?.templateTitle ?? "UNTITLED DOCUMENT";
  const label = docType?.label ?? "Document";

  const content: TipTapNode = {
    type: "doc",
    content: [
      buildCaptionTable(data),
      paragraph(),
      buildTitle(templateTitle),
      paragraph(),
      buildOpeningParagraph(data),
      paragraph(),
      buildNumberedPlaceholder(),
      paragraph(),
      buildPrayerParagraph(data),
      paragraph(),
      ...buildSignatureBlock(),
      paragraph(),
      { type: "horizontalRule" },
      paragraph(),
      ...buildCertificateOfService(),
    ],
  };

  return {
    name: `${label} — ${data.defendantName}`,
    content,
  };
}
