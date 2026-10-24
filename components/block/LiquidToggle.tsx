"use client";

import { animate, motion, useMotionValue, useSpring, useTransform, useVelocity } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

const TRACK = 92;
const THUMB = 36;
const PAD = 5;
const SHUT_X = PAD;
const OPEN_X = TRACK - THUMB - PAD;
const MID_X = (SHUT_X + OPEN_X) / 2;

type LiquidToggleProps = {
  label?: string;
  checkedLabel?: string;
  uncheckedLabel?: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
};

export function LiquidToggle({
  label = "Execution mode",
  checkedLabel = "Live",
  uncheckedLabel = "Demo",
  defaultChecked = false,
  onChange,
}: LiquidToggleProps) {
  const [on, setOn] = useState(defaultChecked);
  const [held, setHeld] = useState(false);
  const [hot, setHot] = useState(false);
  const rail = useRef<HTMLButtonElement | null>(null);
  const grip = useRef<{ id: number; grab: number | null; moved: boolean } | null>(null);
  const x = useMotionValue(defaultChecked ? OPEN_X : SHUT_X);
  const vel = useVelocity(x);
  const eased = useSpring(vel, { stiffness: 320, damping: 40, mass: 0.6 });
  const swell = useSpring(hot ? 1.035 : 1, { stiffness: 520, damping: 34, mass: 0.6 });
  const wide = useTransform([eased, swell], ([v, s]: number[]) => (1 + Math.min(0.32, Math.abs(v) / 650)) * s);
  const tall = useTransform([eased, swell], ([v, s]: number[]) => s / (1 + Math.min(0.32, Math.abs(v) / 650)));

  const settle = useMemo(() => ({ type: "spring" as const, stiffness: 170, damping: 21.5, mass: 0.9 }), []);

  useEffect(() => {
    if (held) return;
    const run = animate(x, on ? OPEN_X : SHUT_X, settle);
    onChange?.(on);
    return () => run.stop();
  }, [held, on, onChange, settle, x]);

  function local(clientX: number) {
    const el = rail.current;
    if (!el) return 0;
    const bounds = el.getBoundingClientRect();
    const scale = bounds.width / (el.offsetWidth || bounds.width) || 1;
    return (clientX - bounds.left) / scale;
  }

  function release(pointerId: number) {
    grip.current = null;
    try {
      rail.current?.releasePointerCapture?.(pointerId);
    } catch {
      // Synthetic pointer events can fail capture/release; the switch still settles.
    }
    setHeld(false);
  }

  return (
    <div className="liq-control">
      <span>{label}</span>
      <button
        ref={rail}
        className="liq-sw"
        data-on={on}
        role="switch"
        aria-checked={on}
        aria-label={label}
        type="button"
        onPointerDown={(event) => {
          grip.current = { id: event.pointerId, grab: null, moved: false };
          setHeld(true);
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {
            // Pointer capture is a nice-to-have for this microinteraction.
          }
        }}
        onPointerMove={(event) => {
          const current = grip.current;
          if (!current || current.id !== event.pointerId) return;
          const at = local(event.clientX);
          if (current.grab === null) current.grab = at - x.get();
          const next = Math.min(OPEN_X, Math.max(SHUT_X, at - current.grab));
          if (Math.abs(next - x.get()) > 0.4) current.moved = true;
          x.set(next);
          const pastMiddle = next > MID_X;
          if (pastMiddle !== on) setOn(pastMiddle);
        }}
        onPointerUp={(event) => {
          const current = grip.current;
          if (current && !current.moved) setOn((value) => !value);
          release(event.pointerId);
        }}
        onPointerCancel={(event) => release(event.pointerId)}
        onPointerEnter={() => setHot(true)}
        onPointerLeave={() => setHot(false)}
        onKeyDown={(event) => {
          if (event.key !== " " && event.key !== "Enter") return;
          event.preventDefault();
          setOn((value) => !value);
        }}
      >
        <motion.span className="liq-thumb" style={{ x, scaleX: wide, scaleY: tall }} />
      </button>
      <strong>{on ? checkedLabel : uncheckedLabel}</strong>
    </div>
  );
}
