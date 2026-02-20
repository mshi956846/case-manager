"use client";

import { Gavel, FileText, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DocumentCategory } from "@/lib/document-types";

interface CategoryStepProps {
  value?: DocumentCategory;
  onSelect: (category: DocumentCategory) => void;
}

const CATEGORIES: { id: DocumentCategory; label: string; description: string; icon: typeof Gavel }[] = [
  {
    id: "motion",
    label: "Motion",
    description: "Motions to dismiss, suppress, compel, and more",
    icon: Gavel,
  },
  {
    id: "brief",
    label: "Brief",
    description: "Supporting briefs, memoranda, and trial briefs",
    icon: FileText,
  },
  {
    id: "appeal",
    label: "Appeal",
    description: "Notices of appeal, appellant briefs, and PCR petitions",
    icon: Scale,
  },
];

export function CategoryStep({ value, onSelect }: CategoryStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select a category</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = value === cat.id;
          return (
            <Card
              key={cat.id}
              className={cn(
                "cursor-pointer transition-colors hover:border-primary/50",
                isSelected && "border-primary bg-primary/5"
              )}
              onClick={() => onSelect(cat.id)}
            >
              <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
                <Icon className={cn("h-10 w-10", isSelected ? "text-primary" : "text-muted-foreground")} />
                <div>
                  <p className="font-semibold">{cat.label}</p>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
