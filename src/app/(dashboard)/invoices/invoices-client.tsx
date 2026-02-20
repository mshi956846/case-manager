"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Invoice, InvoiceStatus, Contact, Matter } from "@prisma/client";
import { MoreHorizontal, Plus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { InvoiceForm } from "./invoice-form";

type InvoiceWithRelations = Invoice & {
  contact: { id: string; name: string } | null;
  matter: { id: string; title: string } | null;
  _count: { lineItems: number };
};

const statusConfig: Record<InvoiceStatus, { class: string }> = {
  DRAFT: { class: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/40 dark:text-gray-300" },
  SENT: { class: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300" },
  PAID: { class: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300" },
  OVERDUE: { class: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300" },
};

export function InvoicesClient({
  invoices,
}: {
  invoices: InvoiceWithRelations[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered =
    statusFilter === "ALL"
      ? invoices
      : invoices.filter((i) => i.status === statusFilter);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/invoices/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Invoice deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete invoice");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  const columns: ColumnDef<InvoiceWithRelations>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      cell: ({ row }) => (
        <Link
          href={`/invoices/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.invoiceNumber}
        </Link>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig[row.original.status].class}`}>{row.original.status}</span>
      ),
    },
    {
      id: "contact",
      header: "Client",
      cell: ({ row }) => row.original.contact?.name ?? "-",
    },
    {
      id: "matter",
      header: "Matter",
      cell: ({ row }) =>
        row.original.matter ? (
          <Link
            href={`/matters/${row.original.matter.id}`}
            className="hover:underline"
          >
            {row.original.matter.title}
          </Link>
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) =>
        `$${row.original.total.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      accessorKey: "issueDate",
      header: "Issued",
      cell: ({ row }) =>
        format(new Date(row.original.issueDate), "MMM d, yyyy"),
    },
    {
      accessorKey: "dueDate",
      header: "Due",
      cell: ({ row }) =>
        row.original.dueDate
          ? format(new Date(row.original.dueDate), "MMM d, yyyy")
          : "-",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/invoices/${row.original.id}`}>View</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setEditing(row.original);
                setFormOpen(true);
              }}
            >
              Edit
            </DropdownMenuItem>
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
      <div className="flex items-center justify-between">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="DRAFT">Draft</TabsTrigger>
            <TabsTrigger value="SENT">Sent</TabsTrigger>
            <TabsTrigger value="PAID">Paid</TabsTrigger>
            <TabsTrigger value="OVERDUE">Overdue</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchKey="invoiceNumber"
        searchPlaceholder="Search invoices..."
      />

      {formOpen && (
        <InvoiceForm
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditing(null);
          }}
          invoice={editing}
        />
      )}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Invoice"
        description="This will permanently delete this invoice and all line items."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
