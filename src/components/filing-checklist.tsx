"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChecklistItem {
  key: string;
  label: string;
  passed: boolean;
}

interface FilingChecklistProps {
  items: ChecklistItem[];
  className?: string;
}

export function FilingChecklist({ items, className }: FilingChecklistProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-2 text-sm">
          {item.passed ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500 shrink-0" />
          )}
          <span className={cn(!item.passed && "text-muted-foreground")}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function buildFilingChecklist(filing: {
  county: string;
  court: string;
  filingCode?: string | null;
  filingParty: string;
  documents: { role: string }[];
  serviceRecords?: number;
  validationResult?: { valid: boolean } | null;
}): ChecklistItem[] {
  const hasLead = filing.documents.some((d) => d.role === "LEAD");

  return [
    { key: "documents", label: "Documents attached", passed: filing.documents.length > 0 },
    { key: "lead", label: "Lead document assigned", passed: hasLead },
    { key: "court-info", label: "Court information complete", passed: !!filing.county && !!filing.court },
    { key: "filing-code", label: "Filing code selected", passed: !!filing.filingCode },
    { key: "service", label: "Service recipients added", passed: (filing.serviceRecords ?? 0) > 0 },
    { key: "validation", label: "Document validation passed", passed: filing.validationResult?.valid ?? false },
  ];
}
