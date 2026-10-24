"use client";

import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Paperclip, Send, X } from "lucide-react";
import { Attachment, AttachmentPreview } from "@/components/ui/attachment";
import type { PendingAttachment } from "@/components/chat/types";

type MessageInputProps = {
  disabled?: boolean;
  onSend: (body: string, attachment: File | null) => Promise<void>;
};

export function MessageInput({ disabled = false, onSend }: MessageInputProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [attachment, setAttachment] = useState<PendingAttachment | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => () => { if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl); }, [attachment]);

  function stageFile(file?: File) {
    if (!file) return;
    if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    setAttachment({ file, previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined });
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    stageFile(event.target.files?.[0]);
  }

  async function submit() {
    if (isSending || (!body.trim() && !attachment)) return;
    setIsSending(true);
    try {
      await onSend(body.trim(), attachment?.file ?? null);
      if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
      setBody("");
      setAttachment(null);
      if (fileInput.current) fileInput.current.value = "";
    } finally {
      setIsSending(false);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <div className="border-t border-white/10 bg-brand-surface p-3">
      {attachment ? (
        <Attachment>
          <AttachmentPreview className="mb-2 flex max-w-xs items-center gap-2 p-2 text-xs text-brand-secondary">
            {attachment.previewUrl ? <img src={attachment.previewUrl} alt="Attachment preview" className="h-10 w-10 rounded-lg object-cover" /> : <Paperclip className="h-4 w-4 text-brand-primary" />}
            <span className="min-w-0 flex-1 truncate">{attachment.file.name}</span>
            <button type="button" onClick={() => setAttachment(null)} className="rounded p-1 hover:bg-white/10" aria-label="Remove attachment"><X className="h-4 w-4" /></button>
          </AttachmentPreview>
        </Attachment>
      ) : null}
      <div className="flex items-end gap-2 rounded-brand border border-white/10 bg-brand-background/45 p-2 focus-within:border-brand-primary/70">
        <input ref={fileInput} type="file" accept="image/*,.pdf,.doc,.docx,.txt" className="sr-only" onChange={onFileChange} />
        <button type="button" onClick={() => fileInput.current?.click()} disabled={disabled || isSending} className="grid h-9 w-9 shrink-0 place-items-center rounded-brand text-brand-secondary transition-colors hover:bg-white/5 hover:text-brand-primary disabled:opacity-50" aria-label="Attach file">
          <Paperclip className="h-4 w-4" />
        </button>
        <textarea value={body} onChange={(event) => setBody(event.target.value)} onKeyDown={onKeyDown} disabled={disabled || isSending} rows={1} placeholder="Write a reply…" className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm outline-none placeholder:text-brand-secondary disabled:opacity-50" />
        <button type="button" onClick={() => void submit()} disabled={disabled || isSending || (!body.trim() && !attachment)} className="grid h-9 w-9 shrink-0 place-items-center rounded-brand bg-brand-primary text-black transition-opacity hover:opacity-90 disabled:opacity-40" aria-label="Send message">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
