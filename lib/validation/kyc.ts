import { z } from "zod";

export const kycSchema = z.object({
  country: z.string().min(2).max(8),
  idNumber: z.string().min(3).max(80),
  documentType: z.string().min(2).max(120),
});
