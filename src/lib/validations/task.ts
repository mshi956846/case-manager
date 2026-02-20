import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  matterId: z.string().optional().or(z.literal("")),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
