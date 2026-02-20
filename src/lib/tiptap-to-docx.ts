import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  LineNumberRestartFormat,
  convertInchesToTwip,
} from "docx";
import { COURT_FILING } from "./court-filing-config";

interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

function getAlignment(attrs?: Record<string, unknown>) {
  const align = attrs?.textAlign as string | undefined;
  switch (align) {
    case "center": return AlignmentType.CENTER;
    case "right": return AlignmentType.RIGHT;
    case "justify": return AlignmentType.JUSTIFIED;
    default: return AlignmentType.LEFT;
  }
}

function getHeadingLevel(level: number) {
  switch (level) {
    case 1: return HeadingLevel.HEADING_1;
    case 2: return HeadingLevel.HEADING_2;
    case 3: return HeadingLevel.HEADING_3;
    default: return undefined;
  }
}

function processTextRuns(node: TipTapNode): TextRun[] {
  if (node.text) {
    const marks = node.marks || [];
    const bold = marks.some((m) => m.type === "bold");
    const italic = marks.some((m) => m.type === "italic");
    const underline = marks.some((m) => m.type === "underline");

    return [
      new TextRun({
        text: node.text,
        bold,
        italics: italic,
        underline: underline ? {} : undefined,
        font: COURT_FILING.font.family,
        size: COURT_FILING.font.size * 2, // half-points
      }),
    ];
  }

  if (node.content) {
    return node.content.flatMap((child) => processTextRuns(child));
  }

  return [];
}

function processNode(node: TipTapNode): Paragraph[] {
  switch (node.type) {
    case "paragraph": {
      const runs = node.content ? node.content.flatMap(processTextRuns) : [];
      return [
        new Paragraph({
          children: runs.length > 0 ? runs : [new TextRun({ text: "", font: COURT_FILING.font.family, size: COURT_FILING.font.size * 2 })],
          alignment: getAlignment(node.attrs),
          spacing: { line: 480 }, // double spacing (240 * 2)
        }),
      ];
    }

    case "heading": {
      const level = (node.attrs?.level as number) || 1;
      const runs = node.content ? node.content.flatMap(processTextRuns) : [];
      return [
        new Paragraph({
          children: runs,
          heading: getHeadingLevel(level),
          alignment: getAlignment(node.attrs),
          spacing: { line: 480 },
        }),
      ];
    }

    case "bulletList": {
      return (node.content || []).flatMap((item) => {
        const runs = item.content?.flatMap((p) =>
          p.content ? p.content.flatMap(processTextRuns) : []
        ) || [];
        return [
          new Paragraph({
            children: runs,
            bullet: { level: 0 },
            spacing: { line: 480 },
          }),
        ];
      });
    }

    case "orderedList": {
      return (node.content || []).flatMap((item, index) => {
        const runs = item.content?.flatMap((p) =>
          p.content ? p.content.flatMap(processTextRuns) : []
        ) || [];
        return [
          new Paragraph({
            children: [
              new TextRun({
                text: `${index + 1}. `,
                font: COURT_FILING.font.family,
                size: COURT_FILING.font.size * 2,
              }),
              ...runs,
            ],
            spacing: { line: 480 },
          }),
        ];
      });
    }

    default:
      return [];
  }
}

export async function tiptapToDocx(
  content: Record<string, unknown>,
  title: string
): Promise<Buffer> {
  const doc = content as unknown as TipTapNode;
  const paragraphs = (doc.content || []).flatMap(processNode);

  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertInchesToTwip(COURT_FILING.page.width),
              height: convertInchesToTwip(COURT_FILING.page.height),
            },
            margin: {
              top: convertInchesToTwip(COURT_FILING.page.margins.top),
              bottom: convertInchesToTwip(COURT_FILING.page.margins.bottom),
              left: convertInchesToTwip(COURT_FILING.page.margins.left),
              right: convertInchesToTwip(COURT_FILING.page.margins.right),
            },
          },
          lineNumbers: {
            countBy: 1,
            restart: LineNumberRestartFormat.NEW_PAGE,
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: title,
                    font: COURT_FILING.font.family,
                    size: COURT_FILING.font.size * 2,
                    italics: true,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: COURT_FILING.font.family,
                    size: COURT_FILING.font.size * 2,
                  }),
                ],
              }),
            ],
          }),
        },
        children: paragraphs,
      },
    ],
  });

  const buffer = await Packer.toBuffer(document);
  return Buffer.from(buffer);
}
