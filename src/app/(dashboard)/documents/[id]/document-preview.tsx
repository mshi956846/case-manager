"use client";

import { useState, useEffect } from "react";

interface DocumentPreviewProps {
  content: Record<string, unknown> | null;
}

export function DocumentPreview({ content }: DocumentPreviewProps) {
  const [Editor, setEditor] = useState<React.ComponentType<{ content: Record<string, unknown> | null }> | null>(null);

  useEffect(() => {
    import("./preview-editor").then((mod) => {
      setEditor(() => mod.PreviewEditor);
    });
  }, []);

  if (!Editor) {
    return <p className="text-muted-foreground">Loading preview...</p>;
  }

  return <Editor content={content} />;
}
