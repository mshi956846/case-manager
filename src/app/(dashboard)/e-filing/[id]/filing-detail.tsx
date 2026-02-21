"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Send,
  FileText,
  Plus,
  Trash2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FilingStatusBadge } from "@/components/filing-status-badge";
import { FilingChecklist, buildFilingChecklist } from "@/components/filing-checklist";
import { ServiceForm, type ServiceRecipient } from "@/components/service-form";

type FilingStatus = "DRAFT" | "READY" | "SUBMITTED" | "ACCEPTED" | "REJECTED" | "RETURNED";

interface FilingData {
  id: string;
  status: FilingStatus;
  filingType: string;
  county: string;
  court: string;
  division: string | null;
  judge: string | null;
  causeNumber: string | null;
  filingParty: string;
  envelopeNumber: string | null;
  filingCode: string | null;
  feeAmount: number;
  feeWaived: boolean;
  notes: string | null;
  submittedAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  returnReason: string | null;
  createdAt: string;
  updatedAt: string;
  matter: { id: string; title: string; caseNumber: string | null } | null;
  documents: {
    id: string;
    role: string;
    filingCode: string | null;
    sortOrder: number;
    documentId: string;
    document: { id: string; name: string; documentType: string; content: unknown };
  }[];
  serviceRecords: {
    id: string;
    method: string;
    status: string;
    partyName: string;
    partyEmail: string | null;
    partyAddress: string | null;
    partyRole: string | null;
    serviceDate: string | null;
    createdAt: string;
  }[];
}

const ROLE_LABELS: Record<string, string> = {
  LEAD: "Lead Document",
  ATTACHMENT: "Attachment",
  PROPOSED_ORDER: "Proposed Order",
};

const METHOD_LABELS: Record<string, string> = {
  E_SERVICE: "E-Service",
  MAIL: "Mail",
  PERSONAL: "Personal",
  PUBLICATION: "Publication",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  SERVED: "Served",
  FAILED: "Failed",
};

