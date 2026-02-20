import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  type: z.enum(["CLIENT", "OPPOSING_PARTY", "WITNESS", "JUDGE", "OTHER"]),
  company: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
