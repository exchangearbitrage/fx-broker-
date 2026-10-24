"use client";

import { useEffect } from "react";
import type { ChatMessage } from "@/components/chat/types";

export function useLiveChat(
  ticketId: string | null,
  onMessage: (message: ChatMessage) => void,
  onFallback: () => void,
) {
  useEffect(() => {
    const query = ticketId ? `?ticketId=${encodeURIComponent(ticketId)}` : "";
    let source: EventSource | null = new EventSource(`/api/support/stream${query}`);
    let fallback: number | undefined;

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as { type?: string; message?: ChatMessage };
        if (payload.type === "NEW_MESSAGE" && payload.message) onMessage(payload.message);
      } catch {
        // Ignore malformed events; the next successful event or poll resynchronizes the UI.
      }
    };

    source.onerror = () => {
      source?.close();
      source = null;
      fallback = window.setInterval(onFallback, 2_500);
    };

    return () => {
      source?.close();
      if (fallback) window.clearInterval(fallback);
    };
  }, [ticketId, onMessage, onFallback]);
}
