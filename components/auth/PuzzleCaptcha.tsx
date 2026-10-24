"use client";

import { useCallback, useEffect, useState } from "react";

type PuzzleCaptchaProps = {
  onSolved: (challengeId: string, answer: number | null) => void;
};

export function PuzzleCaptcha({ onSolved }: PuzzleCaptchaProps) {
  const [challenge, setChallenge] = useState<{ id: string; question: string } | null>(null);
  const [value, setValue] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadChallenge = useCallback(() => {
    setChallenge(null);
    setValue("");
    setLoadError(null);
    onSolved("", null);
    fetch("/api/auth/challenge", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => null) as { id?: string; question?: string; error?: string } | null;
        if (!response.ok || !data?.id || !data.question) throw new Error(data?.error ?? "We couldn’t load the verification question. Please try again.");
        setChallenge({ id: data.id, question: data.question });
      })
      .catch((error: unknown) => {
        setLoadError(error instanceof Error ? error.message : "We couldn’t load the verification question. Please try again.");
      });
  }, [onSolved]);

  useEffect(() => {
    loadChallenge();
  }, [loadChallenge]); // The challenge is intentionally created once per form visit.

  useEffect(() => {
    const answer = Number(value);
    if (challenge) onSolved(challenge.id, Number.isInteger(answer) && value.trim() !== "" ? answer : null);
  }, [challenge, onSolved, value]);

  return (
    <div className="rounded-brand border border-brand-primary/15 bg-brand-surface p-4 shadow-border">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium">Human verification</span>
        <span className="text-brand-secondary">{challenge ? "Solve the quick math check" : loadError ? "Needs attention" : "Loading..."}</span>
      </div>
      <div className="flex items-center gap-3 rounded-brand bg-brand-background/70 p-3">
        <span className="rounded-[calc(var(--radius-brand)-2px)] bg-brand-primary/15 px-3 py-2 font-mono text-lg font-semibold text-brand-primary">
          {challenge ? `${challenge.question} =` : "…"}
        </span>
        <input
        aria-label="Math answer"
        inputMode="numeric"
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Answer"
        disabled={!challenge}
        className="min-h-10 w-full rounded-brand border border-white/10 bg-brand-surface px-3 text-sm text-brand-text outline-none transition-colors placeholder:text-brand-secondary/70 focus:border-brand-primary disabled:opacity-50"
      />
      </div>
      {loadError ? <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-brand border border-brand-danger/30 bg-brand-danger/10 p-3 text-xs text-brand-danger" role="alert"><span>{loadError}</span><button type="button" onClick={loadChallenge} className="rounded-md border border-current px-2.5 py-1 font-semibold">Try again</button></div> : null}
    </div>
  );
}
