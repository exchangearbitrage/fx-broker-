"use client";

import { MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatThread } from "@/components/chat/types";

type ThreadListProps = {
  threads: ChatThread[];
  activeThreadId: string | null;
  isAdmin: boolean;
  onSelect: (threadId: string) => void;
  onCreate: () => void;
};

export function ThreadList({ threads, activeThreadId, isAdmin, onSelect, onCreate }: ThreadListProps) {
  return (
    <aside className="flex min-h-0 min-w-0 flex-col border-b border-white/10 bg-brand-surface/60 md:w-64 md:shrink-0 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 p-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary">Inbox</p>
          <p className="text-xs text-brand-secondary">{isAdmin ? "Client conversations" : "Support conversations"}</p>
        </div>
        {!isAdmin ? (
          <button type="button" onClick={onCreate} className="grid h-9 w-9 place-items-center rounded-brand bg-brand-primary text-black transition-opacity hover:opacity-90" aria-label="Start a new support conversation">
            <MessageSquarePlus className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <nav aria-label="Conversation switcher" className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
        {threads.map((thread) => {
          const preview = thread.messages?.[0]?.body || thread.messages?.[0]?.name || "No messages yet";
          const client = thread.user?.firstName || thread.user?.lastName
            ? `${thread.user.firstName ?? ""} ${thread.user.lastName ?? ""}`.trim()
            : thread.user?.email;
          return (
            <button
              key={thread.id}
              type="button"
              onClick={() => onSelect(thread.id)}
              className={cn(
                "mb-1 w-full rounded-brand p-3 text-left transition-colors",
                activeThreadId === thread.id ? "bg-brand-primary/15 text-brand-text" : "text-brand-secondary hover:bg-white/5 hover:text-brand-text",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="min-w-0 break-words text-sm font-semibold">{isAdmin ? client || thread.subject : thread.subject}</span>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" aria-hidden="true" />
              </span>
              <span className="mt-1 block break-words text-xs opacity-80">{preview}</span>
            </button>
          );
        })}
        {threads.length === 0 ? <p className="p-3 text-xs text-brand-secondary">No conversations yet.</p> : null}
      </nav>
    </aside>
  );
}
