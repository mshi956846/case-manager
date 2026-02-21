// Shared TipTap JSON node helpers for template builders

export interface TipTapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

export function text(t: string, marks?: { type: string; attrs?: Record<string, unknown> }[]): TipTapNode {
  const node: TipTapNode = { type: "text", text: t };
  if (marks) node.marks = marks;
  return node;
}

export function bold(t: string): TipTapNode {
  return text(t, [{ type: "bold" }]);
}

export function italic(t: string): TipTapNode {
  return text(t, [{ type: "italic" }]);
}

export function underline(t: string): TipTapNode {
  return text(t, [{ type: "underline" }]);
}

export function boldUnderline(t: string): TipTapNode {
  return text(t, [{ type: "bold" }, { type: "underline" }]);
}

export function paragraph(content?: TipTapNode[], attrs?: Record<string, unknown>): TipTapNode {
  const node: TipTapNode = { type: "paragraph", attrs };
  if (content && content.length > 0) node.content = content;
  return node;
}

export function emptyParagraph(): TipTapNode {
  return paragraph();
}

export function centeredBoldTitle(title: string): TipTapNode {
  return paragraph([bold(title)], { textAlign: "center" });
}

export function dateNode(format: "long" | "short" = "long"): TipTapNode {
  return {
    type: "dateNode",
    attrs: {
      date: new Date().toISOString(),
      format,
    },
  };
}

export function dropdownField(fieldType: string, label: string): TipTapNode {
  return {
    type: "dropdownField",
    attrs: {
      fieldType,
      label,
      selectedValue: "",
    },
  };
}

export function orderedList(items: TipTapNode[][]): TipTapNode {
  return {
    type: "orderedList",
    attrs: { start: 1 },
    content: items.map((itemContent) => ({
      type: "listItem",
      content: itemContent,
    })),
  };
}

export function listItem(content: TipTapNode[]): TipTapNode {
  return {
    type: "listItem",
    content,
  };
}

export function horizontalRule(): TipTapNode {
  return { type: "horizontalRule" };
}
