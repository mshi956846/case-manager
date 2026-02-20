import { z } from "zod";

export const createDocumentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  matterId: z.string().optional().or(z.literal("")),
});

export type CreateDocumentValues = z.infer<typeof createDocumentSchema>;

export const updateDocumentSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  content: z.any().optional(),
  matterId: z.string().optional().or(z.literal("")),
});

export type UpdateDocumentValues = z.infer<typeof updateDocumentSchema>;
