import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { getFieldOptionSet } from "./field-options";

export function DropdownFieldView({ node, updateAttributes, editor }: NodeViewProps) {
  const fieldType = node.attrs.fieldType as string;
  const selectedValue = node.attrs.selectedValue as string;
  const label = node.attrs.label as string;
  const isEditable = editor.isEditable;

  const optionSet = getFieldOptionSet(fieldType);
  const options = optionSet?.options ?? [];

  const selectedLabel = options.find((o) => o.value === selectedValue)?.label;

  if (!isEditable) {
    return (
      <NodeViewWrapper as="span" className="inline">
        <span className="inline-block rounded px-1.5 py-0.5 text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          {selectedLabel || `[Select ${label}]`}
        </span>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper as="span" className="inline">
      <select
        value={selectedValue}
        onChange={(e) => updateAttributes({ selectedValue: e.target.value })}
        className="inline-block rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-sm font-medium text-amber-800 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400"
      >
        <option value="">Select {label}...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </NodeViewWrapper>
  );
}
