import { z } from "zod";

export const documentWizardSchema = z.object({
  category: z.enum(["motion", "brief", "appeal"]),
  documentTypeId: z.string().min(1, "Document type is required"),
  county: z.string().min(1, "County is required"),
  court: z.string().min(1, "Court is required"),
  causeNumber: z.string().optional().or(z.literal("")),
  plaintiffName: z.string().min(1, "Plaintiff name is required"),
  plaintiffRole: z.string().min(1),
  defendantName: z.string().min(1, "Defendant name is required"),
  defendantRole: z.string().min(1),
  matterId: z.string().optional().or(z.literal("")),
});

export type DocumentWizardValues = z.infer<typeof documentWizardSchema>;
