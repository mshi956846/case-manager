"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Check, FileText, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { MatterSelect } from "@/components/matter-select";
import { ServiceForm, type ServiceRecipient } from "@/components/service-form";
import { FilingChecklist, buildFilingChecklist } from "@/components/filing-checklist";
import { INDIANA_COUNTIES, getCourtsForCounty, getCauseNumberPrefix, getJudgeForCourt } from "@/lib/indiana-courts";
import { FILING_CODES, getFilingCodesByCategory } from "@/lib/filing-codes";
import { calculateFilingFee } from "@/lib/filing-fees";

interface MatterData {
  id: string;
  title: string;
  caseNumber: string | null;
}

interface DocumentOption {
  id: string;
  name: string;
  content: Record<string, unknown> | null;
}

interface SelectedDocument {
  documentId: string;
  name: string;
  role: "LEAD" | "ATTACHMENT" | "PROPOSED_ORDER";
  validationResult: { valid: boolean; errors: { message: string }[]; warnings: { message: string }[] } | null;
}

const STEPS = [
  { number: 1, label: "Select Case" },
  { number: 2, label: "Documents" },
  { number: 3, label: "Filing Details" },
  { number: 4, label: "Service" },
  { number: 5, label: "Review" },
];

const ROLE_LABELS: Record<string, string> = {
  LEAD: "Lead Document",
  ATTACHMENT: "Attachment",
  PROPOSED_ORDER: "Proposed Order",
};

