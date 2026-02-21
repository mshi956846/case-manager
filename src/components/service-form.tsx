"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export interface ServiceRecipient {
  partyName: string;
  partyEmail: string;
  partyAddress: string;
  partyRole: string;
  method: "E_SERVICE" | "MAIL" | "PERSONAL" | "PUBLICATION";
}

const METHOD_LABELS: Record<string, string> = {
  E_SERVICE: "E-Service",
  MAIL: "Mail",
  PERSONAL: "Personal",
  PUBLICATION: "Publication",
};

const ROLE_OPTIONS = ["Opposing Counsel", "Pro Se Party", "State", "Other"];

interface ServiceFormProps {
  recipients: ServiceRecipient[];
  onChange: (recipients: ServiceRecipient[]) => void;
}

export function ServiceForm({ recipients, onChange }: ServiceFormProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<ServiceRecipient>({
    partyName: "",
    partyEmail: "",
    partyAddress: "",
    partyRole: "",
    method: "E_SERVICE",
  });

  function addRecipient() {
    if (!draft.partyName.trim()) return;
    onChange([...recipients, { ...draft }]);
    setDraft({ partyName: "", partyEmail: "", partyAddress: "", partyRole: "", method: "E_SERVICE" });
    setShowAdd(false);
  }

  function removeRecipient(index: number) {
    onChange(recipients.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      {recipients.length > 0 && (
        <div className="space-y-2">
          {recipients.map((r, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{r.partyName}</p>
                <p className="text-xs text-muted-foreground">
                  {r.partyRole && `${r.partyRole} · `}
                  {METHOD_LABELS[r.method]}
                  {r.partyEmail && ` · ${r.partyEmail}`}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeRecipient(i)}>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {showAdd ? (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Party Name</Label>
              <Input
                value={draft.partyName}
                onChange={(e) => setDraft({ ...draft, partyName: e.target.value })}
                placeholder="e.g., John Smith"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={draft.partyRole} onValueChange={(v) => setDraft({ ...draft, partyRole: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                value={draft.partyEmail}
                onChange={(e) => setDraft({ ...draft, partyEmail: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Service Method</Label>
              <Select
                value={draft.method}
                onValueChange={(v) => setDraft({ ...draft, method: v as ServiceRecipient["method"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(METHOD_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input
              value={draft.partyAddress}
              onChange={(e) => setDraft({ ...draft, partyAddress: e.target.value })}
              placeholder="Mailing address (for mail service)"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={addRecipient} disabled={!draft.partyName.trim()}>
              Add
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Recipient
        </Button>
      )}
    </div>
  );
}
