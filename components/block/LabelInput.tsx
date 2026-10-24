"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

type LabelInputProps = {
  label: string;
  type?: "text" | "email" | "password";
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export function LabelInput({ label, type = "text", name, value, onChange, className = "" }: LabelInputProps) {
  const id = useId();
  const [localValue, setLocalValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const inputValue = value ?? localValue;
  const isSecret = type === "password";
  const lifted = focused || inputValue.length > 0;

  return (
    <div className={`lbi ${className}`} data-up={lifted} data-focus={focused}>
      <div className="lbi-box">
        <input
          id={id}
          name={name}
          className="lbi-field"
          type={isSecret && showSecret ? "text" : type}
          value={inputValue}
          onChange={(event) => {
            setLocalValue(event.target.value);
            onChange?.(event.target.value);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="off"
          spellCheck={false}
        />
        <label className="lbi-label" htmlFor={id}>
          {[...label].map((letter, index) => (
            <span key={`${letter}-${index}`} style={{ "--i": index } as React.CSSProperties}>
              {letter}
            </span>
          ))}
        </label>
        {isSecret ? (
          <button
            className="lbi-eye"
            type="button"
            data-show={showSecret}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => setShowSecret((showing) => !showing)}
            aria-label={showSecret ? "Hide password" : "Show password"}
          >
            <Eye size={16} strokeWidth={2} aria-hidden="true" />
            <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
