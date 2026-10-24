import { ChatInbox } from "@/components/chat/ChatInbox";

export function AdminSupportThreads({ view: _view = "messages" }: { view?: "messages" | "tickets" }) {
  return <ChatInbox isAdmin />;
}
