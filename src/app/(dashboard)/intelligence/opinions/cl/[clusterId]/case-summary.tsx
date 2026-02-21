"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText } from "lucide-react";

export function CaseSummary({
  opinionText,
  caseName,
  pdfUrl,
}: {
  opinionText: string;
  caseName: string;
  pdfUrl: string | null;
}) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!opinionText) {
      setLoading(false);
      return;
    }

    fetch("/api/intelligence/opinions/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opinionText, caseName }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSummary(data.summary);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [opinionText, caseName]);

  if (!opinionText) return null;

  return (
    <Card className="border-l-4 border-l-red-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Case Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating summary...
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : summary ? (
          <>
            <div className="text-sm leading-relaxed whitespace-pre-line">
              {summary}
            </div>
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-2"
              >
                <FileText className="h-4 w-4" />
                Read Full Opinion (PDF)
              </a>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
