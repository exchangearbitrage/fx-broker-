import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required.").max(100),
  email: z.string().email("Enter a valid email address.").max(160),
  subject: z.string().min(3, "Subject is required.").max(160),
  message: z.string().min(10, "Message must be at least 10 characters.").max(5000),
  company: z.string().optional().default(""),
});
