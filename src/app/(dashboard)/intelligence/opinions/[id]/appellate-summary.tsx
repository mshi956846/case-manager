"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function AppellateSummary({
  courtListenerId,
  caseName,
}: {
  courtListenerId: number;
  caseName: string;
}) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Step 1: fetch opinion text from CourtListener
    fetch(`/api/intelligence/opinions/opinion-text?courtListenerId=${courtListenerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        // Step 2: generate summary via Claude
        return fetch("/api/intelligence/opinions/summarize-appellate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ opinionText: data.text, caseName }),
        });
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
  }, [courtListenerId, caseName]);

  return (
    <Card className="border-l-4 border-l-rose-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Case Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating summary...
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : summary ? (
          <div className="text-sm leading-relaxed whitespace-pre-line">
            {summary}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