export function FilingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);

  // Step 1 — Case
  const [matterId, setMatterId] = useState(searchParams.get("matterId") || "");
  const [county, setCounty] = useState("");
  const [court, setCourt] = useState("");
  const [causeNumber, setCauseNumber] = useState("");
  const [judge, setJudge] = useState("");
  const [filingParty, setFilingParty] = useState("");

  // Step 2 — Documents
  const [availableDocs, setAvailableDocs] = useState<DocumentOption[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<SelectedDocument[]>([]);
  const preselectedDocId = searchParams.get("documentId") || "";

  // Step 3 — Filing details
  const [filingType, setFilingType] = useState<"INITIAL" | "SUBSEQUENT" | "SERVICE_ONLY">("SUBSEQUENT");
  const [filingCode, setFilingCode] = useState("");
  const [feeWaived, setFeeWaived] = useState(false);
  const [notes, setNotes] = useState("");

  // Step 4 — Service
  const [serviceRecipients, setServiceRecipients] = useState<ServiceRecipient[]>([]);

  const courts = county ? getCourtsForCounty(county) : [];
  const codesByCategory = getFilingCodesByCategory();
  const fee = calculateFilingFee({ filingType, category: "criminal", feeWaived });

  // Load documents for selected matter
  const loadDocuments = useCallback(async (mid: string) => {
    if (!mid) {
      setAvailableDocs([]);
      return;
    }
    try {
      const res = await fetch(`/api/documents?matterId=${mid}`);
      if (res.ok) {
        const docs = await res.json();
        setAvailableDocs(docs);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (matterId) loadDocuments(matterId);
  }, [matterId, loadDocuments]);

  // Pre-select document from query param
  useEffect(() => {
    if (preselectedDocId && availableDocs.length > 0 && selectedDocs.length === 0) {
      const doc = availableDocs.find((d) => d.id === preselectedDocId);
      if (doc) {
        setSelectedDocs([{ documentId: doc.id, name: doc.name, role: "LEAD", validationResult: null }]);
        validateDoc(doc);
      }
    }
  }, [preselectedDocId, availableDocs]); // eslint-disable-line react-hooks/exhaustive-deps

  async function validateDoc(doc: DocumentOption) {
    if (!doc.content) return;
    try {
      const res = await fetch("/api/e-filing/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: doc.content }),
      });
      if (res.ok) {
        const result = await res.json();
        setSelectedDocs((prev) =>
          prev.map((d) => (d.documentId === doc.id ? { ...d, validationResult: result } : d))
        );
      }
    } catch {
      // ignore
    }
  }

  function toggleDocument(doc: DocumentOption) {
    const exists = selectedDocs.find((d) => d.documentId === doc.id);
    if (exists) {
      setSelectedDocs(selectedDocs.filter((d) => d.documentId !== doc.id));
    } else {
      const hasLead = selectedDocs.some((d) => d.role === "LEAD");
      const newDoc: SelectedDocument = {
        documentId: doc.id,
        name: doc.name,
        role: hasLead ? "ATTACHMENT" : "LEAD",
        validationResult: null,
      };
      setSelectedDocs([...selectedDocs, newDoc]);
      validateDoc(doc);
    }
  }

  function updateDocRole(docId: string, role: "LEAD" | "ATTACHMENT" | "PROPOSED_ORDER") {
    setSelectedDocs(selectedDocs.map((d) => (d.documentId === docId ? { ...d, role } : d)));
  }

  function handleCountyChange(value: string) {
    setCounty(value);
    setCourt("");
    setCauseNumber("");
    setJudge("");
  }

  function handleCourtChange(value: string) {
    setCourt(value);
    setCauseNumber(getCauseNumberPrefix(value));
    setJudge(getJudgeForCourt(value));
  }

  function canAdvance(): boolean {
    switch (step) {
      case 1:
        return !!county && !!court && !!filingParty;
      case 2:
        return selectedDocs.length > 0;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  }

  async function handleCreate() {
    setCreating(true);
    try {
      // 1. Create the filing
      const filingRes = await fetch("/api/e-filing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filingType,
          county,
          court,
          judge: judge || undefined,
          causeNumber: causeNumber || undefined,
          filingParty,
          filingCode: filingCode || undefined,
          feeAmount: fee.amount,
          feeWaived,
          notes: notes || undefined,
          matterId: matterId || undefined,
        }),
      });

      if (!filingRes.ok) {
        toast.error("Failed to create filing");
        return;
      }

      const filing = await filingRes.json();

      // 2. Add documents
      for (let i = 0; i < selectedDocs.length; i++) {
        const doc = selectedDocs[i];
        await fetch(`/api/e-filing/${filing.id}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId: doc.documentId,
            role: doc.role,
            sortOrder: i,
          }),
        });
      }

      // 3. Add service records
      for (const recipient of serviceRecipients) {
        await fetch("/api/e-filing/service", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filingId: filing.id,
            method: recipient.method,
            partyName: recipient.partyName,
            partyEmail: recipient.partyEmail || undefined,
            partyAddress: recipient.partyAddress || undefined,
            partyRole: recipient.partyRole || undefined,
          }),
        });
      }

      toast.success("Filing created");
      router.push(`/e-filing/${filing.id}`);
    } catch {
      toast.error("Network error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => {
          const isCompleted = step > s.number;
          const isCurrent = step === s.number;
          return (
            <div key={s.number} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                    isCompleted && "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary text-primary",
                    !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground/50"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : s.number}
                </div>
                <span className={cn("text-sm font-medium hidden sm:inline", isCurrent ? "text-foreground" : "text-muted-foreground")}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("h-px w-8 sm:w-12", step > s.number ? "bg-primary" : "bg-muted-foreground/30")} />
              )}
            </div>
          );
        })}
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Step 1: Select Case */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Select Case & Court</h2>

              <div className="space-y-1.5">
                <Label>Case (Matter)</Label>
                <MatterSelect value={matterId} onValueChange={setMatterId} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>County *</Label>
                  <Select value={county} onValueChange={handleCountyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select county..." />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIANA_COUNTIES.map((c) => (
                        <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Court *</Label>
                  <Select value={court} onValueChange={handleCourtChange} disabled={!county}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select court..." />
                    </SelectTrigger>
                    <SelectContent>
                      {courts.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Cause Number</Label>
                  <Input value={causeNumber} onChange={(e) => setCauseNumber(e.target.value)} placeholder="XX-XX-XXXXX-XX-XX" />
                </div>
                <div className="space-y-1.5">
                  <Label>Judge</Label>
                  <Input value={judge} onChange={(e) => setJudge(e.target.value)} placeholder="Judge name" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Filing Party *</Label>
                <Input value={filingParty} onChange={(e) => setFilingParty(e.target.value)} placeholder="e.g., Defendant, by counsel" />
              </div>
            </div>
          )}

          {/* Step 2: Select Documents */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Select Documents</h2>
              <p className="text-sm text-muted-foreground">Choose documents to include and assign roles.</p>

              {availableDocs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  {matterId ? "No documents found for this case." : "Select a case first to see available documents."}
                </p>
              ) : (
                <div className="space-y-2">
                  {availableDocs.map((doc) => {
                    const selected = selectedDocs.find((d) => d.documentId === doc.id);
                    return (
                      <div
                        key={doc.id}
                        className={cn(
                          "flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors",
                          selected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        )}
                        onClick={() => toggleDocument(doc)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded border-2",
                            selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                          )}>
                            {selected ? <Check className="h-4 w-4" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            {selected?.validationResult && (
                              <div className="flex items-center gap-1 mt-0.5">
                                {selected.validationResult.valid ? (
                                  <span className="text-xs text-emerald-600">Validation passed</span>
                                ) : (
                                  <span className="text-xs text-amber-600 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {selected.validationResult.errors.length} issue(s)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {selected && (
                          <Select
                            value={selected.role}
                            onValueChange={(v) => updateDocRole(doc.id, v as SelectedDocument["role"])}
                          >
                            <SelectTrigger className="w-40" onClick={(e) => e.stopPropagation()}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Filing Details */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Filing Details</h2>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Filing Type</Label>
                  <Select value={filingType} onValueChange={(v) => setFilingType(v as typeof filingType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INITIAL">Initial Filing</SelectItem>
                      <SelectItem value="SUBSEQUENT">Subsequent Filing</SelectItem>
                      <SelectItem value="SERVICE_ONLY">Service Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Filing Code</Label>
                  <Select value={filingCode} onValueChange={setFilingCode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select code..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(codesByCategory).map(([category, codes]) => (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{category}</div>
                          {codes.map((code) => (
                            <SelectItem key={code.code} value={code.code}>
                              {code.code} — {code.label}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Filing Fee</p>
                    <p className="text-xs text-muted-foreground">{fee.description}</p>
                  </div>
                  <p className="text-lg font-bold">${fee.amount.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={feeWaived} onCheckedChange={setFeeWaived} id="fee-waiver" />
                  <Label htmlFor="fee-waiver" className="text-sm">Fee waiver granted</Label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes about this filing..." rows={3} />
              </div>
            </div>
          )}

          {/* Step 4: Service Recipients */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Service Recipients</h2>
              <p className="text-sm text-muted-foreground">Add parties who must be served with this filing.</p>
              <ServiceForm recipients={serviceRecipients} onChange={setServiceRecipients} />
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Review Filing</h2>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Court Information</h3>
                    <div className="rounded-lg border p-3 space-y-1 text-sm">
                      <p><span className="text-muted-foreground">County:</span> {county}</p>
                      <p><span className="text-muted-foreground">Court:</span> {court}</p>
                      {causeNumber && <p><span className="text-muted-foreground">Cause No.:</span> {causeNumber}</p>}
                      {judge && <p><span className="text-muted-foreground">Judge:</span> {judge}</p>}
                      <p><span className="text-muted-foreground">Filing Party:</span> {filingParty}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Filing Details</h3>
                    <div className="rounded-lg border p-3 space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Type:</span> {filingType.replace(/_/g, " ")}</p>
                      {filingCode && (
                        <p><span className="text-muted-foreground">Code:</span> {filingCode} — {FILING_CODES.find((c) => c.code === filingCode)?.label}</p>
                      )}
                      <p><span className="text-muted-foreground">Fee:</span> ${fee.amount.toFixed(2)} {feeWaived && "(waived)"}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Documents ({selectedDocs.length})</h3>
                    <div className="rounded-lg border divide-y">
                      {selectedDocs.map((doc) => (
                        <div key={doc.documentId} className="p-3 flex items-center justify-between text-sm">
                          <span>{doc.name}</span>
                          <span className="text-xs text-muted-foreground">{ROLE_LABELS[doc.role]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {serviceRecipients.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Service ({serviceRecipients.length})</h3>
                      <div className="rounded-lg border divide-y">
                        {serviceRecipients.map((r, i) => (
                          <div key={i} className="p-3 text-sm">
                            <p className="font-medium">{r.partyName}</p>
                            <p className="text-xs text-muted-foreground">{r.partyRole} · {r.method.replace(/_/g, " ")}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Filing Checklist</h3>
                  <div className="rounded-lg border p-4">
                    <FilingChecklist
                      items={buildFilingChecklist({
                        county,
                        court,
                        filingCode,
                        filingParty,
                        documents: selectedDocs.map((d) => ({ role: d.role })),
                        serviceRecords: serviceRecipients.length,
                        validationResult: selectedDocs.find((d) => d.role === "LEAD")?.validationResult ?? null,
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep((s) => Math.max(s - 1, 1))} disabled={step === 1}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex gap-2">
          {step < 5 && (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()}>
              {step === 4 ? "Review" : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {step === 5 && (
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Filing
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
