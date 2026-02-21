"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  getTypesForCategory,
  getTypesGroupedBySubcategory,
  MOTION_SUBCATEGORIES,
  type DocumentCategory,
  type DocumentTypeNode,
  type MotionSubcategory,
} from "@/lib/document-types";

interface DocumentTypeStepProps {
  category: DocumentCategory;
  value?: string;
  onSelect: (typeId: string) => void;
}

function flattenTypes(types: DocumentTypeNode[]): DocumentTypeNode[] {
  const result: DocumentTypeNode[] = [];
  for (const t of types) {
    result.push(t);
    if (t.subtypes) result.push(...t.subtypes);
  }
  return result;
}

export function DocumentTypeStep({ category, value, onSelect }: DocumentTypeStepProps) {
  const [search, setSearch] = useState("");
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const isMotion = category === "motion";
  const grouped = useMemo(() => getTypesGroupedBySubcategory(category), [category]);
  const flatTypes = useMemo(() => getTypesForCategory(category), [category]);

  const filteredTypes = useMemo(() => {
    if (!search.trim()) return null; // null = show normal grouped view
    const q = search.toLowerCase();
    const all = flattenTypes(flatTypes);
    return all.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.templateTitle.toLowerCase().includes(q) ||
        t.parentLabel?.toLowerCase().includes(q)
    );
  }, [search, flatTypes]);

  function toggleExpand(id: string) {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleGroup(key: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select a document type</h2>

      {/* Search filter */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search motions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filtered flat list */}
      {filteredTypes ? (
        <div className="space-y-1">
          {filteredTypes.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No matching document types found.
            </p>
          )}
          {filteredTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                value === type.id && "bg-primary/5 font-medium"
              )}
              onClick={() => onSelect(type.id)}
            >
              <span className="flex-1">
                {type.parentLabel ? `${type.parentLabel} — ${type.label}` : type.label}
              </span>
              {value === type.id && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      ) : isMotion ? (
        /* Grouped view for motions */
        <div className="space-y-3">
          {Object.entries(grouped).map(([key, types]) => {
            const label = MOTION_SUBCATEGORIES[key as MotionSubcategory] ?? key;
            const isCollapsed = collapsedGroups.has(key);
            return (
              <div key={key}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => toggleGroup(key)}
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                  {label}
                  <span className="text-[10px] font-normal ml-1">({types.length})</span>
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5 ml-1">
                    {types.map((type) => (
                      <TypeItem
                        key={type.id}
                        type={type}
                        selectedId={value}
                        expanded={expandedTypes.has(type.id)}
                        onToggle={() => toggleExpand(type.id)}
                        onSelect={onSelect}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat list for briefs/appeals */
        <div className="space-y-1">
          {flatTypes.map((type) => (
            <TypeItem
              key={type.id}
              type={type}
              selectedId={value}
              expanded={expandedTypes.has(type.id)}
              onToggle={() => toggleExpand(type.id)}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
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
