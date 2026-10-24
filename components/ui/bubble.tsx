import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Bubble({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[var(--radius-brand)] px-3 py-2.5 text-sm leading-6", className)} {...props} />;
}

export function BubbleContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("whitespace-pre-wrap break-words", className)} {...props} />;
}
