export type ChatSender = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
};

export type ChatAttachment = {
  url?: string | null;
  name?: string | null;
  type?: string | null;
  size?: number | null;
};

export type ChatMessage = ChatAttachment & {
  id: string;
  ticketId: string;
  body: string;
  createdAt: string;
  sender: ChatSender;
};

export type ChatThread = {
  id: string;
  subject: string;
  status: string;
  updatedAt: string;
  user?: { email: string; firstName?: string; lastName?: string };
  messages?: ChatMessage[];
};

export type PendingAttachment = {
  file: File;
  previewUrl?: string;
};