export function FilingDetail({
  filing: initialFiling,
  availableDocuments,
}: {
  filing: FilingData;
  availableDocuments: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [filing, setFiling] = useState(initialFiling);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [envelopeNumber, setEnvelopeNumber] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addDocId, setAddDocId] = useState("");
  const [addDocRole, setAddDocRole] = useState<string>("ATTACHMENT");

  async function updateStatus(status: string, extra?: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/e-filing/${filing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      });
      if (res.ok) {
        toast.success(`Filing marked as ${status.toLowerCase()}`);
        router.refresh();
        const updated = await res.json();
        setFiling((prev) => ({ ...prev, ...updated }));
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Network error");
    }
  }

  async function handleSubmit() {
    try {
      const res = await fetch(`/api/e-filing/${filing.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ envelopeNumber }),
      });
      if (res.ok) {
        toast.success("Filing marked as submitted");
        setSubmitDialogOpen(false);
        router.refresh();
        const updated = await res.json();
        setFiling((prev) => ({ ...prev, ...updated, status: "SUBMITTED" as FilingStatus }));
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to submit");
      }
    } catch {
      toast.error("Network error");
    }
  }

  async function handleReject() {
    await updateStatus("REJECTED", {
      rejectedAt: new Date().toISOString(),
      rejectionReason,
    });
    setRejectDialogOpen(false);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/e-filing/${filing.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Filing deleted");
        router.push("/e-filing");
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  async function addDocument() {
    if (!addDocId) return;
    try {
      const res = await fetch(`/api/e-filing/${filing.id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: addDocId, role: addDocRole, sortOrder: filing.documents.length }),
      });
      if (res.ok) {
        toast.success("Document added");
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add document");
      }
    } catch {
      toast.error("Network error");
    }
    setAddDocId("");
  }

  async function removeDocument(documentId: string) {
    try {
      const res = await fetch(`/api/e-filing/${filing.id}/documents`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });
      if (res.ok) {
        toast.success("Document removed");
        router.refresh();
      }
    } catch {
      toast.error("Network error");
    }
  }

  async function updateServiceStatus(recordId: string, status: string) {
    try {
      const res = await fetch("/api/e-filing/service", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: recordId, status }),
      });
      if (res.ok) {
        toast.success("Service status updated");
        router.refresh();
      }
    } catch {
      toast.error("Network error");
    }
  }

  async function removeServiceRecord(recordId: string) {
    try {
      const res = await fetch("/api/e-filing/service", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: recordId }),
      });
      if (res.ok) {
        toast.success("Service record removed");
        router.refresh();
      }
    } catch {
      toast.error("Network error");
    }
  }

  // Build activity timeline from dates
  const timeline: { date: string; label: string; icon: typeof Clock }[] = [
    { date: filing.createdAt, label: "Filing created", icon: FileText },
  ];
  if (filing.submittedAt) {
    timeline.push({ date: filing.submittedAt, label: "Submitted to IEFS", icon: Send });
  }
  if (filing.acceptedAt) {
    timeline.push({ date: filing.acceptedAt, label: "Accepted by court", icon: CheckCircle2 });
  }
  if (filing.rejectedAt) {
    timeline.push({ date: filing.rejectedAt, label: "Rejected by court", icon: XCircle });
  }

  const alreadyAttached = new Set(filing.documents.map((d) => d.documentId));
  const docsToAdd = availableDocuments.filter((d) => !alreadyAttached.has(d.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/e-filing">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Filing</h1>
              <FilingStatusBadge status={filing.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {filing.county} — {filing.court}
              {filing.causeNumber && ` — ${filing.causeNumber}`}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {filing.status === "DRAFT" && (
            <Button onClick={() => updateStatus("READY")}>Mark as Ready</Button>
          )}
          {filing.status === "READY" && (
            <Button onClick={() => setSubmitDialogOpen(true)}>
              <Send className="mr-2 h-4 w-4" />
              Mark as Submitted
            </Button>
          )}
          {filing.status === "SUBMITTED" && (
            <>
              <Button
                variant="outline"
                onClick={() => updateStatus("ACCEPTED", { acceptedAt: new Date().toISOString() })}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Record Acceptance
              </Button>
              <Button variant="outline" onClick={() => setRejectDialogOpen(true)}>
                <XCircle className="mr-2 h-4 w-4" />
                Record Rejection
              </Button>
            </>
          )}
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents ({filing.documents.length})</TabsTrigger>
          <TabsTrigger value="service">Service ({filing.serviceRecords.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Court Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">County</span>
                  <span>{filing.county}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Court</span>
                  <span>{filing.court}</span>
                </div>
                {filing.causeNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cause Number</span>
                    <span>{filing.causeNumber}</span>
                  </div>
                )}
                {filing.judge && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Judge</span>
                    <span>{filing.judge}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Filing Party</span>
                  <span>{filing.filingParty}</span>
                </div>
                {filing.matter && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Case</span>
                    <Link href={`/matters/${filing.matter.id}`} className="hover:underline">
                      {filing.matter.title}
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Filing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span>{filing.filingType.replace(/_/g, " ")}</span>
                </div>
                {filing.filingCode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Filing Code</span>
                    <span>{filing.filingCode}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee</span>
                  <span>${filing.feeAmount.toFixed(2)} {filing.feeWaived && "(waived)"}</span>
                </div>
                {filing.envelopeNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envelope #</span>
                    <span>{filing.envelopeNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{format(new Date(filing.createdAt), "MMM d, yyyy h:mm a")}</span>
                </div>
                {filing.rejectionReason && (
                  <div className="pt-2 border-t">
                    <p className="text-muted-foreground mb-1">Rejection Reason</p>
                    <p className="text-red-600">{filing.rejectionReason}</p>
                  </div>
                )}
                {filing.returnReason && (
                  <div className="pt-2 border-t">
                    <p className="text-muted-foreground mb-1">Return Reason</p>
                    <p className="text-orange-600">{filing.returnReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Filing Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <FilingChecklist
                  items={buildFilingChecklist({
                    county: filing.county,
                    court: filing.court,
                    filingCode: filing.filingCode,
                    filingParty: filing.filingParty,
                    documents: filing.documents.map((d) => ({ role: d.role })),
                    serviceRecords: filing.serviceRecords.length,
                  })}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="space-y-2">
            {filing.documents.map((fd) => (
              <div key={fd.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Link
                      href={`/documents/${fd.document.id}/edit`}
                      className="text-sm font-medium hover:underline"
                    >
                      {fd.document.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{ROLE_LABELS[fd.role] || fd.role}</p>
                  </div>
                </div>
                {filing.status === "DRAFT" && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeDocument(fd.documentId)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {filing.status === "DRAFT" && docsToAdd.length > 0 && (
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <Label>Add Document</Label>
                <Select value={addDocId} onValueChange={setAddDocId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document..." />
                  </SelectTrigger>
                  <SelectContent>
                    {docsToAdd.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={addDocRole} onValueChange={setAddDocRole}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addDocument} disabled={!addDocId}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Service Tab */}
        <TabsContent value="service" className="space-y-4">
          {filing.serviceRecords.length > 0 ? (
            <div className="space-y-2">
              {filing.serviceRecords.map((sr) => (
                <div key={sr.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{sr.partyName}</p>
                    <p className="text-xs text-muted-foreground">
                      {sr.partyRole && `${sr.partyRole} · `}
                      {METHOD_LABELS[sr.method] || sr.method}
                      {sr.partyEmail && ` · ${sr.partyEmail}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={sr.status}
                      onValueChange={(v) => updateServiceStatus(sr.id, v)}
                    >
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([v, l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeServiceRecord(sr.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No service records yet.</p>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <div className="space-y-4">
            {timeline.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(item.date), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Submit Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Submitted</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Enter the IEFS envelope number after submitting through the Indiana E-Filing System.
            </p>
            <div className="space-y-1.5">
              <Label>Envelope Number</Label>
              <Input value={envelopeNumber} onChange={(e) => setEnvelopeNumber(e.target.value)} placeholder="e.g., 12345678" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Mark as Submitted</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Rejection</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Rejection Reason</Label>
              <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Why was the filing rejected?" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>Record Rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Filing"
        description="Are you sure you want to delete this filing? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
