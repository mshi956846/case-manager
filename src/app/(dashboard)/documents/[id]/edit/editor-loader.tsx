"use client";

import { useState, useEffect } from "react";

interface DocumentData {
  id: string;
  name: string;
  content: Record<string, unknown> | null;
  matter: { id: string; title: string; caseNumber: string | null } | null;
}

interface EditorLoaderProps {
  document: DocumentData;
}

export function EditorLoader({ document }: EditorLoaderProps) {
  const [Editor, setEditor] = useState<React.ComponentType<{ document: DocumentData }> | null>(null);

  useEffect(() => {
    import("./document-editor").then((mod) => {
      setEditor(() => mod.DocumentEditor);
    });
  }, []);

  if (!Editor) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-theme(spacing.16))]">
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    );
  }

  return <Editor document={document} />;
}
