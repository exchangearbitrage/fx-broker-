"use client";

import { useEffect, useState } from "react";

const key = "cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem(key) !== "accepted");
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-4xl rounded-brand border border-white/10 bg-brand-surface p-4 shadow-2xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-brand-secondary">
          This site uses essential cookies for sessions, security, preferences, and demo trading state.
        </p>
        <button
          type="button"
          className="rounded-brand bg-brand-primary px-4 py-2 text-sm font-semibold text-black"
          onClick={() => {
            window.localStorage.setItem(key, "accepted");
            setVisible(false);
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
