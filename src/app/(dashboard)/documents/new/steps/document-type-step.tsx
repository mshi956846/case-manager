"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTypesForCategory, type DocumentCategory, type DocumentTypeNode } from "@/lib/document-types";

interface DocumentTypeStepProps {
  category: DocumentCategory;
  value?: string;
  onSelect: (typeId: string) => void;
}

export function DocumentTypeStep({ category, value, onSelect }: DocumentTypeStepProps) {
  const types = getTypesForCategory(category);
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select a document type</h2>
      <div className="space-y-1">
        {types.map((type) => (
          <TypeItem
            key={type.id}
            type={type}
            selectedId={value}
            expanded={expanded === type.id}
            onToggle={() => toggleExpand(type.id)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

function TypeItem({
  type,
  selectedId,
  expanded,
  onToggle,
  onSelect,
}: {
  type: DocumentTypeNode;
  selectedId?: string;
  expanded: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
}) {
  const hasSubtypes = type.subtypes && type.subtypes.length > 0;
  const isSelected = selectedId === type.id;
  const hasSelectedChild = type.subtypes?.some((s) => s.id === selectedId);

  return (
    <div>
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
          (isSelected || hasSelectedChild) && "bg-primary/5 font-medium"
        )}
        onClick={() => {
          if (hasSubtypes) {
            onToggle();
          } else {
            onSelect(type.id);
          }
        }}
      >
        {hasSubtypes ? (
          expanded ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )
        ) : (
          <div className="w-4" />
        )}
        <span className="flex-1">{type.label}</span>
        {isSelected && <Check className="h-4 w-4 text-primary" />}
      </button>

      {hasSubtypes && expanded && (
        <div className="ml-6 space-y-1 border-l pl-2">
          {type.subtypes!.map((sub) => (
            <button
              key={sub.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent",
                selectedId === sub.id && "bg-primary/5 font-medium"
              )}
              onClick={() => onSelect(sub.id)}
            >
              <span className="flex-1">{sub.label}</span>
              {selectedId === sub.id && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
