"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, FileText, Send, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FilingStatusBadge } from "@/components/filing-status-badge";

type FilingStatus = "DRAFT" | "READY" | "SUBMITTED" | "ACCEPTED" | "REJECTED" | "RETURNED";
type FilingType = "INITIAL" | "SUBSEQUENT" | "SERVICE_ONLY";

interface FilingWithRelations {
  id: string;
  status: FilingStatus;
  filingType: FilingType;
  county: string;
  court: string;
  causeNumber: string | null;
  filingParty: string;
  filingCode: string | null;
  feeAmount: number;
  feeWaived: boolean;
  createdAt: string;
  submittedAt: string | null;
  acceptedAt: string | null;
  matter: { id: string; title: string; caseNumber: string | null } | null;
  documents: {
    document: { id: string; name: string };
    role: string;
  }[];
  _count: { serviceRecords: number };
}

interface StatusCounts {
  DRAFT: number;
  READY: number;
  SUBMITTED: number;
  ACCEPTED: number;
  REJECTED: number;
  RETURNED: number;
}

const FILING_TYPE_LABELS: Record<FilingType, string> = {
  INITIAL: "Initial",
  SUBSEQUENT: "Subsequent",
  SERVICE_ONLY: "Service Only",
};

export function EFilingClient({
  filings,
  statusCounts,
}: {
  filings: FilingWithRelations[];
  statusCounts: StatusCounts;
}) {
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = filings.filter((f) => {
    switch (tab) {
      case "queue":
        return f.status === "DRAFT" || f.status === "READY";
      case "submitted":
        return f.status === "SUBMITTED";
      case "completed":
        return f.status === "ACCEPTED";
      case "issues":
        return f.status === "REJECTED" || f.status === "RETURNED";
      default:
        return true;
    }
  });

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/e-filing/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Filing deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete filing");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  const columns: ColumnDef<FilingWithRelations>[] = [
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <FilingStatusBadge status={row.original.status} />,
    },
    {
      id: "leadDocument",
      header: "Lead Document",
      cell: ({ row }) => {
        const lead = row.original.documents.find((d) => d.role === "LEAD");
        return (
          <span className="text-sm">
            {lead?.document.name || <span className="text-muted-foreground italic">No lead document</span>}
          </span>
        );
      },
    },
    {
      id: "case",
      header: "Case",
      cell: ({ row }) =>
        row.original.matter ? (
          <Link href={`/matters/${row.original.matter.id}`} className="text-sm hover:underline">
            {row.original.matter.title}
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      id: "court",
      header: "Court",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.county} — {row.original.court}
        </span>
      ),
    },
    {
      accessorKey: "filingType",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-sm">{FILING_TYPE_LABELS[row.original.filingType]}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/e-filing/${row.original.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteId(row.original.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-muted-foreground">Drafts</span>
            </div>
            <p className="text-2xl font-bold mt-1">{statusCounts.DRAFT}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">Ready</span>
            </div>
            <p className="text-2xl font-bold mt-1">{statusCounts.READY}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-indigo-500" />
              <span className="text-sm text-muted-foreground">Submitted</span>
            </div>
            <p className="text-2xl font-bold mt-1">{statusCounts.SUBMITTED}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Accepted</span>
            </div>
            <p className="text-2xl font-bold mt-1">{statusCounts.ACCEPTED}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Rejected</span>
            </div>
            <p className="text-2xl font-bold mt-1">{statusCounts.REJECTED + statusCounts.RETURNED}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs + Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="queue">Queue</TabsTrigger>
              <TabsTrigger value="submitted">Submitted</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="issues">Issues</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button asChild>
            <Link href="/e-filing/new">
              <Plus className="mr-2 h-4 w-4" />
              New Filing
            </Link>
          </Button>
        </div>

        <DataTable columns={columns} data={filtered} />
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Filing"
        description="Are you sure you want to delete this filing? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
