"use client";

import { memo, useMemo } from "react";
import { CheckCheck, ChevronUp, LoaderCircle } from "lucide-react";
import { MessageScroller } from "@shadcn/react/message-scroller";
import { Attachment } from "@/components/ui/attachment";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Marker, MarkerContent } from "@/components/ui/marker";
import { Message, MessageContent, MessageFooter, MessageHeader } from "@/components/ui/message";
import { AttachmentView } from "@/components/support/AttachmentView";
import { MessageInput } from "@/components/chat/MessageInput";
import type { ChatMessage, ChatThread } from "@/components/chat/types";

type MessageThreadProps = {
  thread: ChatThread | null;
  messages: ChatMessage[];
  isAdmin: boolean;
  isLoading: boolean;
  hasMore: boolean;
  onLoadOlder: () => void;
  onSend: (body: string, attachment: File | null) => Promise<void>;
};

function dateLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

const ThreadMessageRow = memo(function ThreadMessageRow({ message, showDate, isAdmin }: { message: ChatMessage; showDate: boolean; isAdmin: boolean }) {
  const isSent = isAdmin ? message.sender.role === "ADMIN" : message.sender.role !== "ADMIN";
  const senderName = isSent ? "You" : isAdmin ? `${message.sender.firstName} ${message.sender.lastName}`.trim() || "Client" : "Support";
  return (
    <MessageScroller.Item messageId={message.id} scrollAnchor={isSent}>
      {showDate ? <Marker><span className="h-px flex-1 bg-white/10" /><MarkerContent>{dateLabel(message.createdAt)}</MarkerContent><span className="h-px flex-1 bg-white/10" /></Marker> : null}
      <Message className={isSent ? "justify-end" : "justify-start"}>
        <MessageContent className={isSent ? "items-end" : "items-start"}>
          <MessageHeader className={isSent ? "justify-end" : "justify-start"}>{senderName}</MessageHeader>
          <Bubble className={`max-w-full break-words ${isSent ? "bg-brand-primary text-black" : "bg-brand-surface text-brand-text shadow-border"}`}>
            {message.body ? <BubbleContent><span className="break-words [overflow-wrap:anywhere]">{message.body}</span></BubbleContent> : null}
            {message.url ? <Attachment><AttachmentView url={message.url} name={message.name} type={message.type} size={message.size} /></Attachment> : null}
          </Bubble>
          <MessageFooter className={isSent ? "justify-end" : "justify-start"}>
            <time>{new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time>
            {isSent ? <CheckCheck className="h-3.5 w-3.5 text-brand-primary" aria-label="Delivered" /> : null}
          </MessageFooter>
        </MessageContent>
      </Message>
    </MessageScroller.Item>
  );
});

export function MessageThread({ thread, messages, isAdmin, isLoading, hasMore, onLoadOlder, onSend }: MessageThreadProps) {
  const items = useMemo(() => messages.map((message, index) => ({
    message,
    showDate: index === 0 || dateLabel(message.createdAt) !== dateLabel(messages[index - 1].createdAt),
  })), [messages]);

  if (!thread) {
    return <div className="grid min-h-[520px] min-w-0 flex-1 place-items-center p-8 text-center text-sm text-brand-secondary">Choose a conversation to open its message history.</div>;
  }

  return (
    <section className="flex min-h-[520px] min-w-0 flex-1 flex-col bg-brand-background/35">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-brand-surface/50 px-5 py-4">
        <div className="min-w-0">
          <p className="break-words font-heading text-lg font-semibold [overflow-wrap:anywhere]">{isAdmin ? thread.user?.email ?? thread.subject : thread.subject}</p>
          <p className="text-xs text-brand-secondary">{thread.status.toLowerCase()} · Live updates enabled</p>
        </div>
        <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-primary">{thread.status}</span>
      </header>

      <MessageScroller.Provider autoScroll defaultScrollPosition="end">
        <MessageScroller.Root className="relative flex h-full min-h-0 flex-1">
          <MessageScroller.Viewport preserveScrollOnPrepend className="custom-scrollbar h-full overflow-y-auto px-4 py-3" aria-label={`Messages in ${thread.subject}`}>
            <MessageScroller.Content className="mx-auto flex w-full max-w-3xl flex-col gap-3">
              {hasMore ? (
                <button type="button" onClick={onLoadOlder} className="mx-auto inline-flex items-center gap-2 rounded-brand px-3 py-2 text-xs text-brand-secondary hover:bg-white/5 hover:text-brand-text">
                  <ChevronUp className="h-4 w-4" /> Load older messages
                </button>
              ) : null}
              {items.map(({ message, showDate }) => <ThreadMessageRow key={message.id} message={message} showDate={showDate} isAdmin={isAdmin} />)}
              {isLoading ? <Marker><LoaderCircle className="h-3.5 w-3.5 animate-spin" /><MarkerContent>Loading messages</MarkerContent></Marker> : null}
            </MessageScroller.Content>
          </MessageScroller.Viewport>
        </MessageScroller.Root>
      </MessageScroller.Provider>
      <MessageInput onSend={onSend} disabled={isLoading} />
    </section>
  );
}
