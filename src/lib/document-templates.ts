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

  const rows: TipTapNode[] = [
    captionRow("STATE OF INDIANA", `IN THE ${courtUpper}`),
    captionRow("", ""),
    captionRow(`COUNTY OF ${countyUpper}`, data.causeNumber ? `CAUSE NO. ${data.causeNumber}` : "CAUSE NO. __________"),
    captionRow("", ""),
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
      `\tCOMES NOW the ${data.defendantRole}, ${data.defendantName}, by counsel, and respectfully files this ${label}, and in support thereof states as follows:`
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
        content: [paragraph([textNode("\t[Enter argument here]")])],
      },
    ],
  };
}

function buildPrayerParagraph(data: DocumentWizardValues): TipTapNode {
  return paragraph([
    textNode(`\tWHEREFORE, the ${data.defendantRole}, ${data.defendantName}, respectfully requests that this Court grant the relief requested herein and all other relief that is just and proper.`),
  ]);
}

function buildSignatureBlock(): TipTapNode[] {
  return [
    paragraph([textNode("Respectfully submitted,")]),
    paragraph(),
    paragraph([textNode("_________________________________")]),
    paragraph([textNode("Attorney for Defendant")]),
    paragraph([textNode("Shipman Law")]),
    paragraph([textNode("[Address]")]),
    paragraph([textNode("[Phone]")]),
    paragraph([textNode("[Email]")]),
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
        "I hereby certify that on _________________, a copy of the foregoing was served upon the following via the Indiana E-Filing System:"
      ),
    ]),
    paragraph(),
    paragraph([textNode("[Opposing Counsel Name]")]),
    paragraph([textNode("[Opposing Counsel Address]")]),
    paragraph(),
    paragraph([textNode("_________________________________")]),
    paragraph([textNode("Attorney for Defendant")]),
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
