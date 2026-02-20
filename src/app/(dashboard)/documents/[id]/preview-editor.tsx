"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import UnderlineExt from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";

interface PreviewEditorProps {
  content: Record<string, unknown> | null;
}

export function PreviewEditor({ content }: PreviewEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExt,
      TextStyle,
      FontFamily,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: content || { type: "doc", content: [{ type: "paragraph" }] },
    editable: false,
  });

  if (!editor) return null;

  return (
    <div className="prose prose-sm max-w-none">
      <EditorContent editor={editor} />
    </div>
  );
}
