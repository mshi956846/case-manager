import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { format } from "date-fns";

export function DateNodeView({ node, updateAttributes, editor }: NodeViewProps) {
  const dateStr = node.attrs.date as string;
  const fmt = node.attrs.format as "long" | "short";
  const date = new Date(dateStr);
  const isEditable = editor.isEditable;

  const formatted =
    fmt === "short"
      ? format(date, "MM/dd/yyyy")
      : format(date, "MMMM d, yyyy");

  function handleClick() {
    if (!isEditable) return;
    updateAttributes({ date: new Date().toISOString() });
  }

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        onClick={handleClick}
        className="inline-block rounded px-1.5 py-0.5 text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        title={isEditable ? "Click to update to today's date" : undefined}
      >
        {formatted}
      </span>
    </NodeViewWrapper>
  );
}
