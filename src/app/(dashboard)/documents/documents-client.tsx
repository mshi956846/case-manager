"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Document } from "@prisma/client";
import { MoreHorizontal, Plus, FileDown, Eye, Pencil, Trash2, Download, FileText, FileEdit, RefreshCw, Wand2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const [converting, setConverting] = useState<string | null>(null);

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

  async function handleExport(id: string, fmt: "docx" | "pdf") {
    try {
      const res = await fetch(`/api/documents/${id}/export-${fmt}`, {
        method: "POST",
      });
      if (!res.ok) {
        toast.error(`Failed to export ${fmt.toUpperCase()}`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = res.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || `document.${fmt}`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${fmt.toUpperCase()} exported`);
    } catch {
      toast.error("Export failed. Please try again.");
    }
  }

  function handleDownload(id: string) {
    window.open(`/api/documents/${id}/download`, "_blank");
  }

  async function handleConvert(id: string) {
    setConverting(id);
    try {
      const res = await fetch(`/api/documents/${id}/convert`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        toast.success("Document converted to editable format");
        router.refresh();
        // Navigate to the new editable document
        router.push(`/documents/${data.id}/edit`);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to convert document");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setConverting(null);
    }
  }

  const columns: ColumnDef<DocumentWithMatter>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const doc = row.original;
        const isWP = doc.documentType === "WORD_PROCESSOR";
        return (
          <div className="flex items-center gap-2">
            {isWP ? (
              <FileEdit className="h-4 w-4 text-blue-500 shrink-0" />
            ) : (
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            {isWP ? (
              <Link
                href={`/documents/${doc.id}`}
                className="font-medium hover:underline"
              >
                {doc.name}
              </Link>
            ) : (
              <button
                onClick={() => handleDownload(doc.id)}
                className="font-medium hover:underline text-left"
              >
                {doc.name}
              </button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "documentType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.original.documentType === "WORD_PROCESSOR" ? "Draft" : row.original.mimeType === "application/pdf" ? "PDF" : "File"}
        </Badge>
      ),
    },
    {
      accessorKey: "matter",
      header: "Case",
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
        format(new Date(row.original.updatedAt), "MMM d, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const doc = row.original;
        const isWP = doc.documentType === "WORD_PROCESSOR";
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isWP ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/documents/${doc.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/documents/${doc.id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport(doc.id, "docx")}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export DOCX
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport(doc.id, "pdf")}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export PDF
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => handleDownload(doc.id)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  {doc.mimeType === "application/pdf" && (
                    <DropdownMenuItem
                      onClick={() => handleConvert(doc.id)}
                      disabled={converting === doc.id}
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${converting === doc.id ? "animate-spin" : ""}`} />
                      {converting === doc.id ? "Converting..." : "Convert to Editable"}
                    </DropdownMenuItem>
                  )}
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteId(doc.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/documents/new">
            <Wand2 className="mr-2 h-4 w-4" />
            Build from Template
          </Link>
        </Button>
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
