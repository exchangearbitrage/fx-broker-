import { cn } from "@/lib/utils";
export function Skeleton({ className }: { className?: string }) { return <div aria-hidden="true" className={cn("animate-pulse rounded-xl border border-white/5 bg-white/[0.04]", className)} />; }
export function SkeletonCard({ className }: { className?: string }) { return <Skeleton className={cn("h-32 p-5", className)} />; }
export function SkeletonText({ className }: { className?: string }) { return <Skeleton className={cn("h-3", className)} />; }
export function SkeletonBadge({ className }: { className?: string }) { return <Skeleton className={cn("h-6 w-20 rounded-full", className)} />; }
