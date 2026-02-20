"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MatterOption {
  id: string;
  title: string;
  caseNumber: string | null;
}

interface MatterSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function MatterSelect({ value, onValueChange }: MatterSelectProps) {
  const [open, setOpen] = useState(false);
  const [matters, setMatters] = useState<MatterOption[]>([]);

  useEffect(() => {
    fetch("/api/matters")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then(setMatters)
      .catch(() => {});
  }, []);

  const selected = matters.find((m) => m.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {selected
            ? `${selected.title}${selected.caseNumber ? ` (#${selected.caseNumber})` : ""}`
            : "Select case..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search cases..." />
          <CommandList>
            <CommandEmpty>No cases found.</CommandEmpty>
            <CommandGroup>
              {matters.map((matter) => (
                <CommandItem
                  key={matter.id}
                  value={matter.title}
                  onSelect={() => {
                    onValueChange(matter.id === value ? "" : matter.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === matter.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {matter.title}
                  {matter.caseNumber && (
                    <span className="ml-1 text-muted-foreground">
                      #{matter.caseNumber}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
