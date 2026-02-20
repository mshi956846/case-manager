"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Matter, MatterStatus, MatterContact, Contact } from "@prisma/client";
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
import { MatterForm } from "./matter-form";

type MatterWithRelations = Matter & {
  contacts: (MatterContact & { contact: Contact })[];
  _count: { tasks: number; timeEntries: number; documents: number };
};

const statusConfig: Record<MatterStatus, { class: string }> = {
  OPEN: { class: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300" },
  PENDING: { class: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300" },
  CLOSED: { class: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/40 dark:text-gray-300" },
};

export function MattersClient({
  matters,
}: {
  matters: MatterWithRelations[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Matter | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered =
    statusFilter === "ALL"
      ? matters
      : matters.filter((m) => m.status === statusFilter);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/matters/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Matter deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete matter");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  const columns: ColumnDef<MatterWithRelations>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <Link
          href={`/matters/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.title}
        </Link>
      ),
    },
    {
      accessorKey: "caseNumber",
      header: "Case #",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig[row.original.status].class}`}>{row.original.status}</span>
      ),
    },
    {
      accessorKey: "practiceArea",
      header: "Practice Area",
    },
    {
      id: "client",
      header: "Client",
      cell: ({ row }) => {
        const client = row.original.contacts.find(
          (c) => c.role === "CLIENT"
        );
        return client?.contact.name ?? "-";
      },
    },
    {
      accessorKey: "openDate",
      header: "Opened",
      cell: ({ row }) => format(new Date(row.original.openDate), "MMM d, yyyy"),
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
            <TabsTrigger value="OPEN">Open</TabsTrigger>
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
            <TabsTrigger value="CLOSED">Closed</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Matter
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        searchKey="title"
        searchPlaceholder="Search matters..."
      />
      {formOpen && (
        <MatterForm
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditing(null);
          }}
          matter={editing}
        />
      )}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Matter"
        description="This will permanently delete this matter and all associated data."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
