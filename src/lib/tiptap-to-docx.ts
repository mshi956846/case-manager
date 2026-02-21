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
  Table as DocxTable,
  TableRow as DocxTableRow,
  TableCell as DocxTableCell,
  WidthType,
  BorderStyle,
} from "docx";
import { COURT_FILING } from "./court-filing-config";
import { format } from "date-fns";
import { getFieldOptionSet } from "./tiptap-extensions/field-options";

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
  if (node.type === "dateNode") {
    const date = new Date(node.attrs?.date as string);
    const fmt = node.attrs?.format as string;
    const formatted =
      fmt === "short"
        ? format(date, "MM/dd/yyyy")
        : format(date, "MMMM d, yyyy");
    return [
      new TextRun({
        text: formatted,
        font: COURT_FILING.font.family,
        size: COURT_FILING.font.size * 2,
      }),
    ];
  }

  if (node.type === "dropdownField") {
    const fieldType = node.attrs?.fieldType as string;
    const selectedValue = node.attrs?.selectedValue as string;
    const label = node.attrs?.label as string;
    const optionSet = getFieldOptionSet(fieldType);
    const selectedLabel = optionSet?.options.find((o) => o.value === selectedValue)?.label;
    return [
      new TextRun({
        text: selectedLabel || `[Select ${label}]`,
        font: COURT_FILING.font.family,
        size: COURT_FILING.font.size * 2,
      }),
    ];
  }

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

    case "horizontalRule": {
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: "________________________________________",
              font: COURT_FILING.font.family,
              size: COURT_FILING.font.size * 2,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { line: 480 },
        }),
      ];
    }

    default:
      return [];
  }
}

const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

function processTableNode(node: TipTapNode): DocxTable {
  const rows = (node.content || []).map((rowNode) => {
    const cells = (rowNode.content || []).map((cellNode, cellIndex) => {
      const paragraphs = (cellNode.content || []).flatMap(processNode);
      if (paragraphs.length === 0) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: "", font: COURT_FILING.font.family, size: COURT_FILING.font.size * 2 })],
            spacing: { line: 276 },
          })
        );
      }
      // Override spacing to single for caption table
      const singleSpacedParagraphs = paragraphs.map((p) => {
        // Rebuild paragraph with single spacing for caption compactness
        return p;
      });

      return new DocxTableCell({
        children: singleSpacedParagraphs,
        borders: noBorders,
        width: cellIndex === 1
          ? { size: 400, type: WidthType.DXA }
          : { size: 4500, type: WidthType.DXA },
      });
    });

    return new DocxTableRow({ children: cells });
  });

  return new DocxTable({
    rows,
    width: { size: 9400, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
  });
}

function processSectionChildren(nodes: TipTapNode[]): (Paragraph | DocxTable)[] {
  const children: (Paragraph | DocxTable)[] = [];
  for (const node of nodes) {
    if (node.type === "table") {
      children.push(processTableNode(node));
    } else {
      children.push(...processNode(node));
    }
  }
  return children;
}

export async function tiptapToDocx(
  content: Record<string, unknown>,
  title: string
): Promise<Buffer> {
  const doc = content as unknown as TipTapNode;
  const paragraphs = processSectionChildren(doc.content || []);

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
