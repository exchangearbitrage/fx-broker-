import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Attachment({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-2", className)} {...props} />;
}

export function AttachmentPreview({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]", className)} {...props} />;
}
