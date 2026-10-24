"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";

type AttachmentPickerProps = {
  name: string;
  disabled?: boolean;
  compact?: boolean;
};

export function AttachmentPicker({ name, disabled = false, compact = false }: AttachmentPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const captureFile = (file?: File) => setFileName(file?.name ?? "");
  const onChange = (event: ChangeEvent<HTMLInputElement>) => captureFile(event.target.files?.[0]);
  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (!file || !inputRef.current) return;
    const files = new DataTransfer();
    files.items.add(file);
    inputRef.current.files = files.files;
    captureFile(file);
  };

  const clear = () => {
    if (inputRef.current) inputRef.current.value = "";
    setFileName("");
  };

  return (
    <label
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      className={`flex cursor-pointer items-center gap-2 rounded-xl border border-dashed text-xs text-brand-secondary transition-colors hover:border-brand-primary/60 hover:bg-brand-primary/5 ${isDragging ? "border-brand-primary bg-brand-primary/10" : "border-white/15 bg-white/[0.03]"} ${compact ? "min-h-10 px-3" : "min-h-20 px-4"}`}
    >
      <input ref={inputRef} name={name} type="file" accept="image/*,.pdf,.doc,.docx,.txt" onChange={onChange} disabled={disabled} className="sr-only" />
      <Paperclip className="h-4 w-4 shrink-0 text-brand-primary" />
      <span className="min-w-0 flex-1 truncate">{fileName || (isDragging ? "Drop file to attach" : "Drop a file or click to attach")}</span>
      {fileName ? (
        <button type="button" onClick={(event) => { event.preventDefault(); clear(); }} className="rounded p-1 hover:bg-white/10" aria-label="Remove attachment">
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </label>
  );
}
