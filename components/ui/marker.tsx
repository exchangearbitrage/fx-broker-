import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Marker({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-3 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-brand-secondary", className)} {...props} />;
}

export function MarkerContent({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("shrink-0", className)} {...props} />;
}
