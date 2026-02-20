import { z } from "zod";

export const timeEntrySchema = z.object({
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  durationMinutes: z.number().min(1, "Duration must be at least 1 minute"),
  hourlyRate: z.number().min(0),
  billable: z.boolean(),
  matterId: z.string().optional().or(z.literal("")),
});

export type TimeEntryFormValues = z.infer<typeof timeEntrySchema>;
