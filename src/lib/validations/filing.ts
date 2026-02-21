import { z } from "zod";

const FILING_STATUSES = ["DRAFT", "READY", "SUBMITTED", "ACCEPTED", "REJECTED", "RETURNED"] as const;
const FILING_TYPES = ["INITIAL", "SUBSEQUENT", "SERVICE_ONLY"] as const;
const SERVICE_METHODS = ["E_SERVICE", "MAIL", "PERSONAL", "PUBLICATION"] as const;
const SERVICE_STATUSES = ["PENDING", "SERVED", "FAILED"] as const;
const DOCUMENT_ROLES = ["LEAD", "ATTACHMENT", "PROPOSED_ORDER"] as const;

export const createFilingSchema = z.object({
  filingType: z.enum(FILING_TYPES),
  county: z.string().min(1, "County is required"),
  court: z.string().min(1, "Court is required"),
  division: z.string().optional().or(z.literal("")),
  judge: z.string().optional().or(z.literal("")),
  causeNumber: z.string().optional().or(z.literal("")),
  filingParty: z.string().min(1, "Filing party is required"),
  filingCode: z.string().optional().or(z.literal("")),
  feeAmount: z.number().min(0).optional(),
  feeWaived: z.boolean().optional(),
  notes: z.string().optional().or(z.literal("")),
  matterId: z.string().optional().or(z.literal("")),
});

export const updateFilingSchema = z.object({
  status: z.enum(FILING_STATUSES).optional(),
  filingType: z.enum(FILING_TYPES).optional(),
  county: z.string().min(1).optional(),
  court: z.string().min(1).optional(),
  division: z.string().optional().or(z.literal("")),
  judge: z.string().optional().or(z.literal("")),
  causeNumber: z.string().optional().or(z.literal("")),
  filingParty: z.string().min(1).optional(),
  envelopeNumber: z.string().optional().or(z.literal("")),
  filingCode: z.string().optional().or(z.literal("")),
  feeAmount: z.number().min(0).optional(),
  feeWaived: z.boolean().optional(),
  notes: z.string().optional().or(z.literal("")),
  matterId: z.string().optional().or(z.literal("")),
  submittedAt: z.string().optional().or(z.literal("")),
  acceptedAt: z.string().optional().or(z.literal("")),
  rejectedAt: z.string().optional().or(z.literal("")),
  rejectionReason: z.string().optional().or(z.literal("")),
  returnReason: z.string().optional().or(z.literal("")),
});

export const filingDocumentSchema = z.object({
  documentId: z.string().min(1, "Document is required"),
  role: z.enum(DOCUMENT_ROLES),
  filingCode: z.string().optional().or(z.literal("")),
  sortOrder: z.number().int().min(0).optional(),
});

export const serviceRecordSchema = z.object({
  method: z.enum(SERVICE_METHODS),
  partyName: z.string().min(1, "Party name is required"),
  partyEmail: z.string().optional().or(z.literal("")),
  partyAddress: z.string().optional().or(z.literal("")),
  partyRole: z.string().optional().or(z.literal("")),
  serviceDate: z.string().optional().or(z.literal("")),
  filingId: z.string().min(1, "Filing is required"),
});

export type CreateFilingValues = z.infer<typeof createFilingSchema>;
export type UpdateFilingValues = z.infer<typeof updateFilingSchema>;
export type FilingDocumentValues = z.infer<typeof filingDocumentSchema>;
export type ServiceRecordValues = z.infer<typeof serviceRecordSchema>;
