"use client";

import { Editor } from "@tiptap/react";
import { FIELD_OPTION_SETS } from "@/lib/tiptap-extensions/field-options";

interface InsertFieldMenuProps {
  editor: Editor;
  onClose: () => void;
}

export function InsertFieldMenu({ editor, onClose }: InsertFieldMenuProps) {
  function handleInsert(fieldType: string, label: string) {
    editor.chain().focus().insertDropdownField({ fieldType, label }).run();
    onClose();
  }

  return (
    <div className="grid gap-1 p-1">
      {FIELD_OPTION_SETS.map((set) => (
        <button
          key={set.id}
          type="button"
          className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent text-left transition-colors"
          onClick={() => handleInsert(set.id, set.label)}
        >
          {set.label}
        </button>
      ))}
    </div>
  );
}
