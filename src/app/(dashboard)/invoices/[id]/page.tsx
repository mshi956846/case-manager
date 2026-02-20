"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  timeEntryId: string | null;
}

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string | null;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  contact: { id: string; name: string; email: string | null } | null;
  matter: { id: string; title: string } | null;
  lineItems: LineItem[];
}

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  SENT: "secondary",
  PAID: "default",
  OVERDUE: "destructive",
};

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Line item form state
  const [desc, setDesc] = useState("");
  const [qty, setQty] = useState("1");
  const [rate, setRate] = useState("0");
  const [submitting, setSubmitting] = useState(false);

  function loadInvoice() {
    fetch(`/api/invoices/${params.id}`)
      .then((r) => r.json())
      .then(setInvoice);
  }

  useEffect(() => {
    loadInvoice();
  }, [params.id]);

  async function addLineItem(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const amount = parseFloat(qty) * parseFloat(rate);
    const res = await fetch(`/api/invoices/${params.id}/line-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: desc,
        quantity: parseFloat(qty),
        rate: parseFloat(rate),
        amount,
      }),
    });

    setSubmitting(false);
    if (res.ok) {
      toast.success("Line item added");
      setDesc("");
      setQty("1");
      setRate("0");
      setAddOpen(false);
      loadInvoice();
    } else {
      toast.error("Failed to add line item");
    }
  }

  async function deleteLineItem() {
    if (!deleteItemId) return;
    setDeleting(true);

    const res = await fetch(`/api/invoices/${params.id}/line-items`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lineItemId: deleteItemId }),
    });

    setDeleting(false);
    setDeleteItemId(null);
    if (res.ok) {
      toast.success("Line item removed");
      loadInvoice();
    } else {
      toast.error("Failed to remove line item");
    }
  }

  if (!invoice) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/invoices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            Invoice {invoice.invoiceNumber}
          </h1>
          <Badge variant={statusVariant[invoice.status]}>
            {invoice.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Issue Date</span>
              <span>
                {format(new Date(invoice.issueDate), "MMM d, yyyy")}
              </span>
            </div>
            {invoice.dueDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span>
                  {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                </span>
              </div>
            )}
            {invoice.contact && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client</span>
                <Link
                  href={`/contacts/${invoice.contact.id}`}
                  className="hover:underline"
                >
                  {invoice.contact.name}
                </Link>
              </div>
            )}
            {invoice.matter && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Matter</span>
                <Link
                  href={`/matters/${invoice.matter.id}`}
                  className="hover:underline"
                >
                  {invoice.matter.title}
                </Link>
              </div>
            )}
            {invoice.notes && (
              <>
                <Separator />
                <p className="text-muted-foreground">{invoice.notes}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>${invoice.tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${invoice.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Line Items</CardTitle>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.lineItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No line items yet.
                  </TableCell>
                </TableRow>
              ) : (
                invoice.lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      ${item.rate.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeleteItemId(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {invoice.lineItems.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-bold">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${invoice.subtotal.toFixed(2)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Line Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={addLineItem} className="space-y-4">
            <div>
              <Label htmlFor="li-desc">Description</Label>
              <Input
                id="li-desc"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="li-qty">Quantity</Label>
                <Input
                  id="li-qty"
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="li-rate">Rate ($)</Label>
                <Input
                  id="li-rate"
                  type="number"
                  min={0}
                  step={0.01}
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Amount</Label>
                <div className="flex h-9 items-center text-sm font-medium">
                  ${(parseFloat(qty || "0") * parseFloat(rate || "0")).toFixed(2)}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteItemId}
        onOpenChange={(open) => !open && setDeleteItemId(null)}
        title="Remove Line Item"
        description="Remove this line item from the invoice?"
        onConfirm={deleteLineItem}
        loading={deleting}
      />
    </div>
  );
}
