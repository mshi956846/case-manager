import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().or(z.literal("")),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().or(z.literal("")),
  allDay: z.boolean(),
  type: z.enum(["HEARING", "DEADLINE", "MEETING", "REMINDER"]),
  matterId: z.string().optional().or(z.literal("")),
});

export type EventFormValues = z.infer<typeof eventSchema>;
