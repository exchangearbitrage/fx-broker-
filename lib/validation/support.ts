import { z } from "zod";

export const supportTicketSchema = z.object({
  subject: z.string().min(3).max(160),
  message: z.string().min(3).max(4000),
});

export const supportMessageSchema = z.object({
  message: z.string().max(4000).default(""),
  attachmentId: z.string().cuid().optional(),
  attachmentName: z.string().max(255).optional(),
  attachmentType: z.string().max(120).optional(),
  attachmentSize: z.number().int().max(10 * 1024 * 1024).optional(),
}).refine(
  (message) => Boolean(message.message.trim() || message.attachmentId),
  { message: "Write a message or attach a file." },
);
