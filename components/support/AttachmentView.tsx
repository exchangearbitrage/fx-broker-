"use client";

import { useState } from "react";
import { Download, FileText, X } from "lucide-react";

type AttachmentViewProps = {
  url?: string | null;
  name?: string | null;
  type?: string | null;
  size?: number | null;
};

export function AttachmentView({ url, name, type, size }: AttachmentViewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  if (!url) return null;

  const isImage = Boolean(type?.startsWith("image/"));
  const inlineUrl = `${url}${url.includes("?") ? "&" : "?"}inline=1`;
  const fileSize = size ? ` · ${(size / 1024 / 1024).toFixed(1)} MB` : "";

  if (!isImage) {
    return (
      <a
        href={url}
        className="mt-2 flex max-w-[320px] items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 text-xs text-brand-text transition-colors hover:bg-white/10"
      >
        <FileText className="h-4 w-4 shrink-0 text-brand-primary" />
        <span className="truncate">{name ?? "Document"}{fileSize}</span>
        <Download className="ml-auto h-4 w-4 shrink-0" />
      </a>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setIsPreviewOpen(true)} className="mt-2 block">
        <img
          src={inlineUrl}
          alt={name ?? "Attachment"}
          className="max-h-[200px] max-w-[280px] rounded-xl border border-white/10 object-cover transition-opacity hover:opacity-90"
        />
      </button>
      {isPreviewOpen ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/90 p-5" role="dialog" aria-modal="true" aria-label="Image preview">
          <button type="button" onClick={() => setIsPreviewOpen(false)} className="absolute right-5 top-5 rounded-full p-2 text-white hover:bg-white/10" aria-label="Close image preview">
            <X />
          </button>
          <img src={inlineUrl} alt={name ?? "Attachment"} className="max-h-[82vh] max-w-full rounded-xl" />
          <a href={url} className="absolute bottom-5 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-black">
            Download
          </a>
        </div>
      ) : null}
    </>
  );
}
