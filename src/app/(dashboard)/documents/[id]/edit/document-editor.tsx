"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import UnderlineExt from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { DateNode } from "@/lib/tiptap-extensions/date-node";
import { DropdownField } from "@/lib/tiptap-extensions/dropdown-field";
import { toast } from "sonner";
import { ArrowLeft, Save, FileDown, Gavel } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DocumentToolbar } from "@/components/document-toolbar";

interface DocumentData {
  id: string;
  name: string;
  content: Record<string, unknown> | null;
  matter: { id: string; title: string; caseNumber: string | null } | null;
}

interface DocumentEditorProps {
  document: DocumentData;
}

export function DocumentEditor({ document: initialDoc }: DocumentEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(initialDoc.name);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [courtMode, setCourtMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExt,
      TextStyle,
      FontFamily,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Start writing your document...",
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      DateNode,
      DropdownField,
    ],
    content: initialDoc.content || { type: "doc", content: [{ type: "paragraph" }] },
    onUpdate: ({ editor }) => {
      setSaveStatus("unsaved");
      const text = editor.state.doc.textContent;
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);

      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveContent(editor.getJSON());
      }, 3000);
    },
    editorProps: {
      attributes: {
        class: "outline-none min-h-[800px] px-16 py-12",
      },
    },
    immediatelyRender: false,
  });

  const saveContent = useCallback(
    async (content: Record<string, unknown>) => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/documents/${initialDoc.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        if (res.ok) {
          setSaveStatus("saved");
        } else {
          setSaveStatus("unsaved");
          toast.error("Failed to save");
        }
      } catch {
        setSaveStatus("unsaved");
        toast.error("Save failed. Check your connection.");
      }
    },
    [initialDoc.id]
  );

  const saveName = useCallback(
    async (newName: string) => {
      try {
        await fetch(`/api/documents/${initialDoc.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName }),
        });
      } catch {
        // Silently fail name save — not critical
      }
    },
    [initialDoc.id]
  );

  // Ctrl+S / Cmd+S manual save
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (editor) {
          if (saveTimer.current) clearTimeout(saveTimer.current);
          saveContent(editor.getJSON());
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor, saveContent]);

  // Court filing mode: toggle layout (font is always TNR 12pt now)
  useEffect(() => {
    if (!editor) return;
    editor.commands.focus("end");
  }, [courtMode, editor]);

  // Word count on initial load
  useEffect(() => {
    if (editor) {
      const text = editor.state.doc.textContent;
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    }
  }, [editor]);

  function handleNameChange(newName: string) {
    setName(newName);
    if (nameTimer.current) clearTimeout(nameTimer.current);
    nameTimer.current = setTimeout(() => {
      saveName(newName);
    }, 1000);
  }

  async function handleExport(format: "docx" | "pdf") {
    // Save first
    if (editor) {
      await saveContent(editor.getJSON());
    }
    try {
      const res = await fetch(`/api/documents/${initialDoc.id}/export-${format}`, {
        method: "POST",
      });
      if (!res.ok) {
        toast.error(`Failed to export ${format.toUpperCase()}`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${name}.${format}`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} exported`);
    } catch {
      toast.error("Export failed. Please try again.");
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))]">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-2 bg-background shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/documents">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="border-0 text-lg font-semibold h-auto p-0 focus-visible:ring-0 w-64"
          />
          {initialDoc.matter && (
            <Badge variant="outline" className="shrink-0">
              {initialDoc.matter.title}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={courtMode ? "default" : "outline"}
            size="sm"
            onClick={() => setCourtMode(!courtMode)}
            title="Toggle court filing formatting"
          >
            <Gavel className="mr-2 h-4 w-4" />
            Court Filing
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (editor) {
                if (saveTimer.current) clearTimeout(saveTimer.current);
                saveContent(editor.getJSON());
              }
            }}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("docx")}>
            <FileDown className="mr-2 h-4 w-4" />
            DOCX
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
            <FileDown className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="shrink-0">
        <DocumentToolbar editor={editor} />
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-auto bg-muted/20 flex justify-center py-8">
        <div
          className={cn(
            "bg-background shadow-lg w-[8.5in] min-h-[11in] relative",
            courtMode && "court-filing-mode"
          )}
        >
          {courtMode && (
            <div className="absolute left-0 top-0 bottom-0 w-12 border-r border-dashed border-muted-foreground/30 flex flex-col items-center pt-12 text-[10px] text-muted-foreground/40 leading-[24px] select-none overflow-hidden">
              {Array.from({ length: 50 }, (_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
          )}
          <EditorContent
            editor={editor}
            className={cn(
              courtMode && "court-filing-editor"
            )}
          />
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t px-4 py-1.5 text-xs text-muted-foreground bg-background shrink-0">
        <span>
          {saveStatus === "saved" && "Saved"}
          {saveStatus === "saving" && "Saving..."}
          {saveStatus === "unsaved" && "Unsaved changes"}
        </span>
        <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
      </div>

      <style jsx global>{`
        .ProseMirror {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
        }
        .court-filing-mode .ProseMirror {
          line-height: 2;
          padding-left: 4rem;
        }
        .court-filing-editor .ProseMirror {
          line-height: 2;
          padding-left: 4rem;
        }
        .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
        }
        .ProseMirror td,
        .ProseMirror th {
          border: 1px dashed transparent;
          padding: 2px 4px;
          vertical-align: top;
        }
        .ProseMirror table:hover td,
        .ProseMirror table:hover th {
          border-color: hsl(var(--border));
        }
      `}</style>
    </div>
  );
}
