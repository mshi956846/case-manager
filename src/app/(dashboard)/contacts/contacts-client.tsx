"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Contact, ContactType } from "@prisma/client";
import { ExternalLink, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ContactForm } from "./contact-form";

type ContactWithCount = Contact & { _count: { matters: number } };

const typeConfig: Record<ContactType, { label: string; class: string }> = {
  CLIENT: { label: "Client", class: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300" },
  OPPOSING_PARTY: { label: "Opposing Party", class: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300" },
  WITNESS: { label: "Witness", class: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300" },
  JUDGE: { label: "Judge", class: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300" },
  OTHER: { label: "Other", class: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/40 dark:text-gray-300" },
};

export function ContactsClient({
  contacts,
}: {
  contacts: ContactWithCount[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [lookupFirst, setLookupFirst] = useState("");
  const [lookupLast, setLookupLast] = useState("");

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/contacts/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Contact deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete contact");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  const columns: ColumnDef<ContactWithCount>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link
          href={`/contacts/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${typeConfig[row.original.type].class}`}>{typeConfig[row.original.type].label}</span>
      ),
    },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "company", header: "Company" },
    {
      id: "matters",
      header: "Cases",
      cell: ({ row }) => row.original._count.matters,
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
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Indiana Attorney Lookup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="lookup-last">Last Name</Label>
              <Input
                id="lookup-last"
                placeholder="e.g. Koch"
                value={lookupLast}
                onChange={(e) => setLookupLast(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lookup-first">First Name</Label>
              <Input
                id="lookup-first"
                placeholder="e.g. Glen"
                value={lookupFirst}
                onChange={(e) => setLookupFirst(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              disabled={!lookupLast.trim()}
              onClick={() => {
                const params = new URLSearchParams();
                params.set("LastName", lookupLast.trim());
                if (lookupFirst.trim()) params.set("FirstName", lookupFirst.trim());
                window.open(
                  `https://courtapps.in.gov/rollofattorneys/Search/RefineSearch?${params.toString()}`,
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Search Roll of Attorneys
            </Button>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            Opens the Indiana Supreme Court Roll of Attorneys in a new tab.
          </p>
        </CardContent>
      </Card>
      <DataTable
        columns={columns}
        data={contacts}
        searchKey="name"
        searchPlaceholder="Search contacts..."
      />
      <ContactForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        contact={editing}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Contact"
        description="This will permanently delete this contact and remove them from all cases."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
