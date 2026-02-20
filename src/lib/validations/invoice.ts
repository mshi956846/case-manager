import { z } from "zod";

export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE"]),
  issueDate: z.string().optional(),
  dueDate: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  contactId: z.string().optional().or(z.literal("")),
  matterId: z.string().optional().or(z.literal("")),
});

export const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01),
  rate: z.number().min(0),
  amount: z.number(),
  timeEntryId: z.string().optional().or(z.literal("")),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
export type LineItemFormValues = z.infer<typeof lineItemSchema>;
