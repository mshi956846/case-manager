"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Document } from "@prisma/client";
import { MoreHorizontal, Plus, FileDown, Eye, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DocumentForm } from "./document-form";

type DocumentWithMatter = Document & {
  matter: { id: string; title: string; caseNumber: string | null } | null;
};

export function DocumentsClient({
  documents,
}: {
  documents: DocumentWithMatter[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Document deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete document");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  async function handleExport(id: string, format: "docx" | "pdf") {
    try {
      const res = await fetch(`/api/documents/${id}/export-${format}`, {
        method: "POST",
      });
      if (!res.ok) {
        toast.error(`Failed to export ${format.toUpperCase()}`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = res.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || `document.${format}`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} exported`);
    } catch {
      toast.error("Export failed. Please try again.");
    }
  }

  const columns: ColumnDef<DocumentWithMatter>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link
          href={`/documents/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "matter",
      header: "Matter",
      cell: ({ row }) =>
        row.original.matter ? (
          <Link
            href={`/matters/${row.original.matter.id}`}
            className="text-sm hover:underline"
          >
            {row.original.matter.title}
          </Link>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: "updatedAt",
      header: "Last Modified",
      cell: ({ row }) =>
        format(new Date(row.original.updatedAt), "MMM d, yyyy h:mm a"),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), "MMM d, yyyy"),
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
              <Link href={`/documents/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/documents/${row.original.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport(row.original.id, "docx")}>
              <FileDown className="mr-2 h-4 w-4" />
              Export DOCX
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport(row.original.id, "pdf")}>
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteId(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Document
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={documents}
        searchKey="name"
        searchPlaceholder="Search documents..."
      />
      <DocumentForm
        open={formOpen}
        onOpenChange={setFormOpen}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Document"
        description="This will permanently delete this document. This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
