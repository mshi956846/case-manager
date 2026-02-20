import { z } from "zod";

export const matterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  caseNumber: z.string().optional().or(z.literal("")),
  status: z.enum(["OPEN", "PENDING", "CLOSED"]),
  practiceArea: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  openDate: z.string().optional(),
  closeDate: z.string().optional().or(z.literal("")),
  statuteOfLimitations: z.string().optional().or(z.literal("")),
});

export type MatterFormValues = z.infer<typeof matterSchema>;
