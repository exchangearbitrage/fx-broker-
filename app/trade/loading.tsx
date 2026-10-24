import { Skeleton } from "@/components/ui/Skeleton";
export default function TradeLoading() { return <div className="mx-auto max-w-7xl space-y-6 p-6"><Skeleton className="h-16 w-1/3" /><div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><Skeleton className="h-96" /><Skeleton className="h-96" /></div></div>; }
