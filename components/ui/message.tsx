import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Message({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <article className={cn("flex w-full gap-2", className)} {...props} />;
}

export function MessageContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-w-0 max-w-[82%]", className)} {...props} />;
}

export function MessageHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-1 flex items-center gap-2 text-[11px] text-brand-secondary", className)} {...props} />;
}

export function MessageFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-1 flex items-center gap-1 text-[10px] text-brand-secondary", className)} {...props} />;
}
