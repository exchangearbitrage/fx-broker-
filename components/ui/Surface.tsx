import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Surface({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border", className)} {...props} />;
}

export function SurfaceInner({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-brand bg-brand-background/45", className)} {...props} />;
}
