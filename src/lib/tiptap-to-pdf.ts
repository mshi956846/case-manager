import {
  renderToBuffer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { createElement } from "react";
import { COURT_FILING, INCHES_TO_PT } from "./court-filing-config";
import { format } from "date-fns";
import { getFieldOptionSet } from "./tiptap-extensions/field-options";

interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

const marginPt = COURT_FILING.page.margins.top * INCHES_TO_PT;

const styles = StyleSheet.create({
  page: {
    paddingTop: marginPt,
    paddingBottom: marginPt + 20, // extra room for footer
    paddingLeft: marginPt,
    paddingRight: marginPt,
    fontFamily: "Times-Roman",
    fontSize: COURT_FILING.font.size,
    lineHeight: COURT_FILING.lineSpacing,
  },
  body: {
    flex: 1,
  },
  paragraph: {
    marginBottom: 4,
  },
  heading1: {
    fontSize: 18,
    fontFamily: "Times-Bold",
    marginBottom: 8,
    marginTop: 12,
  },
  heading2: {
    fontSize: 16,
    fontFamily: "Times-Bold",
    marginBottom: 6,
    marginTop: 10,
  },
  heading3: {
    fontSize: 14,
    fontFamily: "Times-Bold",
    marginBottom: 4,
    marginTop: 8,
  },
  bold: {
    fontFamily: "Times-Bold",
  },
  italic: {
    fontFamily: "Times-Italic",
  },
  boldItalic: {
    fontFamily: "Times-BoldItalic",
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  listBullet: {
    width: 20,
  },
  listContent: {
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: marginPt / 2,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: COURT_FILING.font.size,
    fontFamily: "Times-Roman",
  },
  lineNumbers: {
    position: "absolute",
    left: marginPt / 2 - 20,
    top: marginPt,
    fontSize: 9,
    fontFamily: "Times-Roman",
    color: "#999999",
  },
  alignLeft: { textAlign: "left" },
  alignCenter: { textAlign: "center" },
  alignRight: { textAlign: "right" },
  alignJustify: { textAlign: "justify" },
});

function getAlignStyle(attrs?: Record<string, unknown>) {
  const align = attrs?.textAlign as string | undefined;
  switch (align) {
    case "center": return styles.alignCenter;
    case "right": return styles.alignRight;
    case "justify": return styles.alignJustify;
    default: return styles.alignLeft;
  }
}

function renderTextRuns(node: TipTapNode): React.ReactElement[] {
  if (node.type === "dateNode") {
    const date = new Date(node.attrs?.date as string);
    const fmt = node.attrs?.format as string;
    const formatted =
      fmt === "short"
        ? format(date, "MM/dd/yyyy")
        : format(date, "MMMM d, yyyy");
    return [
      createElement(
        Text,
        { key: Math.random().toString(36) },
        formatted
      ),
    ];
  }

  if (node.type === "dropdownField") {
    const fieldType = node.attrs?.fieldType as string;
    const selectedValue = node.attrs?.selectedValue as string;
    const label = node.attrs?.label as string;
    const optionSet = getFieldOptionSet(fieldType);
    const selectedLabel = optionSet?.options.find((o) => o.value === selectedValue)?.label;
    return [
      createElement(
        Text,
        { key: Math.random().toString(36) },
        selectedLabel || `[Select ${label}]`
      ),
    ];
  }

  if (node.text) {
    const marks = node.marks || [];
    const isBold = marks.some((m) => m.type === "bold");
    const isItalic = marks.some((m) => m.type === "italic");
    const isUnderline = marks.some((m) => m.type === "underline");

    let fontStyle = {};
    if (isBold && isItalic) fontStyle = styles.boldItalic;
    else if (isBold) fontStyle = styles.bold;
    else if (isItalic) fontStyle = styles.italic;

    return [
      createElement(
        Text,
        {
          key: Math.random().toString(36),
          style: [fontStyle, isUnderline ? { textDecoration: "underline" } : {}],
        },
        node.text
      ),
    ];
  }

  if (node.content) {
    return node.content.flatMap(renderTextRuns);
  }

  return [];
}

function renderNode(node: TipTapNode, index: number): React.ReactElement | null {
  switch (node.type) {
    case "paragraph": {
      const children = node.content ? node.content.flatMap(renderTextRuns) : [];
      return createElement(
        Text,
        { key: index, style: [styles.paragraph, getAlignStyle(node.attrs)] },
        children.length > 0 ? children : " "
      );
    }

    case "heading": {
      const level = (node.attrs?.level as number) || 1;
      const headingStyle = level === 1 ? styles.heading1 : level === 2 ? styles.heading2 : styles.heading3;
      const children = node.content ? node.content.flatMap(renderTextRuns) : [];
      return createElement(
        Text,
        { key: index, style: [headingStyle, getAlignStyle(node.attrs)] },
        ...children
      );
    }

    case "bulletList": {
      const items = (node.content || []).map((item, i) => {
        const runs = item.content?.flatMap((p) =>
          p.content ? p.content.flatMap(renderTextRuns) : []
        ) || [];
        return createElement(
          View,
          { key: i, style: styles.listItem },
          createElement(Text, { style: styles.listBullet }, "\u2022 "),
          createElement(Text, { style: styles.listContent }, ...runs)
        );
      });
      return createElement(View, { key: index }, ...items);
    }

    case "orderedList": {
      const items = (node.content || []).map((item, i) => {
        const runs = item.content?.flatMap((p) =>
          p.content ? p.content.flatMap(renderTextRuns) : []
        ) || [];
        return createElement(
          View,
          { key: i, style: styles.listItem },
          createElement(Text, { style: styles.listBullet }, `${i + 1}. `),
          createElement(Text, { style: styles.listContent }, ...runs)
        );
      });
      return createElement(View, { key: index }, ...items);
    }

    default:
      return null;
  }
}

export async function tiptapToPdf(
  content: Record<string, unknown>,
  title: string
): Promise<Buffer> {
  const doc = content as unknown as TipTapNode;
  const bodyElements = (doc.content || [])
    .map((node, i) => renderNode(node, i))
    .filter(Boolean);

  const pdfDocument = createElement(
    Document,
    { title },
    createElement(
      Page,
      { size: "LETTER", style: styles.page },
      createElement(View, { style: styles.body }, ...bodyElements),
      createElement(
        Text,
        {
          style: styles.footer,
          render: ({ pageNumber }: { pageNumber: number }) => `${pageNumber}`,
          fixed: true,
        }
      )
    )
  );

  const buffer = await renderToBuffer(pdfDocument);
  return Buffer.from(buffer);
}
