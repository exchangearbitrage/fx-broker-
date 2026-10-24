"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { MessageThread } from "@/components/chat/MessageThread";
import { ThreadList } from "@/components/chat/ThreadList";
import type { ChatMessage, ChatThread } from "@/components/chat/types";
import { useLiveChat } from "@/lib/hooks/useLiveChat";

type ChatInboxProps = { isAdmin?: boolean };
type ThreadResponse = { ticket: ChatThread; messages: ChatMessage[]; hasMore: boolean };
type UploadResponse = { attachmentId: string };

async function uploadAttachment(file: File | null) {
  if (!file) return null;
  const formData = new FormData();
  formData.set("file", file);
  const response = await fetch("/api/support/upload", { method: "POST", body: formData });
  if (!response.ok) throw new Error("upload_failed");
  return response.json() as Promise<UploadResponse>;
}

export function ChatInbox({ isAdmin = false }: ChatInboxProps) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const loadThreads = useCallback(async () => {
    const response = await fetch("/api/support/tickets", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as { tickets: ChatThread[] };
    setThreads(data.tickets);
    setActiveThreadId((current) => current && data.tickets.some((thread) => thread.id === current) ? current : data.tickets[0]?.id ?? null);
  }, []);

  const loadThread = useCallback(async (ticketId: string, before?: string, prepend = false) => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({ ticketId, limit: "50" });
      if (before) query.set("before", before);
      const response = await fetch(`/api/support/tickets?${query}`, { cache: "no-store" });
      if (!response.ok) throw new Error("thread_failed");
      const data = (await response.json()) as ThreadResponse;
      setActiveThread(data.ticket);
      setHasMore(data.hasMore);
      setMessages((current) => prepend ? [...data.messages, ...current] : data.messages);
    } catch {
      setNotice("We couldn’t load this conversation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadThreads(); }, [loadThreads]);
  useEffect(() => { if (activeThreadId) void loadThread(activeThreadId); else { setActiveThread(null); setMessages([]); } }, [activeThreadId, loadThread]);

  const onIncomingMessage = useCallback((incoming: ChatMessage) => {
    void loadThreads();
    if (incoming.ticketId !== activeThreadId) return;
    setMessages((current) => current.some((message) => message.id === incoming.id) ? current : [...current, incoming]);
  }, [activeThreadId, loadThreads]);

  useLiveChat(activeThreadId, onIncomingMessage, () => {
    void loadThreads();
    if (activeThreadId) void loadThread(activeThreadId);
  });

  async function sendMessage(body: string, file: File | null) {
    if (!activeThreadId) return;
    setNotice("");
    try {
      const attachment = await uploadAttachment(file);
      const response = await fetch(`/api/support/tickets/${activeThreadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: body, ...(attachment ?? {}) }),
      });
      if (!response.ok) throw new Error("message_failed");
      await Promise.all([loadThread(activeThreadId), loadThreads()]);
    } catch {
      setNotice("We couldn’t send that message. Please try again.");
      throw new Error("message_failed");
    }
  }

  async function loadOlder() {
    if (!activeThreadId || messages.length === 0 || !hasMore) return;
    await loadThread(activeThreadId, messages[0].createdAt, true);
  }

  async function createThread(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setNotice("");
    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: formData.get("subject"), message: formData.get("message") }),
      });
      const data = (await response.json().catch(() => null)) as { ticket?: ChatThread } | null;
      if (!response.ok || !data?.ticket) throw new Error("create_failed");
      setIsComposerOpen(false);
      await loadThreads();
      setActiveThreadId(data.ticket.id);
    } catch {
      setNotice("We couldn’t create that conversation. Please try again.");
    }
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-[calc(var(--radius-brand)+10px)] border border-white/10 bg-brand-surface shadow-border">
      <div className="flex min-h-[640px] min-w-0 flex-col md:flex-row">
        <div className={activeThreadId ? "hidden min-w-0 md:block" : "min-w-0"}><ThreadList threads={threads} activeThreadId={activeThreadId} isAdmin={isAdmin} onSelect={setActiveThreadId} onCreate={() => setIsComposerOpen(true)} /></div>
        <div className={activeThreadId ? "min-w-0 flex-1" : "hidden min-w-0 flex-1 md:block"}>{activeThreadId ? <button type="button" onClick={() => setActiveThreadId(null)} className="flex w-full items-center gap-2 border-b border-white/10 px-4 py-3 text-sm font-semibold text-brand-primary md:hidden"><ArrowLeft className="h-4 w-4" />Back to conversations</button> : null}<MessageThread thread={activeThread} messages={messages} isAdmin={isAdmin} isLoading={isLoading} hasMore={hasMore} onLoadOlder={() => void loadOlder()} onSend={sendMessage} /></div>
      </div>
      {notice ? <p className="border-t border-white/10 bg-brand-danger/10 px-4 py-3 text-sm text-brand-text" role="status">{notice}</p> : null}
      {isComposerOpen ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Start support conversation">
          <form onSubmit={createThread} className="w-full max-w-lg rounded-[calc(var(--radius-brand)+8px)] bg-brand-surface p-5 shadow-border">
            <div className="flex items-center justify-between gap-3"><h2 className="font-heading text-xl font-semibold">Start a conversation</h2><button type="button" onClick={() => setIsComposerOpen(false)} className="rounded p-2 text-brand-secondary hover:bg-white/5" aria-label="Close"><X className="h-4 w-4" /></button></div>
            <input name="subject" required placeholder="Subject" className="mt-5 min-h-11 w-full rounded-brand border border-white/10 bg-brand-background/45 px-4 text-sm outline-none focus:border-brand-primary" />
            <textarea name="message" required rows={5} placeholder="How can we help?" className="mt-3 w-full rounded-brand border border-white/10 bg-brand-background/45 px-4 py-3 text-sm outline-none focus:border-brand-primary" />
            <button type="submit" className="mt-4 rounded-brand bg-brand-primary px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90">Create conversation</button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
